import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from '@phosphor-icons/react'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import Swal from 'sweetalert2'
import { getApiErrorMessage, handleApiError } from '../../../utils/apiErrorHandler'
import { RequestCard } from './components/RequestCard'
import { RequestsFilter } from './components/RequestsFilter'
import { ResquestsSkeleton } from './components/RequestsSkeleton'
import {
  getTransactionRequests,
  updateTransactionRequest,
  updateTransactionRequestValue,
} from './services/requestsApi'
import {
  RequestStatus,
  RequestsStatusFilter,
  TransactionRequest,
  TransactionRequestResponse,
} from './types/requests'

const TEAM_NAMES: Record<string, string> = {
  [import.meta.env.VITE_TEAM_GARCOM]: 'Garcom',
  [import.meta.env.VITE_TEAM_CONFEITEIROS]: 'Confeiteiros',
  [import.meta.env.VITE_TEAM_JACKFRUIT]: 'Jackfruit',
  [import.meta.env.VITE_TEAM_INSANOS]: 'Insanos',
  [import.meta.env.VITE_TEAM_APAE]: 'APAE',
  [import.meta.env.VITE_TEAM_LOSRENEGADOS]: 'Los Renegados',
  [import.meta.env.VITE_TEAM_PUNKS]: 'Punks',
}

export function RequestsPage() {
  const normalizeRequestStatus = (status: unknown): RequestStatus => {
    const normalized = String(status ?? '')
      .trim()
      .toLowerCase()

    if (normalized.includes('accept')) return 'accepted'
    if (normalized.includes('deny') || normalized.includes('denied')) return 'denied'
    return 'pending'
  }

  const [requests, setRequests] = useState<TransactionRequest[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<TransactionRequest | null>(null)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<RequestsStatusFilter>('pending')
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

  const getRawNumericFilterValue = (value: string) => value.replace(/[^0-9-]/g, '').replace(/(?!^)-/g, '')

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
        const normalizedTransactions = (data.transactions || []).map((request) => ({
          ...request,
          status: normalizeRequestStatus(request.status),
        }))
        setRequests(normalizedTransactions)
        const totalResults = data.totalPages || 0
        const calculatedPages = Math.ceil(totalResults / 12)
        setTotalPages(calculatedPages)
      } else {
        setRequests([])
        setTotalPages(0)
      }
    } catch (err) {
      await handleApiError(err, getApiErrorMessage(err, 'Error fetching requests'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusFilter = (status: RequestsStatusFilter) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handleTeamFilterChange = (value: string) => {
    setTeamFilter(value)
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

  const handlePlayerFilterInputChange = (value: string) => {
    setPlayerFilterInput(value)
    debouncedSearch(value)
  }

  const handleDateMinFilterChange = (value: string) => {
    setDateMinFilter(value)
    setCurrentPage(1)
  }

  const handleDateMaxFilterChange = (value: string) => {
    setDateMaxFilter(value)
    setCurrentPage(1)
  }

  const handleMinValueFilterKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return
    if (minValueDebounceTimeoutRef.current) clearTimeout(minValueDebounceTimeoutRef.current)
    const rawValue = getRawNumericFilterValue(minValueFilterInput)
    if (!rawValue || rawValue === '-') setMinValueFilter('')
    else if (!Number.isNaN(Number(rawValue))) setMinValueFilter(rawValue)
    setCurrentPage(1)
  }

  const handleMaxValueFilterKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return
    if (maxValueDebounceTimeoutRef.current) clearTimeout(maxValueDebounceTimeoutRef.current)
    const rawValue = getRawNumericFilterValue(maxValueFilterInput)
    if (!rawValue || rawValue === '-') setMaxValueFilter('')
    else if (!Number.isNaN(Number(rawValue))) setMaxValueFilter(rawValue)
    setCurrentPage(1)
  }

  const handleMinValueFilterInputChange = (value: string) => {
    const formattedValue = formatCalculatorValue(value)
    setMinValueFilterInput(formattedValue)
    const rawValue = getRawNumericFilterValue(value)
    if (!rawValue || rawValue === '-') debouncedMinValueSearch('')
    else if (!Number.isNaN(Number(rawValue))) debouncedMinValueSearch(rawValue)
  }

  const handleMaxValueFilterInputChange = (value: string) => {
    const formattedValue = formatCalculatorValue(value)
    setMaxValueFilterInput(formattedValue)
    const rawValue = getRawNumericFilterValue(value)
    if (!rawValue || rawValue === '-') debouncedMaxValueSearch('')
    else if (!Number.isNaN(Number(rawValue))) debouncedMaxValueSearch(rawValue)
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
    } catch (err) {
      await handleApiError(err, 'Failed to update transaction value')
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
      await handleApiError(
        err,
        getApiErrorMessage(
          err,
          `Error ${status === 'accepted' ? 'accepting' : 'denying'} request`
        )
      )
    } finally {
      setProcessingRequests((prev) => {
        const next = new Set(prev)
        next.delete(requestId)
        return next
      })
    }
  }

  const hasNoActiveFilters =
    teamFilter === 'all' &&
    !playerFilter &&
    !dateMinFilter &&
    !dateMaxFilter &&
    !minValueFilter &&
    !maxValueFilter

  const selectedRequestDateInfo = selectedRequest ? formatDateFromAPI(selectedRequest.createdAt) : null

  return (
    <div className='w-full overflow-auto overflow-x-hidden pr-20'>
      <div className='m-8 min-h-screen w-full pb-12 text-white'>
        {isLoading ? (
          <ResquestsSkeleton />
        ) : (
          <>
            <RequestsFilter
              statusFilter={statusFilter}
              onStatusFilterChange={handleStatusFilter}
              teamFilter={teamFilter}
              onTeamFilterChange={handleTeamFilterChange}
              teamOptions={teamOptions}
              playerFilterInput={playerFilterInput}
              onPlayerFilterInputChange={handlePlayerFilterInputChange}
              onPlayerFilterKeyPress={handlePlayerFilterKeyPress}
              dateMinFilter={dateMinFilter}
              onDateMinFilterChange={handleDateMinFilterChange}
              dateMaxFilter={dateMaxFilter}
              onDateMaxFilterChange={handleDateMaxFilterChange}
              minValueFilterInput={minValueFilterInput}
              onMinValueFilterInputChange={handleMinValueFilterInputChange}
              onMinValueFilterKeyPress={handleMinValueFilterKeyPress}
              maxValueFilterInput={maxValueFilterInput}
              onMaxValueFilterInputChange={handleMaxValueFilterInputChange}
              onMaxValueFilterKeyPress={handleMaxValueFilterKeyPress}
              onClearFilters={clearAllFilters}
            />

            {requests.length === 0 ? (
          <div className='rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center text-neutral-300'>
            {statusFilter === 'pending' && hasNoActiveFilters
              ? 'No pending requests found - All requests have been processed!'
              : statusFilter === 'all' && hasNoActiveFilters
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
                    <RequestCard
                      key={request.id}
                      request={request}
                      isProcessing={processingRequests.has(String(request.id))}
                      showActions={statusFilter === 'pending'}
                      onOpenImage={(selected) => {
                        setSelectedRequest(selected)
                        setImageDialogOpen(true)
                      }}
                      onEditValue={openEditValueDialog}
                      onStatusUpdate={handleStatusUpdate}
                      formatDateFromAPI={formatDateFromAPI}
                      formatValueForDisplay={formatValueForDisplay}
                    />
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
                  Created: {selectedRequestDateInfo?.date} at {selectedRequestDateInfo?.time}
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
