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
import { FullRaidsNa } from './pages/bookings-na'
import { RunDetails } from './pages/bookings-na/run'
import { Login } from './pages/login'
import { AuthCallback } from './pages/callback'
import { AuthProvider } from './context/auth-context' // Importe o AuthProvider
import { useAuth } from './context/auth-context'
import { ErrorPage } from './pages/error-pages/not-found'
import { AccessDenied } from './pages/error-pages/access-denied'
import { LoginErro } from './pages/error-pages/login-erro'

// Componente para proteger rotas privadas
function PrivateRoute({ element }: { element: JSX.Element }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-400'></div>
      </div>
    )
  }

  return isAuthenticated ? element : <Navigate to='/' />
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
                  element={<PrivateRoute element={<Balance />} />}
                />
                <Route
                  path='/management-teams'
                  element={<PrivateRoute element={<TeamsManagement />} />}
                />
                <Route
                  path='/attendance'
                  element={<PrivateRoute element={<Attendance />} />}
                />
                <Route
                  path='/bookings-na'
                  element={<PrivateRoute element={<FullRaidsNa />} />}
                />
                <Route
                  path='/bookings-na/run/:id'
                  element={<PrivateRoute element={<RunDetails />} />}
                />

                {/* Rota catch-all */}
                <Route path='*' element={<ErrorPage />} />
              </Routes>
            </main>
          </div>
        </AuthProvider>
      </Router>
    </div>
  )
}
