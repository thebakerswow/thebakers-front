import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Wallet, CopySimple } from '@phosphor-icons/react'
import { LoadingSpinner } from '../../../../components/LoadingSpinner'
import { ApiErrorDetails, handleApiError } from '../../../../utils/apiErrorHandler'
import { PaymentsTabPageSkeleton } from './PaymentsTabPageSkeleton'
import { 
  getPaymentManagement, 
  getPaymentManagementDates, 
  updatePaymentHold,
  updatePaymentBinance,
  updatePaymentManagementDebit,
  getBalanceTeams,
} from '../services/goldPaymentApi'
import type { PaymentManagementTeam, PaymentDate as PaymentDateType } from '../types/goldPayments'
import { sortPaymentDatesByName, toMonthDay } from '../utils/paymentDate'
import Swal from 'sweetalert2'

const teamOrder = [
  'Chefe de cozinha',
  'M+',
  'Leveling',
  'Garçom',
  'Confeiteiros',
  'Jackfruit',
  'Insanos',
  'APAE',
  'Los Renegados',
  'DTM',
  'KFFC',
  'Greensky',
  'Guild Azralon BR#1',
  'Guild Azralon BR#2',
  'Rocket',
  'Booty Reaper',
  'Padeirinho',
  'Milharal',
  'Advertiser',
  'Freelancer',
  'Bastard Munchen',
  'Kiwi',
] as const

interface PaymentRow {
  id: string | number
  player: string
  balanceTotal: number
  balanceSold: number
  mInDollarSold: number
  paymentDate: string
  averageDolarPerGold: number
  hold: boolean
  binanceId: string
  idTeam: string
}

interface PaymentsTabProps {
  onError?: (error: ApiErrorDetails | null) => void
}

