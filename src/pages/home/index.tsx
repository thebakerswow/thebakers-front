import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import { Modal } from '../../components/modal'

type DiscordTokenPayload = {
  username: string
  discriminator: string
  avatar: string
  roles: string
  id: string
}

export function HomePage() {
  const [username, setUsername] = useState('')
  const [error, setError] = useState<ErrorDetails | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('jwt')
    if (!token) return

    try {
      const decoded = jwtDecode<DiscordTokenPayload>(token)
      setUsername(decoded.username)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorDetails = {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        }
        setError(errorDetails)
      } else {
        setError({
          message: 'Erro inesperado',
          response: error,
        })
      }
    }
  }, [])

  if (error) {
    return (
      <Modal onClose={() => setError(null)}>
        <ErrorComponent error={error} onClose={() => setError(null)} />
      </Modal>
    )
  }

  return (
    <div className='bg-zinc-700 text-gray-100 p-4 h-[400px] w-[800px] text-4xl flex flex-col items-center justify-center font-semibold rounded-xl shadow-2xl mt-20'>
      <div>
        Welcome to TheBakers <span className='text-red-700 font-bold'>Hub</span>
      </div>

      {username && (
        <div className='text-2xl mt-4'>
          Olá, <span className='text-red-500'>{username}</span>!
        </div>
      )}
    </div>
  )
}
