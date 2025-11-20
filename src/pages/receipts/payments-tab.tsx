import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { Wallet, CopySimple } from '@phosphor-icons/react'
import { format, parseISO } from 'date-fns'
import Swal from 'sweetalert2'

import { ErrorDetails } from '../../components/error-display'
import { teamOrder } from '../../types/team-interface'
import {
  getReceiptsManagement,
  getReceiptsManagementDates,
  updateReceiptsManagementDebit,
  updateReceiptsBinance,
  type ReceiptsManagementTeam,
  type ReceiptsDate,
} from '../../services/api'

interface ReceiptsPaymentsTabProps {
  onError?: (error: ErrorDetails | null) => void
}

export function ReceiptsPaymentsTab({ onError }: ReceiptsPaymentsTabProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingDates, setIsLoadingDates] = useState(true)
  const [isDebiting, setIsDebiting] = useState(false)
  const [managementTeams, setManagementTeams] = useState<ReceiptsManagementTeam[]>([])
  const [availableDates, setAvailableDates] = useState<ReceiptsDate[]>([])
  const [selectedDateId, setSelectedDateId] = useState<number | null>(null)
  const [selectedTeamId, setSelectedTeamId] = useState<string>('all')

  const handleError = useCallback((message: string, error: unknown) => {
    console.error(message, error)
    if (onError) {
      onError({
        message,
        response: error,
      })
    }
  }, [onError])

  const loadDates = useCallback(async () => {
    try {
      setIsLoadingDates(true)
      const dates = await getReceiptsManagementDates({ status: 'pending' })
      const sortedDates = (dates ?? []).sort((a, b) => Number(a.id) - Number(b.id))
      setAvailableDates(sortedDates)
      if (sortedDates.length > 0) {
        setSelectedDateId(Number(sortedDates[0].id))
      } else {
        setSelectedDateId(null)
      }
    } catch (error) {
      handleError('Error fetching receipts dates', error)
    } finally {
      setIsLoadingDates(false)
    }
  }, [handleError])

  const loadManagement = useCallback(async () => {
    if (!selectedDateId) {
      setManagementTeams([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const teams = await getReceiptsManagement({
        id_payment_dolar_date: selectedDateId,
        id_team: selectedTeamId !== 'all' ? selectedTeamId : undefined,
      })
      setManagementTeams(teams ?? [])
    } catch (error) {
      handleError('Error fetching dolar management data', error)
    } finally {
      setIsLoading(false)
    }
  }, [handleError, selectedDateId, selectedTeamId])

  useEffect(() => {
    loadDates()
  }, [loadDates])

  useEffect(() => {
    loadManagement()
  }, [loadManagement])

  // Função helper para ordenar times de acordo com teamOrder
  const sortTeamsByOrder = useCallback(<T extends { name: string }>(teams: T[]): T[] => {
    return [...teams].sort((a, b) => {
      const indexA = teamOrder.indexOf(a.name as typeof teamOrder[number])
      const indexB = teamOrder.indexOf(b.name as typeof teamOrder[number])
      
      // Se ambos estão na lista, ordenar pelo índice
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB
      }
      // Se apenas A está na lista, A vem primeiro
      if (indexA !== -1) return -1
      // Se apenas B está na lista, B vem primeiro
      if (indexB !== -1) return 1
      // Se nenhum está na lista, manter ordem alfabética
      return a.name.localeCompare(b.name)
    })
  }, [])

  const teamOptions = useMemo(() => {
    const allTeams = managementTeams.map((team) => ({ id: team.id, name: team.name }))
    const uniqueMap = new Map<string, string>()
    allTeams.forEach((team) => {
      if (!uniqueMap.has(team.id)) {
        uniqueMap.set(team.id, team.name)
      }
    })
    const teams = Array.from(uniqueMap.entries()).map(([id, name]) => ({ id, name }))
    
    // Ordenar times de acordo com teamOrder
    return sortTeamsByOrder(teams)
  }, [managementTeams, sortTeamsByOrder])

  // Ordenar managementTeams para exibição na página
  const sortedManagementTeams = useMemo(() => {
    return sortTeamsByOrder(managementTeams)
  }, [managementTeams, sortTeamsByOrder])

  const handleDebit = async () => {
    if (!selectedDateId) {
      Swal.fire({
        icon: 'warning',
        title: 'Select a date',
        text: 'Please select a receipts date before debiting.',
        confirmButtonColor: 'rgb(147, 51, 234)',
        background: '#2a2a2a',
        color: 'white',
      })
      return
    }

    const selectedDate = availableDates.find((date) => Number(date.id) === Number(selectedDateId))
    const formattedDate = selectedDate ? formatDate(selectedDate.name) : ''

    // Calcular o total de dólar a ser debitado
    const allPlayers = sortedManagementTeams.flatMap((team) => team.players)
    const totalDollar = allPlayers.reduce((sum, player) => sum + (player.balance_dolar_paid ?? 0), 0)

    // Formatar o valor em dólar para exibição
    const formatDollarForDisplay = (value: number): string => {
      if (value === 0) return 'U$ 0.00'
      const fixedValue = Math.abs(value).toFixed(2)
      const parts = fixedValue.split('.')
      const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      const formatted = `${integerPart}.${parts[1]}`
      return value < 0 ? `U$ -${formatted}` : `U$ ${formatted}`
    }

    const result = await Swal.fire({
      title: 'Confirm Debit',
      html: selectedDate 
        ? `<div style="text-align: left; margin-bottom: 10px;">
            <p style="color: white; margin-bottom: 10px;">
              Are you sure you want to debit for 
              <strong style="color: rgb(147, 51, 234);">${formattedDate}</strong>?
            </p>
            <div style="background-color: #1a1a1a; padding: 15px; border-radius: 8px; border: 1px solid #333;">      
              <p style="color: #9ca3af; margin: 5px 0;">
                <strong style="color: white;">Total Dollar:</strong> 
                <span style="color: #10b981;">${formatDollarForDisplay(totalDollar)}</span>
              </p>
            </div>
          </div>`
        : '<p style="color: white;">Are you sure you want to debit for selected date?</p>',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'rgb(147, 51, 234)',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, debit',
      cancelButtonText: 'Cancel',
      background: '#2a2a2a',
      color: 'white',
    })

    if (!result.isConfirmed) {
      return
    }

    try {
      setIsDebiting(true)
      await updateReceiptsManagementDebit({ id_receipts_dolar_date: selectedDateId })
      Swal.fire({
        icon: 'success',
        title: 'Debited!',
        text: 'Gold debited successfully.',
        timer: 1500,
        showConfirmButton: false,
        background: '#2a2a2a',
        color: 'white',
      })
      // Reload completo da página para atualizar os filtros de datas
      window.location.reload()
    } catch (error: any) {
      console.error('Error debiting receipts date:', error)
      
      // Verificar se é o erro de data pendente anterior
      const isPendingOldDateError = error?.response?.data?.errors?.some(
        (err: any) => err.type === 'pending-old-date-not-allowed'
      )
      
      if (isPendingOldDateError) {
        await Swal.fire({
          icon: 'warning',
          title: 'Pending Previous Date',
          html: `
            <div style="text-align: left;">
              <p style="color: white; margin-bottom: 10px;">
                You cannot debit a future receipts date while there are still pending receipts from previous dates.
              </p>
              <p style="color: #f59e0b; font-weight: bold; margin-top: 15px;">
                Please debit the previous receipts dates first, in chronological order.
              </p>
            </div>
          `,
          confirmButtonColor: 'rgb(147, 51, 234)',
          background: '#2a2a2a',
          color: 'white',
        })
        // Não chama onError para evitar mensagem duplicada
        setIsDebiting(false)
        return
      }
      
      // Verificar se é o erro de valor da receita maior que o valor em caixa
      const isTotalDolarValueGreaterError = error?.response?.data?.errors?.some(
        (err: any) => err.type === 'total-dolar-value-greater-than-total-debits'
      )
      
      if (isTotalDolarValueGreaterError) {
        await Swal.fire({
          icon: 'error',
          title: 'Insufficient Cash Value',
          html: `
            <div style="text-align: left;">
              <p style="color: white; margin-bottom: 10px;">
                The total receipt value is greater than the available cash value to distribute.
              </p>
              <p style="color: #ef4444; font-weight: bold; margin-top: 15px;">
                Please check the values and adjust the payments before trying to debit again.
              </p>
            </div>
          `,
          confirmButtonColor: 'rgb(147, 51, 234)',
          background: '#2a2a2a',
          color: 'white',
        })
        // Não chama onError para evitar mensagem duplicada
        setIsDebiting(false)
        return
      }
      
      // Para outros erros, mostra mensagem genérica
      handleError('Error debiting receipts date', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to debit receipts date.',
        confirmButtonColor: 'rgb(147, 51, 234)',
        background: '#2a2a2a',
        color: 'white',
      })
    } finally {
      setIsDebiting(false)
    }
  }

  const handleBinanceUpdate = async (idDiscord: string, currentValue: string, playerName: string) => {
    const result = await Swal.fire({
      title: 'Edit Binance ID',
      html: `
        <div style="text-align: left; margin-bottom: 10px;">
          <strong style="color: #9ca3af;">Player:</strong>
          <span style="color: white;">${playerName}</span>
        </div>
      `,
      input: 'text',
      inputLabel: 'Binance ID',
      inputValue: currentValue,
      inputPlaceholder: 'Enter Binance ID',
      showCancelButton: true,
      confirmButtonColor: 'rgb(147, 51, 234)',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel',
      background: '#2a2a2a',
      color: 'white',
      inputValidator: () => null,
      didOpen: () => {
        const input = Swal.getInput()
        if (input) {
          input.style.backgroundColor = '#1a1a1a'
          input.style.color = 'white'
          input.style.border = '1px solid rgba(255, 255, 255, 0.23)'
          input.style.borderRadius = '4px'
          input.style.padding = '10px'
        }
      },
    })

    if (!result.isConfirmed) {
      return
    }

    const newValue = result.value || ''

    try {
      await updateReceiptsBinance({
        id_discord: idDiscord,
        id_binance: newValue,
      })

      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Binance ID updated successfully.',
        timer: 1500,
        showConfirmButton: false,
        background: '#2a2a2a',
        color: 'white',
      })

      setManagementTeams((prev) =>
        prev.map((team) => ({
          ...team,
          players: team.players.map((player) =>
            player.id_discord === idDiscord
              ? { ...player, id_binance: newValue }
              : player
          ),
        }))
      )
    } catch (error) {
      handleError('Error updating binance ID', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update Binance ID.',
        confirmButtonColor: 'rgb(147, 51, 234)',
        background: '#2a2a2a',
        color: 'white',
      })
    }
  }

  const formatCurrency = (value: number) => {
    if (value === 0) return '0'
    const fixedValue = Math.abs(value).toFixed(2)
    const parts = fixedValue.split('.')
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    const formatted = `${integerPart}.${parts[1]}`
    return (
      <span>
        U$ {value < 0 ? '-' : ''}{formatted}
      </span>
    )
  }

  const formatCurrencyWithZero = (value: number) => {
    if (value === 0) return '-'
    const fixedValue = Math.abs(value).toFixed(2)
    const parts = fixedValue.split('.')
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    const formatted = `${integerPart}.${parts[1]}`
    return (
      <span>
        U$ {value < 0 ? '-' : ''}{formatted}
      </span>
    )
  }

  const formatDate = (dateString: string): string => {
    if (!dateString) return dateString
    
    try {
      // Tenta parsear como ISO date
      const date = parseISO(dateString)
      return format(date, 'MM/dd/yyyy')
    } catch (error) {
      // Se falhar, tenta outros formatos comuns
      try {
        // Tenta formato YYYY-MM-DD
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = dateString.split('-')
          return `${month}/${day}/${year}`
        }
        // Tenta formato DD/MM/YYYY ou MM/DD/YYYY
        if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
          const parts = dateString.split('/')
          // Se o primeiro número for > 12, assume DD/MM/YYYY e converte para MM/DD/YYYY
          if (Number(parts[0]) > 12) {
            return `${parts[1]}/${parts[0]}/${parts[2]}`
          }
          return dateString
        }
      } catch (e) {
        // Se tudo falhar, retorna a string original
      }
      return dateString
    }
  }

  const formatDateWithoutYear = (dateString: string): string => {
    if (!dateString) return dateString
    
    try {
      // Tenta parsear como ISO date
      const date = parseISO(dateString)
      return format(date, 'MM/dd')
    } catch (error) {
      // Se falhar, tenta outros formatos comuns
      try {
        // Tenta formato YYYY-MM-DD
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [, month, day] = dateString.split('-')
          return `${month}/${day}`
        }
        // Tenta formato MM/DD/YYYY ou DD/MM/YYYY
        if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
          const parts = dateString.split('/')
          // Se o primeiro número for > 12, assume DD/MM/YYYY e converte para MM/DD
          if (Number(parts[0]) > 12) {
            return `${parts[1]}/${parts[0]}`
          }
          return `${parts[0]}/${parts[1]}`
        }
        // Tenta formato MM/DD
        if (dateString.match(/^\d{2}\/\d{2}$/)) {
          return dateString
        }
      } catch (e) {
        // Se tudo falhar, retorna a string original
      }
      return dateString
    }
  }

  const getPaymentDateLabel = (dateId: number | null) => {
    if (!dateId) return '-'
    const date = availableDates.find((d) => Number(d.id) === Number(dateId))
    if (!date) return '-'
    return formatDateWithoutYear(date.name).toUpperCase()
  }

  const handleCopyBinanceTemplate = async () => {
    try {
      // Filtrar apenas linhas que têm valor maior que 0
      const allPlayers = sortedManagementTeams.flatMap((team) => team.players)
      const validPlayers = allPlayers.filter(
        (player) => player.balance_dolar_paid > 0 && player.id_binance
      )

      if (validPlayers.length === 0) {
        await Swal.fire({
          icon: 'warning',
          title: 'No Data',
          text: 'No valid payment data to copy.',
          confirmButtonColor: 'rgb(147, 51, 234)',
          background: '#2a2a2a',
          color: 'white',
        })
        return
      }

      // Criar linhas de dados
      const rows = validPlayers.map((player) => {
        const accountType = 'Binance ID (BUID)'
        const binanceId = player.id_binance || ''
        const cryptoCurrency = 'USDT'
        const amount = player.balance_dolar_paid.toFixed(2)

        return `${accountType}\t${binanceId}\t${cryptoCurrency}\t${amount}`
      })

      // Combinar linhas sem cabeçalho
      const tsvContent = rows.join('\n')

      // Copiar para clipboard
      await navigator.clipboard.writeText(tsvContent)

      await Swal.fire({
        title: 'Copied!',
        text: `${validPlayers.length} payment(s) copied to clipboard in Binance template format.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        background: '#2a2a2a',
        color: 'white',
      })
    } catch (error) {
      console.error('Error copying to clipboard:', error)

      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to copy to clipboard.',
        confirmButtonColor: 'rgb(147, 51, 234)',
        background: '#2a2a2a',
        color: 'white',
      })
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper
        sx={{
          bgcolor: '#2a2a2a',
          border: '1px solid #333',
          p: 3,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <FormControl size='small' sx={{ minWidth: 200 }} disabled={isLoadingDates}>
              <InputLabel sx={{ color: 'white', '&.Mui-focused': { color: 'rgb(147, 51, 234)' } }}>Receipts Date</InputLabel>
              <Select
                value={selectedDateId ?? ''}
                label='Receipts Date'
                onChange={(event) => setSelectedDateId(event.target.value ? Number(event.target.value) : null)}
                sx={{
                  color: 'white',
                  backgroundColor: '#1f1f1f',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgb(147, 51, 234)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgb(147, 51, 234)' },
                }}
              >
                {availableDates.length === 0 && <MenuItem value='' disabled>No dates available</MenuItem>}
                {availableDates.map((date) => (
                  <MenuItem key={date.id} value={Number(date.id)}>
                    {formatDate(date.name)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size='small' sx={{ minWidth: 180 }}>
              <InputLabel sx={{ color: 'white', '&.Mui-focused': { color: 'rgb(147, 51, 234)' } }}>Team</InputLabel>
              <Select
                value={selectedTeamId}
                label='Team'
                onChange={(event) => setSelectedTeamId(event.target.value)}
                sx={{
                  color: 'white',
                  backgroundColor: '#1f1f1f',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgb(147, 51, 234)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgb(147, 51, 234)' },
                }}
              >
                <MenuItem value='all'>All Teams</MenuItem>
                {teamOptions.map((team) => (
                  <MenuItem key={team.id} value={team.id}>
                    {team.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Button
              variant="contained"
              size="medium"
              startIcon={<CopySimple size={16} />}
              onClick={handleCopyBinanceTemplate}
              sx={{
                backgroundColor: 'rgb(147, 51, 234)',
                '&:hover': { backgroundColor: 'rgb(126, 34, 206)' },
                fontSize: '0.875rem',
                textTransform: 'none',
                height: '40px',
                px: 2,
              }}
            >
              Copy Binance Template for {selectedDateId ? getPaymentDateLabel(selectedDateId) : 'Selected Date'}
            </Button>

            <Button
              variant="contained"
              size="medium"
              startIcon={<Wallet size={16} />}
              onClick={handleDebit}
              disabled={!selectedDateId || isDebiting}
              sx={{
                backgroundColor: '#60a5fa',
                '&:hover': { backgroundColor: '#3b82f6' },
                fontSize: '0.875rem',
                textTransform: 'none',
                height: '40px',
                px: 2,
              }}
            >
              {isDebiting ? 'Debiting...' : `Debit $ for ${selectedDateId ? getPaymentDateLabel(selectedDateId) : 'Selected Date'}`}
            </Button>
          </Box>
        </Box>
      </Paper>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress size={48} sx={{ color: 'rgb(147, 51, 234)' }} />
        </Box>
      ) : sortedManagementTeams.length === 0 ? (
        <Paper sx={{ bgcolor: '#2a2a2a', border: '1px solid #333', p: 6 }}>
          <Typography variant='h6' sx={{ color: '#9ca3af', textAlign: 'center' }}>
            No management data available for the selected filters.
          </Typography>
        </Paper>
      ) : (
        sortedManagementTeams.map((team) => (
          <Paper
            key={team.id}
            sx={{
              bgcolor: '#1f1f1f',
              border: '1px solid #333',
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Typography variant='h5' sx={{ color: 'white', fontWeight: 'bold' }}>
                {team.name}
              </Typography>
            </Box>

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
              <Table size='small'>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#111' }}>
                    <TableCell align="left" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', width: 180 }}>Player</TableCell>
                    <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', width: 150 }}>Balance Total</TableCell>
                    <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', width: 150 }}>Balance $ Paid</TableCell>
                    <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', width: 150 }}>Payment Date</TableCell>
                    <TableCell align="left" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', width: 180 }}>Binance ID</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {team.players.map((player) => (
                    <TableRow key={player.id_discord}>
                      <TableCell align="left" sx={{ color: 'white', fontSize: '1rem', fontWeight: 500, width: 180 }}>
                        {player.username}
                      </TableCell>
                      <TableCell align="right" sx={{ color: '#60a5fa', fontSize: '1rem', fontWeight: 600, width: 150 }}>
                        {formatCurrency(player.balance_total ?? 0)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: '#a78bfa', fontSize: '1rem', fontWeight: 600, width: 150 }}>
                        {formatCurrencyWithZero(player.balance_dolar_paid ?? 0)}
                      </TableCell>
                      <TableCell align="center" sx={{ color: '#9ca3af', fontSize: '1rem', width: 150 }}>
                        {player.receipts_dolar_date ? formatDate(player.receipts_dolar_date) : '-'}
                      </TableCell>
                      <TableCell align="left" sx={{ width: 180 }}>
                        <Box
                          onClick={() => handleBinanceUpdate(player.id_discord, player.id_binance, player.username)}
                          sx={{
                            cursor: 'pointer',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            border: '1px solid rgba(255, 255, 255, 0.23)',
                            backgroundColor: '#1a1a1a',
                            color: player.id_binance ? 'white' : '#9ca3af',
                            fontSize: '1rem',
                            transition: 'all 0.2s ease-in-out',
                            minHeight: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            '&:hover': {
                              borderColor: 'rgb(147, 51, 234)',
                              backgroundColor: '#2a2a2a',
                            },
                          }}
                        >
                          {player.id_binance || 'Click to add Binance ID'}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        ))
      )}
    </Box>
  )
}


