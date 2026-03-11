import axios from 'axios'
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react'
import { X } from '@phosphor-icons/react'
import { format, parse } from 'date-fns'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { ErrorDetails } from '../../components/error-display'
import { CustomSelect } from '../../components/custom-select'
import { getCurrentUserDate } from '../../utils/timezone-utils'
import { getBalanceDaily, updateNick } from '../../services/api/balance'

type BalanceControlTableNewProps = {
  selectedTeam: string
  selectedDate: string
  setSelectedTeam: (value: string) => void
  setSelectedDate: (value: string) => void
  isDolar: boolean
  setIsDolar: (value: boolean) => void
  onError?: (error: ErrorDetails) => void
  allowedTeams: string[]
  hideTeamSelector?: boolean
}

const teamOptions = [
  { id: import.meta.env.VITE_TEAM_MPLUS, label: 'M+' },
  { id: import.meta.env.VITE_TEAM_LEVELING, label: 'Leveling' },
  { id: import.meta.env.VITE_TEAM_GARCOM, label: 'Garcom' },
  { id: import.meta.env.VITE_TEAM_CONFEITEIROS, label: 'Confeiteiros' },
  { id: import.meta.env.VITE_TEAM_JACKFRUIT, label: 'Jackfruit' },
  { id: import.meta.env.VITE_TEAM_INSANOS, label: 'Insanos' },
  { id: import.meta.env.VITE_TEAM_APAE, label: 'APAE' },
  { id: import.meta.env.VITE_TEAM_LOSRENEGADOS, label: 'Los Renegados' },
  { id: import.meta.env.VITE_TEAM_PADEIRINHO, label: 'Padeirinho' },
  { id: import.meta.env.VITE_TEAM_MILHARAL, label: 'Milharal' },
]

const DatePickerInput = forwardRef<
  HTMLButtonElement,
  { value?: string; onClick?: () => void; className: string; placeholder?: string }
>(({ value, onClick, className, placeholder = 'dd/mm/aaaa' }, ref) => (
  <button ref={ref} type='button' onClick={onClick} className={className}>
    <span className={value ? 'text-white' : 'text-white/60'}>{value || placeholder}</span>
  </button>
))

DatePickerInput.displayName = 'DatePickerInput'

