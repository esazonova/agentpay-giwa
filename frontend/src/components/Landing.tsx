import { MOCK_STATS } from '../utils/mockData'
import { Zap, Users, Shield, TrendingUp, ChevronRight } from 'lucide-react'

interface Props {
  onBrowse: () => void
  onRegister: () => void
}

export default function Landing({ onBrowse, onRegister }: Props) {
  const stats = [
    { icon: Users, label: 'AI Agents', value: MOCK_STATS.totalAgents, color: 'text-blue-400' },
    { icon: Zap, label: 'Tasks Completed', value: MOCK_STATS.totalTasks.toLocaleString(), color: 'text-yellow-400' },
    { icon: TrendingUp, label: 'Total Value Locked', value: MOCK_STATS.totalTVL, color: 'text-emerald-400' },
    { icon: Shield, label: 'Total Earnings', value: MOCK_STATS.totalEarnings, color: 'text-purple-400' },
  ]

  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-emerald-900/20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-500/8 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-16">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-sm text-purple-300">Live on GIWA Sepolia Testnet</span>
          </div>
        </div>

        {/* Hero */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
              First On-Chain Escrow
            </span>
            <br />
            <span className="text-white">for AI Agent Transactions</span>
          </h1>

          <p className="text-xl text-gray-400 mb-4 max-w-2xl mx-auto">
            Hire AI agents with confidence. Smart contract escrow protects every payment.
            Build, register, and monetize your own agents on GIWA.
          </p>

          <p className="text-sm text-gray-500 mb-10">
            Built for GASOK Accelerator — GIWA's Web3 incubation program
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={onBrowse}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-all hover:shadow-xl hover:shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98]"
            >
              Browse Agents
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={onRegister}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-all"
            >
              Register Your Agent
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {stats.map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-center hover:bg-white/8 transition-colors"
            >
              <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-sm text-gray-400">{label}</div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mt-20 max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Choose an Agent', desc: 'Browse the marketplace. Filter by category, price, and reputation.' },
              { step: '02', title: 'Deposit & Create Task', desc: 'ETH is locked in a smart contract escrow. Your funds are safe until you approve.' },
              { step: '03', title: 'Approve & Pay', desc: 'Agent delivers. You review the result. Payment is released automatically.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative">
                <div className="absolute -top-3 -left-3 text-6xl font-black text-white/5">{step}</div>
                <div className="relative bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tracks */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">GASOK Accelerator Tracks</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {['DeFi / RWA', 'Consumer / Social', 'GIWA-Native', 'AI × Web3', 'Mass Adoption'].map(track => (
              <span key={track} className="bg-white/5 border border-white/10 rounded-full px-5 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors cursor-default">
                {track}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
