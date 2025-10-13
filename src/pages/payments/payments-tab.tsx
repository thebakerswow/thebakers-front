import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Checkbox,
  TextField,
  InputLabel,
  Typography,
  Button,
} from '@mui/material'
import { Wallet, ShoppingCart } from '@phosphor-icons/react'
import { ErrorDetails } from '../../components/error-display'
import Swal from 'sweetalert2'

// Mapeamento dos IDs dos times para nomes legíveis
const TEAM_NAMES: Record<string, string> = {
  [import.meta.env.VITE_TEAM_MPLUS]: 'M+',
  [import.meta.env.VITE_TEAM_LEVELING]: 'Leveling',
  [import.meta.env.VITE_TEAM_GARCOM]: 'Garçom',
  [import.meta.env.VITE_TEAM_CONFEITEIROS]: 'Confeiteiros',
  [import.meta.env.VITE_TEAM_JACKFRUIT]: 'Jackfruit',
  [import.meta.env.VITE_TEAM_INSANOS]: 'Insanos',
  [import.meta.env.VITE_TEAM_APAE]: 'APAE',
  [import.meta.env.VITE_TEAM_LOSRENEGADOS]: 'Los Renegados',
  [import.meta.env.VITE_TEAM_DTM]: 'DTM',
  [import.meta.env.VITE_TEAM_KFFC]: 'KFFC',
  [import.meta.env.VITE_TEAM_GREENSKY]: 'Greensky',
  [import.meta.env.VITE_TEAM_GUILD_AZRALON_1]: 'Guild Azralon BR#1',
  [import.meta.env.VITE_TEAM_GUILD_AZRALON_2]: 'Guild Azralon BR#2',
  [import.meta.env.VITE_TEAM_ROCKET]: 'Rocket',
  [import.meta.env.VITE_TEAM_BOOTY_REAPER]: 'Booty Reaper',
  [import.meta.env.VITE_TEAM_PADEIRINHO]: 'Padeirinho',
  [import.meta.env.VITE_TEAM_MILHARAL]: 'Milharal',
  [import.meta.env.VITE_TEAM_BASTARD]: 'Bastard Munchen',
  [import.meta.env.VITE_TEAM_KIWI]: 'Kiwi',
}

interface PaymentRow {
  id: string | number
  player: string
  balanceTotal: number
  shopBalance: number
  balanceSold: number
  mInDollarSold: number
  paymentDate: string
  paymentStatus: 'pending' | 'completed'
  nextDollarShop: number
  nextGPayment: number
  total: number
  hold: boolean
  binanceId: string
  idTeam: string
}

interface PaymentsTabProps {
  onError?: (error: ErrorDetails | null) => void
}

