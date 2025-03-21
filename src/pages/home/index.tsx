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
    <div className='mt-20 flex h-[400px] w-[800px] flex-col items-center justify-center rounded-xl bg-zinc-700 p-4 text-4xl font-semibold text-gray-100 shadow-2xl'>
      <div>
        Welcome to TheBakers <span className='font-bold text-red-700'>Hub</span>
      </div>

      {username && (
        <div className='mt-4 text-2xl'>
          Olá, <span className='text-red-500'>{username}</span>!
        </div>
      )}
    </div>
  )
}
