import { useEffect, useMemo, useState } from 'react'
import {
  Briefcase,
  CalendarBlank,
  ClipboardText,
  Coins,
  CurrencyDollar,
  House,
  Key,
  Shield,
  Sword,
  Trophy,
  User,
} from '@phosphor-icons/react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom'
import { Header } from './components/Sidebar'
import { HomePage } from './pages/home'
import { BalancePageRouter } from './pages/balance'
import { FullRaidsNa } from './pages/bookings-na/raids'
import { RunDetails } from './pages/bookings-na/run'
import { AuthCallback, Login } from './pages/auth'
import { AuthProvider } from './context/AuthContext' // Importe o AuthProvider
import { useAuth } from './context/AuthContext'
import { AdminPage } from './pages/management/admin'
import ManagementServices from './pages/management/services-management'
import { MockSpecialRunDetailsPage } from './pages/special-runs/mock-special-run-details-page'
import { RequestsPage } from './pages/management/requests'
import { MyRequestsPage } from './pages/my-requests'
import { PaymentsPage } from './pages/management/gold-payments'
import { ReceiptsPage } from './pages/management/dollar-payments'
import { SellsPage } from './pages/sells'
import { PurpleGlowBackground } from './components/PurpleGlowBackground'
import { LoadingSpinner } from './components/LoadingSpinner'
import { GlobalErrorPage } from './pages/global-error'

// Componente para proteger rotas privadas
function PrivateRoute({ element }: { element: JSX.Element }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <LoadingSpinner size='lg' label='Checking authentication' />
      </div>
    )
  }

  return isAuthenticated ? element : <Navigate to='/' />
}

function AppContent() {
  const { isAuthenticated, username, idDiscord } = useAuth()
  const { pathname } = useLocation()

  useEffect(() => {
    const clearScrollLocks = () => {
      const html = document.documentElement
      const body = document.body
      const isSwalOpen =
        body.classList.contains('swal2-shown') ||
        html.classList.contains('swal2-shown')

      html.style.removeProperty('padding-right')
      html.style.removeProperty('margin-right')
      body.style.removeProperty('padding-right')
      body.style.removeProperty('margin-right')

      if (!isSwalOpen) {
        html.style.removeProperty('overflow')
        body.style.removeProperty('overflow')
      }
    }

    clearScrollLocks()
    const observer = new MutationObserver(clearScrollLocks)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    })
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className='relative isolate flex min-h-screen w-full flex-col bg-[#060608]'>
      <PurpleGlowBackground />
      <div className='relative z-10 flex w-full flex-1'>
        {isAuthenticated ? <Header /> : null}
        <main
          className={`relative flex min-h-0 flex-1 overflow-x-hidden ${
            isAuthenticated ? 'pt-[64px] md:pt-0' : ''
          }`}
        >
          <div className='flex w-full min-w-0 flex-1 flex-col'>
            {isAuthenticated ? (
              <TopInfoBar username={username} idDiscord={idDiscord} pathname={pathname} />
            ) : null}
            <div className='w-full flex-1'>
              <Routes>
              {/* Rotas públicas */}
              <Route path='/' element={<Login />} />
              <Route path='/login/callback' element={<AuthCallback />} />
              <Route
                path='/login/error'
                element={
                  <GlobalErrorPage
                    title='Login failed'
                    message='We could not complete your login. You will be redirected to login shortly.'
                    actionLabel='Return to login'
                    actionTo='/'
                    showReload={false}
                    autoRedirectTo='/'
                    autoRedirectDelayMs={5000}
                  />
                }
              />
              <Route
                path='/access-denied'
                element={
                  <GlobalErrorPage
                    title='Access denied'
                    message='You do not have permission to access this page.'
                    actionLabel={isAuthenticated ? 'Go to home' : 'Go to login'}
                    actionTo={isAuthenticated ? '/home' : '/'}
                    showReload={false}
                  />
                }
              />

              {/* Rotas privadas */}
              <Route
                path='/home'
                element={<PrivateRoute element={<HomePage />} />}
              />
              <Route
                path='/balance'
                element={<PrivateRoute element={<BalancePageRouter />} />}
              />
              <Route
                path='/bookings-na/raids'
                element={<PrivateRoute element={<FullRaidsNa />} />}
              />
              <Route
                path='/bookings-na'
                element={<Navigate to='/bookings-na/raids' replace />}
              />
              <Route
                path='/bookings-na/run/:id'
                element={<PrivateRoute element={<RunDetails />} />}
              />
              <Route
                path='/bookings-na/key/:id'
                element={<PrivateRoute element={<MockSpecialRunDetailsPage runType='Keys' />} />}
              />
              <Route
                path='/bookings-na/leveling/:id'
                element={<PrivateRoute element={<MockSpecialRunDetailsPage runType='Leveling' />} />}
              />
              <Route
                path='/bookings-na/delves/:id'
                element={<PrivateRoute element={<MockSpecialRunDetailsPage runType='Delves' />} />}
              />
              <Route
                path='/bookings-na/achievements/:id'
                element={<PrivateRoute element={<MockSpecialRunDetailsPage runType='Achievements' />} />}
              />
              <Route
                path='/admin'
                element={<PrivateRoute element={<AdminPage />} />}
              />
              <Route
                path='/check-access'
                element={
                  <PrivateRoute
                    element={
                      <GlobalErrorPage
                        title='Access check failed'
                        message='You do not have access to this run.'
                        actionLabel='Back to raids'
                        actionTo='/bookings-na/raids'
                        showReload={false}
                      />
                    }
                  />
                }
              />
              <Route
                path='/services'
                element={<PrivateRoute element={<ManagementServices />} />}
              />
              <Route
                path='/keys'
                element={<PrivateRoute element={<MockSpecialRunDetailsPage runType='Keys' />} />}
              />
              <Route
                path='/leveling'
                element={<PrivateRoute element={<MockSpecialRunDetailsPage runType='Leveling' />} />}
              />
              <Route
                path='/delves'
                element={<PrivateRoute element={<MockSpecialRunDetailsPage runType='Delves' />} />}
              />
              <Route
                path='/achievements'
                element={<PrivateRoute element={<MockSpecialRunDetailsPage runType='Achievements' />} />}
              />
              <Route
                path='/requests'
                element={<PrivateRoute element={<RequestsPage />} />}
              />
              <Route
                path='/my-requests'
                element={<PrivateRoute element={<MyRequestsPage />} />}
              />
              <Route
                path='/payments'
                element={<PrivateRoute element={<PaymentsPage />} />}
              />
              <Route
                path='/receipts'
                element={<Navigate to='/dollar-payments' replace />}
              />
              <Route
                path='/dollar-payments'
                element={<PrivateRoute element={<ReceiptsPage />} />}
              />
              <Route
                path='/sells'
                element={<PrivateRoute element={<SellsPage />} />}
              />

              {/* Rota catch-all */}
              <Route
                path='*'
                element={
                  <GlobalErrorPage
                    title='Page not found'
                    message='The page you were looking for does not exist.'
                    actionLabel={isAuthenticated ? 'Go to home' : 'Go to login'}
                    actionTo={isAuthenticated ? '/home' : '/'}
                    showReload={false}
                  />
                }
              />
              </Routes>
            </div>
          </div>
        </main>
      </div>
      {isAuthenticated ? <AppFooter /> : null}
    </div>
  )
}

