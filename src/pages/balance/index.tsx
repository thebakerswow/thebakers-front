import { useState } from 'react'
import { BalanceDataGrid } from './balance-data-grid'
import { BalanceTeamFilter } from '../../components/balance-team-filter'
import { WeekRangeFilter } from './week-range-filter'
import { Button } from '@mui/material'

export function BalancePage() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>()
  const [isDolar, setIsDolar] = useState(false)

  return (
    <div className='relative mx-8 flex min-h-screen w-full flex-col'>
      <div className='relative mx-4 mt-8 flex flex-wrap items-center justify-between'>
        <div className='flex items-center gap-2'>
          <BalanceTeamFilter
            selectedTeam={selectedTeam}
            onChange={setSelectedTeam}
          />
          <Button
            variant='contained'
            sx={{
              height: '40px',
              minWidth: '80px',
              marginTop: '16px',
              backgroundColor: isDolar ? '#ef4444' : '#FFD700', // vermelho para dólar, dourado para gold
              color: isDolar ? '#fff' : '#000',
              '&:hover': {
                backgroundColor: isDolar ? '#dc2626' : '#FFC300',
              },
            }}
            onClick={() => setIsDolar((prev) => !prev)}
          >
            {isDolar ? 'U$' : 'Gold'}
          </Button>
        </div>
        <WeekRangeFilter onChange={setDateRange} />
      </div>
      <BalanceDataGrid
        selectedTeam={selectedTeam}
        dateRange={dateRange}
        is_dolar={isDolar}
      />
    </div>
  )
}
