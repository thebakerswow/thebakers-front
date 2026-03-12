import { useEffect, useMemo, useState } from 'react'
import { CaretLeft, CaretRight, X } from '@phosphor-icons/react'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import Swal from 'sweetalert2'
import { CustomSelect } from '../../components/custom-select'
import { handleApiError } from '../../utils/apiErrorHandler'
import { MyRequestsSkeleton } from './components/MyRequestsSkeleton'
import { RequestCard } from './components/RequestCard'
import {
  deleteTransactionRequest,
  getUserTransactionRequests,
  updateTransactionRequestValue,
} from './services/myRequestsApi'
import { StatusFilter, TransactionRequest } from './types/myRequests'

const statusFilters: StatusFilter[] = ['pending', 'accepted', 'denied', 'all']

const itemsPerPageOptions = [
  { value: '6', label: '6' },
  { value: '12', label: '12' },
  { value: '24', label: '24' },
  { value: '48', label: '48' },
]

const statusStyleConfig: Record<
  StatusFilter,
  {
    activeClass: string
    inactiveClass: string
    activeBorderColor: string
    inactiveBorderColor: string
    activeBackgroundColor: string
    inactiveBackgroundColor: string
    color: string
  }
> = {
  pending: {
    activeClass: 'border-amber-400/60 bg-amber-500/25 text-amber-100',
    inactiveClass: 'border-white/15 bg-white/[0.03] text-neutral-200 hover:border-amber-400/60 hover:bg-amber-500/15',
    activeBorderColor: '#f59e0b',
    inactiveBorderColor: '#d97706',
    activeBackgroundColor: 'rgba(245,158,11,0.28)',
    inactiveBackgroundColor: 'rgba(245,158,11,0.10)',
    color: '#fef3c7',
  },
  accepted: {
    activeClass: 'border-emerald-400/60 bg-emerald-500/25 text-emerald-100',
    inactiveClass:
      'border-white/15 bg-white/[0.03] text-neutral-200 hover:border-emerald-400/60 hover:bg-emerald-500/15',
    activeBorderColor: '#10b981',
    inactiveBorderColor: '#059669',
    activeBackgroundColor: 'rgba(16,185,129,0.28)',
    inactiveBackgroundColor: 'rgba(16,185,129,0.10)',
    color: '#d1fae5',
  },
  denied: {
    activeClass: 'border-red-400/60 bg-red-500/25 text-red-100',
    inactiveClass: 'border-white/15 bg-white/[0.03] text-neutral-200 hover:border-red-400/60 hover:bg-red-500/15',
    activeBorderColor: '#ef4444',
    inactiveBorderColor: '#dc2626',
    activeBackgroundColor: 'rgba(239,68,68,0.28)',
    inactiveBackgroundColor: 'rgba(239,68,68,0.10)',
    color: '#fee2e2',
  },
  all: {
    activeClass: 'border-purple-400/60 bg-purple-500/25 text-purple-100',
    inactiveClass:
      'border-white/15 bg-white/[0.03] text-neutral-200 hover:border-purple-400/60 hover:bg-purple-500/15',
    activeBorderColor: '#a855f7',
    inactiveBorderColor: '#9333ea',
    activeBackgroundColor: 'rgba(168,85,247,0.28)',
    inactiveBackgroundColor: 'rgba(168,85,247,0.10)',
    color: '#f3e8ff',
  },
}

export function MyRequestsPage() {
  const [requests, setRequests] = useState<TransactionRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
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
      await handleApiError(err, 'Error fetching your requests')
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
    const style = statusStyleConfig[status]
    return statusFilter === status ? style.activeClass : style.inactiveClass
  }

  const getStatusButtonStyle = (status: StatusFilter) => {
    const isActive = statusFilter === status
    const style = statusStyleConfig[status]
    return {
      borderColor: isActive ? style.activeBorderColor : style.inactiveBorderColor,
      backgroundColor: isActive ? style.activeBackgroundColor : style.inactiveBackgroundColor,
      color: style.color,
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
      inputValidator: (value) => {
        if (!value || Number.isNaN(parseFloat(value))) {
          return 'Please enter a valid number'
        }
      },
    })

    if (!newValue || Number.isNaN(parseFloat(newValue))) return

    try {
      Swal.fire({
        title: 'Saving...',
        text: 'Updating transaction value',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      })
      await updateTransactionRequestValue({ id: request.id, value: parseFloat(newValue) })
      await fetchRequests()
      Swal.fire({
        title: 'Success!',
        text: 'Transaction value updated successfully',
        icon: 'success',
      })
    } catch (_error) {
      await handleApiError(_error, 'Failed to update transaction value')
    }
  }

  const handleDeleteRequest = async (request: TransactionRequest) => {
    const result = await Swal.fire({
      title: 'Delete Request',
      text: `Are you sure you want to delete this request for ${request.nameGbank}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    })

    if (!result.isConfirmed) return

    try {
      Swal.fire({
        title: 'Deleting...',
        text: 'Removing request',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      })
      await deleteTransactionRequest(request.id)
      await fetchRequests()
      Swal.fire({
        title: 'Deleted!',
        text: 'Your request has been deleted successfully.',
        icon: 'success',
      })
    } catch (_error) {
      await handleApiError(_error, 'Failed to delete request')
    }
  }

  const openImageModal = (request: TransactionRequest) => {
    setSelectedRequest(request)
    setIsImageModalOpen(true)
  }

  return (
    <div className='flex h-full min-h-0 w-full flex-col px-6 pb-8 pt-6 md:px-10'>
      <section className='mb-4 rounded-xl border border-white/10 bg-white/[0.03] p-4'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div className='flex flex-wrap gap-2'>
            {statusFilters.map((status) => (
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
            <CustomSelect
              value={String(itemsPerPage)}
              onChange={(value) => handleItemsPerPageChange(Number(value))}
              options={itemsPerPageOptions}
              minWidthClassName='min-w-[90px]'
              triggerClassName='h-10 !border-purple-400/25 !bg-white/[0.03] px-3 pr-9 text-sm !text-white !shadow-none focus:!border-purple-400/50 focus:!ring-0'
              menuClassName='!border-white/15 !bg-[#1a1a1a] !shadow-[0_20px_40px_rgba(0,0,0,0.45)]'
              optionClassName='text-white/90 hover:bg-white/10'
              activeOptionClassName='shadow-[0_0_0_1px_rgba(216,180,254,0.35)_inset]'
              renderInPortal
            />
          </div>
        </div>
      </section>

      {isLoading ? (
        <MyRequestsSkeleton />
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
              <RequestCard
                key={request.id}
                request={request}
                onOpenImage={openImageModal}
                onEditValue={openEditValueDialog}
                onDelete={handleDeleteRequest}
              />
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
