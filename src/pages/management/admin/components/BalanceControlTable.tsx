import { useState, useEffect, useCallback } from 'react'
import { getCurrentUserDate } from '../../../../utils/timezone-utils'
import {
  getBalanceAdmin,
  createTransaction,
  updateNick,
} from '../services/adminApi'
import { CustomSelect } from '../../../../components/CustomSelect'
import { LoadingSpinner } from '../../../../components/LoadingSpinner'
import { getApiErrorMessage } from '../../../../utils/apiErrorHandler'
import type { AdminBalanceUser, ExtendedBalanceControlTableProps } from '../types/admin'
import { DEFAULT_TEAM_COLOR, TEAM_ID_TO_COLOR_MAP } from '../../../../utils/teamConfig'

const teamOptions = [
  { value: 'all', label: 'All Teams' },
  { value: import.meta.env.VITE_TEAM_CHEFE, label: 'Chefe de Cozinha' },
  { value: import.meta.env.VITE_TEAM_MPLUS, label: 'M+' },
  { value: import.meta.env.VITE_TEAM_LEVELING, label: 'Leveling' },
  { value: import.meta.env.VITE_TEAM_GARCOM, label: 'Garcom' },
  { value: import.meta.env.VITE_TEAM_CONFEITEIROS, label: 'Confeiteiros' },
  { value: import.meta.env.VITE_TEAM_JACKFRUIT, label: 'Jackfruit' },
  { value: import.meta.env.VITE_TEAM_INSANOS, label: 'Insanos' },
  { value: import.meta.env.VITE_TEAM_APAE, label: 'APAE' },
  { value: import.meta.env.VITE_TEAM_LOSRENEGADOS, label: 'Los Renegados' },
  { value: import.meta.env.VITE_TEAM_DTM, label: 'DTM' },
  { value: import.meta.env.VITE_TEAM_KFFC, label: 'KFFC' },
  { value: import.meta.env.VITE_TEAM_GREENSKY, label: 'Greensky' },
  { value: import.meta.env.VITE_TEAM_GUILD_AZRALON_1, label: 'Guild Azralon BR#1' },
  { value: import.meta.env.VITE_TEAM_GUILD_AZRALON_2, label: 'Guild Azralon BR#2' },
  { value: import.meta.env.VITE_TEAM_ROCKET, label: 'Rocket' },
  { value: import.meta.env.VITE_TEAM_BOOTY_REAPER, label: 'Booty Reaper' },
  { value: import.meta.env.VITE_TEAM_PADEIRINHO, label: 'Padeirinho' },
  { value: import.meta.env.VITE_TEAM_MILHARAL, label: 'Milharal' },
  { value: import.meta.env.VITE_TEAM_ADVERTISER, label: 'Advertiser' },
  { value: import.meta.env.VITE_TEAM_FREELANCER, label: 'Freelancer' },
  { value: import.meta.env.VITE_TEAM_BASTARD, label: 'Bastard Munchen' },
  { value: import.meta.env.VITE_TEAM_KIWI, label: 'Kiwi' },
]

