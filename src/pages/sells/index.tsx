import { useState, useMemo, useEffect } from 'react'
import { SellsTable } from './components/SellsTable'
import { SellsPageSkeleton } from './components/SellsPageSkeleton'
import { getPaymentsResume } from './services/sellsApi'
import { handleApiError } from '../../utils/apiErrorHandler'
import {
  ExtendedPaymentResumeItem,
  PaymentsResumeResponse,
  SalesByDate,
  SellsStatusFilter,
} from './types/sells'

export function SellsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<SellsStatusFilter>('pending')
  const [resumeData, setResumeData] = useState<PaymentsResumeResponse | null>(null)

  const normalizePaymentType = (
    type: string | undefined
  ): 'gold' | 'dollar' | 'mixed' => {
    if (type === 'mixed') return 'mixed'
    if (type === 'dollar' || type === 'dolar') return 'dollar'
    return 'gold'
  }

  const toSafeNumber = (value: unknown): number => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  // Faz o GET na rota /payments/resume
  useEffect(() => {
    const fetchPaymentsResume = async () => {
      try {
        setIsLoading(true)
        const response = await getPaymentsResume()
        setResumeData(response)
      } catch (err) {
        await handleApiError(err, 'Failed to fetch payments resume')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPaymentsResume()
  }, [])

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
    let dataSource: Record<string, ExtendedPaymentResumeItem> = {}
    
    if (statusFilter === 'completed') {
      // Para completed, usa os dados diretamente da API
      // Se já vier como "mixed", usa o total que vem da API
      const completed = resumeData.info.completed || {}
      
      Object.entries(completed).forEach(([date, item]) => {
        const itemType = normalizePaymentType(item.type)
        // Se já for mixed, usa diretamente (o total já vem calculado da API)
        if (itemType === 'mixed') {
          dataSource[date] = {
            ...item,
            type: 'mixed',
            balance_total_gold: item.balance_total ?? null,
            balance_total_dolar: item.balance_total ?? null,
          }
        } else {
          // Para gold e dollar, usa diretamente
          dataSource[date] = {
            ...item,
            type: itemType,
            balance_total_gold: itemType === 'gold' ? item.balance_total ?? null : null,
            balance_total_dolar: itemType === 'dollar' ? item.balance_total ?? null : null,
          }
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
            balance_total_gold: goldItem.balance_total ?? null,
            balance_total_dolar: dolarItem.balance_total ?? null,
          }
        } else if (goldItem) {
          dataSource[date] = {
            ...goldItem,
            balance_total_gold: goldItem.balance_total ?? null,
            balance_total_dolar: null,
          }
        } else if (dolarItem) {
          dataSource[date] = {
            ...dolarItem,
            type: normalizePaymentType(dolarItem.type),
            balance_total_gold: null,
            balance_total_dolar: dolarItem.balance_total ?? null,
          }
        }
      })
    }

    // Converte o objeto em array e formata os dados
    return Object.entries(dataSource)
      .map(([date, item]) => {
        const type = normalizePaymentType(item.type)
        const total =
          type === 'mixed'
            ? toSafeNumber(item.total)
            : type === 'gold'
              ? toSafeNumber(item.gold_in_dolar)
              : toSafeNumber(item.dolar_sold)
        
        return {
          date,
          paymentDate: formatDate(item.payment_date),
          goldSold: toSafeNumber(item.gold_sold),
          avgM: toSafeNumber(item.avg_m),
          goldInDollar: toSafeNumber(item.gold_in_dolar),
          shopDolar: toSafeNumber(item.dolar_sold),
          total,
          type,
          balanceGold: item.balance_total_gold ?? null,
          balanceDolar: item.balance_total_dolar ?? null,
        }
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Mais antiga primeiro
  }, [resumeData, statusFilter])

  if (isLoading) {
    return <SellsPageSkeleton />
  }

  return (
    <div className='w-full overflow-auto overflow-x-hidden pr-20'>
      <div className='m-8 min-h-screen w-full pb-12 text-white'>
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

        <SellsTable salesByDate={salesByDate} statusFilter={statusFilter} />
      </div>
    </div>
  )
}

