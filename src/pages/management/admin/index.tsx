import { useEffect, useRef, useState } from 'react'
import { BalanceControlTable } from './balance-control-table'
import { GBanksTable } from './gbanks-control'
import { VerifyTable } from './verify-table'

export function AdminPage() {
  const [_, setOpenRowIndex] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTeam, setSelectedTeam] = useState('')
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenRowIndex(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className='absolute inset-0 m-8 flex items-center justify-center gap-10 overflow-y-auto rounded-xl bg-zinc-700 text-gray-100 shadow-2xl scrollbar-thin'>
      {/* Primeira Tabela */}
      <BalanceControlTable
        selectedTeam={selectedTeam}
        selectedDate={selectedDate}
        setSelectedTeam={setSelectedTeam}
        setSelectedDate={setSelectedDate}
      />
      {/* Segunda Tabela */}
      <GBanksTable />

      {/* Terceira Tabela */}
      <VerifyTable />
    </div>
  )
}
