import { useState } from 'react'
import { RunsDataGrid } from './runs-data-grid'
import { DateFilter } from './date-filter'
import { bookingData, RunData } from '../../../assets/runs-data'
import { format, parseISO } from 'date-fns'
import { UserPlus } from '@phosphor-icons/react'
import { InputRun } from './input-run'

export function FullRaidsNa() {
  const [rows, setRows] = useState<RunData[]>(bookingData)
  const [isAddRunOpen, setIsAddRunOpen] = useState(false)

  function handleOpenAddRun() {
    setIsAddRunOpen(true)
  }
  function handleCloseAddRun() {
    setIsAddRunOpen(false)
  }

  function onDaySelect(day: Date | null) {
    if (day) {
      const filteredRows = bookingData.filter((row) => {
        const rowDate = parseISO(row.date)
        return format(rowDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      })
      setRows(filteredRows)
    } else {
      setRows(bookingData)
    }
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

        <RunsDataGrid data={rows} />

        {isAddRunOpen && <InputRun onClose={handleCloseAddRun} />}
      </div>
    </div>
  )
}
