import axios from 'axios'
import { Dialog, DialogContent, DialogTitle, Button } from '@mui/material'
import { useEffect, useState } from 'react'
import { Check } from '@phosphor-icons/react'
import { api } from '../services/axiosConfig'
import { ErrorComponent, ErrorDetails } from './error-display'
import Swal from 'sweetalert2'

interface InviteBuyersProps {
  onClose: () => void
  runId: string | undefined
}

export function InviteBuyers({ onClose, runId }: InviteBuyersProps) {
  const [inviteBuyersData, setInviteBuyersData] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Função para buscar os dados de compradores convidados
    async function fetchInviteBuyersData() {
      try {
        const response = await api.get(
          `${import.meta.env.VITE_API_BASE_URL}/run/${runId}/buyers/invite`
        )
        setInviteBuyersData(
          Array.isArray(response.data.info) ? response.data.info : []
        )
        setError(null) // Limpa erros anteriores, se houver
      } catch (err) {
        // Trata erros da requisição
        setError(
          axios.isAxiosError(err)
            ? {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
              }
            : { message: 'Erro inesperado', response: err }
        )
      } finally {
        setLoading(false) // Finaliza o estado de carregamento
      }
    }
    fetchInviteBuyersData()
  }, [runId])

  // Função para copiar os dados para a área de transferência
  function handleCopy() {
    navigator.clipboard
      .writeText(inviteBuyersData.join('\n'))
      .then(() => setCopied(true)) // Indica que os dados foram copiados
      .catch(() => Swal.fire('Erro', 'Erro ao copiar os dados.', 'error')) // Exibe alerta em caso de erro
    setTimeout(() => setCopied(false), 2000) // Reseta o estado de "copiado" após 2 segundos
  }

  return (
    <Dialog open={true} onClose={onClose}>
      <DialogTitle className='text-center'>Invite Buyers</DialogTitle>
      <DialogContent className='flex flex-col items-center'>
        {loading ? (
          // Exibe mensagem de carregamento
          <p className='text-center'>Loading...</p>
        ) : error ? (
          // Exibe componente de erro, se houver
          <ErrorComponent error={error} onClose={() => setError(null)} />
        ) : inviteBuyersData.length > 0 ? (
          // Exibe os dados de compradores convidados
          <div className='flex flex-col items-center gap-2'>
            <div className='text-center'>
              {inviteBuyersData.map((item, index) => (
                <p key={index} className='font-normal'>
                  {item}
                </p>
              ))}
            </div>
            {copied ? (
              // Ícone de confirmação de cópia
              <Check className='text-green-500' size={24} />
            ) : (
              // Botão para copiar os dados
              <Button variant='contained' color='primary' onClick={handleCopy}>
                Copy
              </Button>
            )}
          </div>
        ) : (
          // Exibe mensagem caso nenhum dado seja encontrado
          <p className='text-center'>Nenhum dado encontrado.</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
