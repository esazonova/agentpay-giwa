import { DollarSign, CheckCircle2, Star, TrendingUp, Shield, ArrowUpRight } from 'lucide-react'
import { useWallet } from '../hooks/useWallet'

interface MockTask {
  id: string
  agent: string
  price: string
  status: 'active' | 'completed' | 'disputed'
  createdAt: string
}

const MOCK_TASKS: MockTask[] = [
  { id: '#42', agent: 'CodeReview Pro', price: '0.05 ETH', status: 'completed', createdAt: '2h ago' },
  { id: '#41', agent: 'CodeReview Pro', price: '0.03 ETH', status: 'active', createdAt: '15m ago' },
  { id: '#39', agent: 'Korean Translator AI', price: '0.015 ETH', status: 'completed', createdAt: '1d ago' },
  { id: '#38', agent: 'Smart Contract Tester', price: '0.04 ETH', status: 'disputed', createdAt: '2d ago' },
]

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-blue-500/20', text: 'text-blue-300', label: 'In Progress' },
  completed: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', label: 'Completed' },
  disputed: { bg: 'bg-red-500/20', text: 'text-red-300', label: 'Disputed' },
}

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function Dashboard({ isOpen, onClose }: Props) {
  const { isConnected } = useWallet()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white text-xl">×</button>

        <h3 className="text-xl font-bold text-white mb-6">Agent Dashboard</h3>

        {!isConnected ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-2">Connect wallet to view your dashboard</p>
            <p className="text-sm text-gray-500">Your agent stats, earnings, and active tasks</p>
          </div>
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { icon: DollarSign, label: 'Earnings', value: '2.45 ETH', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { icon: CheckCircle2, label: 'Completed', value: '142', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { icon: Star, label: 'Reputation', value: '4.7 ⭐', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                { icon: Shield, label: 'Staked', value: '1.0 ETH', color: 'text-purple-400', bg: 'bg-purple-500/10' },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className={`${bg} rounded-xl p-4`}>
                  <Icon className={`w-5 h-5 ${color} mb-1`} />
                  <div className="text-lg font-bold text-white">{value}</div>
                  <div className="text-xs text-gray-400">{label}</div>
                </div>
              ))}
            </div>

            {/* Trend chart placeholder */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Earnings (30d)
                </h4>
                <span className="text-xs text-emerald-400">▲ 23%</span>
              </div>
              <div className="flex items-end gap-1 h-16">
                {[40, 55, 35, 65, 50, 70, 80, 60, 90, 75, 95, 85, 100, 88, 92, 78, 95, 88, 102, 96].map((h, i) => (
                  <div key={i} className="flex-1 bg-gradient-to-t from-purple-600/60 to-purple-400/20 rounded-t-sm" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>

            {/* Recent tasks */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-white mb-3">Recent Tasks</h4>
              <div className="space-y-2">
                {MOCK_TASKS.map(task => {
                  const s = statusStyles[task.status]
                  return (
                    <div key={task.id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono text-gray-400">{task.id}</span>
                        <span className="text-sm text-white">{task.agent}</span>
                        <span className="text-xs text-gray-500">{task.createdAt}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-emerald-400">{task.price}</span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>{s.label}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium px-4 py-3 rounded-xl text-sm transition-all">
                <ArrowUpRight className="w-4 h-4" />
                Withdraw Earnings
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-4 py-3 rounded-xl text-sm transition-all">
                <Shield className="w-4 h-4" />
                Increase Stake
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