function TopInfoBar({
  username,
  idDiscord,
  pathname,
}: {
  username: string | null
  idDiscord: string | null
  pathname: string
}) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const formattedDate = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: '2-digit',
      }).format(now),
    [now]
  )

  const displayName = username || idDiscord || 'User'
  const screen = getScreenMeta(pathname)

  return (
    <div className='hidden h-20 w-full shrink-0 items-center justify-between border-b border-white/10 bg-black/50 px-6 backdrop-blur-sm md:flex'>
      <div className='flex items-center gap-3'>
        <span className='flex h-11 w-11 items-center justify-center rounded-xl border border-purple-400/25 bg-gradient-to-b from-[#2a1242] to-[#140821] shadow-[0_8px_20px_rgba(76,29,149,0.35)]'>
          <span className='text-purple-300'>{screen.icon}</span>
        </span>
        <div className='flex flex-col'>
          <span className='text-[11px] font-medium uppercase tracking-wide text-neutral-500'>
            {screen.breadcrumb}
          </span>
          <span className='text-2xl font-semibold leading-tight text-white'>{screen.name}</span>
        </div>
      </div>

      <div className='flex items-end gap-8'>
        <div className='flex flex-col items-end'>
          <span className='text-[11px] font-medium tracking-wide text-neutral-500'>
            User
          </span>
          <span className='text-sm font-medium text-white'>{displayName}</span>
        </div>
        <div className='flex flex-col items-end'>
          <span className='text-[11px] font-medium tracking-wide text-neutral-500'>
            Today
          </span>
          <span className='text-sm font-medium text-white'>{formattedDate}</span>
        </div>
      </div>
    </div>
  )
}

