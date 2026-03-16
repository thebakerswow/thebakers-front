import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { handleApiError } from '../../../utils/apiErrorHandler'
import { loginDiscord } from '../services/authApi'

export function Login() {
  const [isLoadingDiscord, setIsLoadingDiscord] = useState(false)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) navigate('/home')
  }, [isAuthenticated, navigate])

  const handleLoginDiscord = async () => {
    setIsLoadingDiscord(true)
    try {
      const response = await loginDiscord()

      if (response.info) {
        // Validate redirect URL
        try {
          new URL(response.info)
          // Direct redirect
          window.location.assign(response.info)
        } catch (urlError) {
          console.error('Invalid URL:', response.info, urlError)
          setIsLoadingDiscord(false)
        }
      } else {
        console.error('No info found in response:', response)
        setIsLoadingDiscord(false)
      }
    } catch (error) {
      await handleApiError(error, 'Failed to start Discord login')
      setIsLoadingDiscord(false)
    }
  }

  return (
    <div className='relative flex min-h-screen w-full items-center justify-center overflow-hidden px-6'>
      <div className='relative z-10 flex flex-col items-center gap-10 px-10 py-14'>
        <p
          className='pointer-events-none inline-flex select-none items-center gap-3 text-center text-4xl font-semibold uppercase text-white/25 md:gap-4 md:text-6xl'
          style={{ letterSpacing: '0.5em' }}
        >
          <span>THE</span>
          <span className='text-[12px] leading-none text-purple-500 md:text-[14px]'>●</span>
          <span>BAKERS</span>
        </p>

        <button
          className='inline-flex min-w-80 cursor-pointer items-center justify-center gap-4 rounded-2xl border border-[rgba(121,134,255,0.8)] bg-[linear-gradient(135deg,#5865f2_0%,#6d7bff_100%)] px-10 py-6 text-xl font-normal text-white shadow-[0_10px_28px_rgba(88,101,242,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] transition-[transform,box-shadow,filter] duration-200 ease-out hover:-translate-y-[1px] hover:brightness-[1.03] hover:shadow-[0_14px_30px_rgba(88,101,242,0.45),inset_0_1px_0_rgba(255,255,255,0.2)] disabled:cursor-not-allowed disabled:opacity-75 disabled:shadow-[0_8px_18px_rgba(88,101,242,0.25)]'
          onClick={() => {
            handleLoginDiscord()
          }}
          disabled={isLoadingDiscord}
        >
          <svg aria-hidden='true' viewBox='0 0 127.14 96.36' className='h-7 w-7 fill-current'>
            <path d='M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.1 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.27 8.11C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.26 68.42 68.42 0 0 1-10.84-5.16c.91-.66 1.8-1.35 2.66-2.06a75.57 75.57 0 0 0 64.3 0c.87.71 1.76 1.4 2.67 2.06a68.68 68.68 0 0 1-10.86 5.17 77.6 77.6 0 0 0 6.89 11.25A105.25 105.25 0 0 0 126.6 80.2c2.64-27.35-4.5-51.08-18.9-72.13ZM42.45 65.69c-6.29 0-11.44-5.75-11.44-12.82s5.05-12.82 11.44-12.82c6.44 0 11.53 5.8 11.44 12.82 0 7.07-5.05 12.82-11.44 12.82Zm42.24 0c-6.29 0-11.44-5.75-11.44-12.82s5.05-12.82 11.44-12.82c6.44 0 11.53 5.8 11.44 12.82 0 7.07-5 12.82-11.44 12.82Z' />
          </svg>
          {isLoadingDiscord ? 'Connecting...' : 'Sign in with Discord'}
        </button>
      </div>
    </div>
  )
}
