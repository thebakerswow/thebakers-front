import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { Header } from './components/header'
import { HomePage } from './pages/home'
import { BalancePage } from './pages/balance'
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
import { Register } from './pages/register'
import backgroundTeste from './assets/background_teste.png'
import { CheckAccess } from './pages/error-pages/check-access'
import ManagementServices from './pages/management/management-services'
import { KeysPage } from './pages/keys'
import { KeyDetails } from './pages/keys/key-details'
import { LevelingPage } from './pages/leveling'
import { LevelingDetails } from './pages/leveling/leveling-details'
import { SchedulePage } from './pages/schedule'
import { ExternalHomePage } from './pages/external/home'
import { ExternalSchedulePage } from './pages/external/schedule'
import { DomainRouter } from './components/domain-router'

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

export function App() {
  return (
    <div className='flex h-full'>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <div className='flex flex-grow flex-col'>
            <Header />
            <main
              className='relative flex h-screen w-screen justify-center overflow-hidden bg-cover'
              style={{ backgroundImage: `url(${backgroundTeste})` }}
            >
              <DomainRouter>
                <Routes>
                  {/* Rotas públicas */}
                  <Route path='/' element={<Login />} />
                  <Route path='/login/callback' element={<AuthCallback />} />
                  <Route path='/login/error' element={<LoginErro />} />
                  <Route path='/access-denied' element={<AccessDenied />} />
                  <Route path='/register' element={<Register />} />

                  {/* Rotas externas (sem autenticação) */}
                  <Route path='/external' element={<ExternalHomePage />} />
                  <Route
                    path='/external/schedule'
                    element={<ExternalSchedulePage />}
                  />

                  {/* Rotas privadas */}
                  <Route
                    path='/home'
                    element={<PrivateRoute element={<HomePage />} />}
                  />
                  <Route
                    path='/balance'
                    element={<PrivateRoute element={<BalancePage />} />}
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
                    path='/schedule'
                    element={<PrivateRoute element={<SchedulePage />} />}
                  />

                  {/* Rota catch-all */}
                  <Route path='*' element={<ErrorPage />} />
                </Routes>
              </DomainRouter>
            </main>
          </div>
        </AuthProvider>
      </Router>
    </div>
  )
}
