import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../services/axiosConfig'
import { BalanceControlTable } from './balance-control-table'
import { GBanksTable } from './gbanks-control'
import { VerifyTable } from './verify-table'

export function AdminPage() {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTeam, setSelectedTeam] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const navigate = useNavigate()

  // Function to check admin access
  async function checkAdminAccess() {
    try {
      const response = await api.get(
        `${import.meta.env.VITE_API_BASE_URL}/access/admin` ||
          'http://localhost:8000/v1/access/admin'
      )
      if (!response.data.info) {
        navigate('/') // Redirect to home if access is denied
      } else {
        setIsAuthorized(true)
      }
    } catch (error) {
      navigate('/') // Redirect to home in case of error
    }
  }

  useEffect(() => {
    checkAdminAccess()
  }, [])

  if (!isAuthorized) {
    return null // ou return <LoadingSpinner /> se quiser mostrar um loading
  }

  return (
    <div className='flex min-h-screen w-full items-center justify-around'>
      {/* Primeira Tabela */}
      <BalanceControlTable
        selectedTeam={selectedTeam}
        selectedDate={selectedDate}
        setSelectedTeam={setSelectedTeam}
        setSelectedDate={setSelectedDate}
      />
      {/* Segunda Tabela */}
      <GBanksTable />

      {/* Terceira Tabela */}
      <VerifyTable />
    </div>
  )
}
