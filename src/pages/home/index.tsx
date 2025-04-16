import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import { Modal as MuiModal, Box } from '@mui/material'

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
    // console.log(token)
    if (!token) return

    try {
      const decoded = jwtDecode<DiscordTokenPayload>(token)
      setUsername(decoded.username)
    } catch (err) {
      const errorDetails = axios.isAxiosError(err)
        ? {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status,
          }
        : { message: 'Erro inesperado', response: err }
      setError(errorDetails)
    }
  }, [])

  if (error) {
    return (
      <MuiModal open={!!error} onClose={() => setError(null)}>
        <Box className='absolute left-1/2 top-1/2 w-96 -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-gray-400 p-4 shadow-lg'>
          <ErrorComponent error={error} onClose={() => setError(null)} />
        </Box>
      </MuiModal>
    )
  }

  return (
    <div className='mt-20 flex h-[400px] w-[800px] flex-col items-center justify-center rounded-xl bg-zinc-900 p-4 text-4xl font-semibold text-gray-100 shadow-2xl'>
      <div>
        Welcome to TheBakers <span className='font-bold text-red-700'>Hub</span>
      </div>
      {username && (
        <div className='mt-4 text-2xl'>
          Hello, <span className='text-red-500'>{username}</span>!
        </div>
      )}
    </div>
  )
}
