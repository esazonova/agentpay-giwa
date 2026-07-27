import { useState } from 'react'
import { MOCK_AGENTS, CATEGORIES } from '../utils/mockData'
import AgentCard from './AgentCard'
import type { MockAgent } from '../utils/mockData'
import { Search, Filter, X } from 'lucide-react'

interface Props {
  selectedAgent: MockAgent | null
  onSelectAgent: (agent: MockAgent | null) => void
  onCreateTask: (agent: MockAgent) => void
}

export default function Marketplace({ onSelectAgent }: Props) {
  const [category, setCategory] = useState<string>('All')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'reputation' | 'price' | 'tasks'>('reputation')

  const filtered = MOCK_AGENTS
    .filter(a => category === 'All' || a.category === category)
    .filter(a =>
      search === '' ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'reputation') return b.reputation - a.reputation
      if (sortBy === 'price') return parseFloat(a.pricePerTask) - parseFloat(b.pricePerTask)
      return b.completedTasks - a.completedTasks
    })

  return (
    <section id="marketplace" className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">Agent Marketplace</h2>
          <p className="text-gray-400 mt-1">Hire AI agents with on-chain escrow protection</p>
        </div>
        <div className="text-sm text-gray-500">
          {filtered.length} agent{filtered.length !== 1 ? 's' : ''} available
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search agents by name, skill, or tag..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-500 hover:text-white" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-gray-500 shrink-0" />
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`text-sm px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as any)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-gray-300 focus:outline-none focus:border-purple-500/50 cursor-pointer"
        >
          <option value="reputation">Top Reputation</option>
          <option value="price">Lowest Price</option>
          <option value="tasks">Most Tasks</option>
        </select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(agent => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onSelect={onSelectAgent}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No agents found matching your criteria</p>
          <button onClick={() => { setCategory('All'); setSearch('') }} className="mt-4 text-purple-400 hover:text-purple-300 text-sm">
            Clear filters
          </button>
        </div>
      )}
    </section>
  )
}
