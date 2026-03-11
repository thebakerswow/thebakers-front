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
  UsersFour,
} from '@phosphor-icons/react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom'
import { Header } from './components/header'
import { HomePage } from './pages/home'
import { BalancePageRouter } from './pages/balance'
import TeamsManagement from './pages/management/teams'
import { FullRaidsNa } from './pages/bookings-na'
import { RunDetails } from './pages/bookings-na/run'
import { Login } from './pages/login'
import { AuthCallback } from './pages/callback'
import { AuthProvider } from './context/auth-context' // Importe o AuthProvider
import { useAuth } from './context/auth-context'
import { ErrorPage } from './pages/error-pages/not-found'
import { AccessDenied } from './pages/error-pages/access-denied'
import { LoginErro } from './pages/error-pages/login-erro'
import { AdminPage } from './pages/management/admin'
import { CheckAccess } from './pages/error-pages/check-access'
import ManagementServices from './pages/management/management-services'
import { KeysPage } from './pages/special-runs/keys-page'
import { KeyDetails } from './pages/special-runs/keys-details-page'
import { LevelingPage } from './pages/special-runs/leveling-page'
import { LevelingDetails } from './pages/special-runs/leveling-details-page'
import { DelvesPage } from './pages/special-runs/delves-page'
import { DelvesDetails } from './pages/special-runs/delves-details-page'
import { AchievementsPage } from './pages/special-runs/achievements-page'
import { AchievementsDetails } from './pages/special-runs/achievements-details-page'
import { RequestsPage } from './pages/requests'
import { MyRequestsPage } from './pages/my-requests'
import { PaymentsPage } from './pages/management/payments'
import { ReceiptsPage } from './pages/receipts'
import { SellsPage } from './pages/sells'
import { PurpleGlowBackground } from './components/purple-glow-background'
import './styles/global.css'

// Componente para proteger rotas privadas
function PrivateRoute({ element }: { element: JSX.Element }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-purple-400'></div>
      </div>
    )
  }

  return isAuthenticated ? element : <Navigate to='/' />
}

