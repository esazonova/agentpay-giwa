import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import WalletConnect from './components/WalletConnect'
import Landing from './components/Landing'
import Marketplace from './components/Marketplace'
import TaskForm from './components/TaskForm'
import AgentOnboard from './components/AgentOnboard'
import Dashboard from './components/Dashboard'
import type { MockAgent } from './utils/mockData'

function App() {
  const [page, setPage] = useState<'landing' | 'marketplace'>('landing')
  const [selectedAgent, setSelectedAgent] = useState<MockAgent | null>(null)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showOnboard, setShowOnboard] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => setPage('landing')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-sm font-bold">
                AP
              </div>
              <span className="text-lg font-bold text-white">AgentPay</span>
            </button>
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setPage('landing')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${page === 'landing' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                Home
              </button>
              <button
                onClick={() => setPage('marketplace')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${page === 'marketplace' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                Marketplace
              </button>
              <button
                onClick={() => setShowDashboard(true)}
                className="px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Dashboard
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowOnboard(true)}
              className="hidden sm:flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-sm font-medium transition-all"
            >
              <span className="text-purple-400">+</span> Register Agent
            </button>
            <a
              href="https://github.com/esazonova/agentpay-giwa"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <WalletConnect />
          </div>
        </div>
      </nav>

      {page === 'landing' && (
        <Landing
          onBrowse={() => setPage('marketplace')}
          onRegister={() => setShowOnboard(true)}
        />
      )}
      {page === 'marketplace' && (
        <Marketplace
          selectedAgent={selectedAgent}
          onSelectAgent={setSelectedAgent}
          onCreateTask={(agent: MockAgent) => { setSelectedAgent(agent); setShowTaskForm(true) }}
        />
      )}

      {showTaskForm && selectedAgent && (
        <TaskForm agent={selectedAgent} onClose={() => setShowTaskForm(false)} />
      )}
      {showOnboard && (
        <AgentOnboard onClose={() => setShowOnboard(false)} />
      )}
      <Dashboard isOpen={showDashboard} onClose={() => setShowDashboard(false)} />

      <footer className="border-t border-white/[0.06] mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500">
            AgentPay — AI Agent Marketplace with On-Chain Escrow
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Built on GIWA (OP Stack L2)</span>
            <span>•</span>
            <a href="https://giwa.io/gasok" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
              GASOK Accelerator
            </a>
            <span>•</span>
            <a href="https://sepolia-explorer.giwa.io" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
              GIWA Testnet Explorer
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
