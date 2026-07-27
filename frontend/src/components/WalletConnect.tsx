import { Wallet, LogOut, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useWallet } from '../hooks/useWallet'

export default function WalletConnect() {
  const { address, balance, isConnected, isConnecting, error, connect, disconnect } = useWallet()

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-mono text-emerald-300">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          <span className="text-xs text-gray-400">{parseFloat(balance).toFixed(4)} ETH</span>
        </div>
        <button
          onClick={disconnect}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          title="Disconnect"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={connect}
        disabled={isConnecting}
        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl px-4 py-2 text-sm font-medium transition-all hover:shadow-lg hover:shadow-purple-500/10"
      >
        {isConnecting ? (
          <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <Wallet className="w-4 h-4 text-purple-400" />
        )}
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-400">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  )
}
