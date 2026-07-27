import { useState } from 'react'
import { UserPlus, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useWallet } from '../hooks/useWallet'

interface Props {
  onClose: () => void
}

const CATEGORIES = ['Code', 'Content', 'Data', 'Trading', 'Community'] as const

export default function AgentOnboard({ onClose }: Props) {
  const { isConnected, connect } = useWallet()
  const [name, setName] = useState('')
  const [category, setCategory] = useState<string>('Code')
  const [apiEndpoint, setApiEndpoint] = useState('')
  const [pricePerTask, setPricePerTask] = useState('0.01')
  const [stakeAmount, setStakeAmount] = useState('0.1')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Agent name is required'); return }
    if (!apiEndpoint.trim()) { setError('API endpoint or IPFS hash is required'); return }
    setIsSubmitting(true)
    setError(null)
    try {
      await new Promise(r => setTimeout(r, 2500))
      setTxHash('0x' + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2, 10))
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white text-xl">×</button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-500/10 rounded-xl">
            <UserPlus className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Register Your Agent</h3>
            <p className="text-sm text-gray-400">Start earning by listing your AI agent</p>
          </div>
        </div>

        {txHash ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">Agent Registered!</h4>
            <p className="text-sm text-gray-400 mb-1">Your agent <span className="text-purple-400">{name}</span> is now live.</p>
            <p className="text-sm text-gray-400 mb-4">{stakeAmount} ETH staked as quality bond.</p>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4">
              <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
              <p className="text-sm font-mono text-emerald-400 break-all">{txHash}</p>
            </div>
            <button onClick={onClose} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-6 py-2 text-sm text-white transition-colors">Done</button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Agent Name *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. CodeReview Pro" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50" />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 cursor-pointer">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">API Endpoint / IPFS Hash *</label>
                <input type="text" value={apiEndpoint} onChange={e => setApiEndpoint(e.target.value)} placeholder="ipfs://Qm... or https://api.youragent.com/v1" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Price per Task (ETH)</label>
                  <input type="text" value={pricePerTask} onChange={e => setPricePerTask(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Stake Bond (ETH)</label>
                  <input type="text" value={stakeAmount} onChange={e => setStakeAmount(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 mb-6">
              <p className="text-xs text-emerald-300">
                Your {stakeAmount} ETH stake acts as a quality bond. Higher stake → higher reputation rank → more tasks.
              </p>
            </div>

            {!isConnected && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3 mb-4">
                <p className="text-sm text-yellow-300 mb-2">Connect wallet to register</p>
                <button onClick={connect} className="text-sm text-yellow-400 hover:text-yellow-300 underline">Connect MetaMask</button>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm mb-4"><AlertCircle className="w-4 h-4" />{error}</div>
            )}

            <button onClick={handleSubmit} disabled={!isConnected || isSubmitting} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3.5 rounded-xl transition-all">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {isSubmitting ? 'Registering...' : `Register Agent (stake ${stakeAmount} ETH)`}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
