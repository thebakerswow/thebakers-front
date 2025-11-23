import { useState, useMemo, useEffect } from 'react'
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Typography,
  CircularProgress,
  Box,
  Button,
} from '@mui/material'
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
    let dataSource: Record<string, PaymentResumeItem> = {}
    
    if (statusFilter === 'completed') {
      dataSource = resumeData.info.completed || {}
    } else {
      // Para pending, combina pending_gold e pending_dolar
      dataSource = {
        ...(resumeData.info.pending_gold || {}),
        ...(resumeData.info.pending_dolar || {}),
      }
    }

    // Converte o objeto em array e formata os dados
    return Object.entries(dataSource)
      .map(([date, item]) => ({
        date,
        paymentDate: formatDate(item.payment_date),
        goldSold: item.gold_sold,
        avgM: item.avg_m,
        goldInDollar: item.gold_in_dolar,
        shopDolar: item.dolar_sold,
        total: item.total,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Mais recente primeiro
  }, [resumeData, statusFilter])

  if (isLoading) {
    return (
      <div className='w-full overflow-auto overflow-x-hidden pr-20'>
        <div className='m-8 min-h-screen w-full pb-12 text-white'>
          <div className='flex h-40 items-center justify-center'>
            <div className='flex flex-col items-center gap-2'>
              <CircularProgress size={32} sx={{ color: 'rgb(147, 51, 234)' }} />
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
        
        <div className='mb-6 flex justify-between items-center'>
          <Typography variant='h4' fontWeight='bold'>
            Sells Management
          </Typography>
        </div>

        {/* Status Filter */}
        <Box sx={{ mb: 3, display: 'flex', gap: 1, alignItems: 'center' }}>

          <Button
            variant={statusFilter === 'pending' ? 'contained' : 'outlined'}
            onClick={() => setStatusFilter('pending')}
            sx={{
              backgroundColor: statusFilter === 'pending' ? '#f59e0b' : 'transparent',
              borderColor: '#f59e0b',
              color: 'white',
              '&:hover': {
                backgroundColor: statusFilter === 'pending' ? '#fbbf24' : 'rgba(245, 158, 11, 0.1)',
                borderColor: '#fbbf24',
              },
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1
            }}
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === 'completed' ? 'contained' : 'outlined'}
            onClick={() => setStatusFilter('completed')}
            sx={{
              backgroundColor: statusFilter === 'completed' ? '#10b981' : 'transparent',
              borderColor: '#10b981',
              color: 'white',
              '&:hover': {
                backgroundColor: statusFilter === 'completed' ? '#34d399' : 'rgba(16, 185, 129, 0.1)',
                borderColor: '#34d399',
              },
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1
            }}
          >
            Completed
          </Button>
        </Box>

        {salesByDate.length === 0 ? (
          <Paper sx={{ bgcolor: '#3a3a3a', border: '1px solid #555', p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              No sales found
            </Typography>
          </Paper>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              bgcolor: '#2a2a2a',
              border: '1px solid #333',
              '& .MuiTableCell-root': {
                borderColor: '#333',
              },
            }}
          >
            <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
              <colgroup>
                <col style={{ width: '120px' }} />
                <col style={{ width: '150px' }} />
                <col style={{ width: '150px' }} />
                <col style={{ width: '150px' }} />
                <col style={{ width: '150px' }} />
                <col style={{ width: '150px' }} />
              </colgroup>
              <TableHead>
                <TableRow sx={{ bgcolor: '#1a1a1a' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem', px: 2 }}>
                    Payment Date
                  </TableCell>
                  <TableCell align='right' sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem', px: 2 }}>
                    Gold Sold
                  </TableCell>
                  <TableCell align='right' sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem', px: 2 }}>
                    Avg M
                  </TableCell>
                  <TableCell align='right' sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem', px: 2 }}>
                    Gold In $
                  </TableCell>
                  <TableCell align='right' sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem', px: 2 }}>
                    Shop Dolar
                  </TableCell>
                  <TableCell align='right' sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem', px: 2 }}>
                    Total
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {salesByDate.map((dateData) => (
                  <TableRow
                    key={dateData.date}
                    sx={{
                      '&:hover': {
                        bgcolor: '#3a3a3a',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <TableCell sx={{ color: 'white', fontSize: '0.9rem', fontWeight: 'medium', px: 2 }}>
                      {dateData.paymentDate}
                    </TableCell>
                    <TableCell align='right' sx={{ color: '#60a5fa', fontSize: '0.9rem', fontWeight: 600, px: 2 }}>
                      {formatGold(dateData.goldSold)}g
                    </TableCell>
                    <TableCell align='right' sx={{ color: '#a78bfa', fontSize: '0.9rem', fontWeight: 600, px: 2 }}>
                      {formatDollar(dateData.avgM)}
                    </TableCell>
                    <TableCell align='right' sx={{ color: '#10b981', fontSize: '0.9rem', fontWeight: 600, px: 2 }}>
                      {formatDollar(dateData.goldInDollar)}
                    </TableCell>
                    <TableCell align='right' sx={{ color: '#10b981', fontSize: '0.9rem', fontWeight: 600, px: 2 }}>
                      {formatDollar(dateData.shopDolar)}
                    </TableCell>
                    <TableCell align='right' sx={{ color: '#f59e0b', fontSize: '0.9rem', fontWeight: 600, px: 2 }}>
                      {formatDollar(dateData.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>
    </div>
  )
}