export function BalanceControlTableNew({
  selectedTeam,
  selectedDate,
  setSelectedTeam,
  setSelectedDate,
  isDolar,
  setIsDolar,
  onError,
  allowedTeams,
  hideTeamSelector = false,
}: BalanceControlTableNewProps) {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(
    null
  )
  const [isNickModalOpen, setIsNickModalOpen] = useState(false)
  const [newNick, setNewNick] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const selectTriggerClass =
    'h-10 ![background-image:none] !border-white/15 !bg-[#0f0f12] px-3 pr-9 text-sm !text-white !shadow-none focus:!border-purple-400/50 focus:!ring-0'
  const selectMenuClass =
    'z-[240] !border-white/15 !bg-[#1a1a1a] !bg-none !shadow-[0_20px_40px_rgba(0,0,0,0.45)]'
  const selectOptionClass = 'text-white/90 hover:bg-white/10'
  const selectActiveOptionClass = 'shadow-[0_0_0_1px_rgba(216,180,254,0.35)_inset]'
  const dateTriggerClass =
    'h-10 w-full rounded-md border border-white/15 bg-[#0f0f12] px-3 pr-9 text-left text-sm text-white shadow-none outline-none transition focus:border-purple-400/50'

  const showNickButton = [
    import.meta.env.VITE_TEAM_ADVERTISER,
    import.meta.env.VITE_TEAM_FREELANCER,
  ].includes(selectedTeam)

  const sortedUsers = useMemo(() => {
    if (!Array.isArray(users)) return []
    return [...users].sort((a, b) => {
      if (!sortConfig) return 0
      const { key, direction } = sortConfig
      const order = direction === 'asc' ? 1 : -1

      if (key === 'username') return a.username.localeCompare(b.username) * order
      if (key === 'balance_total') return (Number(a.balance_total) - Number(b.balance_total)) * order
      return 0
    })
  }, [users, sortConfig])

  const filteredTeamOptions = useMemo(
    () =>
      teamOptions
        .filter((team) => allowedTeams.includes(team.id))
        .map((team) => ({ value: team.id, label: team.label })),
    [allowedTeams]
  )

  const parsedSelectedDate = useMemo(() => {
    if (!selectedDate) return null
    const parsedDate = parse(selectedDate, 'yyyy-MM-dd', new Date())
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
  }, [selectedDate])

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'asc' }
    })
  }

  const getTeamColor = (team: string) => {
    switch (team) {
      case import.meta.env.VITE_TEAM_CHEFE:
        return 'linear-gradient(90deg, rgba(248,113,113,0.72), rgba(185,28,28,0.62))'
      case import.meta.env.VITE_TEAM_MPLUS:
        return 'linear-gradient(90deg, rgba(167,139,250,0.72), rgba(124,58,237,0.62))'
      case import.meta.env.VITE_TEAM_LEVELING:
        return 'linear-gradient(90deg, rgba(34,197,94,0.72), rgba(22,163,74,0.62))'
      case import.meta.env.VITE_TEAM_GARCOM:
        return 'linear-gradient(90deg, rgba(59,130,246,0.72), rgba(37,99,235,0.62))'
      case import.meta.env.VITE_TEAM_CONFEITEIROS:
        return 'linear-gradient(90deg, rgba(244,114,182,0.72), rgba(236,72,153,0.62))'
      case import.meta.env.VITE_TEAM_JACKFRUIT:
        return 'linear-gradient(90deg, rgba(34,197,94,0.72), rgba(22,163,74,0.62))'
      case import.meta.env.VITE_TEAM_INSANOS:
        return 'linear-gradient(270deg, rgba(59,130,246,0.72), rgba(30,64,175,0.62))'
      case import.meta.env.VITE_TEAM_APAE:
        return 'linear-gradient(90deg, rgba(252,165,165,0.68), rgba(248,113,113,0.6))'
      case import.meta.env.VITE_TEAM_LOSRENEGADOS:
        return 'linear-gradient(90deg, rgba(252,211,77,0.72), rgba(245,158,11,0.62))'
      case import.meta.env.VITE_TEAM_DTM:
        return 'linear-gradient(90deg, rgba(167,139,250,0.72), rgba(139,92,246,0.62))'
      case import.meta.env.VITE_TEAM_KFFC:
        return 'linear-gradient(90deg, rgba(52,211,153,0.72), rgba(4,120,87,0.62))'
      case import.meta.env.VITE_TEAM_GREENSKY:
        return 'linear-gradient(90deg, rgba(244,114,182,0.72), rgba(190,24,93,0.62))'
      case import.meta.env.VITE_TEAM_GUILD_AZRALON_1:
        return 'linear-gradient(270deg, rgba(45,212,191,0.72), rgba(13,148,136,0.62))'
      case import.meta.env.VITE_TEAM_GUILD_AZRALON_2:
        return 'linear-gradient(270deg, rgba(96,165,250,0.72), rgba(29,78,216,0.62))'
      case import.meta.env.VITE_TEAM_ROCKET:
        return 'linear-gradient(90deg, rgba(248,113,113,0.72), rgba(185,28,28,0.62))'
      case import.meta.env.VITE_TEAM_BOOTY_REAPER:
        return 'linear-gradient(90deg, rgba(139,92,246,0.72), rgba(76,29,149,0.62))'
      case import.meta.env.VITE_TEAM_PADEIRINHO:
        return 'linear-gradient(90deg, rgba(251,146,60,0.72), rgba(234,88,12,0.62))'
      case import.meta.env.VITE_TEAM_MILHARAL:
        return 'linear-gradient(90deg, rgba(254,243,199,0.62), rgba(254,240,138,0.54))'
      case import.meta.env.VITE_TEAM_BASTARD:
        return 'linear-gradient(90deg, rgba(245,158,11,0.72), rgba(217,119,6,0.62))'
      case import.meta.env.VITE_TEAM_KIWI:
        return 'linear-gradient(90deg, rgba(163,230,53,0.72), rgba(132,204,22,0.62))'
      default:
        return 'linear-gradient(90deg, rgba(248,113,113,0.72), rgba(185,28,28,0.62))'
    }
  }

  useEffect(() => {
    if (!selectedDate) {
      const todayLocal = getCurrentUserDate().toISOString().split('T')[0]
      setSelectedDate(todayLocal)
    }
  }, [selectedDate, setSelectedDate])

  const fetchBalance = useCallback(
    async (showLoading = true, isDolarFlag = isDolar) => {
      if (!selectedDate || !selectedTeam) return
      if (showLoading) setIsLoading(true)
      try {
        const data = await getBalanceDaily({
          id_team: selectedTeam,
          date: selectedDate,
          is_dolar: isDolarFlag,
        })
        setUsers(data)
      } catch (error) {
        const errorDetails = axios.isAxiosError(error)
          ? {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status,
            }
          : { message: 'Unexpected error', response: error }
        if (onError) onError(errorDetails)
      } finally {
        if (showLoading) setIsLoading(false)
      }
    },
    [selectedTeam, selectedDate, isDolar, onError]
  )

  useEffect(() => {
    if (selectedTeam && selectedDate) fetchBalance(true, isDolar)
  }, [fetchBalance, selectedTeam, selectedDate, isDolar])

  const handleOpenNickModal = (userId: string) => {
    setSelectedUserId(userId)
    setIsNickModalOpen(true)
  }

  const handleCloseNickModal = () => {
    setIsNickModalOpen(false)
    setNewNick('')
    setSelectedUserId(null)
  }

  const handleSaveNick = async () => {
    if (!selectedUserId || !newNick.trim()) return
    try {
      await updateNick({ nick: newNick.trim(), id_discord: selectedUserId })
      await fetchBalance()
    } catch (error) {
      const errorDetails = axios.isAxiosError(error)
        ? {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          }
        : { message: 'Unexpected error', response: error }
      if (onError) onError(errorDetails)
    } finally {
      handleCloseNickModal()
    }
  }

  return (
    <>
      <div className='h-full w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]'>
        <div className='flex flex-wrap items-center gap-3 border-b border-white/10 bg-black/25 p-3'>
          {!hideTeamSelector && (
            <CustomSelect
              value={selectedTeam}
              onChange={setSelectedTeam}
              options={filteredTeamOptions}
              placeholder='Team'
              minWidthClassName='min-w-[180px]'
              triggerClassName={selectTriggerClass}
              menuClassName={selectMenuClass}
              optionClassName={selectOptionClass}
              activeOptionClassName={selectActiveOptionClass}
              renderInPortal
            />
          )}
          <div className='relative min-w-[180px]'>
            <DatePicker
              selected={parsedSelectedDate}
              onChange={(date) => setSelectedDate(date ? format(date, 'yyyy-MM-dd') : '')}
              dateFormat='dd/MM/yyyy'
              placeholderText='dd/mm/aaaa'
              popperClassName='z-[240] balance-datepicker-popper'
              calendarClassName='balance-datepicker add-run-datepicker'
              wrapperClassName='w-full'
              customInput={<DatePickerInput className={dateTriggerClass} />}
            />
            <span className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-purple-300/85'>
              ▼
            </span>
          </div>
          <button
            className={`inline-flex h-10 min-w-[110px] items-center justify-center rounded-md border px-4 text-sm font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.22)] transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/45 ${
              isDolar
                ? 'border-purple-300/55 bg-purple-500/30 text-purple-100 hover:border-purple-300/70 hover:bg-purple-500/40'
                : 'border-purple-400/40 bg-purple-500/20 text-purple-100 hover:border-purple-300/55 hover:bg-purple-500/30'
            }`}
            onClick={() => setIsDolar(!isDolar)}
          >
            {isDolar ? 'U$' : 'Gold'}
          </button>
        </div>

        <div className='h-[calc(100%-65px)] overflow-auto'>
          <table className='w-full border-collapse text-sm text-white/90'>
            <thead className='sticky top-0 z-10 bg-[#121217]'>
              <tr className='text-left text-xs uppercase tracking-wide text-white/60'>
                {showNickButton ? <th className='px-3 py-4'>Nick</th> : null}
                <th className='w-[170px] cursor-pointer px-3 py-4' onClick={() => handleSort('username')}>
                  Player {sortConfig?.key === 'username' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th className='px-3 py-4 text-center'>Gold Cut</th>
                <th className='px-3 py-4 text-center'>Gold Collected</th>
                <th className='px-3 py-4 text-center'>Daily Balance</th>
                <th className='cursor-pointer px-3 py-4 text-center' onClick={() => handleSort('balance_total')}>
                  Balance Total {sortConfig?.key === 'balance_total' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={showNickButton ? 6 : 5} className='px-3 py-8 text-center text-white/70'>
                    <span className='inline-block h-6 w-6 animate-spin rounded-full border-4 border-white/20 border-t-purple-400' />
                    <p className='mt-2'>Loading...</p>
                  </td>
                </tr>
              ) : sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan={showNickButton ? 6 : 5} className='px-3 py-8 text-center text-white/70'>
                    No data available
                  </td>
                </tr>
              ) : (
                sortedUsers.map((user) => (
                  <tr key={user.idDiscord} className='border-t border-white/10'>
                    {showNickButton ? (
                      <td className='px-3 py-4 text-center'>
                        <button
                          className='rounded-md border border-purple-400/40 bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-200 transition hover:bg-purple-500/30'
                          onClick={() => handleOpenNickModal(user.idDiscord)}
                        >
                          Add
                        </button>
                      </td>
                    ) : null}
                    <td
                      className='w-[170px] max-w-[170px] px-3 py-4 align-top'
                      style={{
                        background: getTeamColor(selectedTeam),
                        color: [import.meta.env.VITE_TEAM_MILHARAL, import.meta.env.VITE_TEAM_LOSRENEGADOS].includes(selectedTeam)
                          ? 'black'
                          : 'white',
                      }}
                    >
                      <span className='block truncate' title={user.username}>
                        {user.username}
                      </span>
                      {showNickButton && user.nick ? <span className='block text-xs text-black/70'>({user.nick})</span> : null}
                    </td>
                    <td className='px-3 py-4 text-center'>{Math.round(Number(user.gold)).toLocaleString('en-US')}</td>
                    <td className='px-3 py-4 text-center'>
                      {Math.round(Number(user.gold_collect)).toLocaleString('en-US')}
                    </td>
                    <td className='px-3 py-4 text-center'>{Math.round(Number(user.sum_day)).toLocaleString('en-US')}</td>
                    <td className='px-3 py-4 text-center'>
                      {isDolar
                        ? Math.abs(Number(user.balance_total)) === 0
                          ? '0.00'
                          : Number(user.balance_total).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                        : Math.abs(Math.round(Number(user.balance_total))) === 0
                          ? '0'
                          : Math.round(Number(user.balance_total)).toLocaleString('en-US')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isNickModalOpen ? (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4'>
          <div className='w-full max-w-md rounded-xl border border-white/10 bg-[#101014] p-5 shadow-2xl'>
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='text-lg font-semibold text-white'>Update Nick</h3>
              <button
                className='rounded-md border border-white/15 p-1 text-white/80 transition hover:text-white'
                onClick={handleCloseNickModal}
              >
                <X size={16} />
              </button>
            </div>
            <input
              autoFocus
              type='text'
              placeholder='Nick'
              value={newNick}
              onChange={(e) => setNewNick(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveNick()}
              className='w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none transition focus:border-purple-400'
            />
            <div className='mt-4 flex justify-end'>
              <button
                onClick={handleSaveNick}
                className='rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-500'
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
