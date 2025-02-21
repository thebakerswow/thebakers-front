import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth-context'
import { DiscordLogo } from '@phosphor-icons/react'
import { authApi } from '../../services/axiosConfig'

export function Login() {
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
      const response = await authApi.post(
        '/',
        {},
        {
          headers: {
            APP_TOKEN: import.meta.env.VITE_APP_TOKEN,
          },
        }
      )

      if (response.data.info) {
        window.location.href = response.data.info
      }
    } catch (error) {
      console.error('Erro ao iniciar login com Discord:', error)
    }
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
