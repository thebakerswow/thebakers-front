import { useState } from 'react'
import { BalanceDataGrid } from './balance-data-grid'
import { BalanceTeamFilter } from '../../components/balance-team-filter'
import { WeekRangeFilter } from './week-range-filter'

export function BalancePage() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>()

  return (
    <div className='relative mx-8 flex min-h-screen w-full flex-col'>
      <div className='relative mx-4 mt-8 flex flex-wrap items-center justify-between'>
        <BalanceTeamFilter
          selectedTeam={selectedTeam}
          onChange={setSelectedTeam}
        />
        <WeekRangeFilter onChange={setDateRange} />
      </div>
      <BalanceDataGrid selectedTeam={selectedTeam} dateRange={dateRange} />
    </div>
  )
}