function AppContent() {
  const { isAuthenticated, username, idDiscord } = useAuth()
  const { pathname } = useLocation()

  return (
    <div className='relative isolate flex min-h-screen w-full flex-grow flex-col bg-[#060608]'>
      <PurpleGlowBackground />
      <div className='relative z-10 flex min-h-screen w-full flex-1'>
        {isAuthenticated ? <Header /> : null}
        <main
          className={`relative flex min-h-screen flex-1 justify-center ${
            isAuthenticated ? 'pt-[64px] md:pt-0' : ''
          }`}
        >
          <div className='flex min-h-screen w-full flex-col'>
            {isAuthenticated ? (
              <TopInfoBar username={username} idDiscord={idDiscord} pathname={pathname} />
            ) : null}
            <div className='flex-1'>
              <Routes>
              {/* Rotas públicas */}
              <Route path='/' element={<Login />} />
              <Route path='/login/callback' element={<AuthCallback />} />
              <Route path='/login/error' element={<LoginErro />} />
              <Route path='/access-denied' element={<AccessDenied />} />

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
                path='/management-teams'
                element={<PrivateRoute element={<TeamsManagement />} />}
              />
              <Route
                path='/bookings-na'
                element={<PrivateRoute element={<FullRaidsNa />} />}
              />
              <Route
                path='/bookings-na/run/:id'
                element={<PrivateRoute element={<RunDetails />} />}
              />
              <Route
                path='/bookings-na/key/:id'
                element={<PrivateRoute element={<KeyDetails />} />}
              />
              <Route
                path='/bookings-na/leveling/:id'
                element={<PrivateRoute element={<LevelingDetails />} />}
              />
              <Route
                path='/bookings-na/delves/:id'
                element={<PrivateRoute element={<DelvesDetails />} />}
              />
              <Route
                path='/bookings-na/achievements/:id'
                element={<PrivateRoute element={<AchievementsDetails />} />}
              />
              <Route
                path='/admin'
                element={<PrivateRoute element={<AdminPage />} />}
              />
              <Route
                path='/check-access'
                element={<PrivateRoute element={<CheckAccess />} />}
              />
              <Route
                path='/services'
                element={<PrivateRoute element={<ManagementServices />} />}
              />
              <Route
                path='/keys'
                element={<PrivateRoute element={<KeysPage />} />}
              />
              <Route
                path='/leveling'
                element={<PrivateRoute element={<LevelingPage />} />}
              />
              <Route
                path='/delves'
                element={<PrivateRoute element={<DelvesPage />} />}
              />
              <Route
                path='/achievements'
                element={<PrivateRoute element={<AchievementsPage />} />}
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
                element={<PrivateRoute element={<ReceiptsPage />} />}
              />
              <Route
                path='/sells'
                element={<PrivateRoute element={<SellsPage />} />}
              />

              {/* Rota catch-all */}
              <Route path='*' element={<ErrorPage />} />
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
    <div className='hidden h-20 items-center justify-between border-b border-white/10 bg-black/50 px-6 backdrop-blur-sm md:flex'>
      <div className='flex items-center gap-3'>
        <span className='flex h-11 w-11 items-center justify-center rounded-xl border border-purple-400/25 bg-gradient-to-b from-[#2a1242] to-[#140821] shadow-[0_8px_20px_rgba(76,29,149,0.35)]'>
          <span className='text-purple-300'>{screen.icon}</span>
        </span>
        <div className='flex flex-col'>
          <span className='text-[11px] font-medium uppercase tracking-wide text-neutral-500'>
            {screen.name}
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
    return { name: 'Admin', icon: <Shield size={20} weight='duotone' /> }
  }
  if (pathname.startsWith('/home')) {
    return { name: 'Home', icon: <House size={20} weight='duotone' /> }
  }
  if (pathname.startsWith('/balance')) {
    return { name: 'Balance', icon: <Coins size={20} weight='duotone' /> }
  }
  if (pathname.startsWith('/management-teams')) {
    return { name: 'Teams', icon: <UsersFour size={20} weight='duotone' /> }
  }
  if (pathname.startsWith('/bookings-na/run/')) {
    return { name: 'Run Details', icon: <CalendarBlank size={20} weight='duotone' /> }
  }
  if (pathname.startsWith('/bookings-na')) {
    return { name: 'Bookings', icon: <CalendarBlank size={20} weight='duotone' /> }
  }
  if (pathname.startsWith('/keys')) {
    return { name: 'Keys', icon: <Key size={20} weight='duotone' /> }
  }
  if (pathname.startsWith('/leveling')) {
    return { name: 'Leveling', icon: <Sword size={20} weight='duotone' /> }
  }
  if (pathname.startsWith('/delves')) {
    return { name: 'Delves', icon: <Sword size={20} weight='duotone' /> }
  }
  if (pathname.startsWith('/achievements')) {
    return { name: 'Achievements', icon: <Trophy size={20} weight='duotone' /> }
  }
  if (pathname.startsWith('/services')) {
    return { name: 'Services', icon: <Briefcase size={20} weight='duotone' /> }
  }
  if (pathname.startsWith('/requests')) {
    return { name: 'Requests', icon: <ClipboardText size={20} weight='duotone' /> }
  }
  if (pathname.startsWith('/my-requests')) {
    return { name: 'My Requests', icon: <User size={20} weight='duotone' /> }
  }
  if (pathname.startsWith('/payments')) {
    return { name: 'Gold', icon: <CurrencyDollar size={20} weight='duotone' /> }
  }
  if (pathname.startsWith('/receipts')) {
    return { name: 'Dollar', icon: <CurrencyDollar size={20} weight='duotone' /> }
  }
  if (pathname.startsWith('/sells')) {
    return { name: 'Sells', icon: <CurrencyDollar size={20} weight='duotone' /> }
  }
  return { name: 'Dashboard', icon: <House size={20} weight='duotone' /> }
}

function AppFooter() {
  return (
    <footer className='relative z-10 border-t border-white/5 bg-black/50 backdrop-blur-sm'>
      <div className='w-full px-4 py-4 sm:px-6 lg:px-12 2xl:px-16'>
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
    <div className='flex min-h-screen'>
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
