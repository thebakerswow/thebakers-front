import { useCallback, useEffect, useMemo, useState } from 'react'
import { Wallet, CopySimple } from '@phosphor-icons/react'
import Swal from 'sweetalert2'

import { ErrorDetails } from '../../../../components/error-display'
import { LoadingSpinner } from '../../../../components/LoadingSpinner'
import { handleApiError } from '../../../../utils/apiErrorHandler'
import { PaymentsTabPageSkeleton } from './PaymentsTabPageSkeleton'
import { teamOrder } from '../../../../types/team-interface'
import {
  getReceiptsManagement,
  getReceiptsManagementDates,
  updateReceiptsManagementDebit,
  updateReceiptsBinance,
  type ReceiptsManagementTeam,
  type ReceiptsDate,
} from '../services/dollarPaymentsApi'

interface ReceiptsPaymentsTabProps {
  onError?: (error: ErrorDetails | null) => void
}

export function ReceiptsPaymentsTab({ onError }: ReceiptsPaymentsTabProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingDates, setIsLoadingDates] = useState(true)
  const [isDebiting, setIsDebiting] = useState(false)
  const [hasCompletedInitialLoad, setHasCompletedInitialLoad] = useState(false)
  const [managementTeams, setManagementTeams] = useState<ReceiptsManagementTeam[]>([])
  const [availableDates, setAvailableDates] = useState<ReceiptsDate[]>([])
  const [selectedDateId, setSelectedDateId] = useState<number | null>(null)
  const [selectedTeamId, setSelectedTeamId] = useState<string>('all')

  const handleError = useCallback(
    (message: string, error: unknown) => {
      if (onError) onError({ message, response: error })
    },
    [onError]
  )

  const sortTeamsByOrder = useCallback(<T extends { name: string }>(teams: T[]): T[] => {
    const orderedTeams = teamOrder as readonly string[]
    return [...teams].sort((a, b) => {
      const indexA = orderedTeams.indexOf(a.name)
      const indexB = orderedTeams.indexOf(b.name)
      if (indexA !== -1 && indexB !== -1) return indexA - indexB
      if (indexA !== -1) return -1
      if (indexB !== -1) return 1
      return a.name.localeCompare(b.name)
    })
  }, [])

  const formatDate = (dateString: string): string => {
    if (!dateString) return dateString
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-')
      return `${month}/${day}/${year}`
    }
    return dateString
  }

  const formatDateWithoutYear = (dateString: string): string => {
    if (!dateString) return dateString
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [, month, day] = dateString.split('-')
      return `${month}/${day}`
    }
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      const [month, day] = dateString.split('/')
      return `${month}/${day}`
    }
    return dateString
  }

  const formatCurrency = (value: number) => {
    if (value === 0) return '0'
    const fixedValue = Math.abs(value).toFixed(2)
    const [integerPart, decimalPart] = fixedValue.split('.')
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return `U$ ${value < 0 ? '-' : ''}${formattedInteger}.${decimalPart}`
  }

  const formatCurrencyWithZero = (value: number) => {
    if (value === 0) return '-'
    return formatCurrency(value)
  }

  const formatDollar = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

  const getPaymentDateLabel = (dateId: number | null) => {
    if (!dateId) return '-'
    const date = availableDates.find((d) => Number(d.id) === Number(dateId))
    return date ? formatDateWithoutYear(date.name).toUpperCase() : '-'
  }

  const loadDates = useCallback(async () => {
    try {
      setIsLoadingDates(true)
      const dates = await getReceiptsManagementDates({ status: 'pending' })
      const sorted = [...(dates ?? [])].sort((a, b) => Number(a.id) - Number(b.id))
      setAvailableDates(sorted)
      setSelectedDateId(sorted.length > 0 ? Number(sorted[0].id) : null)
    } catch (error) {
      await handleApiError(error, 'Error fetching receipts dates')
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
      await handleApiError(error, 'Error fetching dollar management data')
      handleError('Error fetching dollar management data', error)
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

  const isAnyLoading = isLoading || isLoadingDates

  useEffect(() => {
    if (!isAnyLoading && !hasCompletedInitialLoad) {
      setHasCompletedInitialLoad(true)
    }
  }, [isAnyLoading, hasCompletedInitialLoad])

  const sortedManagementTeams = useMemo(
    () => sortTeamsByOrder(managementTeams),
    [managementTeams, sortTeamsByOrder]
  )

  const teamOptions = useMemo(() => {
    const uniqueMap = new Map<string, string>()
    managementTeams.forEach((team) => {
      if (!uniqueMap.has(team.id)) uniqueMap.set(team.id, team.name)
    })
    return sortTeamsByOrder(Array.from(uniqueMap.entries()).map(([id, name]) => ({ id, name })))
  }, [managementTeams, sortTeamsByOrder])

  const totalBalanceDollar = useMemo(() => {
    const allPlayers = sortedManagementTeams.flatMap((team) => team.players)
    return allPlayers.reduce((sum, player) => sum + (player.balance_total ?? 0), 0)
  }, [sortedManagementTeams])

  const handleBinanceUpdate = async (idDiscord: string, currentValue: string, playerName: string) => {
    const result = await Swal.fire({
      title: 'Edit Binance ID',
      text: `Player: ${playerName}`,
      input: 'text',
      inputLabel: 'Binance ID',
      inputValue: currentValue,
      inputPlaceholder: 'Enter Binance ID',
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel',
    })
    if (!result.isConfirmed) return

    const newValue = result.value || ''
    setManagementTeams((prev) =>
      prev.map((team) => ({
        ...team,
        players: team.players.map((player) =>
          player.id_discord === idDiscord ? { ...player, id_binance: newValue } : player
        ),
      }))
    )

    try {
      await updateReceiptsBinance({ id_discord: idDiscord, id_binance: newValue })
      Swal.fire({ icon: 'success', title: 'Updated!', text: 'Binance ID updated successfully.', timer: 1500, showConfirmButton: false })
    } catch (error) {
      await handleApiError(error, 'Failed to update Binance ID.')
      handleError('Error updating binance ID', error)
      setManagementTeams((prev) =>
        prev.map((team) => ({
          ...team,
          players: team.players.map((player) =>
            player.id_discord === idDiscord ? { ...player, id_binance: currentValue } : player
          ),
        }))
      )
    }
  }

  const handleHoldChange = async (idDiscord: string, checked: boolean) => {
    setManagementTeams((prev) =>
      prev.map((team) => ({
        ...team,
        players: team.players.map((player) =>
          player.id_discord === idDiscord ? { ...player, hold: checked } : player
        ),
      }))
    )

    try {
      if (!selectedDateId) return
      await updateReceiptsManagementDebit({
        id_receipts_dolar_date: selectedDateId,
        id_discord: idDiscord,
        hold: checked,
      })
      await loadManagement()
    } catch (error) {
      await handleApiError(error, 'Error updating hold status')
      handleError('Error updating hold status', error)
      setManagementTeams((prev) =>
        prev.map((team) => ({
          ...team,
          players: team.players.map((player) =>
            player.id_discord === idDiscord ? { ...player, hold: !checked } : player
          ),
        }))
      )
    }
  }

  const handleCopyBinanceTemplate = async () => {
    try {
      const allPlayers = sortedManagementTeams.flatMap((team) => team.players)
      const validPlayers = allPlayers.filter((player) => !player.hold && player.balance_dolar_paid > 0)
      if (validPlayers.length === 0) {
        await Swal.fire({ icon: 'warning', title: 'No Data', text: 'No valid payment data to copy.' })
        return
      }

      const tsv = validPlayers
        .map((player) => `Binance ID (BUID)\t${player.id_binance || ''}\tUSDT\t${player.balance_dolar_paid.toFixed(2)}`)
        .join('\n')
      await navigator.clipboard.writeText(tsv)
      await Swal.fire({
        title: 'Copied!',
        text: `${validPlayers.length} payment(s) copied to clipboard in Binance template format.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      })
    } catch {
      await Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to copy to clipboard.' })
    }
  }

  const handleDebit = async () => {
    if (!selectedDateId) {
      await Swal.fire({ icon: 'warning', title: 'Select a date', text: 'Please select a receipts date before debiting.' })
      return
    }

    const totalDollar = sortedManagementTeams
      .flatMap((team) => team.players)
      .reduce((sum, player) => sum + (player.balance_dolar_paid ?? 0), 0)

    const result = await Swal.fire({
      title: 'Confirm Debit',
      html: `<p>Debit selected date?</p><p><strong>Total Dollar:</strong> ${formatDollar(totalDollar)}</p>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, debit',
      cancelButtonText: 'Cancel',
    })
    if (!result.isConfirmed) return

    try {
      setIsDebiting(true)
      await updateReceiptsManagementDebit({ id_receipts_dolar_date: selectedDateId })
      await Swal.fire({ icon: 'success', title: 'Debited!', text: 'Dollar debited successfully.', timer: 1500, showConfirmButton: false })
      await loadDates()
      await loadManagement()
    } catch (error) {
      await handleApiError(error, 'Failed to debit receipts date.')
      handleError('Error debiting receipts date', error)
    } finally {
      setIsDebiting(false)
    }
  }

  if (isAnyLoading) {
    if (!hasCompletedInitialLoad) {
      return <PaymentsTabPageSkeleton />
    }

    return (
      <div className='flex justify-center py-16'>
        <LoadingSpinner size='lg' label='Loading management data' />
      </div>
    )
  }

  if (sortedManagementTeams.length === 0) {
    return (
      <div className='rounded-xl border border-white/10 bg-white/[0.04] p-8 text-center text-neutral-400'>
        No management data available for the selected filters.
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='rounded-xl border border-white/10 bg-white/[0.04] p-4'>
        <div className='flex flex-wrap items-end justify-between gap-4'>
          <div className='flex flex-wrap items-end gap-4'>
            <div className='min-w-[220px]'>
              <label className='mb-1 block text-xs text-white/70'>Receipts Date</label>
              <select
                value={selectedDateId ?? ''}
                onChange={(event) => setSelectedDateId(event.target.value ? Number(event.target.value) : null)}
                className='h-10 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition focus:border-purple-400/60'
              >
                {availableDates.length === 0 && <option value=''>No dates available</option>}
                {availableDates.map((date) => (
                  <option key={date.id} value={Number(date.id)}>
                    {formatDate(date.name)}
                  </option>
                ))}
              </select>
            </div>

            <div className='min-w-[180px]'>
              <label className='mb-1 block text-xs text-white/70'>Team</label>
              <select
                value={selectedTeamId}
                onChange={(event) => setSelectedTeamId(event.target.value)}
                className='h-10 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition focus:border-purple-400/60'
              >
                <option value='all'>All Teams</option>
                {teamOptions.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            {totalBalanceDollar > 0 && (
              <p className='m-0 inline-flex h-10 items-center rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 text-sm font-semibold text-emerald-300'>
                Total: {formatDollar(totalBalanceDollar)}
              </p>
            )}
          </div>

          <div className='flex flex-wrap items-end gap-3'>
            <button
              type='button'
              onClick={handleCopyBinanceTemplate}
              className='inline-flex h-10 items-center gap-2 rounded-md border border-purple-400/45 bg-purple-500/15 px-3 text-sm text-purple-100 transition hover:bg-purple-500/25'
            >
              <CopySimple size={16} />
              Copy Binance Template for {selectedDateId ? getPaymentDateLabel(selectedDateId) : 'Selected Date'}
            </button>
            <button
              type='button'
              onClick={handleDebit}
              disabled={!selectedDateId || isDebiting}
              className='inline-flex h-10 items-center gap-2 rounded-md border border-blue-400/45 bg-blue-500/15 px-3 text-sm text-blue-100 transition hover:bg-blue-500/25 disabled:opacity-50'
            >
              <Wallet size={16} />
              {isDebiting ? 'Debiting...' : `Debit $ for ${selectedDateId ? getPaymentDateLabel(selectedDateId) : 'Selected Date'}`}
            </button>
          </div>
        </div>
      </div>

      {sortedManagementTeams.map((team) => (
        <div key={team.id} className='rounded-xl border border-white/10 bg-white/[0.04] p-4'>
          <p className='mb-4 border-l-4 border-purple-500 pl-2 text-lg font-bold text-white'>{team.name}</p>
          <div className='overflow-x-auto rounded-xl border border-white/10 bg-white/[0.05]'>
            <table className='w-full min-w-[1000px] text-sm'>
              <thead>
                <tr className='border-b border-white/10 bg-white/[0.06] text-neutral-200'>
                  <th className='px-4 py-4 text-left font-semibold'>Player</th>
                  <th className='px-4 py-4 text-right font-semibold'>Balance Total</th>
                  <th className='px-4 py-4 text-right font-semibold'>Balance $ Paid</th>
                  <th className='px-4 py-4 text-center font-semibold'>Payment Date</th>
                  <th className='px-4 py-4 text-center font-semibold'>Hold</th>
                  <th className='px-4 py-4 text-left font-semibold'>Binance ID</th>
                </tr>
              </thead>
              <tbody>
                {team.players.map((player) => (
                  <tr key={player.id_discord} className='border-b border-white/5 transition hover:bg-white/[0.05]'>
                    <td className='px-4 py-3 text-white/90'>{player.username}</td>
                    <td className='px-4 py-3 text-right font-semibold text-blue-300'>{formatCurrency(player.balance_total ?? 0)}</td>
                    <td className='px-4 py-3 text-right font-semibold text-violet-300'>{formatCurrencyWithZero(player.balance_dolar_paid ?? 0)}</td>
                    <td className='px-4 py-3 text-center text-neutral-300'>{player.receipts_dolar_date ? formatDate(player.receipts_dolar_date) : '-'}</td>
                    <td className='px-4 py-3 text-center'>
                      <input
                        type='checkbox'
                        checked={Boolean(player.hold)}
                        onChange={(e) => handleHoldChange(player.id_discord, e.target.checked)}
                        style={{ accentColor: 'rgb(147, 51, 234)' }}
                      />
                    </td>
                    <td className='px-4 py-3'>
                      <button
                        type='button'
                        onClick={() => handleBinanceUpdate(player.id_discord, player.id_binance, player.username)}
                        className='flex min-h-[36px] w-full items-center rounded-md border border-white/20 bg-white/[0.03] px-3 py-2 text-left text-sm text-white transition hover:border-purple-400/60 hover:bg-purple-500/10'
                      >
                        {player.id_binance || 'Click to add Binance ID'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}


