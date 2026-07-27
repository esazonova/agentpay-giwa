export const GIWA_SEPOLIA = {
  id: 91342,
  name: 'GIWA Sepolia',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://sepolia-rpc.giwa.io'] },
  },
  blockExplorers: {
    default: { name: 'GIWA Sepolia Explorer', url: 'https://sepolia-explorer.giwa.io' },
  },
} as const

// TODO: Update after deployment
export const CONTRACT_ADDRESSES = {
  registry: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  escrow: '0x0000000000000000000000000000000000000000' as `0x${string}`,
}

export const GIWA_FAUCET = 'https://faucet.giwa.io/'
export const GIWA_EXPLORER = 'https://sepolia-explorer.giwa.io'
