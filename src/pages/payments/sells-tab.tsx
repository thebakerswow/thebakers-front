import { useState, useEffect, useMemo } from 'react'
import {
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import { Calendar, CurrencyDollar, Plus } from '@phosphor-icons/react'
import { ErrorDetails } from '../../components/error-display'
import { Payment } from '../../types/payment-interface'
import { AddPayment } from '../../components/add-payment'

interface SellsTabProps {
  onError?: (error: ErrorDetails | null) => void
}

export function SellsTab({ onError }: SellsTabProps) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'cancelled'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [buyerFilter, setBuyerFilter] = useState('all')
  const [dateMinFilter, setDateMinFilter] = useState('')
  const [dateMaxFilter, setDateMaxFilter] = useState('')
  const [minValueFilter, setMinValueFilter] = useState('')
  const [minValueFilterInput, setMinValueFilterInput] = useState('')
  const [maxValueFilter, setMaxValueFilter] = useState('')
  const [maxValueFilterInput, setMaxValueFilterInput] = useState('')
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false)

  // Função para extrair e formatar data diretamente da string da API
  const formatDateFromAPI = (apiDateString: string) => {
    const datePart = apiDateString.split('T')[0]
    const [year, month, day] = datePart.split('-')
    
    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ]
    
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    const weekday = weekdays[date.getDay()]
    
    return {
      date: `${weekday}, ${day} ${months[parseInt(month) - 1]} ${year}`,
      time: apiDateString.split('T')[1]?.split('.')[0]?.substring(0, 5) || '00:00'
    }
  }

  // Função para formatar valor da calculadora
  const formatCalculatorValue = (value: string) => {
    if (!value || value === '') return ''
    
    const rawValue = value.replace(/[^0-9-]/g, '').replace(/(?!^)-/g, '')
    
    if (rawValue === '-') return '-'
    
    if (!/\d/.test(rawValue)) return ''
    
    const numberValue = Number(rawValue)
    return isNaN(numberValue) ? '' : numberValue.toLocaleString('en-US')
  }

  // Função para formatar valor para exibição
  const formatValueForDisplay = (value: number): string => {
    const formatted = Math.abs(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return value < 0 ? `-${formatted}` : formatted
  }

  // Função para formatar valor em dólar
  const formatDollar = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  const fetchPayments = async () => {
    try {
      // TODO: Substituir por chamada real à API
      const mockPayments: Payment[] = [
        {
          id: 1,
          note: 'Pagamento de run M+20',
          buyer: 'João Silva',
          valueGold: 500000,
          dollar: 45.50,
          mValue: 0.091,
          date: '2025-10-05T14:30:00',
          status: 'paid'
        },
        {
          id: 2,
          note: 'Raid Heroic completa',
          buyer: 'Maria Santos',
          valueGold: 1200000,
          dollar: 109.20,
          mValue: 0.091,
          date: '2025-10-06T18:00:00',
          status: 'pending'
        },
        {
          id: 3,
          note: 'Leveling 60-70',
          buyer: 'Pedro Costa',
          valueGold: 300000,
          dollar: 27.30,
          mValue: 0.091,
          date: '2025-10-04T10:15:00',
          status: 'cancelled'
        },
      ]

      setPayments(mockPayments)
      setTotalPages(1)
    } catch (error) {
      const errorDetails = {
        message: 'Error fetching payments',
        response: error,
      }
      if (onError) {
        onError(errorDetails)
      }
    }
  }

  const handleStatusFilter = (status: 'all' | 'pending' | 'paid' | 'cancelled') => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page)
  }

  const handleBuyerFilterChange = (buyerId: string) => {
    setBuyerFilter(buyerId)
    setCurrentPage(1)
  }

  // Lista única de buyers dos pagamentos
  const uniqueBuyers = useMemo(() => {
    const buyersSet = new Set(payments.map(p => p.buyer))
    return Array.from(buyersSet).sort()
  }, [payments])

  const handleDateMinFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDateMinFilter(event.target.value)
    setCurrentPage(1)
  }

  const handleDateMaxFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDateMaxFilter(event.target.value)
    setCurrentPage(1)
  }

  const handleMinValueFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    const formattedValue = formatCalculatorValue(value)
    setMinValueFilterInput(formattedValue)
    
    const rawValue = value.replace(/[^0-9-]/g, '').replace(/(?!^)-/g, '')
    
    if (!rawValue || rawValue === '-') {
      setMinValueFilter('')
    } else if (!isNaN(Number(rawValue))) {
      setMinValueFilter(rawValue)
    }
  }

  const handleMaxValueFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    const formattedValue = formatCalculatorValue(value)
    setMaxValueFilterInput(formattedValue)
    
    const rawValue = value.replace(/[^0-9-]/g, '').replace(/(?!^)-/g, '')
    
    if (!rawValue || rawValue === '-') {
      setMaxValueFilter('')
    } else if (!isNaN(Number(rawValue))) {
      setMaxValueFilter(rawValue)
    }
  }

  const clearAllFilters = () => {
    setBuyerFilter('all')
    setDateMinFilter('')
    setDateMaxFilter('')
    setMinValueFilter('')
    setMinValueFilterInput('')
    setMaxValueFilter('')
    setMaxValueFilterInput('')
    setCurrentPage(1)
  }

  useEffect(() => {
    fetchPayments()
  }, [statusFilter, currentPage, buyerFilter, dateMinFilter, dateMaxFilter, minValueFilter, maxValueFilter])

  // Função para agrupar pagamentos por situação
  const paymentsSummary = useMemo(() => {
    const summary: Record<string, { count: number; totalGold: number; totalDollar: number }> = {}

    payments.forEach((payment) => {
      const status = payment.status
      if (!summary[status]) {
        summary[status] = { count: 0, totalGold: 0, totalDollar: 0 }
      }
      summary[status].count++
      summary[status].totalGold += payment.valueGold || 0
      summary[status].totalDollar += payment.dollar || 0
    })

    return summary
  }, [payments])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'paid':
        return 'success'
      case 'cancelled':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'PENDING'
      case 'paid':
        return 'PAID'
      case 'cancelled':
        return 'CANCELLED'
      default:
        return status.toUpperCase()
    }
  }

  return (
    <>
      {/* Filters */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Status Filter */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel sx={{ 
            color: 'white',
            '&.Mui-focused': {
              color: 'rgb(147, 51, 234)',
            },
          }}>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value as 'all' | 'pending' | 'paid' | 'cancelled')}
            label="Status"
            sx={{
              color: 'white',
              backgroundColor: '#2a2a2a',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.23)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgb(147, 51, 234)',
              },
              '& .MuiSvgIcon-root': {
                color: 'white',
              },
              '& .MuiSelect-select': {
                color: 'white',
                backgroundColor: '#2a2a2a',
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #333',
                  '& .MuiMenuItem-root': {
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#3a3a3a',
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(147, 51, 234, 0.2)',
                      '&:hover': {
                        backgroundColor: 'rgba(147, 51, 234, 0.3)',
                      },
                    },
                  },
                },
              },
            }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
        </Box>
        
        <Button
          variant='contained'
          startIcon={<Plus size={20} />}
          onClick={() => setIsAddPaymentOpen(true)}
          sx={{
            backgroundColor: 'rgb(147, 51, 234)',
            '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
            padding: '10px 20px',
            boxShadow: 3,
          }}
        >
          Add Sale
        </Button>
      </Box>

      {/* Additional Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Buyer Filter */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel sx={{ 
            color: 'white',
            '&.Mui-focused': {
              color: 'rgb(147, 51, 234)',
            },
          }}>Buyer</InputLabel>
          <Select
            value={buyerFilter}
            onChange={(e) => handleBuyerFilterChange(e.target.value)}
            label="Buyer"
            sx={{
              color: 'white',
              backgroundColor: '#2a2a2a',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.23)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgb(147, 51, 234)',
              },
              '& .MuiSvgIcon-root': {
                color: 'white',
              },
              '& .MuiSelect-select': {
                color: 'white',
                backgroundColor: '#2a2a2a',
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #333',
                  '& .MuiMenuItem-root': {
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#3a3a3a',
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(147, 51, 234, 0.2)',
                      '&:hover': {
                        backgroundColor: 'rgba(147, 51, 234, 0.3)',
                      },
                    },
                  },
                },
              },
            }}
          >
            <MenuItem value="all">All Buyers</MenuItem>
            {uniqueBuyers.map((buyer) => (
              <MenuItem key={buyer} value={buyer}>
                {buyer}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Date Min Filter */}
        <TextField
          size="small"
          label="Start Date"
          type="date"
          value={dateMinFilter}
          onChange={handleDateMinFilterChange}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Calendar size={20} color="#9ca3af" />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            minWidth: 160,
            '& .MuiOutlinedInput-root': {
              color: 'white',
              backgroundColor: '#2a2a2a',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.23)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'rgb(147, 51, 234)',
              },
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-focused': {
                color: 'rgb(147, 51, 234)',
              },
            },
          }}
        />

        {/* Date Max Filter */}
        <TextField
          size="small"
          label="End Date"
          type="date"
          value={dateMaxFilter}
          onChange={handleDateMaxFilterChange}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Calendar size={20} color="#9ca3af" />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            minWidth: 160,
            '& .MuiOutlinedInput-root': {
              color: 'white',
              backgroundColor: '#2a2a2a',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.23)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'rgb(147, 51, 234)',
              },
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-focused': {
                color: 'rgb(147, 51, 234)',
              },
            },
          }}
        />

        {/* Min Value Filter */}
        <TextField
          size="small"
          label="Min Value"
          type="text"
          value={minValueFilterInput}
          onChange={handleMinValueFilterChange}
          placeholder="0"
          sx={{
            minWidth: 120,
            '& .MuiOutlinedInput-root': {
              color: 'white',
              backgroundColor: '#2a2a2a',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.23)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'rgb(147, 51, 234)',
              },
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-focused': {
                color: 'rgb(147, 51, 234)',
              },
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <CurrencyDollar size={20} color="#9ca3af" />
                </InputAdornment>
              ),
            },
          }}
        />

        {/* Max Value Filter */}
        <TextField
          size="small"
          label="Max Value"
          type="text"
          value={maxValueFilterInput}
          onChange={handleMaxValueFilterChange}
          placeholder="∞"
          sx={{
            minWidth: 120,
            '& .MuiOutlinedInput-root': {
              color: 'white',
              backgroundColor: '#2a2a2a',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.23)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'rgb(147, 51, 234)',
              },
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-focused': {
                color: 'rgb(147, 51, 234)',
              },
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <CurrencyDollar size={20} color="#9ca3af" />
                </InputAdornment>
              ),
            },
          }}
        />

        {/* Clear Filters Button */}
        <Button
          variant="outlined"
          onClick={clearAllFilters}
          sx={{
            borderColor: '#6b7280',
            color: '#9ca3af',
            '&:hover': {
              borderColor: '#9ca3af',
              backgroundColor: 'rgba(107, 114, 128, 0.1)',
            },
            textTransform: 'none',
            fontWeight: 500,
            px: 2,
            py: 1
          }}
        >
          Clear Filters
        </Button>
      </Box>

      {/* Layout com duas colunas: Tabela Principal e Resumo */}
      <Grid container spacing={3}>
        {/* Coluna da Tabela Principal */}
        <Grid size={{ xs: 12, lg: 8 }}>
          {payments.length === 0 ? (
            <Paper sx={{ bgcolor: '#3a3a3a', border: '1px solid #555', p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">
                No payments found
              </Typography>
            </Paper>
          ) : (
            <>
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
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#1a1a1a' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Note</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Buyer</TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Value Gold</TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Dollar $</TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>M Value in $</TableCell>
                      <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Date</TableCell>
                      <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow
                        key={payment.id}
                        sx={{
                          '&:hover': {
                            bgcolor: '#3a3a3a',
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        <TableCell sx={{ color: 'white', fontSize: '0.85rem' }}>
                          {payment.note}
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontSize: '0.85rem', fontWeight: 500 }}>
                          {payment.buyer}
                        </TableCell>
                        <TableCell align="right" sx={{ color: '#60a5fa', fontSize: '0.85rem', fontWeight: 600 }}>
                          {formatValueForDisplay(payment.valueGold)}g
                        </TableCell>
                        <TableCell align="right" sx={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
                          {formatDollar(payment.dollar)}
                        </TableCell>
                        <TableCell align="right" sx={{ color: '#a78bfa', fontSize: '0.85rem', fontWeight: 600 }}>
                          {formatDollar(payment.mValue)}
                        </TableCell>
                        <TableCell align="center" sx={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'white' }}>
                              {formatDateFromAPI(payment.date).date}
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace' }}>
                              {formatDateFromAPI(payment.date).time}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={getStatusLabel(payment.status)}
                            color={getStatusColor(payment.status) as any}
                            size="small"
                            sx={{
                              fontWeight: 'bold',
                              fontSize: '0.75rem',
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  mt: 4,
                  mb: 2
                }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        color: 'white',
                        backgroundColor: '#2a2a2a',
                        border: '1px solid #333',
                        '&:hover': {
                          backgroundColor: '#3a3a3a',
                        },
                        '&.Mui-selected': {
                          backgroundColor: 'rgb(147, 51, 234)',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'rgb(168, 85, 247)',
                          },
                        },
                        '&.MuiPaginationItem-previousNext': {
                          backgroundColor: '#2a2a2a',
                          border: '1px solid #333',
                          '&:hover': {
                            backgroundColor: '#3a3a3a',
                          },
                        },
                      },
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </Grid>

        {/* Coluna da Tabela de Resumo */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper
            sx={{
              bgcolor: '#2a2a2a',
              border: '1px solid #333',
              p: 3,
              position: 'sticky',
              top: 20,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                fontWeight: 'bold',
                mb: 3,
                textAlign: 'center',
                borderBottom: '2px solid rgb(147, 51, 234)',
                pb: 1,
              }}
            >
              Summary by Status
            </Typography>

            {Object.keys(paymentsSummary).length === 0 ? (
              <Typography variant="body2" sx={{ color: '#9ca3af', textAlign: 'center', py: 4 }}>
                No data available
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {Object.entries(paymentsSummary).map(([status, data]) => (
                  <Paper
                    key={status}
                    sx={{
                      bgcolor: '#1a1a1a',
                      border: '1px solid #444',
                      p: 2,
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        borderColor: 'rgb(147, 51, 234)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(147, 51, 234, 0.2)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Chip
                        label={getStatusLabel(status)}
                        color={getStatusColor(status) as any}
                        size="small"
                        sx={{
                          fontWeight: 'bold',
                          fontSize: '0.75rem',
                        }}
                      />
                      <Typography
                        variant="h6"
                        sx={{
                          color: 'white',
                          fontWeight: 'bold',
                        }}
                      >
                        {data.count} {data.count === 1 ? 'payment' : 'payments'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                          Total Gold:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#60a5fa',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                          }}
                        >
                          {formatValueForDisplay(data.totalGold)}g
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                          Total Dollar:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#10b981',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                          }}
                        >
                          {formatDollar(data.totalDollar)}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                ))}

                {/* Total Geral */}
                <Paper
                  sx={{
                    bgcolor: '#1a1a1a',
                    border: '2px solid rgb(147, 51, 234)',
                    p: 2.5,
                    mt: 2,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: 'rgb(147, 51, 234)',
                      fontWeight: 'bold',
                      mb: 2,
                      textAlign: 'center',
                    }}
                  >
                    GRAND TOTAL
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                        Payments:
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          color: 'white',
                          fontWeight: 'bold',
                        }}
                      >
                        {payments.length}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                        Total Gold:
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: '#60a5fa',
                          fontWeight: 700,
                        }}
                      >
                        {formatValueForDisplay(
                          payments.reduce((sum, p) => sum + (p.valueGold || 0), 0)
                        )}g
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                        Total Dollar:
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: '#10b981',
                          fontWeight: 700,
                        }}
                      >
                        {formatDollar(
                          payments.reduce((sum, p) => sum + (p.dollar || 0), 0)
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Add Payment Dialog */}
      {isAddPaymentOpen && (
        <AddPayment
          onClose={() => setIsAddPaymentOpen(false)}
          onPaymentAdded={() => {
            setIsAddPaymentOpen(false)
            fetchPayments()
          }}
          onError={onError}
        />
      )}
    </>
  )
}

