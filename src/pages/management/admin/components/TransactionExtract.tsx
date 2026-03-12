import { forwardRef, useMemo, useEffect, useState } from 'react'
import { format, parse } from 'date-fns'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { getPlayers, getTransactionLogs } from '../services/adminApi'
import { CustomSelect } from '../../../../components/CustomSelect'
import { LoadingSpinner } from '../../../../components/LoadingSpinner'
import { handleApiError } from '../../../../utils/apiErrorHandler'
import type {
  DatePickerInputProps,
  ExtractLogInfo,
  ExtractLogRow,
  PlayerOption,
} from '../types/admin'

const DatePickerInput = forwardRef<
  HTMLButtonElement,
  DatePickerInputProps
>(({ value, onClick, className, placeholder = 'dd/mm/aaaa' }, ref) => (
  <button ref={ref} type='button' onClick={onClick} className={className}>
    <span className={value ? 'text-purple-100' : 'text-purple-200/50'}>
      {value || placeholder}
    </span>
  </button>
))

DatePickerInput.displayName = 'DatePickerInput'

export function TransactionExtract() {
  const [players, setPlayers] = useState<PlayerOption[]>([])
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false)
  const [isFetchingLogs, setIsFetchingLogs] = useState(false)
  // Removed unused error state
  const [selectedPlayer, setSelectedPlayer] = useState('')
  const today = new Date().toISOString().split('T')[0] // Get today's date in YYYY-MM-DD format
  const [initialDate, setInitialDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [logs, setLogs] = useState<ExtractLogRow[]>([])
  const [isDolar, setIsDolar] = useState(false)
  const dateTriggerClass =
    'h-10 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 pr-9 text-left text-sm text-white shadow-none outline-none transition focus:border-purple-400/60'

  useEffect(() => {
    const fetchPlayers = async () => {
      setIsLoadingPlayers(true)
      try {
        const response = await getPlayers()
        if (!response) {
          throw new Error('No players found')
        }
        setPlayers(response) // Ensure response is an array of objects
      } catch (error) {
        await handleApiError(error, 'Failed to fetch players.')
      } finally {
        setIsLoadingPlayers(false)
      }
    }

    fetchPlayers()
  }, [])

  const fetchLogs = async () => {
    if (!selectedPlayer || !initialDate || !endDate) return
    setIsFetchingLogs(true)
    try {
      const response = await getTransactionLogs({
        initial_date: initialDate,
        end_date: endDate,
        impacted: selectedPlayer,
        is_dolar: isDolar,
      })
      const logsData = Array.isArray(response)
        ? response.map((log: ExtractLogInfo) => ({
            player: log.name_impacted || 'N/A',
            action: log.value || 'N/A',
            author: log.made_by || 'N/A',
            date: log.date || 'N/A',
          }))
        : []
      setLogs(logsData) // Ensure logsData is always an array
    } catch (error) {
      await handleApiError(error, 'Failed to fetch transaction logs.')
    } finally {
      setIsFetchingLogs(false)
    }
  }

  const selectedInitialDate = useMemo(() => {
    if (!initialDate) return null
    const parsedDate = parse(initialDate, 'yyyy-MM-dd', new Date())
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
  }, [initialDate])

  const selectedEndDate = useMemo(() => {
    if (!endDate) return null
    const parsedDate = parse(endDate, 'yyyy-MM-dd', new Date())
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
  }, [endDate])

  return (
    <div>
      <div className='mb-4 mt-2 flex items-end gap-4'>
        <CustomSelect
          value={selectedPlayer}
          onChange={setSelectedPlayer}
          options={[
            { value: '', label: 'Select Player' },
            ...players.map((player) => ({
              value: player.idDiscord,
              label: player.username,
            })),
          ]}
          minWidthClassName='flex-1'
          renderInPortal
        />
        <div className='relative flex-1'>
          <DatePicker
            selected={selectedInitialDate}
            onChange={(date) =>
              setInitialDate(date ? format(date, 'yyyy-MM-dd') : '')
            }
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
        <div className='relative flex-1'>
          <DatePicker
            selected={selectedEndDate}
            onChange={(date) => setEndDate(date ? format(date, 'yyyy-MM-dd') : '')}
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
        <CustomSelect
          value={isDolar ? 'dollar' : 'gold'}
          onChange={(value) => setIsDolar(value === 'dollar')}
          options={[
            { value: 'gold', label: 'Gold' },
            { value: 'dollar', label: 'Dollar' },
          ]}
          minWidthClassName='flex-1'
          renderInPortal
        />
        <button
          type='button'
          className='h-10 rounded-md border border-purple-400/45 bg-purple-500/20 px-4 text-sm font-semibold text-purple-100 hover:bg-purple-500/30 disabled:opacity-50'
          onClick={fetchLogs}
          disabled={!selectedPlayer || !initialDate || !endDate || isFetchingLogs || isLoadingPlayers}
        >
          {isFetchingLogs ? 'Fetching...' : 'Fetch Extract'}
        </button>
      </div>
      <div className='max-h-[400px] overflow-auto rounded-xl border border-white/10 bg-white/[0.03]'>
        <table className='w-full table-auto border-collapse'>
          <thead className='sticky top-0 bg-white/[0.05] text-left text-xs uppercase text-neutral-300'>
            <tr>
              <th className='border border-white/10 p-2'>Player</th>
              <th className='border border-white/10 p-2'>Value</th>
              <th className='border border-white/10 p-2'>Made By</th>
              <th className='border border-white/10 p-2'>Date</th>
            </tr>
          </thead>
          <tbody>
            {isFetchingLogs ? (
              <tr>
                <td colSpan={4} className='border border-white/10 p-4 text-center'>
                  <div className='flex flex-col items-center gap-2'>
                    <LoadingSpinner size='sm' label='Fetching player extract' />
                    <span className='text-neutral-400'>Fetching extract...</span>
                  </div>
                </td>
              </tr>
            ) : logs.length > 0 ? (
              logs.map((log, index) => (
                <tr key={index} className='border-b border-white/5 odd:bg-white/[0.02]'>
                  <td className='border border-white/10 p-2'>{log.player}</td>
                  <td className='border border-white/10 p-2'>{log.action}</td>
                  <td className='border border-white/10 p-2'>{log.author}</td>
                  <td className='border border-white/10 p-2'>{log.date}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className='border border-white/10 p-3 text-center text-neutral-400'>
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
