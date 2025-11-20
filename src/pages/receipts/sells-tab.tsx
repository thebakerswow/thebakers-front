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
import { AddReceipt } from '../../components/add-receipt'
import { EditReceipt } from '../../components/edit-receipt'
import {
  getReceiptsSales,
  getReceiptsPayers,
  deleteReceiptsSale,
  getReceiptsDates,
  type ReceiptsPayer,
  type ReceiptsSale,
  type ReceiptsDate,
} from '../../services/api'
import Swal from 'sweetalert2'

interface ReceiptDisplay {
  id: number
  note: string
  payer: string
  payerName: string
  idPayer: number
  idReceiptsDate: number
  dollar: number
  createdAt: string
  receiptsDate: string
  status: string
}

interface ReceiptsSellsTabProps {
  onError?: (error: ErrorDetails | null) => void
}

export function ReceiptsSellsTab({ onError }: ReceiptsSellsTabProps) {
  const [receipts, setReceipts] = useState<ReceiptDisplay[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [receiptsDateFilter, setReceiptsDateFilter] = useState<string>('all')
  const [receiptStatusFilter, setReceiptStatusFilter] = useState<'pending' | 'completed'>('pending')
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddReceiptOpen, setIsAddReceiptOpen] = useState(false)
  const [isLoadingReceipts, setIsLoadingReceipts] = useState(true)
  const [editingReceipt, setEditingReceipt] = useState<ReceiptDisplay | null>(null)
  const [receiptsDateOptions, setReceiptsDateOptions] = useState<ReceiptsDate[]>([])

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

  const fetchReceipts = async () => {
    try {
      setIsLoadingReceipts(true)
      
      // Busca receipts, payers e receipts dates em paralelo
      const [salesData, payersData, receiptsDatesData] = await Promise.all([
        getReceiptsSales(),
        getReceiptsPayers(),
        getReceiptsDates(),
      ])
      
      // Validação: garante que os dados são arrays
      const validSalesData = Array.isArray(salesData) ? salesData : []
      const validPayersData = Array.isArray(payersData) ? payersData : []
      const validReceiptsDatesData = Array.isArray(receiptsDatesData) ? receiptsDatesData : []
      
      // Cria um mapa de id_payer -> name para busca rápida
      const payersMap = new Map<number, string>()
      validPayersData.forEach((payer: ReceiptsPayer) => {
        payersMap.set(Number(payer.id), payer.name)
      })
      
      // Cria um mapa de id_receipts_dolar_date -> name para busca rápida
      const receiptsDatesMap = new Map<number, string>()
      validReceiptsDatesData.forEach((receiptDate: ReceiptsDate) => {
        receiptsDatesMap.set(Number(receiptDate.id), receiptDate.name)
      })
      
      // Mapeia os dados da API para o formato de exibição
      const mappedReceipts: ReceiptDisplay[] = validSalesData.map((sale: ReceiptsSale) => ({
        id: sale.id,
        note: sale.note,
        payer: String(sale.id_payer),
        payerName: payersMap.get(sale.id_payer) || 'Unknown',
        idPayer: sale.id_payer,
        idReceiptsDate: sale.id_receipts_dolar_date,
        dollar: sale.dolar_amount ?? 0,
        createdAt: sale.created_at,
        receiptsDate: receiptsDatesMap.get(sale.id_receipts_dolar_date) || sale.receipts_dolar_date || '',
        status: sale.status,
      }))
      
      setReceipts(mappedReceipts)
      setTotalPages(1)
    } catch (error) {
      console.error('Error fetching receipts:', error)
      const errorDetails = {
        message: 'Error fetching receipts',
        response: error,
      }
      if (onError) {
        onError(errorDetails)
      }
    } finally {
      setIsLoadingReceipts(false)
    }
  }

  const handleReceiptsDateFilter = (receiptsDate: string) => {
    setReceiptsDateFilter(receiptsDate)
    setCurrentPage(1)
  }

  const handleReceiptStatusFilter = (status: 'pending' | 'completed') => {
    setReceiptStatusFilter(status)
    setCurrentPage(1)
  }

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page)
  }


  const handleDeleteReceipt = async (receipt: ReceiptDisplay) => {
    const result = await Swal.fire({
      title: 'Delete Receipt?',
      text: `Are you sure you want to delete this receipt? This action cannot be undone.`,
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
        await deleteReceiptsSale(receipt.id)
        
        // Re-fetch da lista de receipts
        await fetchReceipts()
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Receipt has been deleted successfully.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#2a2a2a',
          color: 'white',
        })
      } catch (error) {
        console.error('Error deleting receipt:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete receipt.',
          confirmButtonColor: 'rgb(147, 51, 234)',
          background: '#2a2a2a',
          color: 'white',
        })
      }
    }
  }

  // Carregar lista de receipts dates ao montar o componente
  useEffect(() => {
    const fetchReceiptsDatesData = async () => {
      try {
        const receiptsDatesData = await getReceiptsDates()
        const validReceiptsDatesData = Array.isArray(receiptsDatesData) ? receiptsDatesData : []
        
        // Converte datas de YYYY-MM-DD para MM/DD
        const convertedDates = validReceiptsDatesData.map(date => {
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
        
        setReceiptsDateOptions(sortedDates)
      } catch (error) {
        console.error('Error fetching receipts dates:', error)
        const errorDetails = {
          message: 'Error fetching receipts dates',
          response: error,
        }
        if (onError) {
          onError(errorDetails)
        }
      }
    }

    fetchReceiptsDatesData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchReceipts()
  }, [receiptsDateFilter, receiptStatusFilter, currentPage])

  const getReceiptsDateLabel = (receiptsDate: string) => {
    if (!receiptsDate) return '-'
    // Format receipts dates nicely
    if (receiptsDate.startsWith('receipt')) {
      const datePart = receiptsDate.replace('receipt', 'Receipt').trim()
      return datePart.toUpperCase()
    }
    return formatSummaryDate(receiptsDate).toUpperCase()
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
          {/* Receipts Date Filter */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel sx={{ 
              color: 'white',
              '&.Mui-focused': {
                color: 'rgb(147, 51, 234)',
              },
            }}>Receipts Date</InputLabel>
            <Select
              value={receiptsDateFilter}
              onChange={(e) => handleReceiptsDateFilter(e.target.value)}
              label="Receipts Date"
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
              <MenuItem value="all">All Receipts Dates</MenuItem>
              {receiptsDateOptions && receiptsDateOptions.map((receiptsDate) => (
                <MenuItem key={receiptsDate.id} value={receiptsDate.name}>
                  {receiptsDate.name}
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
              variant={receiptStatusFilter === 'pending' ? 'contained' : 'outlined'}
              onClick={() => handleReceiptStatusFilter('pending')}
              size="medium"
              sx={{
                ...(receiptStatusFilter === 'pending' ? {
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
              variant={receiptStatusFilter === 'completed' ? 'contained' : 'outlined'}
              onClick={() => handleReceiptStatusFilter('completed')}
              size="medium"
              sx={{
                ...(receiptStatusFilter === 'completed' ? {
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
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant='contained'
            startIcon={<Plus size={20} />}
            onClick={() => setIsAddReceiptOpen(true)}
            sx={{
              backgroundColor: 'rgb(147, 51, 234)',
              '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
              padding: '10px 20px',
              boxShadow: 3,
            }}
          >
            Add Receipt
          </Button>
        </Box>
      </Box>

      {/* Tabela Principal */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          {isLoadingReceipts ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={40} sx={{ color: 'rgb(147, 51, 234)' }} />
            </Box>
          ) : receipts.filter(p => 
            (receiptsDateFilter === 'all' || p.receiptsDate === receiptsDateFilter) &&
            p.status === receiptStatusFilter
          ).length === 0 ? (
            <Paper sx={{ bgcolor: '#3a3a3a', border: '1px solid #555', p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">
                No receipts found
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
                      <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Payer</TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Dollar $</TableCell>
                      <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Date</TableCell>
                      <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Receipts Date</TableCell>
                      <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Status</TableCell>
                      <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem', width: 100 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {receipts
                      .filter(p => 
                        (receiptsDateFilter === 'all' || p.receiptsDate === receiptsDateFilter) &&
                        p.status === receiptStatusFilter
                      )
                      .map((receipt) => (
                      <TableRow
                        key={receipt.id}
                        sx={{
                          '&:hover': {
                            bgcolor: '#3a3a3a',
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        <TableCell sx={{ color: 'white', fontSize: '0.85rem' }}>
                          {receipt.note}
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontSize: '0.85rem', fontWeight: 500 }}>
                          {receipt.payerName}
                        </TableCell>
                        <TableCell align="right" sx={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
                          {formatDollar(receipt.dollar)}
                        </TableCell>
                        <TableCell align="center" sx={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'white' }}>
                              {formatCreatedAt(receipt.createdAt).date}
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace' }}>
                              {formatCreatedAt(receipt.createdAt).time}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center" sx={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'white' }}>
                              {getReceiptsDateLabel(receipt.receiptsDate)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={getStatusLabel(receipt.status)}
                            color={getStatusColor(receipt.status) as any}
                            size="small"
                            sx={{
                              fontWeight: 'bold',
                              fontSize: '0.75rem',
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {receipt.status !== 'completed' ? (
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              <Tooltip title="Edit" placement="top">
                                <IconButton
                                  size="small"
                                  onClick={() => setEditingReceipt(receipt)}
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
                                  onClick={() => handleDeleteReceipt(receipt)}
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
      </Grid>

      {/* Add Receipt Dialog */}
      {isAddReceiptOpen && (
        <AddReceipt
          onClose={() => setIsAddReceiptOpen(false)}
          onReceiptAdded={() => {
            setIsAddReceiptOpen(false)
            fetchReceipts()
          }}
          onError={onError}
        />
      )}

      {/* Edit Receipt Dialog */}
      {editingReceipt && (
        <EditReceipt
          sale={{
            id: editingReceipt.id,
            note: editingReceipt.note,
            idPayer: editingReceipt.idPayer,
            idReceiptsDate: editingReceipt.idReceiptsDate,
            status: editingReceipt.status,
            payerName: editingReceipt.payerName,
            dollar: editingReceipt.dollar,
            receiptDate: editingReceipt.receiptsDate,
          }}
          onClose={() => setEditingReceipt(null)}
          onReceiptUpdated={() => {
            setEditingReceipt(null)
            fetchReceipts()
          }}
        />
      )}
    </>
  )
}

