import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import { api } from '../../services/axiosConfig'
import axios from 'axios'
import { TextField, Button, Alert } from '@mui/material'
import { Modal as MuiModal, Box } from '@mui/material'

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
      await api.post('/login/register', {
        id_discord: discordId,
        password,
      })
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
    <div className='mt-20 flex h-[400px] w-[800px] flex-col items-center justify-center gap-10 rounded-xl bg-zinc-900 text-4xl font-semibold text-gray-100 shadow-2xl'>
      <div className='flex flex-col items-center gap-4'>
        <TextField
          fullWidth
          variant='outlined'
          label='ID Discord'
          value={discordId}
          onChange={(e) => setDiscordId(e.target.value)}
          slotProps={textFieldStyles}
          sx={textFieldStyles.sx}
        />
        <TextField
          fullWidth
          variant='outlined'
          label='Password'
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
              backgroundColor: 'rgb(239, 68, 68)',
              '&:hover': { backgroundColor: 'rgb(248, 113, 113)' },
            }}
            style={{ width: '100px', fontSize: '0.8rem' }}
          >
            Register
          </Button>
        </div>
      </div>

      {/* Modal de confirmação */}
      {isConfirmModalOpen && (
        <MuiModal
          open={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
        >
          <Box className='absolute left-1/2 top-1/2 w-[500px] -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-white p-6 shadow-lg'>
            <Alert
              severity='info'
              onClose={() => setIsConfirmModalOpen(false)}
              style={{ textAlign: 'center', fontSize: '1rem' }}
            >
              Confirme o cadastro no Discord. Digite o código enviado no Discord
              para finalizar o cadastro.
            </Alert>
          </Box>
        </MuiModal>
      )}
    </div>
  )
}
