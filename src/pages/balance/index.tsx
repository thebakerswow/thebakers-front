import { BalanceDataGrid } from './balance-data-grid'

export function Balance() {
  return (
    <div
      className='bg-zinc-700 text-gray-100 absolute inset-0 flex flex-col
    rounded-xl shadow-2xl m-8 overflow-y-auto scrollbar-thin justify-center items-center'
    >
      <BalanceDataGrid />
    </div>
  )
}
