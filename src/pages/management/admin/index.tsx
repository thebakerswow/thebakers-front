import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { checkAdminAccess } from './services/adminApi'
import { BalanceControlTable } from './components/BalanceControlTable'
import { GBanksTable } from './components/GbankTable'
import { VerifyTable } from './components/VerifyTable'
import LatestTransactions from './components/LatestTransactions'
import RunWithoutAttendanceTable from './components/RunsWithoutAttendance'
import { AdminPageSkeleton } from './components/AdminPageSkeleton'
import { ApiErrorDetails, handleApiError } from '../../../utils/apiErrorHandler'

export function AdminPage() {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTeam, setSelectedTeam] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isCheckingAccess, setIsCheckingAccess] = useState(true)
  const [isDolar, setIsDolar] = useState(false)
  const navigate = useNavigate()

  async function verifyAdminAccess() {
    try {
      const hasAccess = await checkAdminAccess()
      if (!hasAccess) {
        navigate('/')
      } else {
        setIsAuthorized(true)
      }
    } catch {
      navigate('/')
    } finally {
      setIsCheckingAccess(false)
    }
  }

  const handleError = (nextError: ApiErrorDetails) => {
    void handleApiError(nextError, nextError.message)
  }

  useEffect(() => {
    verifyAdminAccess()
  }, [])

  if (isCheckingAccess) {
    return <AdminPageSkeleton />
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <div className='flex w-full flex-col gap-4 px-6 pb-10 pt-6 text-white md:px-10'>
      <div className='flex w-full items-start gap-4'>
        <section className='w-[55%] rounded-xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-sm'>
          <BalanceControlTable
            selectedTeam={selectedTeam}
            selectedDate={selectedDate}
            setSelectedTeam={setSelectedTeam}
            setSelectedDate={setSelectedDate}
            isDolar={isDolar}
            setIsDolar={setIsDolar}
            onError={handleError}
          />
        </section>

        <section className='w-[35%] rounded-xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-sm'>
          <GBanksTable onError={handleError} />
        </section>

        <section className='min-h-[85vh] min-w-[10%] rounded-xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-sm'>
          <VerifyTable onError={handleError} />
          <LatestTransactions isDolar={isDolar} />
          <RunWithoutAttendanceTable />
        </section>
      </div>
    </div>
  )
}
