import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth-context'
import { DiscordLogo } from '@phosphor-icons/react'
import { loginDiscord, loginWithCredentials } from '../../services/api/auth'
import axios from 'axios'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import { Button, TextField } from '@mui/material'

export function Login() {
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [discordId, setDiscordId] = useState('')
  const [password, setPassword] = useState('')
  const [isLoadingDiscord, setIsLoadingDiscord] = useState(false)
  const { isAuthenticated, login } = useAuth()
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

  const handleLoginRegister = async () => {
    try {
      const response = await loginWithCredentials({
        id_discord: discordId,
        password,
      })
      if (response.info) {
        login(response.info)
        navigate('/home')
        clearError() // Clear error on successful login
      }
    } catch (error) {
      handleApiError(error)
    }
  }

  const textFieldStyles = {
    inputLabel: { style: { color: '#ECEBEE' } },
    input: { style: { color: '#ECEBEE', backgroundColor: '#2D2F36' } }, // Background ajustado
    sx: {
      '& .MuiOutlinedInput-root': {
        '& fieldset': { borderColor: '#ECEBEE' },
        '&:hover fieldset': { borderColor: '#ECEBEE' },
        '&.Mui-focused fieldset': { borderColor: '#ECEBEE' },
        '& input': { backgroundColor: '#2D2F36' }, // Background ajustado
      },
    },
  }

  return (
    <div className='mt-20 flex h-[400px] w-[800px] items-center justify-center gap-10 rounded-xl bg-zinc-900 text-4xl font-semibold text-gray-100 shadow-2xl'>
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
      <span className='text-sm font-thin'>or</span>
      <div className='flex flex-col gap-2'>
        <TextField
          variant='outlined'
          placeholder='Discord ID'
          type='text'
          value={discordId}
          onChange={(e) => setDiscordId(e.target.value)}
          fullWidth
          slotProps={textFieldStyles}
          sx={textFieldStyles.sx}
        />
        <TextField
          variant='outlined'
          placeholder='Password'
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          slotProps={textFieldStyles}
          sx={textFieldStyles.sx}
        />
        <div className='flex items-center justify-between'>
          <Button
            variant='contained'
            onClick={handleLoginRegister}
            sx={{
              backgroundColor: 'rgb(147, 51, 234)',
              '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
            }}
            style={{ width: '100px', fontSize: '0.8rem' }}
          >
            Login
          </Button>
          <Link
            to='/register'
            className='cursor-pointer text-sm font-light underline'
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}
