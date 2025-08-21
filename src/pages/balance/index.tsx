import { useState, useEffect } from 'react'
import { BalanceDataGrid } from './balance-data-grid'
import { BalanceTeamFilter } from '../../components/balance-team-filter'
import { WeekRangeFilter } from '../../components/week-range-filter'
import { Button, CircularProgress } from '@mui/material'
import { useAuth } from '../../context/auth-context'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'

export function BalancePage() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<
    { start: string; end: string } | undefined
  >(undefined)
  const [isDolar, setIsDolar] = useState(false)
  const [error, setError] = useState<ErrorDetails | null>(null)
  const { userRoles = [], idDiscord, loading: authLoading } = useAuth()
  const restrictedRoles = [
    import.meta.env.VITE_TEAM_FREELANCER,
    import.meta.env.VITE_TEAM_ADVERTISER,
  ]
  const isRestrictedUser =
    userRoles.some((role) => restrictedRoles.includes(role)) &&
    userRoles.length > 0

  // Simplificado: Inicializa selectedTeam uma única vez quando auth estiver pronto
  useEffect(() => {
    if (authLoading || selectedTeam) return // Se já tem selectedTeam, não faz nada

    if (isRestrictedUser && idDiscord) {
      setSelectedTeam(idDiscord)
    }
    // Para não-restrito, aguarda o BalanceTeamFilter definir via handleTeamChange
  }, [authLoading, isRestrictedUser, idDiscord, selectedTeam])

  const handleError = (error: ErrorDetails | null) => {
    setError(error)
  }

  const handleTeamChange = (team: string | null) => {
    setSelectedTeam(team)
  }

  // Loading mais simples: só mostra se auth está carregando OU se usuário restrito ainda não tem selectedTeam
  const isLoading = authLoading || (isRestrictedUser && !selectedTeam)

  if (isLoading) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <CircularProgress />
      </div>
    )
  }

  return (
    <div className='flex w-full flex-col overflow-auto px-10 pb-10'>
      {error && <ErrorComponent error={error} onClose={() => setError(null)} />}
      <div className='mx-4 mt-8 flex flex-wrap items-center justify-between'>
        <div className='flex items-center gap-2'>
          <BalanceTeamFilter
            selectedTeam={selectedTeam}
            onChange={handleTeamChange}
            onError={handleError}
          />
          <Button
            variant='contained'
            sx={{
              height: '40px',
              minWidth: '80px',
              marginTop: '16px',
              backgroundColor: isDolar ? '#ef4444' : '#FFD700',
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
        onError={handleError}
      />
    </div>
  )
}
