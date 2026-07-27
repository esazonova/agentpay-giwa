// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./interfaces/IAgentEscrow.sol";
import "./AgentRegistry.sol";

/// @title AgentEscrow — On-chain escrow for AI agent task payments
/// @notice Buyer deposits ETH → Agent delivers → Smart contract releases payment
contract AgentEscrow is IAgentEscrow {

    // ── Config ──
    uint256 public constant PLATFORM_FEE_BPS = 250;      // 2.5%
    uint256 public constant BPS_BASE = 10000;
    uint256 public constant DISPUTE_TIMEOUT = 7 days;
    uint256 public constant MIN_PRICE = 0.0001 ether;

    address payable public owner;
    address payable public registryAddr;

    // ── State ──
    uint256 public taskCount;
    mapping(uint256 => Task) public tasks;
    uint256 public platformBalance;

    // ── Events ──
    event OwnerWithdrawn(uint256 amount);

    // ── Constructor ──
    constructor(address _registryAddress) {
        require(_registryAddress != address(0), "Zero registry");
        owner = payable(msg.sender);
        registryAddr = payable(_registryAddress);
    }

    // ── Modifiers ──
    modifier onlyBuyer(uint256 taskId_) {
        require(tasks[taskId_].buyer == msg.sender, "Not buyer");
        _;
    }

    modifier onlyAgent(uint256 taskId_) {
        require(tasks[taskId_].agent == msg.sender, "Not agent");
        _;
    }

    modifier validStatus(uint256 taskId_, TaskStatus status_) {
        require(tasks[taskId_].status == status_, "Invalid status");
        _;
    }

    // ── Internal: call registry ──
    function _registry() internal view returns (AgentRegistry) {
        return AgentRegistry(registryAddr);
    }

    // ══════════════════════════════════════════════════════════
    //  CREATE TASK
    // ══════════════════════════════════════════════════════════
    function createTask(
        address agent_,
        bytes32 descriptionHash_,
        uint256 price_
    ) external payable returns (uint256) {
        require(price_ >= MIN_PRICE, "Price too low");
        require(msg.value >= price_, "Insufficient deposit");
        require(_registry().getAgent(agent_).isActive, "Agent not active");

        uint256 taskId = taskCount++;
        uint256 fee = (price_ * PLATFORM_FEE_BPS) / BPS_BASE;

        tasks[taskId] = Task({
            id: taskId,
            buyer: msg.sender,
            agent: agent_,
            descriptionHash: descriptionHash_,
            price: price_,
            platformFee: fee,
            status: TaskStatus.Created,
            resultHash: bytes32(0),
            createdAt: block.timestamp,
            submittedAt: 0,
            resolvedAt: 0
        });

        // Refund excess deposit
        if (msg.value > price_) {
            (bool ok,) = msg.sender.call{value: msg.value - price_}("");
            require(ok, "Refund failed");
        }

        emit TaskCreated(taskId, msg.sender, agent_, price_);
        return taskId;
    }

    // ══════════════════════════════════════════════════════════
    //  SUBMIT RESULT
    // ══════════════════════════════════════════════════════════
    function submitResult(uint256 taskId_, bytes32 resultHash_)
        external
        onlyAgent(taskId_)
        validStatus(taskId_, TaskStatus.Created)
    {
        tasks[taskId_].resultHash = resultHash_;
        tasks[taskId_].status = TaskStatus.Submitted;
        tasks[taskId_].submittedAt = block.timestamp;

        emit TaskSubmitted(taskId_, resultHash_);
    }

    // ══════════════════════════════════════════════════════════
    //  APPROVE TASK
    // ══════════════════════════════════════════════════════════
    function approveTask(uint256 taskId_)
        external
        onlyBuyer(taskId_)
        validStatus(taskId_, TaskStatus.Submitted)
    {
        Task storage t = tasks[taskId_];
        t.status = TaskStatus.Approved;
        t.resolvedAt = block.timestamp;

        uint256 payment = t.price - t.platformFee;
        platformBalance += t.platformFee;

        (bool ok,) = t.agent.call{value: payment}("");
        require(ok, "Payment failed");

        _registry().recordTaskCompletion(t.agent, payment);

        emit TaskApproved(taskId_, payment);
    }

    // ══════════════════════════════════════════════════════════
    //  DISPUTE
    // ══════════════════════════════════════════════════════════
    function disputeTask(uint256 taskId_)
        external
        onlyBuyer(taskId_)
        validStatus(taskId_, TaskStatus.Submitted)
    {
        tasks[taskId_].status = TaskStatus.Disputed;
        emit TaskDisputed(taskId_, msg.sender);
    }

    // ══════════════════════════════════════════════════════════
    //  RESOLVE DISPUTE
    // ══════════════════════════════════════════════════════════
    function resolveDispute(uint256 taskId_, bool buyerWon_)
        external
        validStatus(taskId_, TaskStatus.Disputed)
    {
        _resolveDispute(taskId_, buyerWon_);
    }

    function _resolveDispute(uint256 taskId_, bool buyerWon_) internal {
        Task storage t = tasks[taskId_];
        t.status = TaskStatus.Resolved;
        t.resolvedAt = block.timestamp;

        uint256 amount = t.price;

        if (buyerWon_) {
            uint256 refund = amount - t.platformFee;
            platformBalance += t.platformFee;
            (bool ok,) = t.buyer.call{value: refund}("");
            require(ok, "Refund failed");
        } else {
            uint256 payment = amount - t.platformFee;
            platformBalance += t.platformFee;
            (bool ok,) = t.agent.call{value: payment}("");
            require(ok, "Payment failed");
            _registry().recordTaskCompletion(t.agent, payment);
            _registry().updateReputation(t.agent, 3);
        }

        emit DisputeResolved(taskId_, buyerWon_, amount);
    }

    // ══════════════════════════════════════════════════════════
    //  AUTO-RESOLVE
    // ══════════════════════════════════════════════════════════
    function autoResolveDispute(uint256 taskId_) external {
        Task storage t = tasks[taskId_];
        require(t.status == TaskStatus.Disputed, "Not disputed");
        require(
            block.timestamp >= t.submittedAt + DISPUTE_TIMEOUT,
            "Timeout not passed"
        );
        _resolveDispute(taskId_, true);
    }

    // ══════════════════════════════════════════════════════════
    //  CANCEL
    // ══════════════════════════════════════════════════════════
    function cancelTask(uint256 taskId_)
        external
        onlyBuyer(taskId_)
        validStatus(taskId_, TaskStatus.Created)
    {
        Task storage t = tasks[taskId_];
        t.status = TaskStatus.Cancelled;

        (bool ok,) = t.buyer.call{value: t.price}("");
        require(ok, "Refund failed");

        emit TaskCancelled(taskId_, t.price);
    }

    // ══════════════════════════════════════════════════════════
    //  ADMIN
    // ══════════════════════════════════════════════════════════
    function withdrawPlatformFees() external {
        require(msg.sender == owner, "Not owner");
        uint256 amount = platformBalance;
        require(amount > 0, "No fees");
        platformBalance = 0;
        (bool ok,) = owner.call{value: amount}("");
        require(ok, "Transfer failed");
        emit OwnerWithdrawn(amount);
    }

    function getTask(uint256 taskId_) external view returns (Task memory) {
        return tasks[taskId_];
    }

    function getBuyerTasks(address buyer_) external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < taskCount; i++) {
            if (tasks[i].buyer == buyer_) count++;
        }
        uint256[] memory result = new uint256[](count);
        uint256 j = 0;
        for (uint256 i = 0; i < taskCount; i++) {
            if (tasks[i].buyer == buyer_) result[j++] = i;
        }
        return result;
    }

    function getAgentTasks(address agent_) external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < taskCount; i++) {
            if (tasks[i].agent == agent_) count++;
        }
        uint256[] memory result = new uint256[](count);
        uint256 j = 0;
        for (uint256 i = 0; i < taskCount; i++) {
            if (tasks[i].agent == agent_) result[j++] = i;
        }
        return result;
    }

    receive() external payable {}
}
