import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { UserPlus } from '@phosphor-icons/react'
import { BuyersDataGrid } from '../pages/bookings-na/run/buyers-data-grid'
import { api } from '../services/axiosConfig'
import { BuyerData } from '../types/buyer-interface'
import { ErrorDetails, ErrorComponent } from './error-display'
import { InviteBuyers } from './invite-buyers'
import { RunData } from '../types/runs-interface'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Button from '@mui/material/Button'

interface BuyersPreviewProps {
  runId: string
  onClose: () => void
}

function handleApiError(error: unknown): ErrorDetails {
  // Trata erros da API e retorna detalhes estruturados
  if (axios.isAxiosError(error)) {
    return {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    }
  }
  return { message: 'Unexpected error', response: error }
}

export function BuyersPreview({ runId, onClose }: BuyersPreviewProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [rows, setRows] = useState<BuyerData[]>([])
  const [isInviteBuyersOpen, setIsInviteBuyersOpen] = useState(false)
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [runData, setRunData] = useState<RunData | undefined>()

  // Alterna o estado do modal de "Invite Buyers"
  const toggleInviteBuyersModal = () => setIsInviteBuyersOpen((prev) => !prev)

  // Busca dados do "Run" e dos "Buyers" simultaneamente
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [runResponse, buyersResponse] = await Promise.all([
        api.get(`${import.meta.env.VITE_API_BASE_URL}/run/${runId}`),
        api.get(`${import.meta.env.VITE_API_BASE_URL}/run/${runId}/buyers`),
      ])
      const runInfo = runResponse.data.info
      setRunData({
        ...runInfo,
        slotAvailable: Number(runInfo.slotAvailable),
        maxBuyers: Number(runInfo.maxBuyers),
      })
      setRows(buyersResponse.data.info)
    } catch (error) {
      setError(handleApiError(error))
    } finally {
      setIsLoading(false)
    }
  }, [runId])

  // Executa a busca de dados ao montar o componente ou quando o runId muda
  useEffect(() => {
    if (runId) fetchData()
  }, [runId, fetchData])

  return (
    <Dialog open={true} onClose={onClose} fullWidth maxWidth='lg'>
      <DialogContent>
        <div className='w-full max-w-[95vw] overflow-y-auto overflow-x-hidden'>
          {error ? (
            // Exibe componente de erro caso ocorra algum problema
            <ErrorComponent error={error} onClose={() => setError(null)} />
          ) : isLoading ? (
            // Exibe indicador de carregamento enquanto os dados são buscados
            <div className='flex h-full flex-col items-center justify-center'>
              <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-zinc-600' />
              <p className='mt-4 text-lg'>Loading buyers...</p>
            </div>
          ) : rows.length > 0 ? (
            // Exibe a lista de buyers caso existam dados
            <div>
              <Button
                onClick={toggleInviteBuyersModal}
                variant='contained'
                sx={{
                  backgroundColor: 'rgb(248, 113, 113)',
                  '&:hover': { backgroundColor: 'rgb(239, 68, 68)' },
                  marginBottom: 1,
                }}
                startIcon={<UserPlus size={18} />}
              >
                Invite Buyers
              </Button>
              <BuyersDataGrid
                data={rows}
                onBuyerStatusEdit={fetchData}
                onBuyerNameNoteEdit={fetchData}
                onDeleteSuccess={fetchData}
              />
            </div>
          ) : (
            // Exibe mensagem caso não existam buyers
            <div className='flex h-full flex-col items-center justify-center'>
              <p className='text-lg'>No buyers found</p>
            </div>
          )}
        </div>
        {isInviteBuyersOpen && runData && (
          // Exibe o modal de "Invite Buyers" caso esteja aberto
          <InviteBuyers onClose={toggleInviteBuyersModal} runId={runData.id} />
        )}
      </DialogContent>
    </Dialog>
  )
}
