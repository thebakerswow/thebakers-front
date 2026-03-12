import { useEffect, useMemo, useState } from 'react'
import { CaretLeft, CaretRight, Eye, PencilSimple, Trash, X } from '@phosphor-icons/react'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import Swal from 'sweetalert2'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import {
  deleteTransactionRequest,
  getUserTransactionRequests,
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

type StatusFilter = 'all' | 'pending' | 'accepted' | 'denied'

const statusBadgeClass: Record<TransactionRequest['status'], string> = {
  pending: 'border-amber-400/40 bg-amber-500/20 text-amber-100',
  accepted: 'border-emerald-400/40 bg-emerald-500/20 text-emerald-100',
  denied: 'border-red-400/40 bg-red-500/20 text-red-100',
}

export function MyRequestsPage() {
  const [requests, setRequests] = useState<TransactionRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<TransactionRequest | null>(null)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  const fetchRequests = async () => {
    setIsLoading(true)
    try {
      const response = await getUserTransactionRequests()
      const sorted = [...(response || [])].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setRequests(sorted)
    } catch (err) {
      setError({
        message: 'Error fetching your requests',
        response: err,
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const filteredRequests = useMemo(
    () => (statusFilter === 'all' ? requests : requests.filter((request) => request.status === statusFilter)),
    [requests, statusFilter]
  )

  const pagination = useMemo(() => {
    const totalItems = filteredRequests.length
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
    const safePage = Math.min(currentPage, totalPages)
    const startIndex = (safePage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage

    return {
      totalItems,
      totalPages,
      safePage,
      startIndex,
      endIndex,
      pageItems: filteredRequests.slice(startIndex, endIndex),
    }
  }, [filteredRequests, itemsPerPage, currentPage])

  useEffect(() => {
    if (currentPage !== pagination.safePage) {
      setCurrentPage(pagination.safePage)
    }
  }, [currentPage, pagination.safePage])

  const handleStatusFilter = (status: StatusFilter) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value)
    setCurrentPage(1)
  }

  const getStatusButtonClass = (status: StatusFilter) => {
    const isActive = statusFilter === status
    if (status === 'pending') {
      return isActive
        ? 'border-amber-400/60 bg-amber-500/25 text-amber-100'
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

  const getStatusButtonStyle = (status: StatusFilter) => {
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

  const openEditValueDialog = async (request: TransactionRequest) => {
    if (request.status !== 'pending') return

    const { value: newValue } = await Swal.fire({
      title: 'Edit Transaction Value',
      input: 'number',
      inputValue: request.value,
      inputAttributes: {
        step: '0.01',
        style: '-moz-appearance: textfield;',
      },
      customClass: {
        input: 'swal-no-spinner',
      },
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel',
      confirmButtonColor: 'rgb(147, 51, 234)',
      background: '#2a2a2a',
      color: 'white',
      inputValidator: (value) => {
        if (!value || Number.isNaN(parseFloat(value))) {
          return 'Please enter a valid number'
        }
      },
    })

    if (!newValue || Number.isNaN(parseFloat(newValue))) return

    try {
      await updateTransactionRequestValue({ id: request.id, value: parseFloat(newValue) })
      await fetchRequests()
      Swal.fire({
        title: 'Success!',
        text: 'Transaction value updated successfully',
        icon: 'success',
        confirmButtonColor: 'rgb(147, 51, 234)',
        background: '#2a2a2a',
        color: 'white',
      })
    } catch (_error) {
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

  const handleDeleteRequest = async (request: TransactionRequest) => {
    const result = await Swal.fire({
      title: 'Delete Request',
      text: `Are you sure you want to delete this request for ${request.nameGbank}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: '#2a2a2a',
      color: 'white',
    })

    if (!result.isConfirmed) return

    try {
      await deleteTransactionRequest(request.id)
      await fetchRequests()
      Swal.fire({
        title: 'Deleted!',
        text: 'Your request has been deleted successfully.',
        icon: 'success',
        confirmButtonColor: 'rgb(147, 51, 234)',
        background: '#2a2a2a',
        color: 'white',
      })
    } catch (_error) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete request',
        icon: 'error',
        confirmButtonColor: 'rgb(147, 51, 234)',
        background: '#2a2a2a',
        color: 'white',
      })
    }
  }

  const openImageModal = (request: TransactionRequest) => {
    setSelectedRequest(request)
    setIsImageModalOpen(true)
  }

  const getCardColorClass = () => {
    return 'bg-white/[0.04] border-white/10 hover:bg-white/[0.06] hover:border-white/20'
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

  const formatValueForDisplay = (value: number) => {
    const formatted = Math.abs(value)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return value < 0 ? `-${formatted}` : formatted
  }

  return (
    <div className='flex h-full min-h-0 w-full flex-col px-6 pb-8 pt-6 md:px-10'>
      {error && <ErrorComponent error={error} onClose={() => setError(null)} />}

      <section className='mb-4 rounded-xl border border-white/10 bg-white/[0.03] p-4'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div className='flex flex-wrap gap-2'>
            {(['pending', 'accepted', 'denied', 'all'] as const).map((status) => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status)}
                className={`rounded-md border px-3 py-2 text-sm font-medium capitalize transition ${getStatusButtonClass(status)}`}
                style={getStatusButtonStyle(status)}
              >
                {status === 'all' ? 'All Requests' : status[0].toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          <div className='flex items-center gap-2'>
            <span className='text-xs uppercase tracking-wide text-neutral-400'>Per Page</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className='h-10 rounded-md border border-purple-400/25 bg-white/[0.03] px-3 text-sm text-white outline-none transition focus:border-purple-400/50'
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className='flex h-48 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]'>
          <div className='flex flex-col items-center gap-2'>
            <span className='inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-purple-400' />
            <span className='text-sm text-neutral-400'>Loading your requests...</span>
          </div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className='rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center text-neutral-400'>
          {statusFilter === 'all' ? 'No requests found' : 'No requests found for the selected status'}
        </div>
      ) : (
        <>
          <div className='mb-3 text-sm text-neutral-400'>
            Showing {pagination.startIndex + 1}-{Math.min(pagination.endIndex, pagination.totalItems)} of{' '}
            {pagination.totalItems} requests
          </div>

          <div
            className='grid gap-4'
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            }}
          >
            {pagination.pageItems.map((request) => (
              <div
                key={request.id}
                className={`flex flex-col overflow-hidden rounded-xl border transition ${getCardColorClass()}`}
                style={{ height: '450px' }}
              >
                <div className='group relative h-[180px] w-full shrink-0 overflow-hidden' style={{ flexBasis: '180px' }}>
                  <img
                    src={request.urlImage}
                    alt='Request'
                    className='block h-full w-full cursor-pointer object-cover'
                    onClick={() => openImageModal(request)}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src =
                        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDIwMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMWExYTFhIi8+CjxwYXRoIGQ9Ik0xMDAgNzBMMTIwIDEwMEg4MEwxMDAgNzBaIiBmaWxsPSIjNjY2NjY2Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEyMCIgcj0iMjAiIGZpbGw9IiM2NjY2NjYiLz4KPHN2Zz4K'
                    }}
                  />
                  <button
                    type='button'
                    onClick={() => openImageModal(request)}
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
                        <div className='flex items-center gap-1'>
                          <button
                            onClick={() => openEditValueDialog(request)}
                            className='rounded-md p-1.5 text-purple-300 transition hover:bg-purple-500/15'
                            aria-label='edit request value'
                          >
                            <PencilSimple size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(request)}
                            className='rounded-md p-1.5 text-red-300 transition hover:bg-red-500/15'
                            aria-label='delete request'
                          >
                            <Trash size={18} />
                          </button>
                        </div>
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
                </div>
              </div>
            ))}
          </div>

          {pagination.totalPages > 1 ? (
            <div className='mt-5 flex items-center justify-center gap-1'>
              <button
                disabled={pagination.safePage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className='inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 bg-white/[0.03] text-white/80 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50'
              >
                <CaretLeft size={16} />
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`h-9 min-w-9 rounded-md border px-2 text-sm transition ${
                    page === pagination.safePage
                      ? 'border-purple-400/50 bg-purple-500/25 text-purple-100'
                      : 'border-white/15 bg-white/[0.03] text-white/80 hover:bg-white/[0.06]'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                disabled={pagination.safePage === pagination.totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                className='inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 bg-white/[0.03] text-white/80 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50'
              >
                <CaretRight size={16} />
              </button>
            </div>
          ) : null}
        </>
      )}

      {isImageModalOpen && selectedRequest ? (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4'>
          <div className='w-full max-w-5xl rounded-xl border border-white/10 bg-[#101014] p-4 shadow-2xl'>
            <div className='mb-3 flex items-center justify-between'>
              <h3 className='line-clamp-1 text-base font-semibold text-white'>
                Request Image - {selectedRequest.nameGbank}
              </h3>
              <button
                onClick={() => setIsImageModalOpen(false)}
                className='rounded-md border border-white/10 bg-white/5 p-1.5 text-white transition hover:border-purple-500/40 hover:text-purple-300'
              >
                <X size={16} />
              </button>
            </div>

            <div className='h-[70vh] overflow-hidden rounded-lg border border-white/10 bg-black/30'>
              <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={4}
                centerOnInit
                wheel={{ step: 0.1 }}
                pinch={{ step: 5 }}
                doubleClick={{ disabled: false, step: 0.9 }}
                centerZoomedOut
                limitToBounds={false}
              >
                <TransformComponent
                  wrapperStyle={{ width: '100%', height: '100%', cursor: 'grab' }}
                  contentStyle={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={selectedRequest.urlImage}
                    alt='Request'
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      userSelect: 'none',
                    }}
                    draggable={false}
                  />
                </TransformComponent>
              </TransformWrapper>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