export function BalanceControlTable({
  selectedTeam,
  selectedDate,
  setSelectedTeam,
  setSelectedDate,
  isDolar,
  setIsDolar,
  onError,
}: ExtendedBalanceControlTableProps) {
  const [users, setUsers] = useState<AdminBalanceUser[]>([])
  const [calculatorValues, setCalculatorValues] = useState<Record<string, string>>({})
  const [isBulkingSubmitting, setIsBulkingSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)
  const [isNickModalOpen, setIsNickModalOpen] = useState(false)
  const [newNick, setNewNick] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false)

  const sortedUsers = [...users].sort((a, b) => {
    if (!sortConfig) return 0
    const order = sortConfig.direction === 'asc' ? 1 : -1

    if (sortConfig.key === 'username') {
      return a.username.localeCompare(b.username) * order
    }

    return (Number(a.balance_total) - Number(b.balance_total)) * order
  })

  const getTeamColor = (team: string) => {
    if (team === import.meta.env.VITE_TEAM_ADVERTISER) return '#9CA3AF'
    if (team === import.meta.env.VITE_TEAM_FREELANCER) return '#86EFAC'
    return TEAM_ID_TO_COLOR_MAP[team] || DEFAULT_TEAM_COLOR
  }

  useEffect(() => {
    if (!selectedDate) {
      const todayLocal = getCurrentUserDate().toISOString().split('T')[0]
      setSelectedDate(todayLocal)
    }
  }, [selectedDate, setSelectedDate])

  const fetchBalanceAdmin = useCallback(
    async (showLoading = true, isDolarFlag = isDolar) => {
      if (!selectedDate || !selectedTeam) return

      if (showLoading) setIsLoading(true)
      try {
        const data = await getBalanceAdmin({
          id_team: selectedTeam === 'all' ? undefined : selectedTeam,
          date: selectedDate,
          is_dolar: isDolarFlag,
        })
        setUsers(data)
      } catch (error) {
        onError?.({
          message: getApiErrorMessage(error, 'Failed to fetch balance data.'),
        })
      } finally {
        if (showLoading) setIsLoading(false)
      }
    },
    [selectedTeam, selectedDate, isDolar, onError]
  )

  useEffect(() => {
    if (selectedTeam && selectedDate) {
      fetchBalanceAdmin(true, isDolar)
    }
  }, [fetchBalanceAdmin, selectedTeam, selectedDate, isDolar])

  const handleSort = (key: string) => {
    setSortConfig((previous) => {
      if (previous?.key === key) {
        return { key, direction: previous.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'asc' }
    })
  }

  const handleCalculatorChange = (userId: string, value: string) => {
    if (value.trim() === '') {
      setCalculatorValues((previous) => ({ ...previous, [userId]: '' }))
      return
    }

    let rawValue = isDolar
      ? value.replace(/[^0-9.-]/g, '').replace(/(?!^)-/g, '')
      : value.replace(/[^0-9-]/g, '').replace(/(?!^)-/g, '')

    if (rawValue === '-') {
      setCalculatorValues((previous) => ({ ...previous, [userId]: '-' }))
      return
    }

    const parts = rawValue.split('.')
    const isNegative = rawValue.startsWith('-')
    const numericPart = parts[0].replace(/^-/, '')

    let formattedValue = ''
    if (numericPart !== '') {
      formattedValue = Number(numericPart).toLocaleString('en-US')
    }

    if (isNegative) {
      formattedValue = `-${formattedValue}`
    }

    if (isDolar && parts.length > 1) {
      formattedValue += `.${parts[1].replace(/[^0-9]/g, '')}`
    }

    if (formattedValue === '-0' || formattedValue === '0') {
      formattedValue = ''
    }

    setCalculatorValues((previous) => ({ ...previous, [userId]: formattedValue }))
  }

  const handleConfirmCalculator = async (userId: string) => {
    const rawValue = calculatorValues[userId]
    if (!rawValue || rawValue === '-') return

    try {
      await createTransaction({
        value: Number(rawValue.replace(/,/g, '')),
        id_discord: userId,
        is_dolar: isDolar,
      })
      setCalculatorValues((previous) => ({ ...previous, [userId]: '' }))
      fetchBalanceAdmin(false)
    } catch (error) {
      onError?.({
        message: getApiErrorMessage(error, 'Failed to create transaction.'),
      })
    }
  }

  const handleBulkSend = async () => {
    const pendingTransactions = Object.entries(calculatorValues).filter(
      ([, value]) => value.trim() !== '' && value !== '-'
    )
    if (!pendingTransactions.length) return

    setIsBulkingSubmitting(true)
    try {
      await Promise.all(
        pendingTransactions.map(([userId, value]) =>
          createTransaction({
            value: Number(value.replace(/,/g, '')),
            id_discord: userId,
            is_dolar: isDolar,
          })
        )
      )
      setCalculatorValues({})
      fetchBalanceAdmin(false)
    } catch (error) {
      onError?.({
        message: getApiErrorMessage(error, 'Failed to process bulk transaction.'),
      })
    } finally {
      setIsBulkingSubmitting(false)
    }
  }

  const openNickModal = (userId: string) => {
    setSelectedUserId(userId)
    setIsNickModalOpen(true)
  }

  const closeNickModal = () => {
    setSelectedUserId(null)
    setNewNick('')
    setIsNickModalOpen(false)
  }

  const saveNick = async () => {
    if (!selectedUserId || !newNick.trim()) return

    try {
      await updateNick({
        nick: newNick.trim(),
        id_discord: selectedUserId,
      })
      fetchBalanceAdmin(false)
    } catch (error) {
      onError?.({
        message: getApiErrorMessage(error, 'Failed to update player nickname.'),
      })
    } finally {
      closeNickModal()
    }
  }

  const copyPayout = async () => {
    const payload = getPositivePayoutLines(sortedUsers)
    await navigator.clipboard.writeText(payload)
  }

  const getPositivePayoutLines = (entries: AdminBalanceUser[]) =>
    entries
      .filter((user) => Number(user.balance_total) > 0)
      .map(
        (user) =>
          `${user.nick || user.username}, ${Math.round(Number(user.balance_total)) === 0 ? 0 : Math.round(Number(user.balance_total))}`
      )
      .join('\n')

  const hasNickColumn = [
    import.meta.env.VITE_TEAM_ADVERTISER,
    import.meta.env.VITE_TEAM_FREELANCER,
  ].includes(selectedTeam)

  const formatIntNoNegativeZero = (value: number) => {
    const rounded = Math.round(value)
    const safeValue = rounded === 0 ? 0 : rounded
    return safeValue.toLocaleString('en-US')
  }

  const formatDecimalNoNegativeZero = (value: number) => {
    const safeValue = Math.abs(value) < 0.0000001 ? 0 : value
    return safeValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  return (
    <>
      <div className='h-full w-full overflow-y-auto rounded-xl border border-white/10 bg-white/[0.04] text-white'>
        <div className='sticky top-0 z-20 flex flex-wrap gap-2 border-b border-white/10 bg-white/[0.03] p-2'>
          <CustomSelect
            value={selectedTeam}
            options={teamOptions
              .filter((option) => option.value)
              .map((option) => ({ value: option.value, label: option.label }))}
            onChange={setSelectedTeam}
            placeholder='Team'
            minWidthClassName='min-w-[220px]'
            renderInPortal
          />

          <input
            type='date'
            className='h-10 min-w-[200px] rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition focus:border-purple-400/60'
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />

          <button
            type='button'
            className={`h-10 min-w-[90px] rounded-md border px-3 text-sm font-semibold ${
              isDolar
                ? 'border-red-400/40 bg-red-500/20 text-red-100 hover:bg-red-500/30'
                : 'border-amber-400/40 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30'
            }`}
            onClick={() => setIsDolar(!isDolar)}
          >
            {isDolar ? 'U$' : 'Gold'}
          </button>

          <button
            type='button'
            className='h-10 rounded-md border border-purple-400/45 bg-purple-500/20 px-3 text-sm font-semibold text-purple-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:bg-purple-500/30 disabled:opacity-50'
            disabled={
              Object.values(calculatorValues).every((value) => value.trim() === '') ||
              isBulkingSubmitting
            }
            onClick={handleBulkSend}
          >
            {isBulkingSubmitting ? 'Sending...' : 'Send All'}
          </button>

          {hasNickColumn && (
            <button
              type='button'
              className='h-10 rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm font-semibold text-white hover:border-purple-400/40 hover:bg-purple-500/10'
              onClick={() => setIsPayoutModalOpen(true)}
            >
              Payout
            </button>
          )}
        </div>

        <div className='max-h-[140vh] overflow-y-auto'>
          <table className='w-full border-collapse'>
            <thead className='bg-white/[0.06] text-xs uppercase text-neutral-300'>
              <tr>
                {hasNickColumn && <th className='border border-white/10 p-2'>Nick</th>}
                <th
                  className='cursor-pointer border border-white/10 p-2 text-left'
                  onClick={() => handleSort('username')}
                >
                  Player{' '}
                  {sortConfig?.key === 'username' &&
                    (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className='border border-white/10 p-2 text-right'>Gold Cut</th>
                <th className='border border-white/10 p-2 text-right'>Gold Collected</th>
                <th className='border border-white/10 p-2 text-right'>Daily Balance</th>
                <th
                  className='cursor-pointer border border-white/10 p-2 text-right'
                  onClick={() => handleSort('balance_total')}
                >
                  Balance Total{' '}
                  {sortConfig?.key === 'balance_total' &&
                    (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className='border border-white/10 p-2'>Calculator</th>
              </tr>
            </thead>
            <tbody className='text-sm text-neutral-100'>
              {isLoading ? (
                <tr>
                  <td colSpan={hasNickColumn ? 7 : 6} className='p-4 text-center'>
                    <LoadingSpinner size='md' color='#4b5563' label='Loading balances' />
                    <p className='mt-2 text-neutral-400'>Loading...</p>
                  </td>
                </tr>
              ) : sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan={hasNickColumn ? 7 : 6} className='p-4 text-center text-neutral-400'>
                    No data available
                  </td>
                </tr>
              ) : (
                sortedUsers.map((user) => (
                  <tr key={user.idDiscord} className='border-b border-white/5 odd:bg-white/[0.02]'>
                    {hasNickColumn && (
                      <td className='border border-white/10 p-2 text-center'>
                        <button
                          type='button'
                          className='rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-white hover:border-purple-400/40 hover:bg-purple-500/10'
                          onClick={() => openNickModal(user.idDiscord)}
                        >
                          Add
                        </button>
                      </td>
                    )}
                    <td
                      className='border border-white/10 p-2 text-center font-semibold'
                      style={{
                        background: getTeamColor(selectedTeam),
                        color: [
                          'all',
                          import.meta.env.VITE_TEAM_MILHARAL,
                          import.meta.env.VITE_TEAM_LOSRENEGADOS,
                          import.meta.env.VITE_TEAM_ADVERTISER,
                          import.meta.env.VITE_TEAM_FREELANCER,
                        ].includes(selectedTeam)
                          ? 'black'
                          : 'white',
                      }}
                    >
                      {user.username}
                      {hasNickColumn && user.nick ? (
                        <span className='ml-1 text-xs opacity-90'>({user.nick})</span>
                      ) : null}
                    </td>
                    <td className='border border-white/10 p-2 text-right'>
                      {formatIntNoNegativeZero(Number(user.gold))}
                    </td>
                    <td className='border border-white/10 p-2 text-right'>
                      {formatIntNoNegativeZero(Number(user.gold_collect))}
                    </td>
                    <td className='border border-white/10 p-2 text-right'>
                      {isDolar
                        ? formatDecimalNoNegativeZero(Number(user.sum_day))
                        : formatIntNoNegativeZero(Number(user.sum_day))}
                    </td>
                    <td className='border border-white/10 p-2 text-right'>
                      {isDolar
                        ? formatDecimalNoNegativeZero(Number(user.balance_total))
                        : formatIntNoNegativeZero(Number(user.balance_total))}
                    </td>
                    <td className='border border-white/10 p-2 text-center'>
                      <input
                        className='w-[110px] rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-right text-white outline-none transition focus:border-purple-400/60'
                        type='text'
                        value={calculatorValues[user.idDiscord] || ''}
                        onChange={(event) =>
                          handleCalculatorChange(user.idDiscord, event.target.value)
                        }
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            handleConfirmCalculator(user.idDiscord)
                          }
                        }}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isNickModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
          <div className='w-full max-w-sm rounded-xl border border-white/10 bg-[#111115] p-4 text-white shadow-2xl'>
            <div className='mb-3 flex items-center justify-between'>
              <h3 className='text-base font-semibold'>Update Nick</h3>
              <button
                type='button'
                className='rounded px-2 py-1 text-sm hover:bg-white/10'
                onClick={closeNickModal}
              >
                X
              </button>
            </div>
            <input
              className='mb-3 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-white outline-none focus:border-purple-400/60'
              value={newNick}
              onChange={(event) => setNewNick(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  saveNick()
                }
              }}
              placeholder='Nick'
            />
            <div className='flex justify-end gap-2'>
              <button
                type='button'
                className='rounded-md border border-white/10 px-3 py-1 text-sm hover:bg-white/10'
                onClick={closeNickModal}
              >
                Cancel
              </button>
              <button
                type='button'
                className='rounded-md border border-purple-400/45 bg-purple-500/20 px-3 py-1 text-sm text-purple-100 hover:bg-purple-500/30'
                onClick={saveNick}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {isPayoutModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
          <div className='w-full max-w-md rounded-xl border border-white/10 bg-[#111115] p-4 text-white shadow-2xl'>
            <div className='mb-3 flex items-center justify-between'>
              <h3 className='text-base font-semibold'>
                {selectedTeam === import.meta.env.VITE_TEAM_FREELANCER
                  ? 'Freelancer Payout'
                  : 'Advertiser Payout'}
              </h3>
              <button
                type='button'
                className='rounded px-2 py-1 text-sm hover:bg-white/10'
                onClick={() => setIsPayoutModalOpen(false)}
              >
                X
              </button>
            </div>
            <pre className='max-h-80 overflow-y-auto rounded-md border border-white/10 bg-white/[0.03] p-3 text-sm text-neutral-100'>
              {getPositivePayoutLines(sortedUsers) || 'No data found.'}
            </pre>
            <div className='mt-3 flex justify-end gap-2'>
              <button
                type='button'
                className='rounded-md border border-white/10 px-3 py-1 text-sm hover:bg-white/10'
                onClick={() => setIsPayoutModalOpen(false)}
              >
                Close
              </button>
              <button
                type='button'
                className='rounded-md border border-purple-400/45 bg-purple-500/20 px-3 py-1 text-sm text-purple-100 hover:bg-purple-500/30'
                onClick={copyPayout}
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
