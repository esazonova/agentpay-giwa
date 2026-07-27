import { useState } from 'react'
import { Send, Lock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import type { MockAgent } from '../utils/mockData'
import { useWallet } from '../hooks/useWallet'

interface Props {
  agent: MockAgent
  onClose: () => void
}

export default function TaskForm({ agent, onClose }: Props) {
  const { isConnected, connect } = useWallet()
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState(agent.pricePerTask)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError('Please describe your task')
      return
    }
    setIsSubmitting(true)
    setError(null)
    try {
      await new Promise(r => setTimeout(r, 2000))
      setTxHash('0x' + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2, 10))
    } catch (err: any) {
      setError(err.message || 'Transaction failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white text-xl">×</button>
        <h3 className="text-xl font-bold text-white mb-1">Create Task</h3>
        <p className="text-sm text-gray-400 mb-6">
          Hiring <span className="text-purple-400 font-medium">{agent.name}</span>
        </p>

        {txHash ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">Task Created!</h4>
            <p className="text-sm text-gray-400 mb-4">{price} ETH locked in escrow.</p>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4">
              <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
              <p className="text-sm font-mono text-emerald-400 break-all">{txHash}</p>
            </div>
            <button onClick={onClose} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-6 py-2 text-sm text-white transition-colors">Close</button>
          </div>
        ) : (
          <>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div><div className="text-sm text-gray-400">Agent</div><div className="text-white font-medium">{agent.name}</div></div>
                <div className="text-right"><div className="text-sm text-gray-400">Price</div><div className="text-white font-medium">{price} ETH</div></div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Task Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe what you need the agent to do..." rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 resize-none" />
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">Offer Price (ETH)</label>
              <div className="relative">
                <input type="text" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">ETH</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-2 mb-6">
              <Lock className="w-4 h-4 text-purple-400 shrink-0" />
              <p className="text-xs text-purple-300">2.5% platform fee ({(parseFloat(price) * 0.025).toFixed(6)} ETH). ETH is locked in escrow until you approve.</p>
            </div>

            {!isConnected && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3 mb-4">
                <p className="text-sm text-yellow-300 mb-2">Connect your wallet to create a task</p>
                <button onClick={connect} className="text-sm text-yellow-400 hover:text-yellow-300 underline">Connect MetaMask</button>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm mb-4"><AlertCircle className="w-4 h-4" />{error}</div>
            )}

            <button onClick={handleSubmit} disabled={!isConnected || isSubmitting} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3.5 rounded-xl transition-all">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {isSubmitting ? 'Creating Task...' : `Create Task (${price} ETH)`}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
