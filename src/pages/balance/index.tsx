import { useState } from 'react'
import { BalanceDataGrid } from './balance-data-grid'
import { BalanceTeamFilter } from '../../components/balance-team-filter'
import { WeekRangeFilter } from '../../components/week-range-filter'
import { Button } from '@mui/material'
import { useAuth } from '../../context/auth-context'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'

export function BalancePage() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<
    { start: string; end: string } | undefined
  >(undefined)
  const [isDolar, setIsDolar] = useState(false)
  const [error, setError] = useState<ErrorDetails | null>(null)
  const { userRoles = [] } = useAuth()
  const freelancerRole = import.meta.env.VITE_TEAM_FREELANCER
  const isOnlyFreelancer =
    userRoles.length === 1 && userRoles[0] === freelancerRole

  const handleError = (error: ErrorDetails | null) => {
    setError(error)
  }

  return (
    <div className='flex w-full flex-col overflow-auto px-10 pb-10'>
      {error && <ErrorComponent error={error} onClose={() => setError(null)} />}
      <div className='mx-4 mt-8 flex flex-wrap items-center justify-between'>
        <div className='flex items-center gap-2'>
          <BalanceTeamFilter
            selectedTeam={selectedTeam}
            onChange={setSelectedTeam}
            onError={handleError}
          />
          {!isOnlyFreelancer && (
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
          )}
        </div>
        <WeekRangeFilter onChange={setDateRange} />
      </div>
      <BalanceDataGrid
        selectedTeam={selectedTeam}
        dateRange={dateRange}
        is_dolar={isDolar}
        onError={handleError}
      />
    </div>
  )
}
