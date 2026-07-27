import { useState, useEffect, useCallback } from 'react'
import { formatEther, http, createPublicClient } from 'viem'
import { GIWA_SEPOLIA } from '../config/giwa'

const publicClient = createPublicClient({ chain: GIWA_SEPOLIA, transport: http() })

export function useWallet() {
  const [address, setAddress] = useState<`0x${string}` | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [balance, setBalance] = useState<string>('0')
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isConnected = !!address && chainId === GIWA_SEPOLIA.id

  const refreshBalance = useCallback(async (addr: `0x${string}`) => {
    try {
      const bal = await publicClient.getBalance({ address: addr })
      setBalance(formatEther(bal))
    } catch { /* ignore */ }
  }, [])

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask not detected. Please install MetaMask.')
      return
    }
    setIsConnecting(true)
    setError(null)
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[]

      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${GIWA_SEPOLIA.id.toString(16)}` }],
        })
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${GIWA_SEPOLIA.id.toString(16)}`,
              chainName: 'GIWA Sepolia',
              nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://sepolia-rpc.giwa.io'],
              blockExplorerUrls: ['https://sepolia-explorer.giwa.io'],
            }],
          })
        }
      }

      const addr = accounts[0] as `0x${string}`
      setAddress(addr)
      setChainId(GIWA_SEPOLIA.id)
      await refreshBalance(addr)
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }, [refreshBalance])

  const disconnect = useCallback(() => {
    setAddress(null)
    setChainId(null)
    setBalance('0')
  }, [])

  useEffect(() => {
    if (!window.ethereum) return
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) disconnect()
      else setAddress(accounts[0] as `0x${string}`)
    }
    const handleChainChanged = () => { window.location.reload() }
    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum.removeListener('chainChanged', handleChainChanged)
    }
  }, [disconnect])

  return { address, balance, isConnected, isConnecting, error, connect, disconnect }
}

declare global {
  interface Window { ethereum?: any }
}