export function PaymentsTab({ onError }: PaymentsTabProps) {
  const [paymentRows, setPaymentRows] = useState<PaymentRow[]>([])
  const [paymentDateFilter, setPaymentDateFilter] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasCompletedInitialLoad, setHasCompletedInitialLoad] = useState(false)
  const [teamFilter, setTeamFilter] = useState<string>('all')
  const [availableTeams, setAvailableTeams] = useState<Array<{ id_discord: string; team_name: string }>>([])
  const [availablePaymentDates, setAvailablePaymentDates] = useState<PaymentDateType[]>([])
  const [selectedPaymentDateId, setSelectedPaymentDateId] = useState<number | undefined>(undefined)
  const [teamNamesMap, setTeamNamesMap] = useState<Record<string, string>>({})
  
  // Timer para reload após mudança de hold
  const reloadTimerRef = useRef<number | null>(null)

  // Função para converter data de YYYY-MM-DD para MM/DD
  const formatSummaryDate = (dateStr: string) => {
    return toMonthDay(dateStr)
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
      await handleApiError(error, 'Error updating hold status')
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
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel',
      inputValidator: () => {
        // Permite valores vazios (para limpar o campo)
        return null
      },
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
        })
      } catch (error) {
        console.error('Error updating binance ID:', error)
        await handleApiError(error, 'Error updating Binance ID')
        
        // Reverter o estado local em caso de erro
        setPaymentRows(prevRows =>
          prevRows.map(row =>
            row.id === id ? { ...row, binanceId: currentValue } : row
          )
        )

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
      })
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to copy to clipboard.',
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
        confirmButtonText: 'Yes, debit it!',
        cancelButtonText: 'Cancel',
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
        })
        // Não chama onError para evitar mensagem duplicada
        return
      }

      // Verificar se é o erro de data de pagamento não é de hoje
      const isPaymentDateNotTodayError = error?.response?.data?.errors?.some(
        (err: any) => err.type === 'payment-date-not-today'
      )
      
      if (isPaymentDateNotTodayError) {
        await Swal.fire({
          icon: 'warning',
          title: 'Payment Date Not Today',
          html: `
            <div style="text-align: left;">
              <p style="color: white; margin-bottom: 10px;">
                The selected payment details are not from today.
              </p>
              <p style="color: #f59e0b; font-weight: bold; margin-top: 15px;">
                Please select today's payment date to proceed with the debit.
              </p>
            </div>
          `,
        })
        // Não chama onError para evitar mensagem duplicada
        return
      }
      
      // Para outros erros, mostra mensagem genérica
      await handleApiError(error, 'Failed to debit gold. Please try again.')

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
        
        const convertedDates = validPaymentDatesData.map((date) => ({
          ...date,
          name: toMonthDay(date.name),
        }))
        const sortedDates = sortPaymentDatesByName(convertedDates)
        
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
        await handleApiError(error, 'Error fetching initial data')
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
            balanceSold: player.balance_sold,
            mInDollarSold: player.m_in_dolar_sold,
            paymentDate: player.payment_date,
            averageDolarPerGold: player.average_dolar_per_gold,
            hold: player.hold,
            binanceId: player.id_binance,
            idTeam: team.id,
          }))
      )
      
      setPaymentRows(transformedRows)
    } catch (error) {
      await handleApiError(error, 'Error fetching payment rows')
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
    return sortPaymentDatesByName(availablePaymentDates)
  }, [availablePaymentDates])

  // Note: Filtering is now done by the API
  useEffect(() => {
    if (!isLoading && !hasCompletedInitialLoad) {
      setHasCompletedInitialLoad(true)
    }
  }, [isLoading, hasCompletedInitialLoad])

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
    if (!hasCompletedInitialLoad) {
      return <PaymentsTabPageSkeleton />
    }

    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 64, paddingBottom: 64 }}>
        <LoadingSpinner size='lg' label='Loading payments table' />
      </div>
    )
  }

  // Se não há payment dates disponíveis, mostra mensagem
  if (!availablePaymentDates || availablePaymentDates.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 64, paddingBottom: 64 }}>
        <div
          style={{
            backgroundColor: '#2a2a2a',
            border: '1px solid #333',
            padding: 32,
            textAlign: 'center',
            maxWidth: 500,
            borderRadius: 8,
          }}
        >
          <p style={{ color: 'white', marginBottom: 16, fontWeight: 'bold', fontSize: '1.125rem' }}>
            No Payment Dates Available
          </p>
          <p style={{ color: '#9ca3af' }}>
            There are no payment dates configured yet.
          </p>
        </div>
      </div>
    )
  }

  const renderTableRows = (rows: PaymentRow[]) => (
    <>
      {rows.map((row) => (
          <tr key={row.id} className='border-b border-white/5 transition hover:bg-white/[0.05]'>
            <td className='px-4 py-3 text-sm font-medium text-white/90' style={{ textAlign: 'left', width: 180 }}>
              {row.player}
            </td>
            <td className='px-4 py-3 text-right text-sm font-semibold text-blue-300' style={{ width: 150 }}>
              {row.balanceTotal === 0 ? '0' : `${formatValueForDisplay(row.balanceTotal)}g`}
            </td>
            <td className='px-4 py-3 text-right text-sm font-semibold text-emerald-300' style={{ width: 150 }}>
              {row.balanceSold === 0 ? '-' : `${formatValueForDisplay(row.balanceSold)}g`}
            </td>
            <td className='px-4 py-3 text-right text-sm font-semibold text-violet-300' style={{ width: 150 }}>
              {row.mInDollarSold === 0 ? '-' : `U$ ${row.mInDollarSold.toFixed(2)}`}
            </td>
            <td className='px-4 py-3 text-center text-sm text-neutral-400' style={{ width: 150 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <p style={{ color: 'white' }}>
                  {getPaymentDateLabel(row.paymentDate)}
                </p>
              </div>
            </td>
            <td className='px-4 py-3 text-center' style={{ width: 100 }}>
              <input
                type='checkbox'
                checked={row.hold}
                onChange={(e) => handleHoldChange(row.id, e.target.checked)}
                style={{ accentColor: 'rgb(147, 51, 234)' }}
              />
            </td>
            <td className='px-4 py-3 text-left' style={{ width: 180 }}>
              <div
                onClick={() => handleBinanceIdChange(row.id, row.binanceId, row.player)}
                style={{
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.23)',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  color: row.binanceId ? 'white' : '#9ca3af',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease-in-out',
                  minHeight: '36px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                className='hover:border-purple-400/60 hover:bg-purple-500/10'
              >
                {row.binanceId || 'Click to add Binance ID'}
              </div>
            </td>
          </tr>
        ))}
    </>
  )

  const renderTable = (rows: PaymentRow[], teamName?: string) => (
    <div style={{ marginBottom: teamName ? 32 : 0 }}>
      {teamName && (
        <p
          style={{
            color: 'white',
            fontWeight: 'bold',
            marginBottom: 16,
            paddingLeft: 8,
            borderLeft: '4px solid rgb(147, 51, 234)',
            fontSize: '1.125rem',
          }}
        >
          {teamName}
        </p>
      )}
      <div className='overflow-x-auto rounded-xl border border-white/10 bg-white/[0.05]'>
        <table className='w-full min-w-[1000px] text-sm'>
          <thead>
            <tr className='border-b border-white/10 bg-white/[0.06] text-neutral-200'>
              <th className='px-4 py-4 text-left font-semibold' style={{ width: 180 }}>Player</th>
              <th className='px-4 py-4 text-right font-semibold' style={{ width: 150 }}>Balance Total</th>
              <th className='px-4 py-4 text-right font-semibold' style={{ width: 150 }}>Balance Sold</th>
              <th className='px-4 py-4 text-right font-semibold' style={{ width: 150 }}>M in $ Sold</th>
              <th className='px-4 py-4 text-center font-semibold' style={{ width: 150 }}>Payment Date</th>
              <th className='px-4 py-4 text-center font-semibold' style={{ width: 100 }}>Hold</th>
              <th className='px-4 py-4 text-left font-semibold' style={{ width: 180 }}>Binance ID</th>
            </tr>
          </thead>
          <tbody>
            {renderTableRows(rows)}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div>
      {/* Filters */}
      <div style={{ marginBottom: 24, display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {/* Team Filter */}
          <div style={{ minWidth: 200 }}>
          <label className='mb-1 block text-xs text-white/70'>Team</label>
          <select
            value={teamFilter}
            onChange={(e) => handleTeamFilterChange(e.target.value)}
            className='h-10 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition focus:border-purple-400/60'
          >
            <option value="all" style={{ backgroundColor: '#1a1a1a' }}>All Teams</option>
            {sortedAvailableTeams && sortedAvailableTeams.map((team) => (
              <option key={team.id_discord} value={team.id_discord} style={{ backgroundColor: '#1a1a1a' }}>
                {team.team_name}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Date Filter */}
        <div style={{ minWidth: 200 }}>
          <label className='mb-1 block text-xs text-white/70'>Payment Date</label>
          <select
            value={paymentDateFilter}
            onChange={(e) => handlePaymentDateFilter(e.target.value)}
            className='h-10 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition focus:border-purple-400/60'
          >
            {sortedPaymentDates && sortedPaymentDates.map((paymentDate) => (
              <option key={String(paymentDate.id)} value={String(paymentDate.name)} style={{ backgroundColor: '#1a1a1a' }}>
                {paymentDate.name}
              </option>
            ))}
          </select>
        </div>

        {/* Average Display */}
        {averageDolarPerGold > 0 && (
          <p
            style={{
              color: '#10b981',
              fontSize: '0.875rem',
              fontWeight: 600,
              backgroundColor: 'rgba(16,185,129,0.10)',
              padding: '6px 12px',
              borderRadius: '4px',
              border: '1px solid rgba(16,185,129,0.45)',
              display: 'flex',
              alignItems: 'center',
              height: '40px',
              gap: 4,
              margin: 0,
            }}
          >
            Avg: {formatDollar(averageDolarPerGold)}/M
          </p>
        )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <button
            type='button'
            onClick={handleCopyBinanceTemplate}
            className='rounded-md border px-3 py-2 text-sm transition disabled:opacity-50'
            style={{
              borderColor: 'rgba(168,85,247,0.45)',
              color: '#e9d5ff',
              backgroundColor: 'rgba(147,51,234,0.16)',
              fontSize: '0.875rem',
              height: '40px',
              paddingLeft: 16,
              paddingRight: 16,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(147,51,234,0.24)'
              e.currentTarget.style.borderColor = 'rgba(168,85,247,0.7)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(147,51,234,0.16)'
              e.currentTarget.style.borderColor = 'rgba(168,85,247,0.45)'
            }}
          >
            <span className='inline-flex items-center gap-2'>
              <CopySimple size={16} />
              Copy Binance Template for {paymentDateFilter}
            </span>
          </button>
          
          <button
            type='button'
            onClick={handleDebitG}
            className='rounded-md border px-3 py-2 text-sm transition disabled:opacity-50'
            style={{
              borderColor: 'rgba(96,165,250,0.45)',
              color: '#bfdbfe',
              backgroundColor: 'rgba(59,130,246,0.16)',
              fontSize: '0.875rem',
              height: '40px',
              paddingLeft: 16,
              paddingRight: 16,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.24)'
              e.currentTarget.style.borderColor = 'rgba(96,165,250,0.7)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.16)'
              e.currentTarget.style.borderColor = 'rgba(96,165,250,0.45)'
            }}
          >
            <span className='inline-flex items-center gap-2'>
              <Wallet size={16} />
              Debit G for {getPaymentDateLabel(paymentDateFilter)}
            </span>
          </button>
        </div>
      </div>

      {/* Mensagem quando não há dados */}
      {paymentRows.length === 0 && !isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 64, paddingBottom: 64 }}>
          <div
            style={{
              backgroundColor: '#2a2a2a',
              border: '1px solid #333',
              padding: 32,
              textAlign: 'center',
              maxWidth: 500,
              borderRadius: 8,
            }}
          >
            <p style={{ color: 'white', marginBottom: 16, fontWeight: 'bold', fontSize: '1.125rem' }}>
              No Payment Data Available
            </p>
            <p style={{ color: '#9ca3af' }}>
              There are no payment records for the selected filters.
            </p>
          </div>
        </div>
      )}

      {/* Renderizar tabelas */}
      {paymentRows.length > 0 && (
        <>
          {teamFilter === 'all' ? (
            // Renderizar uma tabela para cada time
            <>
              {sortedTeamEntries.map(([teamId, rows]) => {
                const teamName = teamNamesMap[teamId] || teamId
                return <div key={teamId}>{renderTable(rows, teamName)}</div>
              })}
            </>
          ) : (
            // Renderizar apenas uma tabela com o time selecionado
            renderTable(paymentRows, availableTeams?.find(t => t.id_discord === teamFilter)?.team_name || teamFilter)
          )}
        </>
      )}
    </div>
  )
}

