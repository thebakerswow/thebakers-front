import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth-context'
import { DiscordLogo } from '@phosphor-icons/react'
import { api } from '../../services/axiosConfig'
import axios from 'axios'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import { Modal } from '../../components/modal'

export function Login() {
  const [error, setError] = useState<ErrorDetails | null>(null)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Se já estiver autenticado, redireciona para a home
    if (isAuthenticated) {
      navigate('/home')
    }
  }, [isAuthenticated, navigate])

  const handleLogin = async () => {
    try {
      const response = await api.post('/login/discord')

      if (response.data.info) {
        window.location.href = response.data.info
      }
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

  if (error) {
    return (
      <Modal onClose={() => setError(null)}>
        <ErrorComponent error={error} onClose={() => setError(null)} />
      </Modal>
    )
  }

  return (
    <div className='bg-zinc-700 text-gray-100 h-[400px] w-[800px] text-4xl flex flex-col gap-4 items-center justify-center font-semibold rounded-xl shadow-2xl mt-20'>
      <button
        className='flex gap-2 items-center px-8 py-4 bg-indigo-500 rounded-md text-xl font-semibold hover:bg-indigo-600 transition-all'
        onClick={handleLogin}
      >
        <DiscordLogo size={40} weight='fill' />
        Sign in with Discord
      </button>
    </div>
  )
}
