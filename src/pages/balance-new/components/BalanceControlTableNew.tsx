import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { format, parse } from 'date-fns'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { CustomSelect } from '../../../components/CustomSelect'
import { LoadingSpinner } from '../../../components/LoadingSpinner'
import { DEFAULT_TEAM_COLOR, TEAM_ID_TO_COLOR_MAP, TRACKED_TEAM_OPTIONS } from '../../../utils/teamConfig'
import { handleApiError } from '../../../utils/apiErrorHandler'
import { getCurrentUserDate } from '../../../utils/timezoneUtils'
import { getBalanceDaily } from '../services/balanceNewApi'
import {
  BalanceControlSortConfig,
  BalanceControlTableNewProps,
  BalanceDailyUser,
  DatePickerInputProps,
} from '../types/balanceNew'

const DatePickerInput = forwardRef<
  HTMLButtonElement,
  DatePickerInputProps
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
  allowedTeams,
  hideTeamSelector = false,
  hideCurrencyToggle = false,
  onInitialLoadComplete,
}: BalanceControlTableNewProps) {
  const [users, setUsers] = useState<BalanceDailyUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasCompletedInitialFetch, setHasCompletedInitialFetch] = useState(false)
  const [sortConfig, setSortConfig] = useState<BalanceControlSortConfig | null>(null)
  const hasReportedInitialLoad = useRef(false)
  const selectTriggerClass =
    'h-10 ![background-image:none] !border-white/15 !bg-[#0f0f12] px-3 pr-9 text-sm !text-white !shadow-none focus:!border-purple-400/50 focus:!ring-0'
  const selectMenuClass =
    'z-[240] !border-white/15 !bg-[#1a1a1a] !bg-none !shadow-[0_20px_40px_rgba(0,0,0,0.45)]'
  const selectOptionClass = 'text-white/90 hover:bg-white/10'
  const selectActiveOptionClass = 'shadow-[0_0_0_1px_rgba(216,180,254,0.35)_inset]'
  const dateTriggerClass =
    'h-10 w-full rounded-md border border-white/15 bg-[#0f0f12] px-3 pr-9 text-left text-sm text-white shadow-none outline-none transition focus:border-purple-400/50'

  const shouldShowInlineLoading = isLoading && hasReportedInitialLoad.current
  const formatRoundedIntNoNegativeZero = (value: number | string): string => {
    const rounded = Math.round(Number(value))
    const normalized = Object.is(rounded, -0) ? 0 : rounded
    return normalized.toLocaleString('en-US')
  }
  const formatDollarNoNegativeZero = (value: number | string): string => {
    const numericValue = Number(value)
    if (!Number.isFinite(numericValue)) return '0.00'
    const roundedToCents = Math.round(numericValue * 100) / 100
    const normalizedValue = Object.is(roundedToCents, -0) ? 0 : roundedToCents
    return normalizedValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

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
      TRACKED_TEAM_OPTIONS
        .filter((team) => allowedTeams.includes(team.id))
        .map((team) => ({ value: team.id, label: team.label })),
    [allowedTeams]
  )

  const parsedSelectedDate = useMemo(() => {
    if (!selectedDate) return null
    const parsedDate = parse(selectedDate, 'yyyy-MM-dd', new Date())
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
  }, [selectedDate])

  const handleSort = (key: BalanceControlSortConfig['key']) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'asc' }
    })
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
        await handleApiError(error, 'Failed to fetch daily balance')
      } finally {
        if (showLoading) {
          setIsLoading(false)
          setHasCompletedInitialFetch(true)
        }
      }
    },
    [selectedTeam, selectedDate, isDolar]
  )

  useEffect(() => {
    if (hasCompletedInitialFetch && !isLoading && !hasReportedInitialLoad.current) {
      hasReportedInitialLoad.current = true
      onInitialLoadComplete?.()
    }
  }, [hasCompletedInitialFetch, isLoading, onInitialLoadComplete])

  useEffect(() => {
    if (selectedTeam && selectedDate) fetchBalance(true, isDolar)
  }, [fetchBalance, selectedTeam, selectedDate, isDolar])

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
          {!hideCurrencyToggle && (
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
          )}
        </div>

        <div className='h-[calc(100%-65px)] overflow-auto'>
          <table className='w-full border-collapse text-sm text-white/90'>
            <thead className='sticky top-0 z-10 bg-[#121217]'>
              <tr className='text-left text-xs uppercase tracking-wide text-white/60'>
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
              {shouldShowInlineLoading ? (
                <tr>
                  <td colSpan={5} className='px-3 pb-8 pt-32 text-center text-white/70'>
                    <LoadingSpinner size='md' label='Loading balance data' />
                  </td>
                </tr>
              ) : sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className='px-3 py-8 text-center text-white/70'>
                    No data available
                  </td>
                </tr>
              ) : (
                sortedUsers.map((user) => (
                  <tr key={user.idDiscord} className='border-t border-white/10'>
                    <td
                      className='w-[170px] max-w-[170px] px-3 py-4 align-top'
                      style={{
                        background: TEAM_ID_TO_COLOR_MAP[selectedTeam] || DEFAULT_TEAM_COLOR,
                        color: [import.meta.env.VITE_TEAM_MILHARAL, import.meta.env.VITE_TEAM_LOSRENEGADOS].includes(selectedTeam)
                          ? 'black'
                          : 'white',
                      }}
                    >
                      <span className='block truncate' title={user.username}>
                        {user.username}
                      </span>
                    </td>
                    <td className='px-3 py-4 text-center'>{formatRoundedIntNoNegativeZero(user.gold)}</td>
                    <td className='px-3 py-4 text-center'>
                      {formatRoundedIntNoNegativeZero(user.gold_collect)}
                    </td>
                    <td className='px-3 py-4 text-center'>{formatRoundedIntNoNegativeZero(user.sum_day)}</td>
                    <td className='px-3 py-4 text-center'>
                      {isDolar
                        ? formatDollarNoNegativeZero(user.balance_total)
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
    </>
  )
}
