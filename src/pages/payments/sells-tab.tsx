import { useState, useEffect } from 'react'
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
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import { Plus, Trash, PencilSimple } from '@phosphor-icons/react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ErrorDetails } from '../../components/error-display'
import { AddPayment } from '../../components/add-payment'
import { EditSale } from '../../components/edit-sale'
import { getSales, getPayers, deleteSale, getPaymentDates, updateSaleStatus, getPaymentSummaryByStatus, type Payer, type Sale, type PaymentDate, type PaymentSummaryResponse } from '../../services/api'
import Swal from 'sweetalert2'

interface PaymentDisplay {
  id: number
  note: string
  buyer: string
  buyerName: string
  idPayer: number
  idPaymentDate: number
  valueGold: number
  dollar: number
  mValue: number
  createdAt: string
  paymentDate: string
  status: string
}

interface SellsTabProps {
  onError?: (error: ErrorDetails | null) => void
}

export function SellsTab({ onError }: SellsTabProps) {
  const [payments, setPayments] = useState<PaymentDisplay[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [paymentDateFilter, setPaymentDateFilter] = useState<string>('all')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'pending' | 'completed'>('pending')
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false)
  const [isLoadingPayments, setIsLoadingPayments] = useState(true)
  const [editingSale, setEditingSale] = useState<PaymentDisplay | null>(null)
  const [paymentDateOptions, setPaymentDateOptions] = useState<PaymentDate[]>([])
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummaryResponse | null>(null)

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

  // Função para formatar data do created_at
  const formatCreatedAt = (createdAt: string) => {
    if (!createdAt) return { date: '-', time: '-' }
    
    try {
      const date = parseISO(createdAt)
      return {
        date: format(date, "MM/dd/yyyy", { locale: ptBR }),
        time: format(date, "HH:mm")
      }
    } catch (error) {
      console.error('Error formatting date:', error)
      return { date: '-', time: '-' }
    }
  }

  // Função para converter data de YYYY-MM-DD para MM/DD
  const formatSummaryDate = (dateStr: string) => {
    const match = dateStr.match(/^\d{4}-(\d{1,2})-(\d{1,2})$/)
    if (match) {
      const month = match[1]
      const day = match[2]
      return `${month}/${day}`
    }
    return dateStr
  }

  const fetchPayments = async () => {
    try {
      setIsLoadingPayments(true)
      
      // Busca sales, payers e payment dates em paralelo
      const [salesData, payersData, paymentDatesData] = await Promise.all([
        getSales(),
        getPayers(),
        getPaymentDates()
      ])
      
      // Validação: garante que os dados são arrays
      const validSalesData = Array.isArray(salesData) ? salesData : []
      const validPayersData = Array.isArray(payersData) ? payersData : []
      const validPaymentDatesData = Array.isArray(paymentDatesData) ? paymentDatesData : []
      
      // Cria um mapa de id_payer -> name para busca rápida
      const payersMap = new Map<number, string>()
      validPayersData.forEach((payer: Payer) => {
        payersMap.set(Number(payer.id), payer.name)
      })
      
      // Cria um mapa de id_payment_date -> name para busca rápida
      const paymentDatesMap = new Map<number, string>()
      validPaymentDatesData.forEach((paymentDate: PaymentDate) => {
        paymentDatesMap.set(Number(paymentDate.id), paymentDate.name)
      })
      
      // Mapeia os dados da API para o formato de exibição
      const mappedPayments: PaymentDisplay[] = validSalesData.map((sale: Sale) => ({
        id: sale.id,
        note: sale.note,
        buyer: String(sale.id_payer), // Mantém o ID para futuras operações
        buyerName: payersMap.get(sale.id_payer) || 'Unknown',
        idPayer: sale.id_payer,
        idPaymentDate: sale.id_payment_date,
        valueGold: sale.gold_value,
        dollar: sale.dolar_value,
        mValue: sale.m_value,
        createdAt: sale.created_at,
        paymentDate: paymentDatesMap.get(sale.id_payment_date) || sale.payment_date,
        status: sale.status,
      }))
      
      setPayments(mappedPayments)
      setTotalPages(1)
    } catch (error) {
      console.error('Error fetching payments:', error)
      const errorDetails = {
        message: 'Error fetching payments',
        response: error,
      }
      if (onError) {
        onError(errorDetails)
      }
    } finally {
      setIsLoadingPayments(false)
    }
  }

  const handlePaymentDateFilter = (paymentDate: string) => {
    setPaymentDateFilter(paymentDate)
    setCurrentPage(1)
  }

  const handlePaymentStatusFilter = (status: 'pending' | 'completed') => {
    setPaymentStatusFilter(status)
    setCurrentPage(1)
  }

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page)
  }

  const handleStatusChange = async (payment: PaymentDisplay) => {
    // Só permite alterar se status atual for "pending"
    if (payment.status !== 'pending') {
      return
    }

    const result = await Swal.fire({
      title: 'Are you sure you want to mark this sale as completed?',
      html: '<span style="color: #ef4444; font-weight: bold;">This action cannot be undone.</span>',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, complete it!',
      cancelButtonText: 'Cancel',
      background: '#2a2a2a',
      color: 'white',
    })

    if (result.isConfirmed) {
      try {
        await updateSaleStatus(payment.id)
        
        // Re-fetch da lista de sales e summary
        await fetchPayments()
        await fetchSummary()
        
        Swal.fire({
          title: 'Updated!',
          text: 'Sale status changed to Completed.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#2a2a2a',
          color: 'white',
        })
      } catch (error) {
        console.error('Error updating status:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update status.',
          confirmButtonColor: 'rgb(147, 51, 234)',
          background: '#2a2a2a',
          color: 'white',
        })
      }
    }
  }

  const handleDeleteSale = async (payment: PaymentDisplay) => {
    const result = await Swal.fire({
      title: 'Delete Sale?',
      text: `Are you sure you want to delete this sale? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: '#2a2a2a',
      color: 'white',
    })

    if (result.isConfirmed) {
      try {
        await deleteSale(payment.id)
        
        // Re-fetch da lista de sales e summary
        await fetchPayments()
        await fetchSummary()
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Sale has been deleted successfully.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#2a2a2a',
          color: 'white',
        })
      } catch (error) {
        console.error('Error deleting sale:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete sale.',
          confirmButtonColor: 'rgb(147, 51, 234)',
          background: '#2a2a2a',
          color: 'white',
        })
      }
    }
  }

  // Carregar lista de payment dates ao montar o componente
  useEffect(() => {
    const fetchPaymentDatesData = async () => {
      try {
        const paymentDatesData = await getPaymentDates()
        const validPaymentDatesData = Array.isArray(paymentDatesData) ? paymentDatesData : []
        
        // Converte datas de YYYY-MM-DD para MM/DD
        const convertedDates = validPaymentDatesData.map(date => {
          const match = date.name.match(/^\d{4}-(\d{1,2})-(\d{1,2})$/)
          if (match) {
            const month = match[1]
            const day = match[2]
            return { ...date, name: `${month}/${day}` }
          }
          return date
        })
        
        // Ordenar datas por data parseada (cronologicamente)
        const sortedDates = [...convertedDates].sort((dateA, dateB) => {
          // Função para parsear data no formato MM/DD
          const parseDateString = (dateStr: string) => {
            const match = dateStr.match(/(\d{1,2})\/(\d{1,2})/)
            if (match) {
              const month = parseInt(match[1])
              const day = parseInt(match[2])
              return month * 100 + day
            }
            return 0
          }
          
          // PRIORIDADE 1: Tenta parsear como data MM/DD
          const dateValueA = parseDateString(dateA.name)
          const dateValueB = parseDateString(dateB.name)
          
          if (dateValueA && dateValueB) {
            return dateValueA - dateValueB
          }
          
          // PRIORIDADE 2: Se não conseguir parsear, tenta ordenar por ID
          const idA = Number(dateA.id)
          const idB = Number(dateB.id)
          
          if (!isNaN(idA) && !isNaN(idB)) {
            return idA - idB
          }
          
          // PRIORIDADE 3: Fallback para ordenação alfabética
          return dateA.name.localeCompare(dateB.name)
        })
        
        setPaymentDateOptions(sortedDates)
      } catch (error) {
        console.error('Error fetching payment dates:', error)
        const errorDetails = {
          message: 'Error fetching payment dates',
          response: error,
        }
        if (onError) {
          onError(errorDetails)
        }
      }
    }

    fetchPaymentDatesData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Função para buscar summary da API
  const fetchSummary = async () => {
    try {
      const summaryData = await getPaymentSummaryByStatus()
      setPaymentSummary(summaryData)
    } catch (error) {
      console.error('Error fetching payment summary:', error)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [paymentDateFilter, paymentStatusFilter, currentPage])

  // Buscar summary da API
  useEffect(() => {
    fetchSummary()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentDateFilter, paymentStatusFilter])

  const getPaymentDateLabel = (paymentDate: string) => {
    if (!paymentDate) return '-'
    // Format payment dates nicely
    if (paymentDate.startsWith('payment')) {
      const datePart = paymentDate.replace('payment', 'Payment').trim()
      return datePart.toUpperCase()
    }
    return formatSummaryDate(paymentDate).toUpperCase()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'completed':
        return 'success'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    if (!status) return '-'
    return status.toUpperCase()
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
              {paymentDateOptions && paymentDateOptions.map((paymentDate) => (
                <MenuItem key={paymentDate.id} value={paymentDate.name}>
                  {paymentDate.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Status Filter Buttons */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography sx={{ color: '#9ca3af', fontSize: '0.875rem', mr: 1 }}>
              Status:
            </Typography>
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
          {isLoadingPayments ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={40} sx={{ color: 'rgb(147, 51, 234)' }} />
            </Box>
          ) : payments.filter(p => 
            (paymentDateFilter === 'all' || p.paymentDate === paymentDateFilter) &&
            p.status === paymentStatusFilter
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
                      <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem', width: 100 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payments
                      .filter(p => 
                        (paymentDateFilter === 'all' || p.paymentDate === paymentDateFilter) &&
                        p.status === paymentStatusFilter
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
                        <TableCell sx={{ color: 'white', fontSize: '0.85rem', fontWeight: 500 }}>
                          {payment.buyerName}
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
                              {formatCreatedAt(payment.createdAt).date}
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace' }}>
                              {formatCreatedAt(payment.createdAt).time}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center" sx={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'white' }}>
                              {getPaymentDateLabel(payment.paymentDate)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={getStatusLabel(payment.status)}
                            color={getStatusColor(payment.status) as any}
                            size="small"
                            onClick={() => handleStatusChange(payment)}
                            sx={{
                              fontWeight: 'bold',
                              fontSize: '0.75rem',
                              cursor: payment.status === 'pending' ? 'pointer' : 'default',
                              '&:hover': payment.status === 'pending' ? {
                                opacity: 0.8,
                                transform: 'scale(1.05)',
                              } : {},
                              transition: 'all 0.2s ease-in-out',
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {payment.status !== 'completed' ? (
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              <Tooltip title="Edit" placement="top">
                                <IconButton
                                  size="small"
                                  onClick={() => setEditingSale(payment)}
                                  sx={{
                                    color: 'rgb(147, 51, 234)',
                                    '&:hover': {
                                      backgroundColor: 'rgba(147, 51, 234, 0.1)',
                                    },
                                  }}
                                >
                                  <PencilSimple size={18} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete" placement="top">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteSale(payment)}
                                  sx={{
                                    color: '#ef4444',
                                    '&:hover': {
                                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    },
                                  }}
                                >
                                  <Trash size={18} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          ) : (
                            <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                              -
                            </Typography>
                          )}
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
              Pending Sales Summary
            </Typography>

            {!paymentSummary || !paymentSummary.info.summary || paymentSummary.info.summary.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#9ca3af', textAlign: 'center', py: 4 }}>
                No data available
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {paymentSummary.info.summary.map((dateData) => (
                  <Paper
                    key={dateData.date}
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
                        label={formatSummaryDate(dateData.date).toUpperCase()}
                        color="info"
                        size="small"
                        sx={{
                          fontWeight: 'bold',
                          fontSize: '0.75rem',
                          '& .MuiChip-label': {
                            color: 'white',
                          },
                        }}
                      />
                      <Typography
                        variant="h6"
                        sx={{
                          color: 'white',
                          fontWeight: 'bold',
                        }}
                      >
                        {dateData.total_payments} {dateData.total_payments === 1 ? 'payment' : 'payments'}
                      </Typography>
                    </Box>

                    {/* Informações do Status Pending */}
                    {dateData.status_breakdown && dateData.status_breakdown.length > 0 && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {dateData.status_breakdown
                          .filter((statusData) => statusData.status.toLowerCase() === 'pending')
                          .map((statusData) => (
                            <Box key={statusData.status} sx={{ 
                              bgcolor: '#2a2a2a', 
                              p: 1.5, 
                              borderRadius: 1,
                              border: '1px solid #333'
                            }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Chip
                                  label={statusData.status.toUpperCase()}
                                  color={getStatusColor(statusData.status.toLowerCase()) as any}
                                  size="small"
                                  sx={{
                                    fontWeight: 'bold',
                                    fontSize: '0.7rem',
                                  }}
                                />
                                <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                                  {statusData.payments_count} {statusData.payments_count === 1 ? 'payment' : 'payments'}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '0.7rem' }}>
                                    Gold:
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>
                                    {formatValueForDisplay(statusData.gold_amount)}g
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '0.7rem' }}>
                                    Dollar:
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>
                                    {formatDollar(statusData.m_total_value)}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          ))}
                      </Box>
                    )}
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
                   TOTAL
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
                        {paymentSummary.info.totals.total_payments}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                        Total Gold:
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: 'white',
                          fontWeight: 700,
                        }}
                      >
                        {formatValueForDisplay(paymentSummary.info.totals.total_gold)}g
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                        Total Dollar:
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: 'white',
                          fontWeight: 700,
                        }}
                      >
                        {formatDollar(paymentSummary.info.totals.m_total_value)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Total Agrupado por Status */}
                  {paymentSummary.info.totals.by_status && paymentSummary.info.totals.by_status.length > 0 && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: '2px solid rgb(147, 51, 234)' }}>
                      <Typography variant="body2" sx={{ color: '#9ca3af', fontSize: '0.85rem', mb: 2, fontWeight: 600 }}>
                        By Status:
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {paymentSummary.info.totals.by_status.map((statusData) => (
                          <Box key={statusData.status} sx={{ 
                            bgcolor: '#2a2a2a', 
                            p: 2, 
                            borderRadius: 1,
                            border: '1px solid #444'
                          }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                              <Chip
                                label={statusData.status.toUpperCase()}
                                color={getStatusColor(statusData.status.toLowerCase()) as any}
                                size="small"
                                sx={{
                                  fontWeight: 'bold',
                                  fontSize: '0.75rem',
                                }}
                              />
                              <Typography variant="body2" sx={{ color: 'white', fontWeight: 700 }}>
                                {statusData.payments_count} {statusData.payments_count === 1 ? 'payment' : 'payments'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                                  Gold:
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>
                                  {formatValueForDisplay(statusData.gold_amount)}g
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                                  Dollar:
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>
                                  {formatDollar(statusData.m_total_value)}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
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
            fetchSummary()
          }}
          onError={onError}
        />
      )}

      {/* Edit Sale Dialog */}
      {editingSale && (
        <EditSale
          sale={{
            id: editingSale.id,
            note: editingSale.note,
            idPayer: editingSale.idPayer,
            idPaymentDate: editingSale.idPaymentDate,
            status: editingSale.status,
            buyerName: editingSale.buyerName,
            valueGold: editingSale.valueGold,
            dollar: editingSale.dollar,
            mValue: editingSale.mValue,
            paymentDate: editingSale.paymentDate,
          }}
          onClose={() => setEditingSale(null)}
          onSaleUpdated={() => {
            setEditingSale(null)
            fetchPayments()
            fetchSummary()
          }}
        />
      )}
    </>
  )
}

