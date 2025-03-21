import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import { Modal } from '../../components/modal'
import { api } from '../../services/axiosConfig'
import axios from 'axios'

export function Register() {
  const navigate = useNavigate()
  const [discordId, setDiscordId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)

  useEffect(() => {
    if (isConfirmModalOpen) {
      const timer = setTimeout(() => {
        setIsConfirmModalOpen(false)
        navigate('/') // Redireciona para a tela de login
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isConfirmModalOpen, navigate])

  const handleRegister = async () => {
    setIsConfirmModalOpen(true)
    try {
      await api.post('/login/register', {
        id_discord: discordId,
        password,
      })
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError({
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        })
      } else {
        setError({ message: 'Erro inesperado', response: error })
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
    <div className='mt-20 flex h-[400px] w-[800px] items-center justify-center gap-10 rounded-xl bg-zinc-700 text-4xl font-semibold text-gray-100 shadow-2xl'>
      <div className='flex flex-col items-center gap-2'>
        <input
          className='rounded-md px-2 text-black'
          placeholder='ID Discord'
          type='text'
          value={discordId}
          onChange={(e) => setDiscordId(e.target.value)}
        />
        <input
          className='rounded-md px-2 text-black'
          placeholder='Password'
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className='flex items-center justify-between'>
          <button
            onClick={handleRegister}
            className='w-28 rounded-md bg-red-400 p-2 text-sm font-normal text-gray-100 shadow-lg hover:bg-red-500'
          >
            Register
          </button>
        </div>
      </div>

      {/* Modal de confirmação */}
      {isConfirmModalOpen && (
        <Modal onClose={() => setIsConfirmModalOpen(false)}>
          <div className='p-6 text-center'>
            <h2 className='text-xl font-semibold text-blue-500'>
              Confirme o cadastro no Discord
            </h2>
            <p className='mt-2 text-sm text-black'>
              Digite o código enviado no Discord para finalizar o cadastro.
            </p>
          </div>
        </Modal>
      )}
    </div>
  )
}
