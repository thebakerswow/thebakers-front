import { useEffect, useState } from 'react'
import { RunsDataGrid } from './runs-data-grid'
import { DateFilter } from './date-filter'
import { format } from 'date-fns'
import { UserPlus } from '@phosphor-icons/react'
import { AddRun } from '../../components/add-run'
import { useAuth } from '../../context/auth-context'
import { api } from '../../services/axiosConfig'
import axios from 'axios'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import { RunData } from '../../types/runs-interface'
import { Modal } from '../../components/modal'

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

  async function fetchRuns(isUserRequest: boolean) {
    // Ativa loading apenas se for requisição do usuário e houver data selecionada
    if (isUserRequest && selectedDate) {
      setIsLoading(true)
    }

    try {
      if (!selectedDate) {
        setRows([])
        return
      }

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
          ? runs.map((run: any) => ({
              ...run,
              buyersCount: `${run.maxBuyers - run.slotAvailable}/${run.maxBuyers}`,
            }))
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
      if (isUserRequest) {
        setIsLoading(false) // Desativa loading apenas para requisições do usuário
      }
    }
  }

  if (error) {
    return (
      <Modal onClose={() => setError(null)}>
        <ErrorComponent error={error} onClose={() => setError(null)} />
      </Modal>
    )
  }

  useEffect(() => {
    fetchRuns(true) // Requisição inicial (usuário)

    const interval = setInterval(() => {
      fetchRuns(false) // Pooling (não mostra loading)
    }, 20000)

    return () => clearInterval(interval)
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
    <div className='m-8 flex w-full flex-col items-center justify-center rounded-xl bg-zinc-700 font-semibold text-gray-100 shadow-2xl'>
      <DateFilter onDaySelect={onDaySelect} />
      <div className='container mx-auto mt-2 p-4'>
        <div className='mb-2 flex items-center justify-between'>
          {/* Apenas Chefe de Cozinha pode ver */}
          {hasRequiredRole(['1101231955120496650']) && (
            <button
              className='flex items-center justify-center gap-2 rounded-md bg-red-400 p-2 text-gray-100 hover:bg-red-500'
              onClick={handleOpenAddRun}
            >
              <UserPlus size={18} />
              Add Run
            </button>
          )}

          <h1 className='mr-24 flex-grow text-center text-2xl font-bold'>
            NA Raids
          </h1>
        </div>

        <RunsDataGrid
          data={rows}
          isLoading={isLoading}
          onDeleteSuccess={() => fetchRuns(true)}
        />

        {isAddRunOpen && (
          <AddRun
            onClose={handleCloseAddRun}
            onRunAddedReload={() => fetchRuns(true)}
          />
        )}
      </div>
    </div>
  )
}
