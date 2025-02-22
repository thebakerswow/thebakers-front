export interface ErrorDetails {
  message: string
  response?: any
  status?: number
}

interface ErrorComponentProps {
  error: ErrorDetails
  onClose: () => void
}

export function ErrorComponent({ error, onClose }: ErrorComponentProps) {
  return (
    <div className='bg-zinc-400 text-red-400 flex flex-col items-center justify-center rounded-xl shadow-2xl p-6'>
      <div className='bg-zinc-800 p-4 rounded-lg w-full max-w-2xl'>
        {error.response?.errors?.[0]?.title && (
          <div className='mb-2 text-center'>
            <p className='mt-1 text-xl font-bold'>
              {error.response.errors[0].title}
            </p>
          </div>
        )}

        {error.response?.errors?.[0]?.detail && (
          <div className='mb-2'>
            <p className='font-semibold'>Details:</p>
            <p className='mt-1'>{error.response.errors[0].detail}</p>
          </div>
        )}

        {!error.response?.errors && error.message && (
          <div className='mb-2'>
            <p className='font-semibold'>Mensagem:</p>
            <p className='mt-1'>{error.message}</p>
          </div>
        )}
      </div>

      <button
        className='mt-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors'
        onClick={onClose}
      >
        Fechar
      </button>
    </div>
  )
}
