import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth-context'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import { useState } from 'react'

export function Login() {
  const [error, setError] = useState<ErrorDetails | null>(null)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) navigate('/home')
  }, [isAuthenticated, navigate])

  return (
    <div className='mt-20 flex h-[400px] w-[800px] items-center justify-center gap-10 rounded-xl bg-zinc-900 text-4xl font-semibold text-gray-100 shadow-2xl'>
      {error && <ErrorComponent error={error} onClose={() => setError(null)} />}

      {/* Temporarily disabled login functionality */}
      <div className='flex flex-col items-center justify-center gap-6 text-center'>
        <h2 className='text-3xl font-bold text-red-400 mb-4'>⚠️ Login Temporarily Disabled</h2>
        <div className='text-lg font-normal text-gray-300 max-w-md'>
          <p className='mb-4'>
            We apologize for the inconvenience. Our login system is currently undergoing maintenance.
          </p>
          <p className='text-blue-400 font-semibold'>
            Please contact our staff for assistance or check our Discord server for updates.
          </p>
        </div>
      </div>
    </div>
  )
}
