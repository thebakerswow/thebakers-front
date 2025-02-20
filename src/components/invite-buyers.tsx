import axios from 'axios'
import { Modal } from './modal'
import { useEffect, useState } from 'react'
import { Check } from '@phosphor-icons/react'

interface InviteBuyersProps {
  onClose: () => void
  runId: string | undefined
}

export function InviteBuyers({ onClose, runId }: InviteBuyersProps) {
  const [inviteBuyersData, setInviteBuyersData] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function fetchInviteBuyersData() {
    try {
      const apiUrl = import.meta.env.VITE_GET_RUN_URL
      const response = await axios.get(
        `${apiUrl}/${runId}/buyers/invite` ||
          `http://localhost:8000/v1/run/${runId}/buyers/invite`,
        {
          headers: {
            APP_TOKEN: import.meta.env.VITE_APP_TOKEN,
            Authorization: `Bearer ${sessionStorage.getItem('jwt')}`,
          },
        }
      )
      setInviteBuyersData(response.data.info)
      setError(null)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Erro detalhado:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        })
        setError('Erro ao carregar os dados. Tente novamente mais tarde.')
      } else {
        console.error('Erro inesperado:', error)
        setError('Ocorreu um erro inesperado.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInviteBuyersData()
  }, [runId])

  function handleCopy() {
    const textToCopy = inviteBuyersData.join('\n')
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => setCopied(true))
      .catch(() => alert('Erro ao copiar os dados.'))

    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Modal onClose={onClose}>
      {loading && <p>Carregando...</p>}

      {error && <p className='error-message'>{error}</p>}

      {inviteBuyersData.length > 0 && (
        <div className='modal-content flex flex-col items-end gap-2'>
          <div className='text-start'>
            {inviteBuyersData.map((item, index) => (
              <div key={index}>
                <p className='font-normal'>{item}</p>
              </div>
            ))}
          </div>
          {copied ? (
            <Check className='text-green-500' size={24} />
          ) : (
            <button
              className='bg-zinc-400 text-white rounded-md px-3 p-1'
              onClick={handleCopy}
            >
              Copy
            </button>
          )}
        </div>
      )}

      {!loading && inviteBuyersData.length === 0 && !error && (
        <p>Nenhum dado encontrado.</p>
      )}
    </Modal>
  )
}
