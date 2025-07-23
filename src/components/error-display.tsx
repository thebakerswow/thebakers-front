import Button from '@mui/material/Button'
import { useAuth } from '../context/auth-context'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export interface ErrorDetails {
  message: string
  response?: any
  status?: number
}

import { ErrorComponentProps } from '../types'

export function ErrorComponent({ error, onClose }: ErrorComponentProps) {
  const { response, message, status } = error
  const errorData = response?.errors?.[0]
  const { logout } = useAuth()
  const navigate = useNavigate()

  // Verifica se é um erro de autenticação
  const isAuthError =
    status === 401 ||
    errorData?.type === 'autenticacao-invalida' ||
    errorData?.title === 'Usuário não autenticado'

  useEffect(() => {
    if (isAuthError) {
      // Faz logout e redireciona para login após 2 segundos
      const timer = setTimeout(() => {
        logout()
        navigate('/')
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [isAuthError, logout, navigate])

  return (
    <div className='max-w-2xl rounded-lg bg-zinc-800 p-4 text-center'>
      {errorData?.title && (
        <div className='mb-2'>
          <p className='text-xl font-bold text-red-400'>{errorData.title}</p>
        </div>
      )}

      {errorData?.detail && (
        <div className='mb-2'>
          <p className='font-semibold text-red-400'>Details:</p>
          <p className='text-red-400'>{errorData.detail}</p>
        </div>
      )}

      {!errorData && message && (
        <div className='mb-2'>
          <p className='font-semibold text-red-400'>Mensagem:</p>
          <p className='text-red-400'>{message}</p>
        </div>
      )}

      {isAuthError && (
        <div className='mb-2'>
          <p className='text-yellow-400'>
            Redirecionando para login em 2 segundos...
          </p>
        </div>
      )}

      <Button
        variant='contained'
        color='error'
        onClick={onClose}
        sx={{
          marginTop: '1.5rem',
          paddingX: '1rem',
          paddingY: '0.5rem',
          fontWeight: 'bold',
          ':hover': {
            backgroundColor: 'rgb(248, 113, 113)',
            '&:hover': { backgroundColor: 'rgb(239, 68, 68)' },
          },
        }}
      >
        Fechar
      </Button>
    </div>
  )
}
