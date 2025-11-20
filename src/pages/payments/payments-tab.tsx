import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
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
  CircularProgress,
  Checkbox,
  InputLabel,
  Typography,
  Button,
} from '@mui/material'
import { Wallet, CopySimple } from '@phosphor-icons/react'
import { ErrorDetails } from '../../components/error-display'
import { 
  getPaymentManagement, 
  getPaymentManagementDates, 
  updatePaymentHold,
  updatePaymentBinance,
  updatePaymentManagementDebit,
  PaymentManagementTeam,
  PaymentDate as PaymentDateType 
} from '../../services/api/payments'
import { getBalanceTeams } from '../../services/api/teams'
import { teamOrder } from '../../types/team-interface'
import Swal from 'sweetalert2'

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
  averageDolarPerGold: number
  hold: boolean
  binanceId: string
  idTeam: string
}

interface PaymentsTabProps {
  onError?: (error: ErrorDetails | null) => void
}

export function PaymentsTab({ onError }: PaymentsTabProps) {
  const [paymentRows, setPaymentRows] = useState<PaymentRow[]>([])
  const [paymentDateFilter, setPaymentDateFilter] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [teamFilter, setTeamFilter] = useState<string>('all')
  const [availableTeams, setAvailableTeams] = useState<Array<{ id_discord: string; team_name: string }>>([])
  const [availablePaymentDates, setAvailablePaymentDates] = useState<PaymentDateType[]>([])
  const [selectedPaymentDateId, setSelectedPaymentDateId] = useState<number | undefined>(undefined)
  const [teamNamesMap, setTeamNamesMap] = useState<Record<string, string>>({})
  
  // Timer para reload após mudança de hold
  const reloadTimerRef = useRef<number | null>(null)

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

  const handleHoldChange = async (id: string | number, checked: boolean) => {
    // Encontrar a linha correspondente para obter o id_payment_date
    const row = paymentRows.find(r => r.id === id)
    if (!row || selectedPaymentDateId === undefined) {
      console.error('Row not found or payment date not selected')
      return
    }

    // Atualizar o estado local imediatamente para melhor UX
    setPaymentRows(prevRows =>
      prevRows.map(row =>
        row.id === id ? { ...row, hold: checked } : row
      )
    )

    // Limpar timer anterior se existir
    if (reloadTimerRef.current) {
      clearTimeout(reloadTimerRef.current)
    }

    // Iniciar novo timer de 2 segundos para reload
    reloadTimerRef.current = setTimeout(() => {
      // Salvar a tab ativa antes do reload
      sessionStorage.setItem('paymentsActiveTab', '1')
      window.location.reload()
    }, 2000)

    try {
      // Chamar API para atualizar hold
      await updatePaymentHold({
        id_discord: String(id),
        id_payment_date: selectedPaymentDateId,
        hold: checked
      })
    } catch (error) {
      console.error('Error updating hold:', error)
      // Reverter o estado local em caso de erro
      setPaymentRows(prevRows =>
        prevRows.map(row =>
          row.id === id ? { ...row, hold: !checked } : row
        )
      )
      
      const errorDetails = {
        message: 'Error updating hold status',
        response: error,
      }
      if (onError) {
        onError(errorDetails)
      }
    }
  }

  const handleBinanceIdChange = async (id: string | number, currentValue: string, playerName: string) => {
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
      inputValidator: () => {
        // Permite valores vazios (para limpar o campo)
        return null
      },
      customClass: {
        input: 'swal-input-dark'
      },
      didOpen: () => {
        // Estilizar o input
        const input = Swal.getInput()
        if (input) {
          input.style.backgroundColor = '#1a1a1a'
          input.style.color = 'white'
          input.style.border = '1px solid rgba(255, 255, 255, 0.23)'
          input.style.borderRadius = '4px'
          input.style.padding = '10px'
        }
      }
    })

    if (result.isConfirmed) {
      const newValue = result.value || ''
      
      // Atualizar o estado local imediatamente
      setPaymentRows(prevRows =>
        prevRows.map(row =>
          row.id === id ? { ...row, binanceId: newValue } : row
        )
      )

      try {
        await updatePaymentBinance({
          id_discord: String(id),
          id_binance: newValue
        })

        Swal.fire({
          title: 'Updated!',
          text: 'Binance ID has been updated successfully.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#2a2a2a',
          color: 'white',
        })
      } catch (error) {
        console.error('Error updating binance ID:', error)
        
        // Reverter o estado local em caso de erro
        setPaymentRows(prevRows =>
          prevRows.map(row =>
            row.id === id ? { ...row, binanceId: currentValue } : row
          )
        )

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update Binance ID.',
          confirmButtonColor: 'rgb(147, 51, 234)',
          background: '#2a2a2a',
          color: 'white',
        })

        const errorDetails = {
          message: 'Error updating Binance ID',
          response: error,
        }
        if (onError) {
          onError(errorDetails)
        }
      }
    }
  }

  const handleCopyBinanceTemplate = async () => {
    try {
      // Filtrar apenas linhas que não estão em hold e têm valor maior que 0
      const validRows = paymentRows.filter(row => !row.hold && row.mInDollarSold > 0)
      
      if (validRows.length === 0) {
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
      const rows = validRows.map(row => {
        const accountType = 'Binance ID (BUID)'
        const binanceId = row.binanceId || '' // Vazio se não tiver
        const cryptoCurrency = 'USDT'
        const amount = row.mInDollarSold.toFixed(2)
        
        return `${accountType}\t${binanceId}\t${cryptoCurrency}\t${amount}`
      })
      
      // Combinar linhas sem cabeçalho
      const tsvContent = rows.join('\n')
      
      // Copiar para clipboard
      await navigator.clipboard.writeText(tsvContent)
      
      await Swal.fire({
        title: 'Copied!',
        text: `${validRows.length} payment(s) copied to clipboard in Binance template format.`,
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

  const handleDebitG = async () => {
    try {
      // Verificar se há um payment date selecionado
      if (selectedPaymentDateId === undefined) {
        await Swal.fire({
          icon: 'warning',
          title: 'No Payment Date Selected',
          text: 'Please select a payment date first.',
          confirmButtonColor: 'rgb(147, 51, 234)',
          background: '#2a2a2a',
          color: 'white',
        })
        return
      }

      // Calcular o total de gold a ser debitado (apenas linhas não em hold)
      const validRows = paymentRows.filter(row => !row.hold)
      const totalGold = validRows.reduce((sum, row) => sum + row.balanceSold, 0)

      // Mostrar confirmação com os detalhes
      const result = await Swal.fire({
        title: 'Confirm Debit',
        html: `
          <div style="text-align: left; margin-bottom: 10px;">
            <p style="color: white; margin-bottom: 10px;">
              Are you sure you want to debit gold for 
              <strong style="color: rgb(147, 51, 234);">${getPaymentDateLabel(paymentDateFilter)}</strong>?
            </p>
            <div style="background-color: #1a1a1a; padding: 15px; border-radius: 8px; border: 1px solid #333;">      
              <p style="color: #9ca3af; margin: 5px 0;">
                <strong style="color: white;">Total Gold:</strong> 
                <span style="color: #10b981;">${formatValueForDisplay(totalGold)}g</span>
              </p>
            </div>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#60a5fa',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, debit it!',
        cancelButtonText: 'Cancel',
        background: '#2a2a2a',
        color: 'white',
      })

      if (!result.isConfirmed) {
        return
      }

      // Chamar a API
      await updatePaymentManagementDebit({
        id_payment_date: selectedPaymentDateId
      })

      // Mostrar sucesso
      await Swal.fire({
        title: 'Success!',
        text: 'Gold has been debited successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        background: '#2a2a2a',
        color: 'white',
      })

      // Reload completo da página para atualizar os filtros de datas
      window.location.reload()
    } catch (error: any) {
      console.error('Error debiting gold:', error)
      
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
                You cannot debit a future payment date while there are still pending payments from previous dates.
              </p>
              <p style="color: #f59e0b; font-weight: bold; margin-top: 15px;">
                Please debit the previous payment dates first, in chronological order.
              </p>
            </div>
          `,
          confirmButtonColor: 'rgb(147, 51, 234)',
          background: '#2a2a2a',
          color: 'white',
        })
        // Não chama onError para evitar mensagem duplicada
        return
      }

      // Verificar se é o erro de valor de gold maior que débitos
      const isTotalGoldGreaterError = error?.response?.data?.errors?.some(
        (err: any) => err.type === 'total-gold-value-greater-than-total-debits'
      )
      
      if (isTotalGoldGreaterError) {
        await Swal.fire({
          icon: 'error',
          title: 'Insufficient Debit Value',
          html: `
            <div style="text-align: left;">
              <p style="color: white; margin-bottom: 10px;">
                The total gold value to be debited is greater than the total available debits.
              </p>
              <p style="color: #ef4444; font-weight: bold; margin-top: 15px;">
                Please change any payment date.
              </p>
            </div>
          `,
          confirmButtonColor: 'rgb(147, 51, 234)',
          background: '#2a2a2a',
          color: 'white',
        })
        // Não chama onError para evitar mensagem duplicada
        return
      }
      
      // Para outros erros, mostra mensagem genérica
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to debit gold. Please try again.',
        confirmButtonColor: 'rgb(147, 51, 234)',
        background: '#2a2a2a',
        color: 'white',
      })

      const errorDetails = {
        message: 'Error debiting gold',
        response: error,
      }
      if (onError) {
        onError(errorDetails)
      }
    }
  }

  // Limpar timer quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (reloadTimerRef.current) {
        clearTimeout(reloadTimerRef.current)
      }
    }
  }, [])

  // Função para formatar valor para exibição
  const formatValueForDisplay = (value: number): string => {
    const rounded = Math.round(Math.abs(value))
    const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    // Retorna "-" apenas se o valor for menor que 0 e diferente de 0
    return rounded === 0 ? formatted : (value < 0 ? `-${formatted}` : formatted)
  }

  // Função para formatar valor em dólar
  const formatDollar = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  // Fetch available teams and payment dates
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch teams and payment dates in parallel
        const [teamsData, paymentDatesData] = await Promise.all([
          getBalanceTeams(),
          getPaymentManagementDates()
        ])
        
        // Validar que os dados são arrays
        const validTeamsData = Array.isArray(teamsData) ? teamsData : []
        const validPaymentDatesData = Array.isArray(paymentDatesData) ? paymentDatesData : []
        
        setAvailableTeams(validTeamsData)
        
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
        
        // Ordenar datas antes de definir
        const sortedDates = [...convertedDates].sort((dateA, dateB) => {
          // Função para parsear data no formato MM/DD
          const parseDateString = (dateStr: string) => {
            const match = dateStr.match(/(\d{1,2})\/(\d{1,2})/)
            if (match) {
              const month = parseInt(match[1])
              const day = parseInt(match[2])
              // Retorna um valor que pode ser usado para comparação
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
        
        setAvailablePaymentDates(sortedDates)
        
        // Set default payment date if available (primeira data ordenada)
        if (sortedDates.length > 0) {
          const firstPaymentDate = sortedDates[0]
          setPaymentDateFilter(firstPaymentDate.name)
          setSelectedPaymentDateId(Number(firstPaymentDate.id))
        } else {
          // Se não há datas disponíveis, finaliza o loading
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error fetching initial data:', error)
        const errorDetails = {
          message: 'Error fetching initial data',
          response: error,
        }
        if (onError) {
          onError(errorDetails)
        }
        // Garantir que os arrays estão inicializados mesmo em caso de erro
        setAvailableTeams([])
        setAvailablePaymentDates([])
        setIsLoading(false)
      }
    }
    
    fetchInitialData()
  }, [onError])

  const fetchPaymentRows = useCallback(async (teamId?: string, paymentDateId?: number) => {
    setIsLoading(true)
    try {
      const filters: { id_team?: string; id_payment_date?: number } = {}
      
      if (teamId && teamId !== 'all') {
        filters.id_team = teamId
      }
      
      if (paymentDateId !== undefined) {
        filters.id_payment_date = paymentDateId
      }
      
      const teamsData = await getPaymentManagement(filters)
      
      // Verificar se a resposta é null ou vazia
      if (!teamsData || !Array.isArray(teamsData) || teamsData.length === 0) {
        setPaymentRows([])
        setTeamNamesMap({})
        setIsLoading(false)
        return
      }
      
      // Build a map of team.id -> team.name for display
      const newTeamNamesMap: Record<string, string> = {}
      teamsData.forEach((team: PaymentManagementTeam) => {
        newTeamNamesMap[team.id] = team.name
      })
      setTeamNamesMap(newTeamNamesMap)
      
      // Transform API response to PaymentRow format and sort players alphabetically
      const transformedRows: PaymentRow[] = teamsData.flatMap((team: PaymentManagementTeam) =>
        team.players
          .sort((a, b) => a.username.localeCompare(b.username, 'en', { sensitivity: 'base' }))
          .map((player) => ({
            id: player.id_discord,
            player: player.username,
            balanceTotal: player.balance_total,
            shopBalance: 0, // Not provided by API
            balanceSold: player.balance_sold,
            mInDollarSold: player.m_in_dolar_sold,
            paymentDate: player.payment_date,
            paymentStatus: 'pending' as const, // Not provided by API
            nextDollarShop: 0, // Not provided by API
            nextGPayment: 0, // Not provided by API
            total: player.balance_total,
            averageDolarPerGold: player.average_dolar_per_gold,
            hold: player.hold,
            binanceId: player.id_binance,
            idTeam: team.id,
          }))
      )
      
      setPaymentRows(transformedRows)
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
  }, [onError])

  const handleTeamFilterChange = (teamId: string) => {
    setTeamFilter(teamId)
  }

  const handlePaymentDateFilter = (paymentDate: string) => {
    setPaymentDateFilter(paymentDate)
    // Find the payment date ID
    if (availablePaymentDates && availablePaymentDates.length > 0) {
      const paymentDateObj = availablePaymentDates.find(pd => pd.name === paymentDate)
      if (paymentDateObj) {
        setSelectedPaymentDateId(Number(paymentDateObj.id))
      }
    }
  }

  // Fetch data when filters change
  useEffect(() => {
    if (selectedPaymentDateId !== undefined) {
      fetchPaymentRows(teamFilter, selectedPaymentDateId)
    }
  }, [teamFilter, selectedPaymentDateId, fetchPaymentRows])

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

  // Função para obter o índice de ordenação do time
  const getTeamOrderIndex = (teamName: string): number => {
    const index = teamOrder.indexOf(teamName as any)
    return index === -1 ? teamOrder.length : index // Times não encontrados vão para o final
  }

  // Ordenar times de acordo com teamOrder
  const sortedTeamEntries = useMemo(() => {
    return Object.entries(groupedByTeam).sort(([teamIdA, _rowsA], [teamIdB, _rowsB]) => {
      const teamNameA = teamNamesMap[teamIdA] || teamIdA
      const teamNameB = teamNamesMap[teamIdB] || teamIdB
      return getTeamOrderIndex(teamNameA) - getTeamOrderIndex(teamNameB)
    })
  }, [groupedByTeam, teamNamesMap])

  // Calcular a média ponderada global de dólar por gold
  const averageDolarPerGold = useMemo(() => {
    if (paymentRows.length === 0) return 0
    
    // Pega a média do primeiro registro (todos devem ter a mesma média para a mesma data de pagamento)
    const firstRow = paymentRows[0]
    return firstRow?.averageDolarPerGold || 0
  }, [paymentRows])

  // Ordenar times disponíveis de acordo com teamOrder
  const sortedAvailableTeams = useMemo(() => {
    return [...availableTeams].sort((teamA, teamB) => {
      return getTeamOrderIndex(teamA.team_name) - getTeamOrderIndex(teamB.team_name)
    })
  }, [availableTeams])

  // Ordenar datas de pagamento cronologicamente
  const sortedPaymentDates = useMemo(() => {
    return [...availablePaymentDates].sort((dateA, dateB) => {
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
  }, [availablePaymentDates])

  // Note: Filtering is now done by the API

  const getPaymentDateLabel = (paymentDate: string) => {
    if (!paymentDate) return '-'
    // Format payment dates nicely
    if (paymentDate.startsWith('payment')) {
      const datePart = paymentDate.replace('payment', 'Payment').trim()
      return datePart.toUpperCase()
    }
    return formatSummaryDate(paymentDate).toUpperCase()
  }


  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={32} sx={{ color: 'rgb(147, 51, 234)' }} />
      </Box>
    )
  }

  // Se não há payment dates disponíveis, mostra mensagem
  if (!availablePaymentDates || availablePaymentDates.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8 }}>
        <Paper sx={{ 
          bgcolor: '#2a2a2a', 
          border: '1px solid #333', 
          p: 4, 
          textAlign: 'center',
          maxWidth: 500 
        }}>
          <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>
            No Payment Dates Available
          </Typography>
          <Typography variant="body1" sx={{ color: '#9ca3af' }}>
            There are no payment dates configured yet.
          </Typography>
        </Paper>
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
            <TableCell align="left" sx={{ color: 'white', fontSize: '1rem', fontWeight: 500, width: 180 }}>
              {row.player}
            </TableCell>
            <TableCell align="right" sx={{ color: '#60a5fa', fontSize: '1rem', fontWeight: 600, width: 150 }}>
              {row.balanceTotal === 0 ? '0' : `${formatValueForDisplay(row.balanceTotal)}g`}
            </TableCell>
            <TableCell align="right" sx={{ color: '#10b981', fontSize: '1rem', fontWeight: 600, width: 150 }}>
              {row.balanceSold === 0 ? '-' : `${formatValueForDisplay(row.balanceSold)}g`}
            </TableCell>
            <TableCell align="right" sx={{ color: '#f59e0b', fontSize: '1rem', fontWeight: 600, width: 150 }}>
              {row.mInDollarSold === 0 ? '-' : `U$ ${row.mInDollarSold.toFixed(2)}`}
            </TableCell>
            <TableCell align="center" sx={{ color: '#9ca3af', fontSize: '1rem', width: 150 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontSize: '1rem', color: 'white' }}>
                  {getPaymentDateLabel(row.paymentDate)}
                </Typography>
              </Box>
            </TableCell>
            <TableCell align="center" sx={{ width: 100 }}>
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
            <TableCell align="left" sx={{ width: 180 }}>
              <Box
                onClick={() => handleBinanceIdChange(row.id, row.binanceId, row.player)}
                sx={{
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.23)',
                  backgroundColor: '#1a1a1a',
                  color: row.binanceId ? 'white' : '#9ca3af',
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
                {row.binanceId || 'Click to add Binance ID'}
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
              <TableCell align="left" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', width: 180 }}>Player</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', width: 150 }}>Balance Total</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', width: 150 }}>Balance Sold</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', width: 150 }}>M in $ Sold</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', width: 150 }}>Payment Date</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', width: 100 }}>Hold</TableCell>
              <TableCell align="left" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', width: 180 }}>Binance ID</TableCell>
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
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
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
            {sortedAvailableTeams && sortedAvailableTeams.map((team) => (
              <MenuItem key={team.id_discord} value={team.id_discord}>
                {team.team_name}
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
            {sortedPaymentDates && sortedPaymentDates.map((paymentDate) => (
              <MenuItem key={paymentDate.id} value={paymentDate.name}>
                {paymentDate.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Average Display */}
        {averageDolarPerGold > 0 && (
          <Typography
            sx={{
              color: '#10b981',
              fontSize: '0.875rem',
              fontWeight: 600,
              backgroundColor: '#1a1a1a',
              padding: '6px 12px',
              borderRadius: '4px',
              border: '1px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            Avg: {formatDollar(averageDolarPerGold)}/M
          </Typography>
        )}
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
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
            Copy Binance Template for {paymentDateFilter}
          </Button>
          
          <Button
            variant="contained"
            size="medium"
            startIcon={<Wallet size={16} />}
            onClick={handleDebitG}
            sx={{
              backgroundColor: '#60a5fa',
              '&:hover': { backgroundColor: '#3b82f6' },
              fontSize: '0.875rem',
              textTransform: 'none',
              height: '40px',
              px: 2,
            }}
          >
            Debit G for {getPaymentDateLabel(paymentDateFilter)}
          </Button>
        </Box>
      </Box>

      {/* Mensagem quando não há dados */}
      {paymentRows.length === 0 && !isLoading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8 }}>
          <Paper sx={{ 
            bgcolor: '#2a2a2a', 
            border: '1px solid #333', 
            p: 4, 
            textAlign: 'center',
            maxWidth: 500 
          }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>
              No Payment Data Available
            </Typography>
            <Typography variant="body1" sx={{ color: '#9ca3af' }}>
              There are no payment records for the selected filters.
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Renderizar tabelas */}
      {paymentRows.length > 0 && (
        <>
          {teamFilter === 'all' ? (
            // Renderizar uma tabela para cada time
            <>
              {sortedTeamEntries.map(([teamId, rows]) => {
                const teamName = teamNamesMap[teamId] || teamId
                return <Box key={teamId}>{renderTable(rows, teamName)}</Box>
              })}
            </>
          ) : (
            // Renderizar apenas uma tabela com o time selecionado
            renderTable(paymentRows, availableTeams?.find(t => t.id_discord === teamFilter)?.team_name || teamFilter)
          )}
        </>
      )}
    </Box>
  )
}

