import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth-context'

export function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const { login, isAuthenticated, loading } = useAuth()
  const loginCalled = useRef(false)

  useEffect(() => {
    const token = searchParams.get('token')
    if (token && !loginCalled.current) {
      loginCalled.current = true
      login(token)
    } else if (!token) {
      setError('Token not found in URL.')
      setTimeout(() => navigate('/login'), 2000)
    }
  }, [searchParams, login, navigate])

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/home')
    }
  }, [isAuthenticated, loading, navigate])

  if (error) {
    return <p className='text-red-500'>{error}</p>
  }

  return (
    <div className='flex min-h-screen flex-col items-center justify-center'>
      <p className='mb-2 text-lg'>Authenticating...</p>
      <p className='text-sm text-gray-500'>
        {loading
          ? 'Verifying token...'
          : isAuthenticated
            ? 'Redirecting...'
            : 'Waiting...'}
      </p>
    </div>
  )
}
