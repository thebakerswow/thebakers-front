import { useState, useEffect, useMemo } from 'react'
import { BalanceDataGrid } from './balance-data-grid'
import { BalanceTeamFilter } from '../../components/balance-team-filter'
import { WeekRangeFilter } from '../../components/week-range-filter'
import { Button, CircularProgress } from '@mui/material'
import { useAuth } from '../../context/auth-context'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import { shouldShowBalanceFilter, shouldShowUsGoldButton } from '../../utils/role-utils'

export function BalancePage() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<
    { start: string; end: string } | undefined
  >(undefined)
  const [isDolar, setIsDolar] = useState(false)
  const [error, setError] = useState<ErrorDetails | null>(null)
  const { userRoles = [], idDiscord, loading: authLoading } = useAuth()

  // Determina se deve mostrar o filtro baseado nas regras especificadas
  const shouldShowFilter = useMemo(() => shouldShowBalanceFilter(userRoles), [userRoles])

  // Determina se deve mostrar o botão US/Gold
  const shouldShowUsGoldButtonValue = useMemo(() => shouldShowUsGoldButton(userRoles), [userRoles])

  // Inicializa selectedTeam baseado nas regras
  useEffect(() => {
    if (authLoading) return // Aguarda o auth carregar

    if (!shouldShowFilter && idDiscord && !selectedTeam) {
      // Para usuários que não devem ver o filtro, usa o próprio ID como time selecionado
      setSelectedTeam(idDiscord)
    }
    // Para usuários que devem ver o filtro, aguarda o BalanceTeamFilter definir via handleTeamChange
  }, [authLoading, shouldShowFilter, idDiscord, selectedTeam])

  const handleError = (error: ErrorDetails | null) => {
    setError(error)
  }

  const handleTeamChange = (team: string | null) => {
    setSelectedTeam(team)
  }

  // Loading mais simples: só mostra se auth está carregando OU se usuário que não deve ver filtro ainda não tem selectedTeam
  const isLoading = authLoading || (!shouldShowFilter && !selectedTeam)

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
          {shouldShowUsGoldButtonValue && (
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
