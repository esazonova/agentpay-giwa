// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IAgentEscrow {
    enum TaskStatus { Created, Submitted, Approved, Disputed, Resolved, Cancelled }

    struct Task {
        uint256 id;
        address buyer;
        address agent;
        bytes32 descriptionHash;
        uint256 price;
        uint256 platformFee;
        TaskStatus status;
        bytes32 resultHash;
        uint256 createdAt;
        uint256 submittedAt;
        uint256 resolvedAt;
    }

    event TaskCreated(uint256 indexed taskId, address indexed buyer, address indexed agent, uint256 price);
    event TaskSubmitted(uint256 indexed taskId, bytes32 resultHash);
    event TaskApproved(uint256 indexed taskId, uint256 payment);
    event TaskDisputed(uint256 indexed taskId, address indexed buyer);
    event DisputeResolved(uint256 indexed taskId, bool buyerWon, uint256 amount);
    event TaskCancelled(uint256 indexed taskId, uint256 refund);
}
