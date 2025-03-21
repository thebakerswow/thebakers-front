import { BalanceDataGrid } from './balance-data-grid'

export function Balance() {
  return (
    <div className='absolute inset-0 m-8 flex flex-col items-center justify-center overflow-y-auto rounded-xl bg-zinc-700 text-gray-100 shadow-2xl scrollbar-thin'>
      <BalanceDataGrid />
    </div>
  )
}
