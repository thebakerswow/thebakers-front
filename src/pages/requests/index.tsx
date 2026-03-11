import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Check,
  CircleNotch,
  Eye,
  PencilSimple,
  X,
} from '@phosphor-icons/react'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import Swal from 'sweetalert2'
import { format, parse } from 'date-fns'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { CustomSelect } from '../../components/custom-select'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import {
  getTransactionRequests,
  updateTransactionRequest,
  updateTransactionRequestValue,
} from '../../services/api/gbanks'

interface TransactionRequest {
  id: string | number
  idDiscord: string
  idGbank: string | number
  value: number
  status: 'pending' | 'accepted' | 'denied'
  urlImage: string
  createdAt: string
  nameUserRequest: string
  nameGbank: string
  idTeam: string
  balanceTotal: number
  sumDay: number
}

interface TransactionRequestResponse {
  transactions: TransactionRequest[]
  totalPages: number
}

const TEAM_NAMES: Record<string, string> = {
  [import.meta.env.VITE_TEAM_MPLUS]: 'M+',
  [import.meta.env.VITE_TEAM_LEVELING]: 'Leveling',
  [import.meta.env.VITE_TEAM_GARCOM]: 'Garcom',
  [import.meta.env.VITE_TEAM_CONFEITEIROS]: 'Confeiteiros',
  [import.meta.env.VITE_TEAM_JACKFRUIT]: 'Jackfruit',
  [import.meta.env.VITE_TEAM_INSANOS]: 'Insanos',
  [import.meta.env.VITE_TEAM_APAE]: 'APAE',
  [import.meta.env.VITE_TEAM_LOSRENEGADOS]: 'Los Renegados',
  [import.meta.env.VITE_TEAM_BOOTY_REAPER]: 'Booty Reaper',
}

const DatePickerInput = forwardRef<
  HTMLButtonElement,
  { value?: string; onClick?: () => void; className: string; placeholder?: string }
>(({ value, onClick, className, placeholder = 'dd/mm/aaaa' }, ref) => (
  <button ref={ref} type='button' onClick={onClick} className={className}>
    <span className={value ? 'text-white' : 'text-white/60'}>{value || placeholder}</span>
  </button>
))

DatePickerInput.displayName = 'DatePickerInput'

