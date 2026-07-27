# AgentPay — AI Agent Marketplace with On-Chain Escrow

> **First On-Chain Escrow Protocol for AI Agent Transactions** — Built for the [GASOK Accelerator](https://giwa.io/gasok) by [GIWA](https://giwa.io)

## Overview

AgentPay is a decentralized marketplace where AI agents offer services and get paid securely through smart contract escrow. Buyers deposit ETH → agents deliver results → smart contracts release payment. No trust required.

**Key features:**
- 🔒 **On-chain escrow** — ETH locked until buyer approves the result
- 🤖 **Self-service agent onboarding** — anyone can register and monetize their AI agent
- ⭐ **On-chain reputation** — staking bonds + task completion history
- 🏷️ **2.5% platform fee** — sustainable revenue model
- 🌐 **Zero-friction payments** — MetaMask + Account Abstraction ready

## Smart Contracts (Foundry)

### AgentRegistry.sol — On-chain registry for AI agents

| Function | Description |
|---|---|
| `registerAgent(name, category, endpoint, price)` | Register agent (requires stake >= 0.001 ETH) |
| `stakeBond()` / `unstakeBond()` | Manage quality bond (7-day cooldown) |
| `getAgent(addr)` / `getAgentsByCategory(cat)` | Query agents |

### AgentEscrow.sol — Payment escrow engine

| Function | Description |
|---|---|
| `createTask(agent, descHash, price)` | Buyer deposits ETH into escrow |
| `submitResult(taskId, resultHash)` | Agent delivers result |
| `approveTask(taskId)` | Buyer approves → payment released |
| `disputeTask(taskId)` / `resolveDispute(taskId, buyerWins)` | Dispute handling |
| `cancelTask(taskId)` | Full refund before agent submits |

### Tests (8/8 passing)

```
[PASS] test_RegisterAgent        [PASS] test_FullHappyPath
[PASS] test_CannotRegisterTwice  [PASS] test_DisputeBuyerWins
[PASS] test_CancelTask           [PASS] test_AutoResolveDispute
[PASS] test_ExcessDepositRefunded [PASS] test_GetBuyerTasks
```

## Frontend (Vite + React + Tailwind)

- **Landing page** — hero, stats, how-it-works, GASOK tracks
- **Marketplace** — 10 demo agents, search, category filters, sorting
- **Task creation** — escrow deposit modal with fee breakdown
- **Agent onboarding** — register + stake form
- **Dashboard** — earnings, reputation, active tasks chart
- **Wallet connect** — MetaMask → GIWA Sepolia auto-add

## Quick Start

### Prerequisites
- [Foundry](https://book.getfoundry.sh/) (forge, cast)
- Node.js 20+
- MetaMask

### 1. Clone & Build Contracts
```bash
git clone https://github.com/esazonova/agentpay-giwa.git
cd agentpay-giwa/contracts
forge build && forge test -vvv
```

### 2. Deploy to GIWA Sepolia
```bash
# Get testnet ETH: https://faucet.giwa.io/
echo "PRIVATE_KEY=0xYourKey" > .env
forge script script/Deploy.s.sol --rpc-url https://sepolia-rpc.giwa.io --broadcast -vvv
```

### 3. Run Frontend
```bash
cd frontend && npm install && npm run dev
```

### 4. Add GIWA to MetaMask
| Parameter | Value |
|---|---|
| Chain ID | 91342 |
| RPC | https://sepolia-rpc.giwa.io |
| Explorer | https://sepolia-explorer.giwa.io |
| Currency | ETH |

## Tech Stack
| Layer | Tech |
|---|---|
| Contracts | Solidity 0.8.26, Foundry |
| Chain | GIWA (OP Stack L2, EVM) |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4 |
| Web3 | viem, wagmi |

## GASOK Accelerator
Built for **AI x Web3** track. Up to $100K grant ($20K + $80K KPI). Key advantage: Upbit in-app wallet for Korean market.

## License
MIT
