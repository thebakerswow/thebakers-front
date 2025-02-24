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

export function BuyersPreview({ runId, onClose }: BuyersPreviewProps) {
  const [isLoadingBuyers, setIsLoadingBuyers] = useState(false)
  const [rows, setRows] = useState<BuyerData[]>([])
  const [isInviteBuyersOpen, setIsInviteBuyersOpen] = useState(false)
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [runData, setRunData] = useState<RunData | undefined>(undefined)

  function handleOpenInviteBuyersModal() {
    setIsInviteBuyersOpen(true)
  }

  function handleCloseInviteBuyersModal() {
    setIsInviteBuyersOpen(false)
  }

  async function fetchRunData() {
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
      if (axios.isAxiosError(error)) {
        const errorDetails = {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        }
        console.error('Erro detalhado:', errorDetails)
        setError(errorDetails)
      } else {
        const genericError = {
          message: 'Erro inesperado',
          response: error,
        }
        console.error('Erro genérico:', error)
        setError(genericError)
      }
    }
  }

  // Função para buscar os dados dos buyers
  async function fetchBuyersData() {
    try {
      setIsLoadingBuyers(true)
      const response = await api.get(
        `${import.meta.env.VITE_API_BASE_URL}/run/${runId}/buyers` ||
          `http://localhost:8000/v1/run/${runId}/buyers`
      )

      setRows(response.data.info)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorDetails = {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        }
        setError(errorDetails)
      } else {
        setError({
          message: 'Erro inesperado',
          response: error,
        })
      }
    } finally {
      setIsLoadingBuyers(false)
    }
  }

  if (error) {
    return (
      <Modal onClose={() => setError(null)}>
        <ErrorComponent error={error} onClose={() => setError(null)} />
      </Modal>
    )
  }

  useEffect(() => {
    if (runId) {
      fetchRunData()
      fetchBuyersData()
    }
  }, [runId])

  const reloadAllData = async () => {
    await fetchRunData() // Atualiza dados da run
    await fetchBuyersData() // Atualiza lista de buyers
  }

  return (
    <Modal onClose={onClose}>
      <div className='w-full max-w-[95vw] overflow-y-auto overflow-x-hidden'>
        {error ? (
          <ErrorComponent error={error} onClose={() => setError(null)} />
        ) : isLoadingBuyers ? (
          <div className='flex flex-col items-center justify-center h-full'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-600' />
            <p className='mt-4 text-lg'>Loading buyers...</p>
          </div>
        ) : rows?.length > 0 ? (
          <div>
            <button
              onClick={handleOpenInviteBuyersModal}
              className='flex items-center gap-2 bg-red-400 text-gray-100 hover:bg-red-500 rounded-md p-2 mb-2'
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
          <div className='flex flex-col items-center justify-center h-full'>
            <p className='text-lg'>No buyers found</p>
          </div>
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
