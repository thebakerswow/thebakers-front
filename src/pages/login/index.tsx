import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth-context'
import { DiscordLogo } from '@phosphor-icons/react'
import { api } from '../../services/axiosConfig'
import axios from 'axios'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import { Modal as MuiModal, Box } from '@mui/material'
import { Button, TextField } from '@mui/material'

export function Login() {
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [discordId, setDiscordId] = useState('')
  const [password, setPassword] = useState('')
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
      setError({ message: 'Erro inesperado', response: error })
    }
  }

  const handleLoginDiscord = async () => {
    try {
      console.log(import.meta.env.VITE_API_BASE_URL)
      const response = await api.post('/login/discord')
      if (response.data.info) window.location.href = response.data.info
    } catch (error) {
      handleApiError(error)
    }
  }

  const handleLoginRegister = async () => {
    try {
      const response = await api.post('/login', {
        id_discord: discordId,
        password,
      })
      if (response.data.info) {
        login(response.data.info)
        navigate('/home')
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
    <div className='mt-20 flex h-[400px] w-[800px] items-center justify-center gap-10 rounded-xl bg-zinc-900 text-4xl font-semibold text-gray-100 shadow-2xl'>
      <Button
        variant='contained'
        color='primary'
        startIcon={<DiscordLogo size={40} weight='fill' />}
        onClick={handleLoginDiscord}
        style={{ padding: '10px 20px', fontSize: '1rem', fontWeight: 'bold' }}
      >
        Sign in with Discord
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
              backgroundColor: 'rgb(239, 68, 68)',
              '&:hover': { backgroundColor: 'rgb(248, 113, 113)' },
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
