export interface ErrorDetails {
  message: string
  response?: any
  status?: number
}

interface ErrorComponentProps {
  error: ErrorDetails
}

export function ErrorComponent({ error }: ErrorComponentProps) {
  return (
    <div className='bg-zinc-700 text-red-400 absolute inset-0 flex flex-col items-center justify-center rounded-xl shadow-2xl m-8 p-4'>
      <h2 className='text-xl font-bold mb-4'>Erro ao carregar equipes</h2>
      <div className='bg-zinc-800 p-4 rounded-lg w-full max-w-2xl'>
        <p className='mb-2'>Mensagem: {error.message}</p>
        {error.status && <p>Código HTTP: {error.status}</p>}
        {error.response && (
          <div className='mt-4'>
            <p className='font-semibold'>Resposta do servidor:</p>
            <pre className='whitespace-pre-wrap break-words mt-2 text-sm'>
              {JSON.stringify(error.response, null, 2)}
            </pre>
          </div>
        )}
      </div>
      <button
        className='mt-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors'
        onClick={() => window.location.reload()}
      >
        Tentar novamente
      </button>
    </div>
  )
}
