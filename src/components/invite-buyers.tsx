import axios from 'axios'
import { Modal } from './modal'
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

interface InviteBuyersProps {
  onClose: () => void
}

export function InviteBuyers({ onClose }: InviteBuyersProps) {
  const { id } = useParams<{ id: string }>()
  const [inviteBuyersData, setInviteBuyersData] = useState<string[]>([]) // Estado para os dados (array de strings)
  const [loading, setLoading] = useState(true) // Estado de carregamento
  const [error, setError] = useState<string | null>(null) // Estado de erro

  async function fetchInviteBuyersData() {
    try {
      const apiUrl = import.meta.env.VITE_GET_RUN_URL
      const response = await axios.get(
        `${apiUrl}/${id}/buyers/invite` ||
          `http://localhost:8000/v1/run/${id}/buyers/invite`,
        {
          headers: {
            APP_TOKEN: import.meta.env.VITE_APP_TOKEN,
            Authorization: `Bearer ${sessionStorage.getItem('jwt')}`,
          },
        }
      )

      console.log(response.data) // Verifique o retorno no console
      setInviteBuyersData(response.data.info) // Assumindo que response.data é o array de strings
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

  // Executar a busca quando o componente montar
  useEffect(() => {
    fetchInviteBuyersData()
  }, [id])

  return (
    <Modal onClose={onClose}>
      {loading && <p>Carregando...</p>}

      {error && <p className='error-message'>{error}</p>}

      {inviteBuyersData.length > 0 && ( // Verifica se há dados no array
        <div className='modal-content'>
          <div>
            {inviteBuyersData.map((item, index) => (
              <div key={index}>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && inviteBuyersData.length === 0 && !error && (
        <p>Nenhum dado encontrado.</p>
      )}
    </Modal>
  )
}