export function RequestsPage() {
  const [requests, setRequests] = useState<TransactionRequest[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<TransactionRequest | null>(null)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'denied'>(
    'pending'
  )
  const [teamFilter, setTeamFilter] = useState('all')
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [playerFilter, setPlayerFilter] = useState('')
  const [playerFilterInput, setPlayerFilterInput] = useState('')
  const [dateMinFilter, setDateMinFilter] = useState('')
  const [dateMaxFilter, setDateMaxFilter] = useState('')
  const [minValueFilter, setMinValueFilter] = useState('')
  const [minValueFilterInput, setMinValueFilterInput] = useState('')
  const [maxValueFilter, setMaxValueFilter] = useState('')
  const [maxValueFilterInput, setMaxValueFilterInput] = useState('')
  const debounceTimeoutRef = useRef<number | null>(null)
  const minValueDebounceTimeoutRef = useRef<number | null>(null)
  const maxValueDebounceTimeoutRef = useRef<number | null>(null)

  const teamOptions = useMemo(
    () => [
      { value: 'all', label: 'All Teams' },
      ...Object.entries(TEAM_NAMES).map(([teamId, teamName]) => ({
        value: teamId,
        label: teamName,
      })),
    ],
    []
  )

  const formatDateFromAPI = (apiDateString: string) => {
    const datePart = apiDateString.split('T')[0]
    const [year, month, day] = datePart.split('-')
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    const weekday = weekdays[date.getDay()]
    return {
      date: `${weekday}, ${day} ${months[parseInt(month) - 1]} ${year}`,
      time: apiDateString.split('T')[1].split('.')[0].substring(0, 5),
    }
  }

  const formatCalculatorValue = (value: string) => {
    if (!value || value === '') return ''
    const rawValue = value.replace(/[^0-9-]/g, '').replace(/(?!^)-/g, '')
    if (rawValue === '-') return '-'
    if (!/\d/.test(rawValue)) return ''
    const numberValue = Number(rawValue)
    return Number.isNaN(numberValue) ? '' : numberValue.toLocaleString('en-US')
  }

  const formatValueForDisplay = (value: number) => {
    const formatted = Math.abs(value)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return value < 0 ? `-${formatted}` : formatted
  }

  const fetchRequests = async () => {
    setIsLoading(true)
    try {
      const response = await getTransactionRequests({
        status: statusFilter,
        page: currentPage,
        limit: 12,
        id_team: teamFilter,
        player_name: playerFilter,
        date_min: dateMinFilter,
        date_max: dateMaxFilter,
        min_value: minValueFilter,
        max_value: maxValueFilter,
      })

      if (response && Array.isArray(response) && response.length > 0) {
        const data = response[0] as TransactionRequestResponse
        setRequests(data.transactions || [])
        const totalResults = data.totalPages || 0
        const calculatedPages = Math.ceil(totalResults / 12)
        setTotalPages(calculatedPages)
      } else {
        setRequests([])
        setTotalPages(0)
      }
    } catch (err) {
      setError({ message: 'Error fetching requests', response: err })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusFilter = (status: 'all' | 'pending' | 'accepted' | 'denied') => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const debouncedSearch = (value: string) => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current)
    debounceTimeoutRef.current = setTimeout(() => {
      setPlayerFilter(value)
      setCurrentPage(1)
    }, 1000)
  }

  const debouncedMinValueSearch = (value: string) => {
    if (minValueDebounceTimeoutRef.current) clearTimeout(minValueDebounceTimeoutRef.current)
    minValueDebounceTimeoutRef.current = setTimeout(() => {
      setMinValueFilter(value)
      setCurrentPage(1)
    }, 1000)
  }

  const debouncedMaxValueSearch = (value: string) => {
    if (maxValueDebounceTimeoutRef.current) clearTimeout(maxValueDebounceTimeoutRef.current)
    maxValueDebounceTimeoutRef.current = setTimeout(() => {
      setMaxValueFilter(value)
      setCurrentPage(1)
    }, 1000)
  }

  const handlePlayerFilterKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current)
    setPlayerFilter(playerFilterInput)
    setCurrentPage(1)
  }

  const handleMinValueFilterKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return
    if (minValueDebounceTimeoutRef.current) clearTimeout(minValueDebounceTimeoutRef.current)
    const rawValue = minValueFilterInput.replace(/[^0-9-]/g, '').replace(/(?!^)-/g, '')
    if (!rawValue || rawValue === '-') setMinValueFilter('')
    else if (!Number.isNaN(Number(rawValue))) setMinValueFilter(rawValue)
    setCurrentPage(1)
  }

  const handleMaxValueFilterKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return
    if (maxValueDebounceTimeoutRef.current) clearTimeout(maxValueDebounceTimeoutRef.current)
    const rawValue = maxValueFilterInput.replace(/[^0-9-]/g, '').replace(/(?!^)-/g, '')
    if (!rawValue || rawValue === '-') setMaxValueFilter('')
    else if (!Number.isNaN(Number(rawValue))) setMaxValueFilter(rawValue)
    setCurrentPage(1)
  }

  const clearAllFilters = () => {
    setPlayerFilter('')
    setPlayerFilterInput('')
    setDateMinFilter('')
    setDateMaxFilter('')
    setMinValueFilter('')
    setMinValueFilterInput('')
    setMaxValueFilter('')
    setMaxValueFilterInput('')
    setCurrentPage(1)
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current)
    if (minValueDebounceTimeoutRef.current) clearTimeout(minValueDebounceTimeoutRef.current)
    if (maxValueDebounceTimeoutRef.current) clearTimeout(maxValueDebounceTimeoutRef.current)
  }

  useEffect(() => {
    fetchRequests()
  }, [statusFilter, currentPage, teamFilter, playerFilter, dateMinFilter, dateMaxFilter, minValueFilter, maxValueFilter])

  useEffect(
    () => () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current)
      if (minValueDebounceTimeoutRef.current) clearTimeout(minValueDebounceTimeoutRef.current)
      if (maxValueDebounceTimeoutRef.current) clearTimeout(maxValueDebounceTimeoutRef.current)
    },
    []
  )

  const openEditValueDialog = async (request: TransactionRequest) => {
    if (request.status !== 'pending') return
    const { value: newValue } = await Swal.fire({
      title: 'Edit Transaction Value',
      input: 'number',
      inputValue: request.value,
      inputAttributes: { step: '0.01', style: '-moz-appearance: textfield;' },
      customClass: { input: 'swal-no-spinner' },
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel',
      confirmButtonColor: 'rgb(147, 51, 234)',
      background: '#2a2a2a',
      color: 'white',
      inputValidator: (value) => {
        if (!value || Number.isNaN(parseFloat(value))) return 'Please enter a valid number'
      },
    })

    if (!newValue || Number.isNaN(parseFloat(newValue))) return
    try {
      await updateTransactionRequestValue({ id: request.id, value: parseFloat(newValue) })
      setRequests((prev) =>
        prev.map((req) => (req.id === request.id ? { ...req, value: parseFloat(newValue) } : req))
      )
      Swal.fire({
        title: 'Success!',
        text: 'Transaction value updated successfully',
        icon: 'success',
        confirmButtonColor: 'rgb(147, 51, 234)',
        background: '#2a2a2a',
        color: 'white',
      })
    } catch {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update transaction value',
        icon: 'error',
        confirmButtonColor: 'rgb(147, 51, 234)',
        background: '#2a2a2a',
        color: 'white',
      })
    }
  }

  const handleStatusUpdate = async (requestId: string, status: 'accepted' | 'denied') => {
    setProcessingRequests((prev) => new Set(prev).add(requestId))
    try {
      await updateTransactionRequest({ id: requestId, status })
      const updatedRequests = requests.map((request) =>
        request.id.toString() === requestId ? { ...request, status } : request
      )
      setRequests(updatedRequests)
      if (updatedRequests.filter((req) => req.status === 'pending').length === 0) fetchRequests()
    } catch (err) {
      setError({ message: `Error ${status === 'accepted' ? 'accepting' : 'denying'} request`, response: err })
    } finally {
      setProcessingRequests((prev) => {
        const next = new Set(prev)
        next.delete(requestId)
        return next
      })
    }
  }

  const getCardColorClass = () => {
    return 'bg-white/[0.04] border-white/10 hover:bg-white/[0.06] hover:border-white/20'
  }

  const statusBadgeClass: Record<TransactionRequest['status'], string> = {
    pending: 'border-amber-400/40 bg-amber-500/20 text-amber-200',
    accepted: 'border-emerald-400/40 bg-emerald-500/20 text-emerald-200',
    denied: 'border-red-400/40 bg-red-500/20 text-red-200',
  }

  const getStatusBadgeStyle = (status: TransactionRequest['status']) => {
    if (status === 'accepted') {
      return {
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.20)',
        color: '#bbf7d0',
      }
    }
    if (status === 'pending') {
      return {
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245,158,11,0.20)',
        color: '#fde68a',
      }
    }
    return {
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239,68,68,0.20)',
      color: '#fecaca',
    }
  }

  const selectedDateMin = useMemo(() => {
    if (!dateMinFilter) return null
    const parsedDate = parse(dateMinFilter, 'yyyy-MM-dd', new Date())
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
  }, [dateMinFilter])

  const selectedDateMax = useMemo(() => {
    if (!dateMaxFilter) return null
    const parsedDate = parse(dateMaxFilter, 'yyyy-MM-dd', new Date())
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
  }, [dateMaxFilter])

  const getStatusButtonClass = (status: 'all' | 'pending' | 'accepted' | 'denied') => {
    const isActive = statusFilter === status
    if (status === 'pending') {
      return isActive
        ? 'border--500 bg-amber-500/25 text-amber-100'
        : 'border-white/15 bg-white/[0.03] text-neutral-200 hover:border-amber-400/60 hover:bg-amber-500/15'
    }
    if (status === 'accepted') {
      return isActive
        ? 'border-emerald-400/60 bg-emerald-500/25 text-emerald-100'
        : 'border-white/15 bg-white/[0.03] text-neutral-200 hover:border-emerald-400/60 hover:bg-emerald-500/15'
    }
    if (status === 'denied') {
      return isActive
        ? 'border-red-400/60 bg-red-500/25 text-red-100'
        : 'border-white/15 bg-white/[0.03] text-neutral-200 hover:border-red-400/60 hover:bg-red-500/15'
    }
    return isActive
      ? 'border-purple-400/60 bg-purple-500/25 text-purple-100'
      : 'border-white/15 bg-white/[0.03] text-neutral-200 hover:border-purple-400/60 hover:bg-purple-500/15'
  }

  const getStatusButtonStyle = (status: 'all' | 'pending' | 'accepted' | 'denied') => {
    const isActive = statusFilter === status
    if (status === 'pending') {
      return {
        borderColor: isActive ? '#f59e0b' : '#d97706',
        backgroundColor: isActive ? 'rgba(245,158,11,0.28)' : 'rgba(245,158,11,0.10)',
        color: '#fef3c7',
      }
    }
    if (status === 'accepted') {
      return {
        borderColor: isActive ? '#10b981' : '#059669',
        backgroundColor: isActive ? 'rgba(16,185,129,0.28)' : 'rgba(16,185,129,0.10)',
        color: '#d1fae5',
      }
    }
    if (status === 'denied') {
      return {
        borderColor: isActive ? '#ef4444' : '#dc2626',
        backgroundColor: isActive ? 'rgba(239,68,68,0.28)' : 'rgba(239,68,68,0.10)',
        color: '#fee2e2',
      }
    }
    return {
      borderColor: isActive ? '#a855f7' : '#9333ea',
      backgroundColor: isActive ? 'rgba(168,85,247,0.28)' : 'rgba(168,85,247,0.10)',
      color: '#f3e8ff',
    }
  }

  return (
    <div className='w-full overflow-auto overflow-x-hidden pr-20'>
      <div className='m-8 min-h-screen w-full pb-12 text-white'>
        {error ? <ErrorComponent error={error} onClose={() => setError(null)} /> : null}

        <div className='relative isolate mb-4 rounded-xl border border-white/10 bg-white/[0.04] p-4'>
          <div className='mb-3 flex flex-wrap gap-2'>
            {(['pending', 'accepted', 'denied', 'all'] as const).map((status) => (
              <button
                key={status}
                type='button'
                onClick={() => handleStatusFilter(status)}
                className={`rounded-md border px-3 py-2 text-sm transition ${getStatusButtonClass(status)}`}
                style={getStatusButtonStyle(status)}
              >
                {status === 'all' ? 'All Requests' : status[0].toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'>
            <div>
              <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>Team</label>
              <CustomSelect
                value={teamFilter}
                onChange={(value) => {
                  setTeamFilter(value)
                  setCurrentPage(1)
                }}
                options={teamOptions}
                minWidthClassName='min-w-0'
                triggerClassName='h-10 ![background-image:none] !border-white/15 !bg-white/[0.05] !shadow-none text-sm !text-white focus:!border-purple-400/50 focus:!ring-0'
                menuClassName='!border-white/15 !bg-[#1a1a1a]'
                optionClassName='text-white/90 hover:bg-purple-500/20'
                renderInPortal
              />
            </div>

            <div>
              <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>Player</label>
              <input
                value={playerFilterInput}
                onChange={(e) => {
                  setPlayerFilterInput(e.target.value)
                  debouncedSearch(e.target.value)
                }}
                onKeyDown={handlePlayerFilterKeyPress}
                placeholder='Search player...'
                className='h-10 w-full rounded-md border border-white/15 bg-white/[0.05] px-3 text-sm text-white outline-none transition focus:border-purple-400/50'
              />
            </div>

            <div>
              <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>From Date</label>
              <div className='relative'>
                <DatePicker
                  selected={selectedDateMin}
                  onChange={(date) => {
                    setDateMinFilter(date ? format(date, 'yyyy-MM-dd') : '')
                    setCurrentPage(1)
                  }}
                  dateFormat='dd/MM/yyyy'
                  placeholderText='dd/mm/aaaa'
                  showPopperArrow={false}
                  popperClassName='z-[99999] balance-datepicker-popper'
                  calendarClassName='balance-datepicker add-run-datepicker'
                  wrapperClassName='w-full'
                  customInput={
                    <DatePickerInput className='h-10 w-full rounded-md border border-white/15 bg-white/[0.05] px-3 pr-9 text-left text-sm text-white shadow-none outline-none transition focus:border-purple-400/50' />
                  }
                />
                <span className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-purple-300/85'>
                  ▼
                </span>
              </div>
            </div>

            <div>
              <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>To Date</label>
              <div className='relative'>
                <DatePicker
                  selected={selectedDateMax}
                  onChange={(date) => {
                    setDateMaxFilter(date ? format(date, 'yyyy-MM-dd') : '')
                    setCurrentPage(1)
                  }}
                  dateFormat='dd/MM/yyyy'
                  placeholderText='dd/mm/aaaa'
                  showPopperArrow={false}
                  popperClassName='z-[99999] balance-datepicker-popper'
                  calendarClassName='balance-datepicker add-run-datepicker'
                  wrapperClassName='w-full'
                  customInput={
                    <DatePickerInput className='h-10 w-full rounded-md border border-white/15 bg-white/[0.05] px-3 pr-9 text-left text-sm text-white shadow-none outline-none transition focus:border-purple-400/50' />
                  }
                />
                <span className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-purple-300/85'>
                  ▼
                </span>
              </div>
            </div>

            <div>
              <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>Min Value</label>
              <input
                type='text'
                value={minValueFilterInput}
                onChange={(event) => {
                  const value = event.target.value
                  const formattedValue = formatCalculatorValue(value)
                  setMinValueFilterInput(formattedValue)
                  const rawValue = value.replace(/[^0-9-]/g, '').replace(/(?!^)-/g, '')
                  if (!rawValue || rawValue === '-') debouncedMinValueSearch('')
                  else if (!Number.isNaN(Number(rawValue))) debouncedMinValueSearch(rawValue)
                }}
                onKeyDown={handleMinValueFilterKeyPress}
                placeholder='0'
                className='h-10 w-full rounded-md border border-white/15 bg-white/[0.05] px-3 text-sm text-white outline-none transition focus:border-purple-400/50'
              />
            </div>

            <div>
              <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>Max Value</label>
              <input
                type='text'
                value={maxValueFilterInput}
                onChange={(event) => {
                  const value = event.target.value
                  const formattedValue = formatCalculatorValue(value)
                  setMaxValueFilterInput(formattedValue)
                  const rawValue = value.replace(/[^0-9-]/g, '').replace(/(?!^)-/g, '')
                  if (!rawValue || rawValue === '-') debouncedMaxValueSearch('')
                  else if (!Number.isNaN(Number(rawValue))) debouncedMaxValueSearch(rawValue)
                }}
                onKeyDown={handleMaxValueFilterKeyPress}
                placeholder='inf'
                className='h-10 w-full rounded-md border border-white/15 bg-white/[0.05] px-3 text-sm text-white outline-none transition focus:border-purple-400/50'
              />
            </div>
          </div>

          <div className='mt-3 flex justify-end'>
            <button
              type='button'
              onClick={clearAllFilters}
              className='rounded-md border border-white/15 bg-white/[0.03] px-3 py-2 text-sm text-neutral-300 transition hover:border-purple-400/50 hover:bg-purple-500/15'
            >
              Clear Filters
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className='flex h-40 items-center justify-center'>
            <div className='flex flex-col items-center gap-2 text-neutral-400'>
              <CircleNotch size={28} className='animate-spin text-purple-300' />
              <span>Loading requests...</span>
            </div>
          </div>
        ) : requests.length === 0 ? (
          <div className='rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center text-neutral-300'>
            {statusFilter === 'pending' &&
            teamFilter === 'all' &&
            !playerFilter &&
            !dateMinFilter &&
            !dateMaxFilter &&
            !minValueFilter &&
            !maxValueFilter
              ? 'No pending requests found - All requests have been processed!'
              : statusFilter === 'all' &&
                  teamFilter === 'all' &&
                  !playerFilter &&
                  !dateMinFilter &&
                  !dateMaxFilter &&
                  !minValueFilter &&
                  !maxValueFilter
                ? 'No requests found'
                : 'No requests found for the selected filters'}
          </div>
        ) : (
          <>
            <div className='mb-3 text-sm text-neutral-400'>
              Showing {requests.length} requests on page {currentPage}
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
              {requests.map((request) => (
                <div
                  key={request.id}
                  className={`flex flex-col overflow-hidden rounded-xl border transition ${getCardColorClass()}`}
                  style={{ height: '450px' }}
                >
                  <div
                    className='group relative h-[180px] w-full shrink-0 overflow-hidden'
                    style={{ flexBasis: '180px' }}
                  >
                    <img
                      src={request.urlImage}
                      alt='Request'
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src =
                          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDIwMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMWExYTFhIi8+CjxwYXRoIGQ9Ik0xMDAgNzBMMTIwIDEwMEg4MEwxMDAgNzBaIiBmaWxsPSIjNjY2NjY2Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEyMCIgcj0iMjAiIGZpbGw9IiM2NjY2NjYiLz4KPHN2Zz4K'
                      }}
                      className='block h-full w-full cursor-pointer object-cover'
                      onClick={() => {
                        setSelectedRequest(request)
                        setImageDialogOpen(true)
                      }}
                    />
                    <button
                      type='button'
                      onClick={() => {
                        setSelectedRequest(request)
                        setImageDialogOpen(true)
                      }}
                      className='absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition group-hover:opacity-100'
                    >
                      <span className='rounded-full bg-purple-500/90 p-3'>
                        <Eye size={22} />
                      </span>
                    </button>
                  </div>

                  <div className='flex flex-1 flex-col p-3'>
                    <div className='mb-2 flex items-center gap-2'>
                      <h3 className='line-clamp-1 text-lg font-semibold text-white'>{request.nameGbank}</h3>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${statusBadgeClass[request.status]}`}
                        style={getStatusBadgeStyle(request.status)}
                      >
                        {request.status}
                      </span>
                    </div>

                    <div
                      className='mb-3 rounded-md border p-2'
                      style={
                        request.value > 0
                          ? { borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.16)' }
                          : request.value < 0
                            ? { borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.16)' }
                            : { borderColor: 'rgba(255,255,255,0.10)', backgroundColor: 'rgba(0,0,0,0.35)' }
                      }
                    >
                      <p className='text-[11px] uppercase tracking-wide text-neutral-400'>Transaction Value</p>
                      <div className='flex items-center justify-between'>
                        <p
                          className={`text-xl font-bold ${
                            request.value > 0
                              ? 'text-blue-300'
                              : request.value < 0
                                ? 'text-red-400'
                                : 'text-purple-300'
                          }`}
                        >
                          {formatValueForDisplay(request.value)}
                        </p>
                        {request.status === 'pending' ? (
                          <button
                            type='button'
                            onClick={() => openEditValueDialog(request)}
                            className='rounded-md p-1.5 text-purple-300 transition hover:bg-purple-500/15'
                          >
                            <PencilSimple size={18} />
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <div className='mb-3 text-sm'>
                      <p className='text-[11px] uppercase tracking-wide text-neutral-400'>Requested by</p>
                      <p className='line-clamp-1 font-medium text-white'>{request.nameUserRequest}</p>
                      {request.status === 'pending' ? (
                        <div className='mt-1 flex flex-wrap gap-1'>
                          <span className='rounded-full border border-blue-400/40 bg-blue-500/15 px-2 py-0.5 text-[11px] text-blue-300'>
                            Daily: {formatValueForDisplay(request.sumDay)}g
                          </span>
                          <span className='rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2 py-0.5 text-[11px] text-emerald-300'>
                            Total: {formatValueForDisplay(request.balanceTotal)}g
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <div className='mb-4 text-sm'>
                      <p className='text-[11px] uppercase tracking-wide text-neutral-400'>Date & Time</p>
                      <p className='text-white'>{formatDateFromAPI(request.createdAt).date}</p>
                      <p className='font-mono text-xs text-neutral-400'>{formatDateFromAPI(request.createdAt).time}</p>
                    </div>

                    {request.status === 'pending' ? (
                      <div className='mt-auto grid grid-cols-2 gap-2'>
                        <button
                          type='button'
                          onClick={() => handleStatusUpdate(String(request.id), 'accepted')}
                          disabled={processingRequests.has(String(request.id))}
                          className='inline-flex items-center justify-center gap-1 rounded-md border border-emerald-400/40 bg-emerald-500/20 px-2 py-2 text-sm text-emerald-100 transition hover:bg-emerald-500/30 disabled:opacity-60'
                        >
                          <Check size={16} />
                          {processingRequests.has(String(request.id)) ? 'Processing...' : 'Accept'}
                        </button>
                        <button
                          type='button'
                          onClick={() => handleStatusUpdate(String(request.id), 'denied')}
                          disabled={processingRequests.has(String(request.id))}
                          className='inline-flex items-center justify-center gap-1 rounded-md border border-red-400/40 bg-red-500/20 px-2 py-2 text-sm text-red-100 transition hover:bg-red-500/30 disabled:opacity-60'
                        >
                          <X size={16} />
                          {processingRequests.has(String(request.id)) ? 'Processing...' : 'Deny'}
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 ? (
              <div className='mt-6 flex items-center justify-center gap-2'>
                <button
                  type='button'
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className='rounded-md border border-white/15 bg-white/[0.03] px-3 py-1.5 text-sm text-white transition hover:border-purple-400/50 hover:bg-purple-500/15 disabled:opacity-50'
                >
                  Prev
                </button>
                <span className='text-sm text-neutral-300'>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type='button'
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  className='rounded-md border border-white/15 bg-white/[0.03] px-3 py-1.5 text-sm text-white transition hover:border-purple-400/50 hover:bg-purple-500/15 disabled:opacity-50'
                >
                  Next
                </button>
              </div>
            ) : null}
          </>
        )}

        {imageDialogOpen && selectedRequest
          ? createPortal(
              <div className='fixed inset-0 z-[9999] bg-black/70 p-4 md:pl-64'>
                <div className='flex h-full w-full items-center justify-center'>
                  <div className='w-full max-w-5xl rounded-xl border border-white/10 bg-[#1a1a1a] p-4 text-white shadow-2xl'>
              <div className='mb-3 flex items-center justify-between'>
                <h3 className='text-xl font-semibold'>Request Image - {selectedRequest.nameGbank}</h3>
                <button
                  type='button'
                  onClick={() => setImageDialogOpen(false)}
                  className='rounded-md border border-white/10 bg-white/5 p-1.5 text-white transition hover:border-purple-500/40 hover:text-purple-300'
                >
                  <X size={18} />
                </button>
              </div>

              <TransformWrapper initialScale={1} minScale={0.5} maxScale={4} centerOnInit wheel={{ step: 0.1 }}>
                <TransformComponent
                  wrapperStyle={{
                    width: '100%',
                    height: 'min(65vh, 520px)',
                    cursor: 'grab',
                  }}
                >
                  <div className='flex h-full w-full items-center justify-center'>
                    <img
                      src={selectedRequest.urlImage}
                      alt='Request'
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src =
                          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDIwMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMWExYTFhIi8+CjxwYXRoIGQ9Ik0xMDAgNzBMMTIwIDEwMEg4MEwxMDAgNzBaIiBmaWxsPSIjNjY2NjY2Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEyMCIgcj0iMjAiIGZpbGw9IiM2NjY2NjYiLz4KPHN2Zz4K'
                      }}
                      className='max-h-full max-w-full rounded-md object-contain select-none'
                      draggable={false}
                    />
                  </div>
                </TransformComponent>
              </TransformWrapper>

              <div className='mt-3 space-y-1 text-base text-neutral-300'>
                <p>
                  Value: <strong>{formatValueForDisplay(selectedRequest.value)}</strong>
                </p>
                <p>
                  Status: <strong>{selectedRequest.status}</strong>
                </p>
                <p>
                  Created: {formatDateFromAPI(selectedRequest.createdAt).date} at{' '}
                  {formatDateFromAPI(selectedRequest.createdAt).time}
                </p>
              </div>
                  </div>
                </div>
              </div>,
              document.body
            )
          : null}
      </div>
    </div>
  )
}
