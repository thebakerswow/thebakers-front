import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth-context'
import { DiscordLogo } from '@phosphor-icons/react'
import { loginDiscord } from '../../services/api/auth'
import axios from 'axios'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import { Button } from '@mui/material'

export function Login() {
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [isLoadingDiscord, setIsLoadingDiscord] = useState(false)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) navigate('/home')
  }, [isAuthenticated, navigate])

  const handleApiError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      setError({
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      })
    } else {
      setError({ message: 'Unexpected error', response: error })
    }
  }

  const clearError = () => {
    setError(null)
  }

  const handleLoginDiscord = async () => {
    setIsLoadingDiscord(true)
    try {
      const response = await loginDiscord()

      if (response.info) {
        // Verifica se a URL é válida
        try {
          new URL(response.info)
          // Redirecionamento direto
          window.location.assign(response.info)
        } catch (urlError) {
          console.error('Invalid URL:', response.info, urlError)
          setIsLoadingDiscord(false)
        }
      } else {
        console.error('No info found in response:', response)
        setIsLoadingDiscord(false)
      }
    } catch (error) {
      handleApiError(error)
      setIsLoadingDiscord(false)
    }
  }



  return (
    <div className='mt-20 flex h-[400px] w-[800px] items-center justify-center rounded-xl bg-zinc-900 text-4xl font-semibold text-gray-100 shadow-2xl'>
      {error && <ErrorComponent error={error} onClose={clearError} />}

      <Button
        variant='contained'
        color='primary'
        startIcon={<DiscordLogo size={40} weight='fill' />}
        onClick={() => {
          handleLoginDiscord()
        }}
        disabled={isLoadingDiscord}
        style={{ padding: '10px 20px', fontSize: '1rem', fontWeight: 'bold' }}
      >
        {isLoadingDiscord ? 'Loading...' : 'Sign in with Discord'}
      </Button>
    </div>
  )
}
