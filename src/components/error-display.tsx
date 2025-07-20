import Button from '@mui/material/Button'

export interface ErrorDetails {
  message: string
  response?: any
  status?: number
}

import { ErrorComponentProps } from '../types'

export function ErrorComponent({ error, onClose }: ErrorComponentProps) {
  const { response, message } = error
  const errorData = response?.errors?.[0]

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
