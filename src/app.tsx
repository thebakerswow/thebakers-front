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
import { Register } from './pages/register'
import backgroundTeste from './assets/background_teste.png'

// Componente para proteger rotas privadas
function PrivateRoute({ element }: { element: JSX.Element }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-red-400'></div>
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
          <div className='flex flex-grow flex-col'>
            <Header />
            <main
              className='relative flex flex-grow justify-center overflow-y-auto bg-cover bg-center'
              style={{ backgroundImage: `url(${backgroundTeste})` }}
            >
              <Routes>
                {/* Rotas públicas */}
                <Route path='/' element={<Login />} />
                <Route path='/login/callback' element={<AuthCallback />} />
                <Route path='/login/error' element={<LoginErro />} />
                <Route path='/access-denied' element={<AccessDenied />} />
                <Route path='/register' element={<Register />} />

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
                  path='/bookings-na'
                  element={<PrivateRoute element={<FullRaidsNa />} />}
                />
                <Route
                  path='/bookings-na/run/:id'
                  element={<PrivateRoute element={<RunDetails />} />}
                />
                <Route
                  path='/admin'
                  element={<PrivateRoute element={<AdminPage />} />}
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
