// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../src/AgentRegistry.sol";
import "../src/AgentEscrow.sol";
import "../src/interfaces/IAgentEscrow.sol";

contract AgentPayTest is Test {
    AgentRegistry registry;
    AgentEscrow escrow;

    address buyer = makeAddr("buyer");
    address agent = makeAddr("agent");
    address arbiter = makeAddr("arbiter");

    uint256 constant PRICE = 0.01 ether;
    uint256 constant STAKE = 0.1 ether;

    function setUp() public {
        vm.prank(arbiter);
        registry = new AgentRegistry();

        vm.prank(arbiter);
        escrow = new AgentEscrow(address(registry));

        // Link escrow → registry
        vm.prank(arbiter);
        registry.setEscrow(address(escrow));

        vm.deal(buyer, 1 ether);
        vm.deal(agent, 1 ether);

        vm.prank(agent);
        registry.registerAgent{value: STAKE}(
            "CodeReview Pro",
            AgentRegistry.Category.Code,
            "ipfs://QmAgent1",
            PRICE
        );
    }

    function test_RegisterAgent() public {
        AgentRegistry.Agent memory a = registry.getAgent(agent);
        assertEq(a.name, "CodeReview Pro");
        assertEq(uint8(a.category), uint8(AgentRegistry.Category.Code));
        assertTrue(a.isActive);
        assertEq(a.stakedAmount, STAKE);
        assertEq(a.reputationScore, 3000);
        assertEq(registry.getAgentCount(), 1);
    }

    function test_CannotRegisterTwice() public {
        vm.prank(agent);
        vm.expectRevert("Already registered");
        registry.registerAgent{value: STAKE}(
            "Another Agent",
            AgentRegistry.Category.Data,
            "url",
            PRICE
        );
    }

    function test_FullHappyPath() public {
        bytes32 descHash = keccak256("Review my smart contract");
        bytes32 resultHash = keccak256("Audit report: 3 issues found");

        uint256 balanceBefore = agent.balance;

        // 1. Buyer creates task
        vm.prank(buyer);
        uint256 taskId = escrow.createTask{value: PRICE}(agent, descHash, PRICE);

        // 2. Verify task
        AgentEscrow.Task memory t = escrow.getTask(taskId);
        assertEq(t.buyer, buyer);
        assertEq(t.agent, agent);
        assertEq(t.price, PRICE);
        assertEq(uint8(t.status), uint8(IAgentEscrow.TaskStatus.Created));

        // 3. Agent submits result
        vm.prank(agent);
        escrow.submitResult(taskId, resultHash);

        t = escrow.getTask(taskId);
        assertEq(uint8(t.status), uint8(IAgentEscrow.TaskStatus.Submitted));
        assertEq(t.resultHash, resultHash);

        // 4. Buyer approves
        vm.prank(buyer);
        escrow.approveTask(taskId);

        t = escrow.getTask(taskId);
        assertEq(uint8(t.status), uint8(IAgentEscrow.TaskStatus.Approved));

        // 5. Agent got paid (minus 2.5% fee)
        uint256 expectedPayment = PRICE - (PRICE * 250 / 10000);
        assertGe(agent.balance, balanceBefore + expectedPayment);

        // 6. Registry updated
        AgentRegistry.Agent memory a = registry.getAgent(agent);
        assertEq(a.completedTasks, 1);
        assertGe(a.totalEarnings, expectedPayment);
    }

    function test_DisputeBuyerWins() public {
        bytes32 descHash = keccak256("desc");
        bytes32 resultHash = keccak256("bad result");

        vm.prank(buyer);
        uint256 taskId = escrow.createTask{value: PRICE}(agent, descHash, PRICE);

        vm.prank(agent);
        escrow.submitResult(taskId, resultHash);

        vm.prank(buyer);
        escrow.disputeTask(taskId);

        vm.prank(arbiter);
        escrow.resolveDispute(taskId, true);

        AgentEscrow.Task memory t = escrow.getTask(taskId);
        assertEq(uint8(t.status), uint8(IAgentEscrow.TaskStatus.Resolved));
    }

    function test_CancelTask() public {
        uint256 balanceBefore = buyer.balance;

        vm.prank(buyer);
        uint256 taskId = escrow.createTask{value: PRICE}(agent, keccak256("desc"), PRICE);

        vm.prank(buyer);
        escrow.cancelTask(taskId);

        AgentEscrow.Task memory t = escrow.getTask(taskId);
        assertEq(uint8(t.status), uint8(IAgentEscrow.TaskStatus.Cancelled));
        assertEq(buyer.balance, balanceBefore);
    }

    function test_AutoResolveDispute() public {
        vm.prank(buyer);
        uint256 taskId = escrow.createTask{value: PRICE}(agent, keccak256("desc"), PRICE);

        vm.prank(agent);
        escrow.submitResult(taskId, keccak256("result"));

        vm.prank(buyer);
        escrow.disputeTask(taskId);

        vm.warp(block.timestamp + 8 days);

        escrow.autoResolveDispute(taskId);

        AgentEscrow.Task memory t = escrow.getTask(taskId);
        assertEq(uint8(t.status), uint8(IAgentEscrow.TaskStatus.Resolved));
    }

    function test_ExcessDepositRefunded() public {
        uint256 balanceBefore = buyer.balance;

        vm.prank(buyer);
        escrow.createTask{value: 2 * PRICE}(agent, keccak256("desc"), PRICE);

        assertLe(buyer.balance, balanceBefore - PRICE);
    }

    function test_GetBuyerTasks() public {
        vm.prank(buyer);
        escrow.createTask{value: PRICE}(agent, keccak256("desc1"), PRICE);

        vm.prank(buyer);
        escrow.createTask{value: PRICE}(agent, keccak256("desc2"), PRICE);

        uint256[] memory taskIds = escrow.getBuyerTasks(buyer);
        assertEq(taskIds.length, 2);
    }
}
