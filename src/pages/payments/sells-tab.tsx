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
import { Plus } from '@phosphor-icons/react'
import { ErrorDetails } from '../../components/error-display'
import { Payment } from '../../types/payment-interface'
import { AddPayment } from '../../components/add-payment'

interface SellsTabProps {
  onError?: (error: ErrorDetails | null) => void
}

export function SellsTab({ onError }: SellsTabProps) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [paymentDateFilter, setPaymentDateFilter] = useState<string>('all')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false)

  // Lista de buyers disponíveis
  const availableBuyers = [
    'João Silva',
    'Maria Santos',
    'Pedro Costa',
    'Ana Costa',
  ]

  // Lista de payment dates disponíveis
  const availablePaymentDates = [
    'payment 01/10',
    'payment 07/10',
    'payment 15/10',
  ]

  // Lista de payment status disponíveis
  const availablePaymentStatuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
  ]

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
          paymentDate: 'payment 01/10',
          paymentStatus: 'pending'
        },
        {
          id: 2,
          note: 'Raid Heroic completa',
          buyer: 'Maria Santos',
          valueGold: 1200000,
          dollar: 109.20,
          mValue: 0.091,
          date: '2025-10-06T18:00:00',
          paymentDate: 'payment 07/10',
          paymentStatus: 'completed'
        },
        {
          id: 3,
          note: 'Leveling 60-70',
          buyer: 'Pedro Costa',
          valueGold: 300000,
          dollar: 27.30,
          mValue: 0.091,
          date: '2025-10-04T10:15:00',
          paymentDate: 'payment 15/10',
          paymentStatus: 'pending'
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

  const handlePaymentDateFilter = (paymentDate: string) => {
    setPaymentDateFilter(paymentDate)
    setCurrentPage(1)
  }

  const handlePaymentStatusFilter = (status: 'all' | 'pending' | 'completed') => {
    setPaymentStatusFilter(status)
    setCurrentPage(1)
  }

  const handleBuyerChange = (paymentId: string | number, newBuyer: string) => {
    setPayments(prevPayments =>
      prevPayments.map(payment =>
        payment.id === paymentId ? { ...payment, buyer: newBuyer } : payment
      )
    )
    // TODO: Chamar API para atualizar o buyer
    console.log(`Updated buyer for payment ${paymentId}: ${newBuyer}`)
  }

  const handlePaymentDateChange = (paymentId: string | number, newPaymentDate: string) => {
    setPayments(prevPayments =>
      prevPayments.map(payment =>
        payment.id === paymentId ? { ...payment, paymentDate: newPaymentDate } : payment
      )
    )
    // TODO: Chamar API para atualizar o payment date
    console.log(`Updated payment date for payment ${paymentId}: ${newPaymentDate}`)
  }

  const handlePaymentStatusChange = (paymentId: string | number, newPaymentStatus: 'pending' | 'completed') => {
    setPayments(prevPayments =>
      prevPayments.map(payment =>
        payment.id === paymentId ? { ...payment, paymentStatus: newPaymentStatus } : payment
      )
    )
    // TODO: Chamar API para atualizar o payment status
    console.log(`Updated payment status for payment ${paymentId}: ${newPaymentStatus}`)
  }

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page)
  }

  useEffect(() => {
    fetchPayments()
  }, [paymentDateFilter, paymentStatusFilter, currentPage])

  // Função para agrupar pagamentos por payment date (aplicando filtros)
  const paymentsSummary = useMemo(() => {
    const summary: Record<string, { count: number; totalGold: number; totalDollar: number }> = {}

    payments
      .filter(p => 
        (paymentDateFilter === 'all' || p.paymentDate === paymentDateFilter) &&
        (paymentStatusFilter === 'all' || p.paymentStatus === paymentStatusFilter)
      )
      .forEach((payment) => {
        const paymentDate = payment.paymentDate
        if (!summary[paymentDate]) {
          summary[paymentDate] = { count: 0, totalGold: 0, totalDollar: 0 }
        }
        summary[paymentDate].count++
        summary[paymentDate].totalGold += payment.valueGold || 0
        summary[paymentDate].totalDollar += payment.dollar || 0
      })

    return summary
  }, [payments, paymentDateFilter, paymentStatusFilter])

  const getPaymentDateColor = (paymentDate: string) => {
    // Payment dates get different colors
    if (paymentDate.startsWith('payment')) {
      return 'info'
    }
    return 'default'
  }

  const getPaymentDateLabel = (paymentDate: string) => {
    // Format payment dates nicely
    if (paymentDate.startsWith('payment')) {
      const datePart = paymentDate.replace('payment', 'Payment').trim()
      return datePart.toUpperCase()
    }
    return paymentDate.toUpperCase()
  }

  const getPaymentStatusColor = (paymentStatus: 'pending' | 'completed') => {
    switch (paymentStatus) {
      case 'pending':
        return 'warning'
      case 'completed':
        return 'success'
      default:
        return 'default'
    }
  }

  const getPaymentStatusLabel = (paymentStatus: 'pending' | 'completed') => {
    switch (paymentStatus) {
      case 'pending':
        return 'PENDING'
      case 'completed':
        return 'COMPLETED'
    }
  }

  return (
    <>
      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Payment Date Filter */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel sx={{ 
              color: 'white',
              '&.Mui-focused': {
                color: 'rgb(147, 51, 234)',
              },
            }}>Payment Date</InputLabel>
            <Select
              value={paymentDateFilter}
              onChange={(e) => handlePaymentDateFilter(e.target.value)}
              label="Payment Date"
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
              <MenuItem value="all">All Payment Dates</MenuItem>
              <MenuItem value="payment 01/10">Payment 01/10</MenuItem>
              <MenuItem value="payment 07/10">Payment 07/10</MenuItem>
              <MenuItem value="payment 15/10">Payment 15/10</MenuItem>
            </Select>
          </FormControl>

          {/* Status Filter Buttons */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography sx={{ color: '#9ca3af', fontSize: '0.875rem', mr: 1 }}>
              Status:
            </Typography>
            <Button
              variant={paymentStatusFilter === 'all' ? 'contained' : 'outlined'}
              onClick={() => handlePaymentStatusFilter('all')}
              size="medium"
              sx={{
                ...(paymentStatusFilter === 'all' ? {
                  backgroundColor: 'rgb(147, 51, 234)',
                  '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
                  color: 'white',
                } : {
                  borderColor: '#6b7280',
                  color: '#9ca3af',
                  '&:hover': {
                    borderColor: '#9ca3af',
                    backgroundColor: 'rgba(107, 114, 128, 0.1)',
                  },
                }),
                textTransform: 'none',
                minWidth: '90px',
                padding: '8px 20px',
                fontSize: '0.95rem',
                fontWeight: 500,
              }}
            >
              All
            </Button>
            <Button
              variant={paymentStatusFilter === 'pending' ? 'contained' : 'outlined'}
              onClick={() => handlePaymentStatusFilter('pending')}
              size="medium"
              sx={{
                ...(paymentStatusFilter === 'pending' ? {
                  backgroundColor: '#f59e0b',
                  '&:hover': { backgroundColor: '#d97706' },
                  color: 'white',
                } : {
                  borderColor: '#f59e0b',
                  color: '#f59e0b',
                  '&:hover': {
                    borderColor: '#d97706',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  },
                }),
                textTransform: 'none',
                minWidth: '110px',
                padding: '8px 20px',
                fontSize: '0.95rem',
                fontWeight: 500,
              }}
            >
              Pending
            </Button>
            <Button
              variant={paymentStatusFilter === 'completed' ? 'contained' : 'outlined'}
              onClick={() => handlePaymentStatusFilter('completed')}
              size="medium"
              sx={{
                ...(paymentStatusFilter === 'completed' ? {
                  backgroundColor: '#10b981',
                  '&:hover': { backgroundColor: '#059669' },
                  color: 'white',
                } : {
                  borderColor: '#10b981',
                  color: '#10b981',
                  '&:hover': {
                    borderColor: '#059669',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  },
                }),
                textTransform: 'none',
                minWidth: '120px',
                padding: '8px 20px',
                fontSize: '0.95rem',
                fontWeight: 500,
              }}
            >
              Completed
            </Button>
          </Box>
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

      {/* Layout com duas colunas: Tabela Principal e Resumo */}
      <Grid container spacing={3}>
        {/* Coluna da Tabela Principal */}
        <Grid size={{ xs: 12, lg: 8 }}>
          {payments.filter(p => 
            (paymentDateFilter === 'all' || p.paymentDate === paymentDateFilter) &&
            (paymentStatusFilter === 'all' || p.paymentStatus === paymentStatusFilter)
          ).length === 0 ? (
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
                      <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Payment Date</TableCell>
                      <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payments
                      .filter(p => 
                        (paymentDateFilter === 'all' || p.paymentDate === paymentDateFilter) &&
                        (paymentStatusFilter === 'all' || p.paymentStatus === paymentStatusFilter)
                      )
                      .map((payment) => (
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
                        <TableCell sx={{ width: 180 }}>
                          <FormControl size="small" fullWidth>
                            <Select
                              value={payment.buyer}
                              onChange={(e) => handleBuyerChange(payment.id, e.target.value)}
                              sx={{
                                color: 'white',
                                fontSize: '0.85rem',
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
                              }}
                            >
                              {availableBuyers.map((buyer) => (
                                <MenuItem key={buyer} value={buyer}>
                                  {buyer}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
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
                        <TableCell align="center" sx={{ width: 180 }}>
                          <FormControl size="small" fullWidth>
                            <Select
                              value={payment.paymentDate}
                              onChange={(e) => handlePaymentDateChange(payment.id, e.target.value)}
                              sx={{
                                color: 'white',
                                fontSize: '0.85rem',
                                '& .MuiOutlinedInput-notchedOutline': {
                                  border: 'none',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  border: 'none',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  border: 'none',
                                },
                                '& .MuiSvgIcon-root': {
                                  color: 'white',
                                },
                              }}
                              renderValue={(value) => (
                                <Chip
                                  label={getPaymentDateLabel(value)}
                                  color={getPaymentDateColor(value) as any}
                                  size="small"
                                  sx={{
                                    fontWeight: 'bold',
                                    fontSize: '0.75rem',
                                    height: '24px',
                                  }}
                                />
                              )}
                            >
                              {availablePaymentDates.map((paymentDate) => (
                                <MenuItem key={paymentDate} value={paymentDate}>
                                  <Chip
                                    label={getPaymentDateLabel(paymentDate)}
                                    color={getPaymentDateColor(paymentDate) as any}
                                    size="small"
                                    sx={{
                                      fontWeight: 'bold',
                                      fontSize: '0.75rem',
                                    }}
                                  />
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell align="center" sx={{ width: 150 }}>
                          <FormControl size="small" fullWidth>
                            <Select
                              value={payment.paymentStatus}
                              onChange={(e) => handlePaymentStatusChange(payment.id, e.target.value as 'pending' | 'completed')}
                              sx={{
                                color: 'white',
                                fontSize: '0.85rem',
                                '& .MuiOutlinedInput-notchedOutline': {
                                  border: 'none',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  border: 'none',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  border: 'none',
                                },
                                '& .MuiSvgIcon-root': {
                                  color: 'white',
                                },
                              }}
                              renderValue={(value) => (
                                <Chip
                                  label={getPaymentStatusLabel(value as 'pending' | 'completed')}
                                  color={getPaymentStatusColor(value as 'pending' | 'completed') as any}
                                  size="small"
                                  sx={{
                                    fontWeight: 'bold',
                                    fontSize: '0.75rem',
                                    height: '24px',
                                  }}
                                />
                              )}
                            >
                              {availablePaymentStatuses.map((status) => (
                                <MenuItem key={status.value} value={status.value}>
                                  <Chip
                                    label={status.label}
                                    color={getPaymentStatusColor(status.value as 'pending' | 'completed') as any}
                                    size="small"
                                    sx={{
                                      fontWeight: 'bold',
                                      fontSize: '0.75rem',
                                    }}
                                  />
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
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
                {Object.entries(paymentsSummary).map(([paymentDate, data]) => (
                  <Paper
                    key={paymentDate}
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
                        label={getPaymentDateLabel(paymentDate)}
                        color={getPaymentDateColor(paymentDate) as any}
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
                        {payments.filter(p => 
                          (paymentDateFilter === 'all' || p.paymentDate === paymentDateFilter) &&
                          (paymentStatusFilter === 'all' || p.paymentStatus === paymentStatusFilter)
                        ).length}
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
                          payments
                            .filter(p => 
                              (paymentDateFilter === 'all' || p.paymentDate === paymentDateFilter) &&
                              (paymentStatusFilter === 'all' || p.paymentStatus === paymentStatusFilter)
                            )
                            .reduce((sum, p) => sum + (p.valueGold || 0), 0)
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
                          payments
                            .filter(p => 
                              (paymentDateFilter === 'all' || p.paymentDate === paymentDateFilter) &&
                              (paymentStatusFilter === 'all' || p.paymentStatus === paymentStatusFilter)
                            )
                            .reduce((sum, p) => sum + (p.dollar || 0), 0)
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

