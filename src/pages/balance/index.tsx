import { useState } from 'react'
import { BalanceDataGrid } from './balance-data-grid'
import { BalanceTeamFilter } from '../../components/balance-team-filter'
import { WeekRangeFilter } from './week-range-filter'

export function BalancePage() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [teams, setTeams] = useState<
    Array<{ id_discord: string; team_name: string }>
  >([])
  const [isLoadingTeams, setIsLoadingTeams] = useState(false)
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>()

  return (
    <div className='relative mx-8 flex min-h-screen w-full flex-col'>
      <div className='relative mx-4 mt-8 flex flex-wrap items-center justify-between'>
        <BalanceTeamFilter
          selectedTeam={selectedTeam}
          teams={teams}
          isLoadingTeams={isLoadingTeams}
          onSelectTeam={setSelectedTeam}
        />
        <WeekRangeFilter onChange={setDateRange} />
      </div>
      <BalanceDataGrid
        selectedTeam={selectedTeam}
        setTeams={setTeams}
        setIsLoadingTeams={setIsLoadingTeams}
        dateRange={dateRange}
      />
    </div>
  )
}
