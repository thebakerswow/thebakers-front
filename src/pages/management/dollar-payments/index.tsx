import { useState } from 'react'
import { ReceiptsSellsTab } from './components/SellsTab'
import { ReceiptsPaymentsTab } from './components/PaymentsTab'

export function ReceiptsPage() {
  // Inicializar o estado diretamente com o valor do sessionStorage para evitar "piscar"
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = sessionStorage.getItem('receiptsActiveTab')
    if (savedTab) {
      const tabIndex = parseInt(savedTab, 10)
      // Agendar remoção assíncrona para evitar problema de dupla montagem (React StrictMode)
      setTimeout(() => {
        sessionStorage.removeItem('receiptsActiveTab')
      }, 100)
      return tabIndex
    }
    return 0
  })
  const handleTabChange = (newValue: number) => {
    setActiveTab(newValue)
  }

  return (
    <div className='w-full overflow-auto overflow-x-hidden pr-20'>
      <div className='m-8 min-h-screen w-full pb-12 text-white'>
        {/* Tabs */}
        <div className='mb-4 rounded-xl border border-white/10 bg-white/[0.04] p-2'>
          <div className='grid grid-cols-2 gap-2'>
            <button
              type='button'
              onClick={() => handleTabChange(0)}
              className={`rounded-lg border px-4 py-2 text-sm transition ${
                activeTab === 0
                  ? 'border-purple-400/50 bg-purple-500/20 text-purple-100'
                  : 'border-white/10 bg-white/[0.03] text-neutral-300 hover:border-purple-400/40 hover:bg-purple-500/10'
              }`}
            >
              Receipts
            </button>
            <button
              type='button'
              onClick={() => handleTabChange(1)}
              className={`rounded-lg border px-4 py-2 text-sm transition ${
                activeTab === 1
                  ? 'border-purple-400/50 bg-purple-500/20 text-purple-100'
                  : 'border-white/10 bg-white/[0.03] text-neutral-300 hover:border-purple-400/40 hover:bg-purple-500/10'
              }`}
            >
              Payments
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 0 && <ReceiptsSellsTab />}
        {activeTab === 1 && <ReceiptsPaymentsTab />}
      </div>
    </div>
  )
}
