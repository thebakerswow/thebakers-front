import { useState } from 'react'
import { ErrorComponent, ErrorDetails } from '../../../components/error-display'
import { LoadingSpinner } from '../../../components/LoadingSpinner'
import { SellsTab } from './sells-tab'
import { PaymentsTab } from './payments-tab'

export function PaymentsPage() {
  // Inicializar o estado diretamente com o valor do sessionStorage para evitar "piscar"
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = sessionStorage.getItem('paymentsActiveTab')
    if (savedTab) {
      const tabIndex = parseInt(savedTab, 10)
      // Agendar remoção assíncrona para evitar problema de dupla montagem (React StrictMode)
      setTimeout(() => {
        sessionStorage.removeItem('paymentsActiveTab')
      }, 100)
      return tabIndex
    }
    return 0
  })
  const [isLoading] = useState(false)
  const [error, setError] = useState<ErrorDetails | null>(null)

  const handleTabChange = (newValue: number) => {
    setActiveTab(newValue)
  }

  if (isLoading) {
    return (
      <div className='w-full overflow-auto overflow-x-hidden pr-20'>
        <div className='m-8 min-h-screen w-full pb-12 text-white'>
          <div className='flex h-40 items-center justify-center'>
            <div className='flex flex-col items-center gap-2'>
              <LoadingSpinner size='lg' label='Loading payments page' />
              <span className='text-gray-400'>Loading...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full overflow-auto overflow-x-hidden pr-20'>
      <div className='m-8 min-h-screen w-full pb-12 text-white'>
        {error && <ErrorComponent error={error} onClose={() => setError(null)} />}
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
              Sells
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
        {activeTab === 0 && <SellsTab onError={setError} />}
        {activeTab === 1 && <PaymentsTab onError={setError} />}
      </div>
    </div>
  )
}
