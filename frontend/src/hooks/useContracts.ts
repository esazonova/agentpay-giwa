import { createPublicClient, http, createWalletClient, custom } from 'viem'
import { GIWA_SEPOLIA } from '../config/giwa'
import { parseAbi } from 'viem'

export const publicClient = createPublicClient({
  chain: GIWA_SEPOLIA,
  transport: http(),
})

// Registry ABI (selective)
export const REGISTRY_ABI = parseAbi([
  'struct Agent { string name; address owner; uint8 category; string apiEndpoint; uint256 pricePerTask; uint256 stakedAmount; uint256 completedTasks; uint256 totalEarnings; uint256 reputationScore; bool isActive; uint256 registeredAt; }',
  'function agents(address) view returns (string name, address owner, uint8 category, string apiEndpoint, uint256 pricePerTask, uint256 stakedAmount, uint256 completedTasks, uint256 totalEarnings, uint256 reputationScore, bool isActive, uint256 registeredAt)',
  'function getAgent(address) view returns (tuple(string name, address owner, uint8 category, string apiEndpoint, uint256 pricePerTask, uint256 stakedAmount, uint256 completedTasks, uint256 totalEarnings, uint256 reputationScore, bool isActive, uint256 registeredAt))',
  'function getAgentCount() view returns (uint256)',
  'function getAgentByIndex(uint256) view returns (address)',
  'function registerAgent(string name, uint8 category, string apiEndpoint, uint256 pricePerTask) payable',
  'function getReputationStars(address) view returns (uint8)',
  'function escrowAddr() view returns (address)',
])

// Escrow ABI (selective)
export const ESCROW_ABI = parseAbi([
  'struct Task { uint256 id; address buyer; address agent; bytes32 descriptionHash; uint256 price; uint256 platformFee; uint8 status; bytes32 resultHash; uint256 createdAt; uint256 submittedAt; uint256 resolvedAt; }',
  'function taskCount() view returns (uint256)',
  'function getTask(uint256) view returns (tuple(uint256 id, address buyer, address agent, bytes32 descriptionHash, uint256 price, uint256 platformFee, uint8 status, bytes32 resultHash, uint256 createdAt, uint256 submittedAt, uint256 resolvedAt))',
  'function createTask(address agent, bytes32 descriptionHash, uint256 price) payable returns (uint256)',
  'function submitResult(uint256 taskId, bytes32 resultHash)',
  'function approveTask(uint256 taskId)',
  'function disputeTask(uint256 taskId)',
  'function resolveDispute(uint256 taskId, bool buyerWins)',
  'function cancelTask(uint256 taskId)',
  'function getBuyerTasks(address) view returns (uint256[])',
  'function getAgentTasks(address) view returns (uint256[])',
  'function platformBalance() view returns (uint256)',
  'function PLATFORM_FEE_BPS() view returns (uint256)',
  'function registryAddr() view returns (address)',
  'function owner() view returns (address)',
])

// Task status enum values
export const TASK_STATUS = {
  Created: 0,
  Submitted: 1,
  Approved: 2,
  Disputed: 3,
  Resolved: 4,
  Cancelled: 5,
} as const

export function getWalletClient() {
  if (typeof window === 'undefined' || !window.ethereum) return null
  return createWalletClient({
    chain: GIWA_SEPOLIA,
    transport: custom(window.ethereum as any),
  })
}
