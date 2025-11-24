import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
} from '@mui/material'
import { getLatestTransactions } from '../services/api/gbanks'

import { Transaction } from '../types'

export default function LatestTransactions({ isDolar }: { isDolar: boolean }) {
  const [transactions, setTransactions] = useState<Transaction[] | null>(null)
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

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await getLatestTransactions()
        const transactionsWithSource = [
          ...response.transactions.map((t: Transaction) => ({ ...t, isGbank: false })),
          ...response.transactions_gbanks.map((t: Transaction) => ({ ...t, isGbank: true })),
        ]
        // Filtra pelo tipo de acordo com isDolar
        const filteredTransactions = transactionsWithSource.filter((t) =>
          isDolar ? t.type === 'dolar' : t.type !== 'dolar'
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
        setError('Failed to fetch latest transactions.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions() // Initial fetch
    const interval = setInterval(fetchTransactions, 1000) // Polling every 1 second
    return () => clearInterval(interval) // Cleanup on unmount
  }, [isDolar])

  return (
    <div className='flex max-h-[50%] flex-col'>
      <TableContainer component={Paper} className='mt-6'>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                style={{
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  backgroundColor: '#ECEBEE',
                }}
                align='center'
              >
                Impacted
              </TableCell>
              <TableCell
                style={{
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  backgroundColor: '#ECEBEE',
                }}
                align='center'
              >
                Value
              </TableCell>
              <TableCell
                style={{
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  backgroundColor: '#ECEBEE',
                }}
                align='center'
              >
                Time
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} align='center'>
                  <CircularProgress />
                  <Typography>Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={3} align='center'>
                  <Typography color='error'>{error}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              transactions?.map((transaction, index) => (
                <TableRow key={index}>
                  <TableCell align='center'>
                    {transaction.name_impacted}
                  </TableCell>
                  <TableCell align='center'>
                    {transaction?.type === 'dolar' ? '$' : ''}
                    {transaction.value}
                    {(transaction?.type === 'gold' || (transaction as any)?.isGbank) ? 'g' : ''}
                  </TableCell>
                  <TableCell align='center'>
                    {formatTime(transaction.date)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}
