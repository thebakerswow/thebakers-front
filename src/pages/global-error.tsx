import { useEffect } from 'react'
import { WarningCircle } from '@phosphor-icons/react'
import { Link, useNavigate } from 'react-router-dom'

interface GlobalErrorPageProps {
  title?: string
  message?: string
  actionLabel?: string
  actionTo?: string
  showReload?: boolean
  autoRedirectTo?: string
  autoRedirectDelayMs?: number
}

export function GlobalErrorPage({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  actionLabel = 'Go back',
  actionTo = '/',
  showReload = true,
  autoRedirectTo,
  autoRedirectDelayMs,
}: GlobalErrorPageProps) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!autoRedirectTo || !autoRedirectDelayMs) return

    const timer = window.setTimeout(() => {
      navigate(autoRedirectTo, { replace: true })
    }, autoRedirectDelayMs)

    return () => window.clearTimeout(timer)
  }, [autoRedirectDelayMs, autoRedirectTo, navigate])

  return (
    <div className='flex min-h-[70vh] items-center justify-center px-4 py-10'>
      <div className='w-full max-w-md rounded-2xl border border-white/10 bg-black/35 p-6 text-center text-white shadow-2xl'>
        <div className='mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10'>
          <WarningCircle size={32} className='text-red-400' />
        </div>

        <h1 className='text-2xl font-bold'>{title}</h1>
        <p className='mt-2 text-sm text-neutral-300'>{message}</p>

        <div className='mt-7 flex flex-wrap items-center justify-center gap-2'>
          {showReload ? (
            <button
              type='button'
              onClick={() => window.location.reload()}
              className='inline-flex h-10 items-center justify-center rounded-md border border-purple-400/40 bg-purple-500/20 px-4 text-sm font-medium text-purple-100 transition hover:border-purple-300/55 hover:bg-purple-500/30'
            >
              Try again
            </button>
          ) : null}

          <Link
            to={actionTo}
            className='inline-flex h-10 items-center justify-center rounded-md border border-white/20 bg-white/10 px-4 text-sm font-medium text-white transition hover:bg-white/15'
          >
            {actionLabel}
          </Link>
        </div>
      </div>
    </div>
  )
}
