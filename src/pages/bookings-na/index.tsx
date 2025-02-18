// FullRaidsNa.tsx
import { useEffect, useState } from 'react'
import { RunsDataGrid } from './runs-data-grid'
import { DateFilter } from './date-filter'
import { format } from 'date-fns'
import { UserPlus } from '@phosphor-icons/react'
import { AddRun } from '../../components/add-run'
import axios from 'axios'
import { RunData } from './run'

export function FullRaidsNa() {
  const [rows, setRows] = useState<RunData[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isAddRunOpen, setIsAddRunOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Função para buscar os runs
  async function fetchRuns() {
    if (!selectedDate) {
      setRows([])
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.get(
        import.meta.env.VITE_GET_RUN_URL || 'http://localhost:8000/v1/run',
        {
          params: { date: format(selectedDate, 'yyyy-MM-dd') },
          headers: {
            APP_TOKEN: import.meta.env.VITE_APP_TOKEN,
            Authorization: `Bearer ${sessionStorage.getItem('jwt')}`,
          },
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
      console.error('Erro ao buscar runs:', error)
      setRows([])
    } finally {
      setIsLoading(false)
    }
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
          <button
            className='flex items-center gap-2 bg-red-400 text-gray-100 hover:bg-red-500 rounded-md p-2 justify-center'
            onClick={handleOpenAddRun}
          >
            <UserPlus size={18} />
            Add Run
          </button>
          <h1 className='text-2xl font-bold text-center flex-grow mr-24'>
            NA Raids
          </h1>
        </div>

        <RunsDataGrid data={rows} isLoading={isLoading} />

        {isAddRunOpen && (
          <AddRun
            onClose={handleCloseAddRun}
            onRunAddedReload={fetchRuns} // Passa a função para recarregar a lista
          />
        )}
      </div>
    </div>
  )
}
