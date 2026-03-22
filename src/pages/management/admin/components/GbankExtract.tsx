import { forwardRef, useMemo, useEffect, useState } from 'react'
import { format, parse } from 'date-fns'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { getGbanks, getGbankLogs } from '../services/adminApi'
import { LoadingSpinner } from '../../../../components/LoadingSpinner'
import { handleApiError } from '../../../../utils/apiErrorHandler'
import { getLocalTodayDateString } from '../../../../utils/timezoneUtils'
import type {
  DatePickerInputProps,
  ExtractLogInfo,
  ExtractLogRow,
  GbankOption,
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

export function GbankExtract() {
  const [gbanks, setGbanks] = useState<GbankOption[]>([])
  const [selectedGbank, setSelectedGbank] = useState('') // State for selected Gbank
  const [gbankSearch, setGbankSearch] = useState('')
  const [isGbankAutocompleteOpen, setIsGbankAutocompleteOpen] = useState(false)
  const [isLoadingGbanks, setIsLoadingGbanks] = useState(false)
  const [isFetchingLogs, setIsFetchingLogs] = useState(false)
  const today = getLocalTodayDateString()
  const [initialDate, setInitialDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [logs, setLogs] = useState<ExtractLogRow[]>([])
  const dateTriggerClass =
    'h-10 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 pr-9 text-left text-sm text-white shadow-none outline-none transition focus:border-purple-400/60'

  useEffect(() => {
    const fetchGbanks = async () => {
      setIsLoadingGbanks(true)
      try {
        const response = await getGbanks()
        if (!response) {
          throw new Error('No gbanks found')
        }
        setGbanks(response) // Ensure response is an array of objects
      } catch (error) {
        await handleApiError(error, 'Failed to fetch g-banks.')
      } finally {
        setIsLoadingGbanks(false)
      }
    }
    fetchGbanks() // Fetch gbanks on component mount
  }, [])

  const fetchLogs = async () => {
    if (!initialDate || !endDate || !selectedGbank) return
    setIsFetchingLogs(true)
    try {
      const response = await getGbankLogs({
        initial_date: initialDate,
        end_date: endDate,
        impacted: selectedGbank, // Send the name of the selected Gbank
      })
      const logsData = Array.isArray(response)
        ? response.map((log: ExtractLogInfo) => ({
            player: log.name_impacted || 'N/A',
            action: log.value || 'N/A',
            author: log.made_by || 'N/A',
            date: log.date || 'N/A', // Map date field
          }))
        : []
      setLogs(logsData) // Ensure logsData is always an array
    } catch (error) {
      await handleApiError(error, 'Failed to fetch g-bank logs.')
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

  const filteredGbanks = useMemo(() => {
    const normalizedSearch = gbankSearch.trim().toLowerCase()
    if (!normalizedSearch) return gbanks
    return gbanks.filter((gbank) => gbank.name.toLowerCase().includes(normalizedSearch))
  }, [gbankSearch, gbanks])

  return (
    <div>
      <div className='mb-4 mt-2 flex items-end gap-4'>
        <div className='relative flex-1'>
          <input
            type='text'
            value={gbankSearch}
            onChange={(event) => {
              setGbankSearch(event.target.value)
              setSelectedGbank('')
              setIsGbankAutocompleteOpen(true)
            }}
            onFocus={() => setIsGbankAutocompleteOpen(true)}
            onBlur={() => setTimeout(() => setIsGbankAutocompleteOpen(false), 120)}
            placeholder='Search g-bank'
            className='balance-filter-control h-10 w-full rounded-md border border-purple-300/20 bg-[linear-gradient(180deg,rgba(23,23,27,0.92)_0%,rgba(14,14,18,0.92)_100%)] px-3 pr-9 text-left text-sm text-white/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.22)] outline-none transition placeholder:text-white/50 focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/35'
          />
          {isGbankAutocompleteOpen && (
            <div className='absolute left-0 right-0 top-[calc(100%+6px)] z-[250] max-h-56 overflow-auto rounded-md border border-white/15 bg-neutral-900/95 p-1 shadow-xl backdrop-blur-sm'>
              {filteredGbanks.length > 0 ? (
                filteredGbanks.map((gbank) => (
                  <button
                    key={gbank.name}
                    type='button'
                    onMouseDown={(event) => {
                      event.preventDefault()
                      setSelectedGbank(gbank.name)
                      setGbankSearch(gbank.name)
                      setIsGbankAutocompleteOpen(false)
                    }}
                    className={`mb-1 w-full rounded-md px-3 py-2 text-left text-sm transition last:mb-0 ${
                      selectedGbank === gbank.name
                        ? 'bg-purple-500/20 text-purple-100'
                        : 'text-white/90 hover:bg-white/10'
                    }`}
                  >
                    {gbank.name}
                  </button>
                ))
              ) : (
                <p className='px-3 py-2 text-sm text-neutral-400'>No g-bank found</p>
              )}
            </div>
          )}
        </div>
        <div className='relative flex-1'>
          <DatePicker
            selected={selectedInitialDate}
            onChange={(date) => setInitialDate(date ? format(date, 'yyyy-MM-dd') : '')}
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
        <button
          type='button'
          className='h-10 rounded-md border border-purple-400/45 bg-purple-500/20 px-4 text-sm font-semibold text-purple-100 hover:bg-purple-500/30 disabled:opacity-50'
          onClick={fetchLogs}
          disabled={!initialDate || !endDate || !selectedGbank || isFetchingLogs || isLoadingGbanks}
        >
          {isFetchingLogs ? 'Fetching...' : 'Fetch Extract'}
        </button>
      </div>
      <div className='max-h-[400px] overflow-auto rounded-xl border border-white/10 bg-white/[0.03]'>
        <table className='w-full table-auto border-collapse'>
          <thead className='sticky top-0 bg-white/[0.05] text-left text-xs uppercase text-neutral-300'>
            <tr>
              <th className='border border-white/10 p-2'>G-Bank</th>
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
                    <LoadingSpinner size='sm' label='Fetching g-bank extract' />
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
