import { useState, useMemo, useEffect } from 'react'
import { CircleNotch } from '@phosphor-icons/react'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import { getPaymentsResume, PaymentsResumeResponse, PaymentResumeItem } from '../../services/api/payments'

// Interface para vendas agrupadas por data
interface SalesByDate {
  date: string
  paymentDate: string // formato mm/dd/yyyy
  goldSold: number
  avgM: number
  goldInDollar: number
  shopDolar: number
  total: number
  type: 'gold' | 'dolar' | 'mixed'
  balanceGold: number | null
  balanceDolar: number | null
}

export function SellsPage() {
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'pending' | 'completed'>('pending')
  const [resumeData, setResumeData] = useState<PaymentsResumeResponse | null>(null)

  // Faz o GET na rota /payments/resume
  useEffect(() => {
    const fetchPaymentsResume = async () => {
      try {
        setIsLoading(true)
        const response = await getPaymentsResume()
        setResumeData(response)
      } catch (err) {
        console.error('Error fetching payments resume:', err)
        setError({
          message: err instanceof Error ? err.message : 'Unknown error occurred',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPaymentsResume()
  }, [])

  // Função para formatar valor de gold
  const formatGold = (value: number): string => {
    return Math.round(value).toLocaleString('en-US')
  }

  // Função para formatar valor em dólar
  const formatDollar = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  // Função para formatar data (de YYYY-MM-DD para MM/DD/YYYY)
  const formatDate = (dateStr: string): string => {
    const match = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
    if (match) {
      const year = match[1]
      const month = match[2].padStart(2, '0')
      const day = match[3].padStart(2, '0')
      return `${month}/${day}/${year}`
    }
    return dateStr
  }

  // Processa os dados da API e agrupa por data
  const salesByDate: SalesByDate[] = useMemo(() => {
    if (!resumeData) {
      return []
    }

    // Seleciona os dados baseado no filtro de status
    type ExtendedPaymentResumeItem = Omit<PaymentResumeItem, 'type'> & { type: 'gold' | 'dolar' | 'mixed' }
    let dataSource: Record<string, ExtendedPaymentResumeItem> = {}
    
    if (statusFilter === 'completed') {
      // Para completed, usa os dados diretamente da API
      // Se já vier como "mixed", usa o total que vem da API
      const completed = resumeData.info.completed || {}
      
      Object.entries(completed).forEach(([date, item]) => {
        // Se já for mixed, usa diretamente (o total já vem calculado da API)
        const itemType = item.type as 'gold' | 'dolar' | 'mixed'
        if (itemType === 'mixed') {
          dataSource[date] = {
            ...item,
            type: 'mixed',
            balance_total_gold: (item as any).balance_total,
            balance_total_dolar: (item as any).balance_total,
          } as any
        } else {
          // Para gold e dolar, usa diretamente
          dataSource[date] = {
            ...item,
            balance_total_gold: item.type === 'gold' ? (item as any).balance_total : null,
            balance_total_dolar: item.type === 'dolar' ? (item as any).balance_total : null,
          } as any
        }
      })
    } else {
      // Para pending, combina pending_gold e pending_dolar
      // Se houver a mesma data em ambos, combina em uma única linha
      const pendingGold = resumeData.info.pending_gold || {}
      const pendingDolar = resumeData.info.pending_dolar || {}
      
      // Coleta todas as datas únicas
      const allDates = new Set([
        ...Object.keys(pendingGold),
        ...Object.keys(pendingDolar)
      ])
      
      // Para cada data, combina os dados se existirem em ambos
      allDates.forEach(date => {
        const goldItem = pendingGold[date]
        const dolarItem = pendingDolar[date]
        
        if (goldItem && dolarItem) {
          // Combina: soma gold_in_dolar do gold com dolar_sold do dólar
          dataSource[date] = {
            ...goldItem,
            dolar_sold: dolarItem.dolar_sold,
            total: goldItem.gold_in_dolar + dolarItem.dolar_sold,
            type: 'mixed',
            balance_total_gold: (goldItem as any).balance_total,
            balance_total_dolar: (dolarItem as any).balance_total,
          } as any
        } else if (goldItem) {
          dataSource[date] = {
            ...goldItem,
            balance_total_gold: (goldItem as any).balance_total,
            balance_total_dolar: null,
          } as any
        } else if (dolarItem) {
          dataSource[date] = {
            ...dolarItem,
            balance_total_gold: null,
            balance_total_dolar: (dolarItem as any).balance_total,
          } as any
        }
      })
    }

    // Converte o objeto em array e formata os dados
    return Object.entries(dataSource)
      .map(([date, item]) => {
        const type = (item.type === 'mixed' ? 'mixed' : item.type) as 'gold' | 'dolar' | 'mixed'
        let total: number
        
        if (type === 'mixed') {
          // Mixed: usa o total que já vem calculado (do completed ou do pending combinado)
          total = item.total
        } else if (type === 'gold') {
          // Gold: exibe gold_in_dolar
          total = item.gold_in_dolar
        } else {
          // Dolar: exibe dolar_sold
          total = item.dolar_sold
        }
        
        return {
          date,
          paymentDate: formatDate(item.payment_date),
          goldSold: item.gold_sold,
          avgM: item.avg_m,
          goldInDollar: item.gold_in_dolar,
          shopDolar: item.dolar_sold,
          total,
          type,
          balanceGold: (item as any).balance_total_gold ?? null,
          balanceDolar: (item as any).balance_total_dolar ?? null,
        }
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Mais antiga primeiro
  }, [resumeData, statusFilter])

  if (isLoading) {
    return (
      <div className='w-full overflow-auto overflow-x-hidden pr-20'>
        <div className='m-8 min-h-screen w-full pb-12 text-white'>
          <div className='flex h-40 items-center justify-center'>
            <div className='flex flex-col items-center gap-2'>
              <CircleNotch size={32} className='animate-spin text-purple-400' />
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
        
        {/* Status Filter */}
        <div className='mb-4 flex items-center gap-2'>
          <button
            type='button'
            onClick={() => setStatusFilter('pending')}
            className='rounded-md border px-4 py-2 text-sm font-semibold transition'
            style={{
              borderColor: statusFilter === 'pending' ? 'rgba(245,158,11,0.65)' : 'rgba(255,255,255,0.15)',
              color: statusFilter === 'pending' ? '#fcd34d' : '#d4d4d8',
              backgroundColor: statusFilter === 'pending' ? 'rgba(245,158,11,0.18)' : 'rgba(255,255,255,0.03)',
            }}
          >
            Pending
          </button>
          <button
            type='button'
            onClick={() => setStatusFilter('completed')}
            className='rounded-md border px-4 py-2 text-sm font-semibold transition'
            style={{
              borderColor: statusFilter === 'completed' ? 'rgba(16,185,129,0.65)' : 'rgba(255,255,255,0.15)',
              color: statusFilter === 'completed' ? '#6ee7b7' : '#d4d4d8',
              backgroundColor: statusFilter === 'completed' ? 'rgba(16,185,129,0.18)' : 'rgba(255,255,255,0.03)',
            }}
          >
            Completed
          </button>
        </div>

        {salesByDate.length === 0 ? (
          <div className='rounded-xl border border-white/15 bg-white/[0.08] p-4 text-center'>
            <p className='text-neutral-400'>No payments found</p>
          </div>
        ) : (
          <div className='overflow-x-auto rounded-xl border border-white/10 bg-white/[0.05]'>
            <table className='w-full' style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '120px' }} />
                {statusFilter === 'pending' && <col style={{ width: '150px' }} />}
                <col style={{ width: '150px' }} />
                <col style={{ width: '150px' }} />
                <col style={{ width: '150px' }} />
                {statusFilter === 'pending' && <col style={{ width: '150px' }} />}
                <col style={{ width: '150px' }} />
                <col style={{ width: '150px' }} />
              </colgroup>
              <thead>
                <tr className='bg-white/[0.06]'>
                  <th className='px-4 py-4 text-left text-sm font-bold text-white'>
                    Payment Date
                  </th>
                  {statusFilter === 'pending' && (
                    <th className='px-4 py-4 text-right text-sm font-bold text-white'>
                      Balance Gold
                    </th>
                  )}
                  <th className='px-4 py-4 text-right text-sm font-bold text-white'>
                    Gold Sold
                  </th>
                  <th className='px-4 py-4 text-right text-sm font-bold text-white'>
                    Avg M
                  </th>
                  <th className='px-4 py-4 text-right text-sm font-bold text-white'>
                    Gold In $
                  </th>
                  {statusFilter === 'pending' && (
                    <th className='px-4 py-4 text-right text-sm font-bold text-white'>
                      Balance Dolar
                    </th>
                  )}
                  <th className='px-4 py-4 text-right text-sm font-bold text-white'>
                    Shop Dolar
                  </th>
                  <th className='px-4 py-4 text-right text-sm font-bold text-white'>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {salesByDate.map((dateData) => (
                  <tr key={dateData.date} className='border-t border-white/10 transition hover:bg-white/[0.03]'>
                    <td className='px-4 py-3 text-left text-sm font-medium text-white'>
                      {dateData.paymentDate}
                    </td>
                    {statusFilter === 'pending' && (
                      <td className='px-4 py-3 text-right text-sm font-semibold text-blue-300'>
                        {dateData.balanceGold !== null ? formatGold(dateData.balanceGold) + 'g' : '-'}
                      </td>
                    )}
                    <td className='px-4 py-3 text-right text-sm font-semibold text-blue-300'>
                      {dateData.type === 'dolar' ? '-' : `${formatGold(dateData.goldSold)}g`}
                    </td>
                    <td className='px-4 py-3 text-right text-sm font-semibold text-violet-300'>
                      {dateData.type === 'dolar' ? '-' : formatDollar(dateData.avgM)}
                    </td>
                    <td className='px-4 py-3 text-right text-sm font-semibold text-emerald-300'>
                      {dateData.type === 'dolar' ? '-' : formatDollar(dateData.goldInDollar)}
                    </td>
                    {statusFilter === 'pending' && (
                      <td className='px-4 py-3 text-right text-sm font-semibold text-blue-300'>
                        {dateData.balanceDolar !== null ? formatDollar(dateData.balanceDolar) : '-'}
                      </td>
                    )}
                    <td className='px-4 py-3 text-right text-sm font-semibold text-emerald-300'>
                      {dateData.type === 'gold' ? '-' : formatDollar(dateData.shopDolar)}
                    </td>
                    <td className='px-4 py-3 text-right text-sm font-semibold text-amber-400'>
                      {formatDollar(dateData.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

