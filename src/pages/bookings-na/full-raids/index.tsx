import { useEffect, useState } from 'react'
import { RunsDataGrid } from './runs-data-grid'
import { DateFilter } from './date-filter'
import { format } from 'date-fns'
import { UserPlus } from '@phosphor-icons/react'
import { InputRun } from './input-run'
import axios from 'axios'
import { RunData } from './run/run-details'

export function FullRaidsNa() {
  const [rows, setRows] = useState<RunData[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isAddRunOpen, setIsAddRunOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (selectedDate) {
      setIsLoading(true)

      axios
        .get(
          import.meta.env.VITE_GET_RUN_URL || 'http://localhost:8000/v1/run',
          {
            params: { date: format(selectedDate, 'yyyy-MM-dd') },
            headers: {
              APP_TOKEN: import.meta.env.VITE_APP_TOKEN,
              Authorization: `Bearer ${sessionStorage.getItem('jwt')}`,
            },
          }
        )
        .then((response) => {
          console.log(response.data.info)
          const runs = response.data.info

          if (runs) {
            const formattedData = Array.isArray(runs)
              ? runs.map((run: any) => ({
                  ...run,
                }))
              : []

            setRows(formattedData)
          } else {
            setRows([])
          }
        })
        .catch((error) => {
          console.error('Erro ao buscar runs:', error)
          setRows([])
        })
        .finally(() => {
          setIsLoading(false) // Finaliza o loading
        })
    } else {
      setRows([])
    }
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

        {isAddRunOpen && <InputRun onClose={handleCloseAddRun} />}
      </div>
    </div>
  )
}