export function PaymentsTab({ onError }: PaymentsTabProps) {
  const [paymentRows, setPaymentRows] = useState<PaymentRow[]>([])
  const [allPaymentRows, setAllPaymentRows] = useState<PaymentRow[]>([])
  const [paymentDateFilter, setPaymentDateFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [teamFilter, setTeamFilter] = useState<string>('all')

  const handleHoldChange = (id: string | number, checked: boolean) => {
    setPaymentRows(prevRows =>
      prevRows.map(row =>
        row.id === id ? { ...row, hold: checked } : row
      )
    )
    setAllPaymentRows(prevRows =>
      prevRows.map(row =>
        row.id === id ? { ...row, hold: checked } : row
      )
    )
    // TODO: Chamar API para atualizar hold
    console.log(`Updated hold for ${id}: ${checked}`)
  }

  const handleBinanceIdChange = (id: string | number, value: string) => {
    setPaymentRows(prevRows =>
      prevRows.map(row =>
        row.id === id ? { ...row, binanceId: value } : row
      )
    )
    setAllPaymentRows(prevRows =>
      prevRows.map(row =>
        row.id === id ? { ...row, binanceId: value } : row
      )
    )
    // TODO: Chamar API para atualizar binanceId (com debounce)
  }

  const handleDebitGBalance = async (row: PaymentRow) => {
    const result = await Swal.fire({
      title: 'Debit G Balance',
      text: `Debit ${formatValueForDisplay(row.balanceTotal)}g from ${row.player}'s balance?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'rgb(147, 51, 234)',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, debit it!',
      cancelButtonText: 'Cancel',
      background: '#2a2a2a',
      color: 'white',
    })

    if (result.isConfirmed) {
      try {
        // TODO: Chamar API para debitar G balance
        console.log(`Debiting G Balance for player ${row.player}, amount: ${row.balanceTotal}`)
        
        Swal.fire({
          title: 'Success!',
          text: 'G Balance debited successfully!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#2a2a2a',
          color: 'white',
        })
      } catch (error) {
        console.error('Error debiting G balance:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to debit G balance.',
          confirmButtonColor: 'rgb(147, 51, 234)',
          background: '#2a2a2a',
          color: 'white',
        })
      }
    }
  }

  const handleDebitShopBalance = async (row: PaymentRow) => {
    const result = await Swal.fire({
      title: 'Debit Shop Balance',
      text: `Debit ${formatValueForDisplay(row.shopBalance)}g from ${row.player}'s shop balance?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'rgb(147, 51, 234)',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, debit it!',
      cancelButtonText: 'Cancel',
      background: '#2a2a2a',
      color: 'white',
    })

    if (result.isConfirmed) {
      try {
        // TODO: Chamar API para debitar Shop balance
        console.log(`Debiting Shop Balance for player ${row.player}, amount: ${row.shopBalance}`)
        
        Swal.fire({
          title: 'Success!',
          text: 'Shop Balance debited successfully!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#2a2a2a',
          color: 'white',
        })
      } catch (error) {
        console.error('Error debiting shop balance:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to debit shop balance.',
          confirmButtonColor: 'rgb(147, 51, 234)',
          background: '#2a2a2a',
          color: 'white',
        })
      }
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

  const fetchPaymentRows = async () => {
    setIsLoading(true)
    try {
      // TODO: Substituir por chamada real à API
      const mockData: PaymentRow[] = [
        {
          id: 1,
          player: 'João Silva',
          balanceTotal: 1500000,
          shopBalance: 800000,
          balanceSold: 700000,
          mInDollarSold: 63.70,
          paymentDate: 'payment 01/10',
          paymentStatus: 'pending',
          nextDollarShop: 72.80,
          nextGPayment: 500000,
          total: 2300000,
          hold: false,
          binanceId: 'BIN123456',
          idTeam: import.meta.env.VITE_TEAM_MPLUS,
        },
        {
          id: 2,
          player: 'Maria Santos',
          balanceTotal: 2000000,
          shopBalance: 1200000,
          balanceSold: 800000,
          mInDollarSold: 72.80,
          paymentDate: 'payment 07/10',
          paymentStatus: 'completed',
          nextDollarShop: 109.20,
          nextGPayment: 800000,
          total: 3200000,
          hold: true,
          binanceId: 'BIN789012',
          idTeam: import.meta.env.VITE_TEAM_MPLUS,
        },
        {
          id: 3,
          player: 'Pedro Costa',
          balanceTotal: 800000,
          shopBalance: 400000,
          balanceSold: 400000,
          mInDollarSold: 36.40,
          paymentDate: 'payment 15/10',
          paymentStatus: 'pending',
          nextDollarShop: 36.40,
          nextGPayment: 300000,
          total: 1200000,
          hold: false,
          binanceId: 'BIN345678',
          idTeam: import.meta.env.VITE_TEAM_LEVELING,
        },
        {
          id: 4,
          player: 'Ana Costa',
          balanceTotal: 1200000,
          shopBalance: 600000,
          balanceSold: 600000,
          mInDollarSold: 54.60,
          paymentDate: 'payment 01/10',
          paymentStatus: 'completed',
          nextDollarShop: 54.60,
          nextGPayment: 400000,
          total: 1600000,
          hold: false,
          binanceId: 'BIN987654',
          idTeam: import.meta.env.VITE_TEAM_LEVELING,
        },
      ]
      setPaymentRows(mockData)
      setAllPaymentRows(mockData)
    } catch (error) {
      const errorDetails = {
        message: 'Error fetching payment rows',
        response: error,
      }
      if (onError) {
        onError(errorDetails)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleTeamFilterChange = (teamId: string) => {
    setTeamFilter(teamId)
  }

  const handlePaymentDateFilter = (paymentDate: string) => {
    setPaymentDateFilter(paymentDate)
  }

  useEffect(() => {
    fetchPaymentRows()
  }, [])

  // Agrupar payment rows por time
  const groupedByTeam = useMemo(() => {
    const grouped: Record<string, PaymentRow[]> = {}
    
    paymentRows.forEach(row => {
      const teamId = row.idTeam
      if (!grouped[teamId]) {
        grouped[teamId] = []
      }
      grouped[teamId].push(row)
    })
    
    return grouped
  }, [paymentRows])

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...allPaymentRows]

    // Filtro por team
    if (teamFilter !== 'all') {
      filtered = filtered.filter(row => row.idTeam === teamFilter)
    }

    // Filtro por payment date
    if (paymentDateFilter !== 'all') {
      filtered = filtered.filter(row => row.paymentDate === paymentDateFilter)
    }

    setPaymentRows(filtered)
  }, [allPaymentRows, teamFilter, paymentDateFilter])

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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={32} sx={{ color: 'rgb(147, 51, 234)' }} />
      </Box>
    )
  }

  const renderTableRows = (rows: PaymentRow[]) => (
    <>
      {rows.map((row) => (
          <TableRow
            key={row.id}
            sx={{
              '&:hover': {
                bgcolor: '#3a3a3a',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <TableCell sx={{ color: 'white', fontSize: '0.85rem', fontWeight: 500 }}>
              {row.player}
            </TableCell>
            <TableCell align="right" sx={{ color: '#60a5fa', fontSize: '0.85rem', fontWeight: 600 }}>
              {formatValueForDisplay(row.balanceTotal)}g
            </TableCell>
            <TableCell align="right" sx={{ color: '#a78bfa', fontSize: '0.85rem', fontWeight: 600 }}>
              {formatValueForDisplay(row.shopBalance)}g
            </TableCell>
            <TableCell align="right" sx={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
              {formatValueForDisplay(row.balanceSold)}g
            </TableCell>
            <TableCell align="right" sx={{ color: '#f59e0b', fontSize: '0.85rem', fontWeight: 600 }}>
              {formatDollar(row.mInDollarSold)}
            </TableCell>
            <TableCell align="center">
              <Chip
                label={getPaymentDateLabel(row.paymentDate)}
                color={getPaymentDateColor(row.paymentDate) as any}
                size="small"
                sx={{
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                }}
              />
            </TableCell>
            <TableCell align="center">
              <Chip
                label={getPaymentStatusLabel(row.paymentStatus)}
                color={getPaymentStatusColor(row.paymentStatus) as any}
                size="small"
                sx={{
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                }}
              />
            </TableCell>
            <TableCell align="right" sx={{ color: '#ec4899', fontSize: '0.85rem', fontWeight: 600 }}>
              {formatDollar(row.nextDollarShop)}
            </TableCell>
            <TableCell align="right" sx={{ color: '#8b5cf6', fontSize: '0.85rem', fontWeight: 600 }}>
              {formatValueForDisplay(row.nextGPayment)}g
            </TableCell>
            <TableCell align="right" sx={{ color: 'white', fontSize: '0.9rem', fontWeight: 700 }}>
              {formatValueForDisplay(row.total)}g
            </TableCell>
            <TableCell align="center">
              <Checkbox
                checked={row.hold}
                onChange={(e) => handleHoldChange(row.id, e.target.checked)}
                sx={{
                  color: '#9ca3af',
                  '&.Mui-checked': {
                    color: 'rgb(147, 51, 234)',
                  },
                }}
              />
            </TableCell>
            <TableCell sx={{ width: 150 }}>
              <TextField
                value={row.binanceId}
                onChange={(e) => handleBinanceIdChange(row.id, e.target.value)}
                variant="outlined"
                size="small"
                placeholder="Binance ID"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    fontSize: '0.85rem',
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
                  '& .MuiOutlinedInput-input': {
                    padding: '8px 10px',
                  },
                }}
              />
            </TableCell>
            <TableCell align="center" sx={{ width: 150 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Wallet size={16} />}
                  onClick={() => handleDebitGBalance(row)}
                  fullWidth
                  sx={{
                    backgroundColor: '#60a5fa',
                    '&:hover': { backgroundColor: '#3b82f6' },
                    fontSize: '0.7rem',
                    textTransform: 'none',
                    px: 1,
                    py: 0.5,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Debit G
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<ShoppingCart size={16} />}
                  onClick={() => handleDebitShopBalance(row)}
                  fullWidth
                  sx={{
                    backgroundColor: '#a78bfa',
                    '&:hover': { backgroundColor: '#8b5cf6' },
                    fontSize: '0.7rem',
                    textTransform: 'none',
                    px: 1,
                    py: 0.5,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Debit Shop
                </Button>
              </Box>
            </TableCell>
          </TableRow>
        ))}
    </>
  )

  const renderTable = (rows: PaymentRow[], teamName?: string) => (
    <Box sx={{ mb: teamName ? 4 : 0 }}>
      {teamName && (
        <Typography
          variant="h6"
          sx={{
            color: 'white',
            fontWeight: 'bold',
            mb: 2,
            pl: 1,
            borderLeft: '4px solid rgb(147, 51, 234)',
          }}
        >
          {teamName}
        </Typography>
      )}
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
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Player</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Balance Total</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Shop Balance</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Balance Sold</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>M in $ Sold</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Payment Date</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Status</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Next $ Shop</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Next G Payment</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Total</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Hold</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem', width: 150 }}>Binance ID</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem', width: 150 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {renderTableRows(rows)}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )

  return (
    <Box>
      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Team Filter */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel sx={{ 
            color: 'white',
            '&.Mui-focused': {
              color: 'rgb(147, 51, 234)',
            },
          }}>Team</InputLabel>
          <Select
            value={teamFilter}
            onChange={(e) => handleTeamFilterChange(e.target.value)}
            label="Team"
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
            <MenuItem value="all">All Teams</MenuItem>
            {Object.entries(TEAM_NAMES).map(([teamId, teamName]) => (
              <MenuItem key={teamId} value={teamId}>
                {teamName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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
      </Box>

      {/* Renderizar tabelas */}
      {teamFilter === 'all' ? (
        // Renderizar uma tabela para cada time
        <>
          {Object.entries(groupedByTeam).map(([teamId, rows]) => {
            const teamName = TEAM_NAMES[teamId] || teamId
            return renderTable(rows, teamName)
          })}
        </>
      ) : (
        // Renderizar apenas uma tabela com o time selecionado
        renderTable(paymentRows)
      )}
    </Box>
  )
}

