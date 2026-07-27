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

// Deployed on GIWA Sepolia (chain 91342)
export const CONTRACT_ADDRESSES = {
  registry: '0xdF697F836a71e0495a5c67598a32D3Cc49b4D2B6' as `0x${string}`,
  escrow: '0xfD34f4442CF4CFC6150fd4c69cdc0A0258E1AcD3' as `0x${string}`,
}

export const GIWA_FAUCET = 'https://faucet.giwa.io/'
export const GIWA_EXPLORER = 'https://sepolia-explorer.giwa.io'
