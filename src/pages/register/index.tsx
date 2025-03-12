import { useState } from 'react'
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
  const [isSuccess, setIsSuccess] = useState(false)

  const handleRegister = async () => {
    try {
      await api.post('/login/register', {
        id_discord: discordId,
        password,
      })

      setIsSuccess(true) // Exibe modal de sucesso
      setTimeout(() => {
        setIsSuccess(false)
        navigate('/') // Redireciona após 2 segundos
      }, 2000)
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
    <div className='bg-zinc-700 text-gray-100 h-[400px] w-[800px] text-4xl flex gap-10 items-center justify-center font-semibold rounded-xl shadow-2xl mt-20'>
      <div className='flex flex-col gap-2 items-center'>
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
            className='bg-red-400 text-gray-100 hover:bg-red-500 shadow-lg rounded-md p-2 text-sm font-normal w-28'
          >
            Register
          </button>
        </div>
      </div>

      {/* Modal de sucesso */}
      {isSuccess && (
        <Modal onClose={() => setIsSuccess(false)}>
          <div className='text-center p-6'>
            <h2 className='text-xl font-semibold text-green-500'>
              Cadastro realizado com sucesso!
            </h2>
          </div>
        </Modal>
      )}
    </div>
  )
}
