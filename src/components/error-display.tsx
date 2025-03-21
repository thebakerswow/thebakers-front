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
    <div className='flex flex-col items-center justify-center rounded-xl bg-zinc-400 p-6 text-red-400 shadow-2xl'>
      <div className='w-full max-w-2xl rounded-lg bg-zinc-800 p-4'>
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
        className='mt-6 rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600'
        onClick={onClose}
      >
        Fechar
      </button>
    </div>
  )
}
