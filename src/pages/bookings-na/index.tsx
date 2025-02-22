import { useEffect, useState } from 'react'
import { RunsDataGrid } from './runs-data-grid'
import { DateFilter } from './date-filter'
import { format } from 'date-fns'
import { UserPlus } from '@phosphor-icons/react'
import { AddRun } from '../../components/add-run'
import { RunData } from './run'
import { useAuth } from '../../context/auth-context'
import { api } from '../../services/axiosConfig'
import axios from 'axios'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'

export function FullRaidsNa() {
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [rows, setRows] = useState<RunData[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isAddRunOpen, setIsAddRunOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { userRoles } = useAuth()

  const hasRequiredRole = (requiredRoles: string[]): boolean => {
    return requiredRoles.some((required) =>
      userRoles.some((userRole) => userRole.toString() === required.toString())
    )
  }
  async function fetchRuns() {
    if (!selectedDate) {
      setRows([])
      return
    }

    setIsLoading(true)
    try {
      const response = await api.get(
        `${import.meta.env.VITE_API_BASE_URL}/run` ||
          'http://localhost:8000/v1/run',
        {
          params: { date: format(selectedDate, 'yyyy-MM-dd') },
        }
      )
      const runs = response.data.info
      if (runs) {
        const formattedData = Array.isArray(runs)
          ? runs.map((run: any) => ({ ...run }))
          : []
        setRows(formattedData)
      } else {
        setRows([])
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorDetails = {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        }
        console.error('Erro detalhado:', errorDetails)
        setError(errorDetails)
      } else {
        const genericError = {
          message: 'Erro inesperado',
          response: error,
        }
        console.error('Erro genérico:', error)
        setError(genericError)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (error) {
    return <ErrorComponent error={error} />
  }

  useEffect(() => {
    fetchRuns()
  }, [selectedDate])

  function onDaySelect(day: Date | null) {
    setSelectedDate(day)
  }

  function handleOpenAddRun() {
    setIsAddRunOpen(true)
  }

  function handleCloseAddRun() {
    setIsAddRunOpen(false)
  }

  return (
    <div className='bg-zinc-700 text-gray-100 w-full flex flex-col items-center justify-center font-semibold rounded-xl shadow-2xl m-8'>
      <DateFilter onDaySelect={onDaySelect} />
      <div className='container mx-auto mt-2 p-4'>
        <div className='flex items-center justify-between mb-2'>
          {/* Apenas Chefe de Cozinha pode ver */}
          {hasRequiredRole(['1101231955120496650']) && (
            <button
              className='flex items-center gap-2 bg-red-400 text-gray-100 hover:bg-red-500 rounded-md p-2 justify-center'
              onClick={handleOpenAddRun}
            >
              <UserPlus size={18} />
              Add Run
            </button>
          )}

          <h1 className='text-2xl font-bold text-center flex-grow mr-24'>
            NA Raids
          </h1>
        </div>

        <RunsDataGrid data={rows} isLoading={isLoading} />

        {isAddRunOpen && (
          <AddRun onClose={handleCloseAddRun} onRunAddedReload={fetchRuns} />
        )}
      </div>
    </div>
  )
}
