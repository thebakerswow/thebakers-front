import { useEffect, useState } from 'react'
import { getLatestTransactions } from '../services/adminApi'
import { LoadingSpinner } from '../../../../components/LoadingSpinner'
import { getApiErrorMessage } from '../../../../utils/apiErrorHandler'
import { useAdaptivePolling } from '../hooks/useAdaptivePolling'

import type {
  LatestTransactionsProps,
  LatestTransactionsResponse,
  Transaction,
  TransactionWithSource,
} from '../types/admin'

export default function LatestTransactions({ isDolar }: LatestTransactionsProps) {
  const [transactions, setTransactions] = useState<TransactionWithSource[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const formatTime = (dateString: string) => {
    // Espera data no formato 'dd/MM/yyyy HH:mm:ss'
    const match = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/.exec(
      dateString
    )
    if (match) {
      const [, , , , hour, minute] = match
      return `${hour}:${minute}`
    }
    // fallback para outros formatos
    let normalized = dateString
    if (normalized && !normalized.includes('T')) {
      normalized = normalized.replace(' ', 'T')
    }
    normalized = normalized.replace(/\.\d+Z$/, 'Z')
    const date = new Date(normalized)
    if (isNaN(date.getTime())) {
      return '-'
    }
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${hour}:${minute}`
  }

  const parseDate = (dateString: string): number => {
    // Tenta parsear formato 'dd/MM/yyyy HH:mm:ss'
    const match = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/.exec(
      dateString
    )
    if (match) {
      const [, day, month, year, hour, minute, second] = match
      // Cria data no formato ISO: yyyy-MM-ddTHH:mm:ss
      const isoDate = `${year}-${month}-${day}T${hour}:${minute}:${second}`
      return new Date(isoDate).getTime()
    }
    // fallback para outros formatos
    let normalized = dateString
    if (normalized && !normalized.includes('T')) {
      normalized = normalized.replace(' ', 'T')
    }
    normalized = normalized.replace(/\.\d+Z$/, 'Z')
    const date = new Date(normalized)
    return isNaN(date.getTime()) ? 0 : date.getTime()
  }

  const formatTransactionValue = (rawValue: string | number) => {
    const numeric = Number(rawValue)
    if (Number.isNaN(numeric)) {
      return String(rawValue)
    }

    const rounded = Math.round(numeric)
    const safeRounded = rounded === 0 ? 0 : rounded
    return safeRounded.toLocaleString('en-US')
  }

  const fetchTransactions = async () => {
    try {
      const response = (await getLatestTransactions()) as LatestTransactionsResponse
      const transactionsWithSource: TransactionWithSource[] = [
        ...response.transactions.map((t: Transaction) => ({ ...t, isGbank: false })),
        ...response.transactions_gbanks.map((t: Transaction) => ({ ...t, isGbank: true })),
      ]
      // Filtra pelo tipo de acordo com isDolar
      const filteredTransactions = transactionsWithSource.filter((t) =>
        isDolar ? t.type === 'dollar' : t.type !== 'dollar'
      )
      // Ordena por data/hora, mais recente primeiro (independente de origem)
      const sortedTransactions = filteredTransactions
        .sort(
          (a, b) => parseDate(b.date) - parseDate(a.date)
        )
        .slice(0, 20)
      setTransactions(sortedTransactions)
      setError(null)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to fetch latest transactions.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setIsLoading(true)
    fetchTransactions() // Busca inicial e ao trocar filtro
  }, [isDolar])

  useAdaptivePolling({
    onPoll: fetchTransactions,
    activeDelayMs: 1000,
    inactiveDelayMs: 6000,
  })

  return (
    <div className='flex max-h-[50%] flex-col'>
      <div className='mt-6 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] text-white'>
        <table className='w-full border-collapse'>
          <thead className='bg-white/[0.05] text-xs uppercase text-neutral-300'>
            <tr>
              <th className='border border-white/10 p-2 text-center'>Impacted</th>
              <th className='border border-white/10 p-2 text-center'>Value</th>
              <th className='border border-white/10 p-2 text-center'>Time</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={3} className='border border-white/10 p-3 text-center'>
                  <div className='flex flex-col items-center gap-2'>
                    <LoadingSpinner size='sm' label='Loading transactions' />
                    <span className='text-neutral-400'>Loading...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={3} className='border border-white/10 p-3 text-center text-red-300'>
                  {error}
                </td>
              </tr>
            ) : (
              transactions?.map((transaction, index) => (
                <tr key={index} className='border-b border-white/5 odd:bg-white/[0.02]'>
                  <td className='border border-white/10 p-2 text-center'>
                    {transaction.name_impacted}
                  </td>
                  <td className='border border-white/10 p-2 text-center'>
                    {transaction?.type === 'dollar' ? '$' : ''}
                    {formatTransactionValue(transaction.value)}
                    {(transaction?.type === 'gold' || transaction.isGbank) ? 'g' : ''}
                  </td>
                  <td className='border border-white/10 p-2 text-center'>
                    {formatTime(transaction.date)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
