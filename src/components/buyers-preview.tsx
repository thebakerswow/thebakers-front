import { useEffect, useState } from 'react'
import axios from 'axios'
import { UserPlus } from '@phosphor-icons/react'
import { BuyersDataGrid } from '../pages/bookings-na/run/buyers-data-grid'
import { api } from '../services/axiosConfig'
import { BuyerData } from '../types/buyer-interface'
import { ErrorDetails, ErrorComponent } from './error-display'
import { Modal } from './modal'
import { InviteBuyers } from './invite-buyers'
import { RunData } from '../types/runs-interface'

interface BuyersPreviewProps {
  runId: string
  onClose: () => void
}

function handleApiError(error: unknown): ErrorDetails {
  if (axios.isAxiosError(error)) {
    return {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    }
  }
  return {
    message: 'Unexpected error',
    response: error,
  }
}

export function BuyersPreview({ runId, onClose }: BuyersPreviewProps) {
  const [isLoadingBuyers, setIsLoadingBuyers] = useState(false)
  const [rows, setRows] = useState<BuyerData[]>([])
  const [isInviteBuyersOpen, setIsInviteBuyersOpen] = useState(false)
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [runData, setRunData] = useState<RunData | undefined>(undefined)

  const handleOpenInviteBuyersModal = () => setIsInviteBuyersOpen(true)
  const handleCloseInviteBuyersModal = () => setIsInviteBuyersOpen(false)

  const fetchRunData = async () => {
    try {
      const response = await api.get(
        `${import.meta.env.VITE_API_BASE_URL}/run/${runId}` ||
          `http://localhost:8000/v1/run/${runId}`
      )
      const data = response.data.info
      setRunData({
        ...data,
        slotAvailable: Number(data.slotAvailable),
        maxBuyers: Number(data.maxBuyers),
      })
    } catch (error) {
      setError(handleApiError(error))
    }
  }

  const fetchBuyersData = async () => {
    try {
      setIsLoadingBuyers(true)
      const response = await api.get(
        `${import.meta.env.VITE_API_BASE_URL}/run/${runId}/buyers` ||
          `http://localhost:8000/v1/run/${runId}/buyers`
      )
      setRows(response.data.info)
    } catch (error) {
      setError(handleApiError(error))
    } finally {
      setIsLoadingBuyers(false)
    }
  }

  useEffect(() => {
    if (runId) {
      fetchRunData()
      fetchBuyersData()
    }
  }, [runId])

  const reloadAllData = async () => {
    await fetchRunData()
    await fetchBuyersData()
  }

  return (
    <Modal onClose={onClose}>
      <div className='w-full max-w-[95vw] overflow-y-auto overflow-x-hidden'>
        {error ? (
          <ErrorComponent error={error} onClose={() => setError(null)} />
        ) : isLoadingBuyers ? (
          <div className='flex h-full flex-col items-center justify-center'>
            <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-zinc-600' />
            <p className='mt-4 text-lg'>Loading buyers...</p>
          </div>
        ) : (
          <>
            {rows?.length > 0 ? (
              <div>
                <button
                  onClick={handleOpenInviteBuyersModal}
                  className='mb-2 flex items-center gap-2 rounded-md bg-red-400 p-2 text-gray-100 hover:bg-red-500'
                >
                  <UserPlus size={18} />
                  Invite Buyers
                </button>
                <BuyersDataGrid
                  data={rows}
                  onBuyerStatusEdit={reloadAllData}
                  onBuyerNameNoteEdit={fetchBuyersData}
                  onDeleteSuccess={reloadAllData}
                />
              </div>
            ) : (
              <div className='flex h-full flex-col items-center justify-center'>
                <p className='text-lg'>No buyers found</p>
              </div>
            )}
          </>
        )}
      </div>
      {isInviteBuyersOpen && runData && (
        <InviteBuyers
          onClose={handleCloseInviteBuyersModal}
          runId={runData.id}
        />
      )}
    </Modal>
  )
}