function getScreenMeta(pathname: string) {
  if (pathname.startsWith('/admin')) {
    return {
      name: 'Admin',
      breadcrumb: 'Management / Admin',
      icon: <Shield size={20} weight='duotone' />,
    }
  }
  if (pathname.startsWith('/home')) {
    return { name: 'Home', breadcrumb: 'Dashboard / Home', icon: <House size={20} weight='duotone' /> }
  }
  if (pathname.startsWith('/balance')) {
    return { name: 'Balance', breadcrumb: 'Finances / Balance', icon: <Coins size={20} weight='duotone' /> }
  }
  if (pathname.startsWith('/bookings-na/key/')) {
    return {
      name: 'Keys',
      breadcrumb: 'Bookings (NA) / Keys',
      icon: <Key size={20} weight='duotone' />,
    }
  }
  if (pathname.startsWith('/bookings-na/leveling/')) {
    return {
      name: 'Leveling',
      breadcrumb: 'Bookings (NA) / Leveling',
      icon: <Sword size={20} weight='duotone' />,
    }
  }
  if (pathname.startsWith('/bookings-na/delves/')) {
    return {
      name: 'Delves',
      breadcrumb: 'Bookings (NA) / Delves',
      icon: <Sword size={20} weight='duotone' />,
    }
  }
  if (pathname.startsWith('/bookings-na/achievements/')) {
    return {
      name: 'Achievements',
      breadcrumb: 'Bookings (NA) / Achievements',
      icon: <Trophy size={20} weight='duotone' />,
    }
  }
  if (pathname.startsWith('/bookings-na/run/')) {
    const runId = pathname.split('/').filter(Boolean).pop() || '-'
    return {
      name: `Run ${runId}`,
      breadcrumb: 'Bookings (NA) / Raids / Run',
      icon: <CalendarBlank size={20} weight='duotone' />,
    }
  }
  if (pathname.startsWith('/bookings-na/raids')) {
    return {
      name: 'Raids',
      breadcrumb: 'Bookings (NA) / Raids',
      icon: <CalendarBlank size={20} weight='duotone' />,
    }
  }
  if (pathname.startsWith('/keys')) {
    return { name: 'Keys', breadcrumb: 'Bookings (NA) / Keys', icon: <Key size={20} weight='duotone' /> }
  }
  if (pathname.startsWith('/leveling')) {
    return {
      name: 'Leveling',
      breadcrumb: 'Bookings (NA) / Leveling',
      icon: <Sword size={20} weight='duotone' />,
    }
  }
  if (pathname.startsWith('/delves')) {
    return { name: 'Delves', breadcrumb: 'Bookings (NA) / Delves', icon: <Sword size={20} weight='duotone' /> }
  }
  if (pathname.startsWith('/achievements')) {
    return {
      name: 'Achievements',
      breadcrumb: 'Bookings (NA) / Achievements',
      icon: <Trophy size={20} weight='duotone' />,
    }
  }
  if (pathname.startsWith('/services')) {
    return { name: 'Services', breadcrumb: 'Management / Services', icon: <Briefcase size={20} weight='duotone' /> }
  }
  if (pathname.startsWith('/requests')) {
    return { name: 'Requests', breadcrumb: 'Management / Requests', icon: <ClipboardText size={20} weight='duotone' /> }
  }
  if (pathname.startsWith('/my-requests')) {
    return { name: 'My Requests', breadcrumb: 'Finances / My Requests', icon: <User size={20} weight='duotone' /> }
  }
  if (pathname.startsWith('/payments')) {
    return { name: 'Gold', breadcrumb: 'Management / Gold', icon: <CurrencyDollar size={20} weight='duotone' /> }
  }
  if (pathname.startsWith('/dollar-payments')) {
    return { name: 'Dollar', breadcrumb: 'Finance / Dollar', icon: <CurrencyDollar size={20} weight='duotone' /> }
  }
  if (pathname.startsWith('/sells')) {
    return { name: 'Sells', breadcrumb: 'Finances / Sells', icon: <CurrencyDollar size={20} weight='duotone' /> }
  }
  return { name: 'Dashboard', breadcrumb: 'Dashboard', icon: <House size={20} weight='duotone' /> }
}

function AppFooter() {
  return (
    <footer className='relative z-10 h-14 w-full shrink-0 border-t border-white/5 bg-black/50 backdrop-blur-sm'>
      <div className='flex h-full w-full items-center justify-center px-4 sm:px-6 lg:px-12 2xl:px-16'>
        <div className='flex items-center justify-center'>
          <p className='text-xs text-neutral-500'>
            <span
              className='inline-flex items-center gap-1.5 font-semibold uppercase text-white/60'
              style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.25em' }}
            >
              <span>THE</span>
              <span className='relative -top-[1px] text-[9px] leading-none text-purple-500'>●</span>
              <span>BAKERS</span>
            </span>{' '}
            <span className='mx-1 text-white/30'>|</span>
            <span className=' tracking-wide text-neutral-500'>
            Built for internal management
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}

export function App() {
  return (
    <div className='flex min-h-screen w-full'>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </div>
  )
}
