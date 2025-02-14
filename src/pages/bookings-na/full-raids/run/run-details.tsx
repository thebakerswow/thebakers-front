import { useState } from 'react'
import { RunInfo } from './run-info'
import { BuyersDataGrid } from './buyers-data-grid'
import { buyersData, RowData } from '../../../../assets/buyers-data'

export function RunDetails() {
  const [rows] = useState<RowData[]>(buyersData)

  return (
    <div
      className='bg-zinc-700 text-gray-100 absolute inset-0 flex flex-col
      rounded-xl shadow-2xl m-8 overflow-y-auto scrollbar-thin'
    >
      <RunInfo />
      <div className='container mx-auto mt-2 p-4'>
        <BuyersDataGrid data={rows} />
      </div>
    </div>
  )
}
