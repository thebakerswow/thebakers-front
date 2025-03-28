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
import Button from '@mui/material/Button'
import { Modal as MuiModal, Box } from '@mui/material'

export function FullRaidsNa() {
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [rows, setRows] = useState<RunData[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isAddRunOpen, setIsAddRunOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { userRoles } = useAuth()

  // Verifica se o usuário possui o papel necessário
  const hasRequiredRole = (requiredRoles: string[]) =>
    requiredRoles.some((required) => userRoles.includes(required.toString()))

  // Busca os dados das corridas na API
  const fetchRuns = async (isUserRequest: boolean) => {
    if (isUserRequest && selectedDate) setIsLoading(true)

    try {
      if (!selectedDate) {
        setRows([])
        return
      }

      const { data } = await api.get('/run', {
        params: { date: format(selectedDate, 'yyyy-MM-dd') },
      })

      setRows(
        (data.info || []).map((run: any) => ({
          ...run,
          buyersCount: `${run.maxBuyers - run.slotAvailable}/${run.maxBuyers}`,
        }))
      )
    } catch (error) {
      const errorDetails = axios.isAxiosError(error)
        ? {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          }
        : { message: 'Erro inesperado', response: error }
      console.error('Erro:', errorDetails)
      setError(errorDetails)
    } finally {
      if (isUserRequest) setIsLoading(false)
    }
  }

  // Busca inicial e configuração de polling
  useEffect(() => {
    fetchRuns(true)

    const interval = setInterval(() => fetchRuns(false), 20000)
    return () => clearInterval(interval)
  }, [selectedDate])

  if (error) {
    return (
      <MuiModal open={!!error} onClose={() => setError(null)}>
        <Box className='absolute left-1/2 top-1/2 w-96 -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-gray-400 p-4 shadow-lg'>
          <ErrorComponent error={error} onClose={() => setError(null)} />
        </Box>
      </MuiModal>
    )
  }

  return (
    <div className='flex min-h-screen w-full flex-col items-center justify-center'>
      <DateFilter onDaySelect={setSelectedDate} />
      <div
        className='container mx-auto mt-2 flex flex-col p-4'
        style={{
          minHeight: '500px',
          height: 'calc(100vh - 200px)', // Ajusta a altura para ocupar o espaço disponível
        }}
      >
        {/* Deve possuir o papel de Chefe de Cozinha para adicionar corridas. */}
        {hasRequiredRole(['1101231955120496650']) && (
          <div className='mb-2 self-start'>
            <Button
              variant='contained'
              sx={{
                backgroundColor: 'rgb(239, 68, 68)',
                '&:hover': { backgroundColor: 'rgb(248, 113, 113)' },
              }}
              startIcon={<UserPlus size={18} />}
              onClick={() => setIsAddRunOpen(true)}
            >
              Add Run
            </Button>
          </div>
        )}

        <div className='mb-4 flex flex-1 flex-col'>
          <RunsDataGrid
            data={rows}
            isLoading={isLoading}
            onDeleteSuccess={() => fetchRuns(true)}
          />
        </div>

        {isAddRunOpen && (
          <AddRun
            onClose={() => setIsAddRunOpen(false)}
            onRunAddedReload={() => fetchRuns(true)}
          />
        )}
      </div>
    </div>
  )
}
