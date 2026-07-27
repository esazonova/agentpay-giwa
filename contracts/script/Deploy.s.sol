// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "../src/AgentRegistry.sol";
import "../src/AgentEscrow.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerKey);

        // 1. Deploy Registry
        AgentRegistry registry = new AgentRegistry();
        console.log("AgentRegistry deployed at:", address(registry));

        // 2. Deploy Escrow (points to Registry)
        AgentEscrow escrow = new AgentEscrow(address(registry));
        console.log("AgentEscrow deployed at:", address(escrow));

        // 3. Link Escrow → Registry (so Registry can verify calls from Escrow)
        registry.setEscrow(address(escrow));
        console.log("Registry.setEscrow() called");

        vm.stopBroadcast();

        // Output for frontend config
        console.log("--- CONFIG ---");
        console.log("REGISTRY_ADDRESS=%s", address(registry));
        console.log("ESCROW_ADDRESS=%s", address(escrow));
    }
}
