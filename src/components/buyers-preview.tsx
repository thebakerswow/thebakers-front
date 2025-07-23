import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { BuyersDataGrid } from '../pages/bookings-na/run/buyers-data-grid'
import { getRun } from '../services/api/runs'
import { getRunBuyers } from '../services/api/buyers'
import { BuyerData } from '../types/buyer-interface'
import { ErrorDetails, ErrorComponent } from './error-display'
import { RunData } from '../types/runs-interface'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { AddBuyer } from './add-buyer'
import CloseIcon from '@mui/icons-material/Close'

import { BuyersPreviewProps } from '../types'

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
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [runData, setRunData] = useState<RunData | undefined>()
  const [isAddBuyerOpen, setIsAddBuyerOpen] = useState(false)

  // Busca dados do "Run" e dos "Buyers" simultaneamente
  const fetchData = useCallback(
    async (showLoading: boolean = true) => {
      if (showLoading) setIsLoading(true)
      try {
        const [runResponse, buyersResponse] = await Promise.all([
          getRun(runId),
          getRunBuyers(runId),
        ])
        const runInfo = runResponse
        setRunData({
          ...runInfo,
          slotAvailable: Number(runInfo.slotAvailable),
          maxBuyers: Number(runInfo.maxBuyers),
        })
        setRows(buyersResponse)
      } catch (error) {
        setError(handleApiError(error))
      } finally {
        if (showLoading) setIsLoading(false)
      }
    },
    [runId]
  )

  // Executa a busca de dados ao montar o componente ou quando o runId muda
  useEffect(() => {
    if (runId) fetchData(true)
  }, [runId, fetchData])

  // Polling para atualizar buyers a cada 2 segundos enquanto o modal está aberto
  useEffect(() => {
    if (!runId) return
    const interval = setInterval(() => {
      fetchData(false)
    }, 2000)
    return () => clearInterval(interval)
  }, [runId, fetchData])

  return (
    <Dialog open={true} onClose={onClose} fullWidth maxWidth='lg'>
      <DialogContent>
        <IconButton
          aria-label='close'
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <div className='w-full max-w-[95vw] overflow-y-auto overflow-x-hidden'>
          {/* Botão Add Buyer sempre visível */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 12,
            }}
          >
            <Button
              onClick={() => setIsAddBuyerOpen(true)}
              variant='contained'
              sx={{
                backgroundColor: 'rgb(147, 51, 234)',
                '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
                minWidth: 140,
                fontWeight: 500,
                boxShadow: 'none',
              }}
            >
              Add Buyer
            </Button>
            {/* Informativo de status só aparece se houver buyers */}
            {Array.isArray(rows) && rows.length > 0 && (
              <span className='rounded-md bg-gray-300 px-4 py-1 text-gray-800'>
                Waiting: {rows.filter((b) => b.status === 'waiting').length} |
                Group: {rows.filter((b) => b.status === 'group').length}
              </span>
            )}
          </div>
          {error ? (
            // Exibe componente de erro caso ocorra algum problema
            <ErrorComponent error={error} onClose={() => setError(null)} />
          ) : isLoading ? (
            // Exibe indicador de carregamento enquanto os dados são buscados
            <div className='flex h-full flex-col items-center justify-center'>
              <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-zinc-600' />
              <p className='mt-4 text-lg'>Loading buyers...</p>
            </div>
          ) : Array.isArray(rows) && rows.length > 0 ? (
            // Exibe a lista de buyers caso existam dados
            <BuyersDataGrid
              data={rows}
              onBuyerStatusEdit={fetchData}
              onBuyerNameNoteEdit={fetchData}
              onDeleteSuccess={fetchData}
            />
          ) : (
            // Exibe mensagem caso não existam buyers
            <div className='flex h-full flex-col items-center justify-center'>
              <p className='text-lg'>No buyers found</p>
            </div>
          )}
        </div>

        {isAddBuyerOpen && runData && (
          <AddBuyer
            run={runData}
            onClose={() => setIsAddBuyerOpen(false)}
            onBuyerAddedReload={fetchData}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
