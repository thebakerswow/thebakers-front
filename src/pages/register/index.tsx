import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import { register } from '../../services/api/auth'
import axios from 'axios'
import { TextField, Button } from '@mui/material'
import Swal from 'sweetalert2'

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
      await register({
        username: discordId,
        password,
      })
      Swal.fire({
        icon: 'info',
        title: 'Confirm registration on Discord',
        text: 'Enter the code sent on Discord to complete the registration.',
        confirmButtonText: 'OK',
      }).then(() => {
        setIsConfirmModalOpen(false)
      })
    } catch (error) {
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
    <div className='min-h-screen'>
      <div className='mt-20 flex h-[400px] w-[800px] flex-col items-center justify-center gap-10 rounded-xl bg-zinc-900 text-4xl font-semibold text-gray-100 shadow-2xl'>
        <div className='flex flex-col items-center gap-4'>
          <TextField
            fullWidth
            variant='outlined'
            placeholder='Discord ID'
            value={discordId}
            onChange={(e) => setDiscordId(e.target.value)}
            slotProps={textFieldStyles}
            sx={textFieldStyles.sx}
          />
          <TextField
            fullWidth
            variant='outlined'
            placeholder='Password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            slotProps={textFieldStyles}
            sx={textFieldStyles.sx}
          />
          <div className='flex items-center justify-between'>
            <Button
              onClick={handleRegister}
              variant='contained'
              fullWidth
              sx={{
                backgroundColor: 'rgb(147, 51, 234)',
                '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
              }}
              style={{ width: '100px', fontSize: '0.8rem' }}
            >
              Register
            </Button>
          </div>
        </div>

        {/* Confirmation modal */}
        {isConfirmModalOpen && null}
      </div>

      {error && <ErrorComponent error={error} onClose={() => setError(null)} />}
    </div>
  )
}
