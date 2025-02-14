import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { Header } from './components/header'
import { HomePage } from './pages/home'
import { Balance } from './pages/balance'
import { TeamsManagement } from './pages/management/teams'
import { Attendance } from './pages/management/attendance'
import { FullRaidsNa } from './pages/bookings-na/full-raids'
import { CurvesNa } from './pages/bookings-na/curves'
import { MythicRaidsNa } from './pages/bookings-na/mythic-raids'
import { LegacyNa } from './pages/bookings-na/legacy'
import { RunDetails } from './pages/bookings-na/full-raids/run/run-details'
import { Login } from './pages/login'
import { AuthCallback } from './pages/callback'
import { AuthProvider } from './context/auth-context' // Importe o AuthProvider
import { useAuth } from './context/auth-context'
import { ErrorPage } from './pages/erro'

// Componente para proteger rotas privadas
function PrivateRoute({ element }: { element: JSX.Element }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to='/' /> // Redireciona para o login se não estiver autenticado
  }

  return element
}

export function App() {
  return (
    <div className='flex h-full'>
      <Router>
        <AuthProvider>
          <div className='flex flex-col flex-grow'>
            <Header />
            <main className='bg-zinc-300 relative flex-grow flex justify-center overflow-y-auto'>
              <Routes>
                <Route path='/' element={<Login />} />
                <Route path='/login/callback' element={<AuthCallback />} />
                <Route path='/erro' element={<ErrorPage />} />
                <Route path='*' element={<ErrorPage />} />
                {/* Rotas privadas - exigem autenticação */}
                <Route
                  path='/home'
                  element={<PrivateRoute element={<HomePage />} />}
                />
                <Route
                  path='/balance'
                  element={<PrivateRoute element={<Balance />} />}
                />
                <Route
                  path='/management-teams'
                  element={<PrivateRoute element={<TeamsManagement />} />}
                />
                <Route
                  path='/freelancers'
                  element={<PrivateRoute element={<Attendance />} />}
                />
                <Route
                  path='/full-raids-na'
                  element={<PrivateRoute element={<FullRaidsNa />} />}
                />
                <Route
                  path='/curves-na'
                  element={<PrivateRoute element={<CurvesNa />} />}
                />
                <Route
                  path='/mythic-raids-na'
                  element={<PrivateRoute element={<MythicRaidsNa />} />}
                />
                <Route
                  path='/legacy-na'
                  element={<PrivateRoute element={<LegacyNa />} />}
                />
                <Route
                  path='/full-raids-na/run/'
                  element={<PrivateRoute element={<RunDetails />} />}
                />
              </Routes>
            </main>
          </div>
        </AuthProvider>
      </Router>
    </div>
  )
}
