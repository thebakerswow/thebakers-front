import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
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

function ConditionalHeader() {
  const location = useLocation()

  if (location.pathname === '/' || location.pathname === '/login/callback') {
    return <Header variant='login' />
  }
  return <Header />
}

export function App() {
  return (
    <div className='flex h-full'>
      <Router>
        <div className='flex flex-col flex-grow'>
          <ConditionalHeader />
          <main className='bg-zinc-300 relative flex-grow flex justify-center overflow-y-auto'>
            <Routes>
              <Route path='/' element={<Login />} />
              <Route path='/login/callback' element={<AuthCallback />} />
              <Route path='/home' element={<HomePage />} />
              <Route path='/balance' element={<Balance />} />
              <Route path='/management-teams' element={<TeamsManagement />} />
              <Route path='/freelancers' element={<Attendance />} />
              <Route path='/full-raids-na' element={<FullRaidsNa />} />
              <Route path='/curves-na' element={<CurvesNa />} />
              <Route path='/mythic-raids-na' element={<MythicRaidsNa />} />
              <Route path='/legacy-na' element={<LegacyNa />} />
              <Route
                path='/full-raids-na/run/'
                element={<RunDetails />}
              ></Route>
            </Routes>
          </main>
        </div>
      </Router>
    </div>
  )
}
