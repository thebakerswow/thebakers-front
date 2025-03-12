import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth-context'
import { DiscordLogo } from '@phosphor-icons/react'
import { api } from '../../services/axiosConfig'
import axios from 'axios'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import { Modal } from '../../components/modal'

export function Login() {
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [discordId, setDiscordId] = useState('')
  const [password, setPassword] = useState('')
  const { isAuthenticated, login } = useAuth() // Obtém a função de login do contexto
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home') // Redireciona automaticamente se estiver autenticado
    }
  }, [isAuthenticated, navigate])

  const handleLoginDiscord = async () => {
    try {
      const response = await api.post('/login/discord')

      if (response.data.info) {
        window.location.href = response.data.info
      }
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

  const handleLoginRegister = async () => {
    try {
      const payload = {
        id_discord: discordId,
        password,
      }

      const response = await api.post('/login', payload)

      console.log(response.data.info)

      if (response.data.info) {
        login(response.data.info) // Atualiza o estado global de autenticação
        navigate('/home') // Redireciona após login bem-sucedido
      }
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
      <button
        className='flex gap-2 items-center px-8 py-4 bg-indigo-500 rounded-md text-xl font-semibold hover:bg-indigo-600 transition-all'
        onClick={handleLoginDiscord}
      >
        <DiscordLogo size={40} weight='fill' />
        Sign in with Discord
      </button>
      <span className='text-sm font-thin'>or</span>
      <div className='flex flex-col gap-2 '>
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
            onClick={handleLoginRegister}
            className='bg-red-400 text-gray-100 hover:bg-red-500 shadow-lg rounded-md p-2 text-sm font-normal w-28'
          >
            Login
          </button>
          <Link
            to={'/register'}
            className='text-sm underline font-light cursor-pointer'
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}
