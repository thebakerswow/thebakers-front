import { useState } from 'react'
import { RunsDataGrid } from './runs-data-grid'
import { DateFilter } from './date-filter'
import { bookingData, RowData } from '../../../assets/runs-data'
import { format, parseISO } from 'date-fns'
import { UserPlus } from '@phosphor-icons/react'
import { Modal } from '../../../components/modal'

export function FullRaidsNa() {
  const [rows, setRows] = useState<RowData[]>(bookingData)
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
        {isAddRunOpen && (
          <Modal onClose={handleCloseAddRun}>
            <div className='w-full max-w-[95vw] h-[450px] overflow-y-auto overflow-x-hidden flex flex-col'>
              <form action='' className='grid grid-cols-2 gap-4'>
                <input
                  type='text'
                  placeholder='Run Name'
                  className='col-span-2 p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition'
                />
                <input
                  type='text'
                  placeholder='Raid'
                  className='p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition'
                />
                <input
                  type='text'
                  placeholder='Status'
                  className='p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition'
                />
                <input
                  type='text'
                  placeholder='Date'
                  className='p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition'
                />
                <input
                  type='text'
                  placeholder='Time'
                  className='p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition'
                />

                <input
                  type='text'
                  placeholder='Max Buyers'
                  className='p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition'
                />
                <input
                  type='text'
                  placeholder='Difficulty'
                  className='p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition'
                />
                <input
                  type='text'
                  placeholder='Loot Type'
                  className='p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition'
                />
                <select className='p-2 font-normal border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition'>
                  <option value='' disabled selected hidden>
                    Team
                  </option>
                  <option value='team1'>Team 1</option>
                  <option value='team2'>Team 2</option>
                  <option value='team3'>Team 3</option>
                </select>
                <input
                  type='text'
                  placeholder='Gold Collector'
                  className='p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition'
                />
                <input
                  type='text'
                  placeholder='Raid Leader'
                  className='p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition'
                />
                <input
                  type='text'
                  placeholder='Note'
                  className='col-span-2 p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition'
                />
              </form>
              <button className='flex items-center gap-2 bg-red-400 text-gray-100 hover:bg-red-500 rounded-md p-2 mt-4 justify-center'>
                <UserPlus size={20} /> Add Run
              </button>
            </div>
          </Modal>
        )}
      </div>
    </div>
  )
}
