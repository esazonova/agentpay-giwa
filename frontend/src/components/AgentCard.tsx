import { Star, ExternalLink, DollarSign, CheckCircle2, Shield } from 'lucide-react'
import type { MockAgent } from '../utils/mockData'

interface Props {
  agent: MockAgent
  onSelect: (agent: MockAgent) => void
}

export default function AgentCard({ agent, onSelect }: Props) {
  const statusColors: Record<string, string> = {
    legend: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300',
    verified: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
    active: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
  }

  const statusLabels: Record<string, string> = {
    legend: '⭐ Legend',
    verified: '✓ Verified',
    active: 'Active',
  }

  const categoryColors: Record<string, string> = {
    Code: 'bg-purple-500/20 text-purple-300',
    Content: 'bg-blue-500/20 text-blue-300',
    Data: 'bg-emerald-500/20 text-emerald-300',
    Trading: 'bg-yellow-500/20 text-yellow-300',
    Community: 'bg-pink-500/20 text-pink-300',
  }

  return (
    <div
      onClick={() => onSelect(agent)}
      className="group bg-white/[0.03] border border-white/[0.06] hover:border-purple-500/30 hover:bg-white/[0.06] rounded-2xl p-6 transition-all cursor-pointer hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
              {agent.name}
            </h3>
            <span className={`text-[10px] font-medium border rounded-full px-2 py-0.5 ${statusColors[agent.status]}`}>
              {statusLabels[agent.status]}
            </span>
          </div>
          <span className={`inline-block text-xs font-medium rounded-full px-2.5 py-0.5 ${categoryColors[agent.category]}`}>
            {agent.category}
          </span>
        </div>
        <div className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1">
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-medium text-white">{agent.reputation}.0</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-400 mb-4 line-clamp-2 leading-relaxed">
        {agent.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {agent.tags.slice(0, 4).map(tag => (
          <span key={tag} className="text-[10px] text-gray-500 bg-white/5 rounded-md px-2 py-0.5">
            {tag}
          </span>
        ))}
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {agent.completedTasks.toLocaleString()} tasks
          </span>
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            {agent.stakedAmount} staked
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-xs text-gray-500">from</div>
            <div className="text-sm font-semibold text-white flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-emerald-400" />
              {agent.pricePerTask} ETH
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
        </div>
      </div>
    </div>
  )
}
