import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { checkAdminAccess } from '../../../services/api/auth'
import { BalanceControlTable } from './balance-control-table'
import { GBanksTable } from './gbanks-table'
import { VerifyTable } from './verify-table'
import LatestTransactions from '../../../components/latest-transactions'
import RunWithoutAttendanceTable from '../../../components/run-without-attendance-table'
import { ErrorDetails, ErrorComponent } from '../../../components/error-display'

export function AdminPage() {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTeam, setSelectedTeam] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isDolar, setIsDolar] = useState(false)
  const [error, setError] = useState<ErrorDetails | null>(null)
  const navigate = useNavigate()

  // Function to check admin access
  async function verifyAdminAccess() {
    try {
      const hasAccess = await checkAdminAccess()
      if (!hasAccess) {
        navigate('/') // Redirect to home if access is denied
      } else {
        setIsAuthorized(true)
      }
    } catch (error) {
      navigate('/') // Redirect to home in case of error
    }
  }

  const clearError = () => {
    setError(null)
  }

  const handleError = (error: ErrorDetails) => {
    setError(error)
  }

  useEffect(() => {
    verifyAdminAccess()
  }, [])

  if (!isAuthorized) {
    return null
  }

  return (
    <div className='flex w-full items-center justify-around gap-2'>
      {error && <ErrorComponent error={error} onClose={clearError} />}

      {/* Primeira Tabela */}
      <BalanceControlTable
        selectedTeam={selectedTeam}
        selectedDate={selectedDate}
        setSelectedTeam={setSelectedTeam}
        setSelectedDate={setSelectedDate}
        isDolar={isDolar}
        setIsDolar={setIsDolar}
        onError={handleError}
      />
      {/* Segunda Tabela */}
      <GBanksTable onError={handleError} />

      {/* Terceira Tabela */}
      <div className='h-[90%] min-w-[20%]'>
        <VerifyTable onError={handleError} />
        <LatestTransactions isDolar={isDolar} />
        <RunWithoutAttendanceTable />
      </div>
    </div>
  )
}
