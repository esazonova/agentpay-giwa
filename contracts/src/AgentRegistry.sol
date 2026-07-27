// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./interfaces/IAgentEscrow.sol";

/// @title AgentRegistry — On-chain registry for AI agents
/// @notice Agents register, stake bonds, build reputation
contract AgentRegistry {
    // ── Categories ──
    enum Category { Code, Content, Data, Trading, Community, Custom }

    // ── Agent struct ──
    struct Agent {
        string name;
        address owner;
        Category category;
        string apiEndpoint;      // IPFS hash or URL
        uint256 pricePerTask;    // in wei (ETH)
        uint256 stakedAmount;
        uint256 completedTasks;
        uint256 totalEarnings;
        uint256 reputationScore; // 0-100 scaled × 100 (basis: 10000 = 4.0★)
        bool isActive;
        uint256 registeredAt;
    }

    // ── State ──
    mapping(address => Agent) public agents;
    address[] public agentList;

    uint256 public constant MIN_STAKE = 0.001 ether; // Minimum bond to register
    uint256 public constant UNSTAKE_COOLDOWN = 7 days;

    mapping(address => uint256) public stakeTimestamp;
    mapping(address => uint256) public pendingUnstake;

    // ── Events ──
    event AgentRegistered(address indexed agent, string name, Category category);
    event AgentUpdated(address indexed agent);
    event AgentStaked(address indexed agent, uint256 amount);
    event AgentUnstaked(address indexed agent, uint256 amount);
    event AgentDeactivated(address indexed agent);

    // ── Modifiers ──
    modifier onlyActiveAgent() {
        require(agents[msg.sender].isActive, "Agent not active");
        _;
    }

    // ── Register ──
    function registerAgent(
        string calldata name_,
        Category category_,
        string calldata apiEndpoint_,
        uint256 pricePerTask_
    ) external payable {
        require(bytes(agents[msg.sender].name).length == 0, "Already registered");
        require(msg.value >= MIN_STAKE, "Stake too low");
        require(bytes(name_).length > 0, "Name required");

        agents[msg.sender] = Agent({
            name: name_,
            owner: msg.sender,
            category: category_,
            apiEndpoint: apiEndpoint_,
            pricePerTask: pricePerTask_,
            stakedAmount: msg.value,
            completedTasks: 0,
            totalEarnings: 0,
            reputationScore: 3000, // start at 3.0/5.0 (3000/10000)
            isActive: true,
            registeredAt: block.timestamp
        });

        agentList.push(msg.sender);
        stakeTimestamp[msg.sender] = block.timestamp;

        emit AgentRegistered(msg.sender, name_, category_);
    }

    // ── Update profile ──
    function updateAgentProfile(
        string calldata name_,
        Category category_,
        string calldata apiEndpoint_,
        uint256 pricePerTask_
    ) external onlyActiveAgent {
        agents[msg.sender].name = name_;
        agents[msg.sender].category = category_;
        agents[msg.sender].apiEndpoint = apiEndpoint_;
        agents[msg.sender].pricePerTask = pricePerTask_;
        emit AgentUpdated(msg.sender);
    }

    // ── Additional staking ──
    function stakeBond() external payable onlyActiveAgent {
        require(msg.value > 0, "Zero stake");
        agents[msg.sender].stakedAmount += msg.value;
        stakeTimestamp[msg.sender] = block.timestamp;
        emit AgentStaked(msg.sender, msg.value);
    }

    // ── Initiate unstake ──
    function unstakeBond() external onlyActiveAgent {
        uint256 staked = agents[msg.sender].stakedAmount;
        require(staked > 0, "No stake");
        require(
            block.timestamp >= stakeTimestamp[msg.sender] + UNSTAKE_COOLDOWN,
            "Cooldown not passed"
        );

        pendingUnstake[msg.sender] = staked;
        agents[msg.sender].stakedAmount = 0;
        emit AgentUnstaked(msg.sender, staked);
    }

    // ── Withdraw unstaked funds ──
    function withdrawUnstake() external {
        uint256 amount = pendingUnstake[msg.sender];
        require(amount > 0, "Nothing to withdraw");
        pendingUnstake[msg.sender] = 0;
        (bool ok,) = msg.sender.call{value: amount}("");
        require(ok, "Transfer failed");
    }

    // ── Called by Escrow: record completed task ──
    address public escrowAddr;

    function setEscrow(address _escrow) external {
        require(escrowAddr == address(0), "Already set");
        escrowAddr = _escrow;
    }

    function recordTaskCompletion(address agent_, uint256 payment_) external {
        require(msg.sender == escrowAddr, "Only escrow");
        Agent storage a = agents[agent_];
        require(a.isActive, "Not active");
        a.completedTasks++;
        a.totalEarnings += payment_;
    }

    // ── Called by Escrow: update reputation ──
    function updateReputation(address agent_, uint8 score_) external {
        require(msg.sender == escrowAddr, "Only escrow");
        // score 1-5, map to 10000 scale
        require(score_ >= 1 && score_ <= 5, "Score 1-5");
        Agent storage a = agents[agent_];
        require(a.isActive, "Not active");
        uint256 newScore = uint256(score_) * 2000; // 1→2000, 5→10000
        // Weighted average (70% old, 30% new)
        a.reputationScore = (a.reputationScore * 70 + newScore * 30) / 100;
    }

    // ── Slash stake (called by Escrow or owner) ──
    function slashStake(address agent_, uint256 amount_) external {
        // In production: onlyEscrow. For demo: open
        Agent storage a = agents[agent_];
        require(a.stakedAmount >= amount_, "Insufficient stake");
        a.stakedAmount -= amount_;
        (bool ok,) = msg.sender.call{value: amount_}("");
        require(ok, "Transfer failed");
    }

    // ── View helpers ──
    function getAgent(address addr_) external view returns (Agent memory) {
        return agents[addr_];
    }

    function getAgentCount() external view returns (uint256) {
        return agentList.length;
    }

    function getAgentByIndex(uint256 idx_) external view returns (address) {
        return agentList[idx_];
    }

    function getAgentsByCategory(Category cat_) external view returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < agentList.length; i++) {
            if (agents[agentList[i]].isActive && agents[agentList[i]].category == cat_) count++;
        }
        address[] memory result = new address[](count);
        uint256 j = 0;
        for (uint256 i = 0; i < agentList.length; i++) {
            if (agents[agentList[i]].isActive && agents[agentList[i]].category == cat_) {
                result[j++] = agentList[i];
            }
        }
        return result;
    }

    // ── Reputation as stars (1-5) ──
    function getReputationStars(address addr_) external view returns (uint8) {
        return uint8(agents[addr_].reputationScore / 2000); // 0-5
    }

    // ── Deactivate ──
    function deactivate() external onlyActiveAgent {
        require(agents[msg.sender].stakedAmount == 0, "Unstake first");
        agents[msg.sender].isActive = false;
        emit AgentDeactivated(msg.sender);
    }

    // ── Withdraw earnings (paid to contract by Escrow) ──
    function withdrawEarnings() external onlyActiveAgent {
        uint256 earnings = address(this).balance - _totalStaked();
        require(earnings > 0, "No earnings");
        (bool ok,) = msg.sender.call{value: earnings}("");
        require(ok, "Transfer failed");
    }

    function _totalStaked() internal view returns (uint256 total) {
        for (uint256 i = 0; i < agentList.length; i++) {
            total += agents[agentList[i]].stakedAmount;
        }
    }

    receive() external payable {} // Accept payments from Escrow
}
