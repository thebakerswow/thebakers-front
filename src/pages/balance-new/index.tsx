import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '../../context/auth-context'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import { getTrackedTeamRoles, shouldShowBalanceFilter } from '../../utils/role-utils'
import { GBankListNew } from './gbank-list-new'
import { BalanceControlTableNew } from './balance-control-table-new'

export function NewBalancePage() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [isDolar, setIsDolar] = useState<boolean>(false)
  const [error, setError] = useState<ErrorDetails | null>(null)
  
  const { userRoles = [], idDiscord, loading: authLoading } = useAuth()

  const shouldShowFilter = useMemo(() => shouldShowBalanceFilter(userRoles), [userRoles])

  const tenTeams = [
    import.meta.env.VITE_TEAM_MPLUS,
    import.meta.env.VITE_TEAM_LEVELING,
    import.meta.env.VITE_TEAM_GARCOM,
    import.meta.env.VITE_TEAM_CONFEITEIROS,
    import.meta.env.VITE_TEAM_JACKFRUIT,
    import.meta.env.VITE_TEAM_INSANOS,
    import.meta.env.VITE_TEAM_APAE,
    import.meta.env.VITE_TEAM_LOSRENEGADOS,
    import.meta.env.VITE_TEAM_PADEIRINHO,
    import.meta.env.VITE_TEAM_MILHARAL,
  ]

  const isChefe = userRoles.includes(import.meta.env.VITE_TEAM_CHEFE)
  const isMplus = userRoles.includes(import.meta.env.VITE_TEAM_MPLUS)

  const allowedTeams = useMemo(() => {
    // Se tem Chefe + M+, retorna apenas M+
    if (isChefe && isMplus) {
      return [import.meta.env.VITE_TEAM_MPLUS]
    }
    // Se tem apenas Chefe (sem M+), retorna todos os times
    if (isChefe) {
      return tenTeams
    }
    // Para outros usuários, retorna apenas os times que possuem
    return getTrackedTeamRoles(userRoles).filter((t) => tenTeams.includes(t))
  }, [isChefe, isMplus, userRoles])

  // Seleção inicial do time
  useEffect(() => {
    if (authLoading) return
    if (!shouldShowFilter) {
      if (idDiscord) setSelectedTeam(idDiscord)
      return
    }
    // Com filtro: se não houver time selecionado e houver times permitidos, seleciona o primeiro
    if (!selectedTeam && allowedTeams.length > 0) {
      setSelectedTeam(allowedTeams[0])
    }
  }, [authLoading, shouldShowFilter, idDiscord, selectedTeam, allowedTeams])

  const handleError = useCallback((error: ErrorDetails | null) => setError(error), [])

  const isLoading = authLoading

  if (isLoading) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <span className='inline-block h-10 w-10 animate-spin rounded-full border-4 border-purple-300/30 border-t-purple-400' />
      </div>
    )
  }

  return (
    <div className='flex h-full min-h-0 w-full flex-col px-6 pb-8 pt-6 md:px-10'>
      {error && <ErrorComponent error={error} onClose={() => setError(null)} />}
      <div className='grid min-h-0 w-full flex-1 grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='min-h-0 h-full lg:col-span-2'>
          {selectedTeam && (
            <BalanceControlTableNew
              selectedTeam={selectedTeam}
              selectedDate={selectedDate}
              setSelectedTeam={setSelectedTeam}
              setSelectedDate={setSelectedDate}
              isDolar={isDolar}
              setIsDolar={setIsDolar}
              onError={handleError}
              allowedTeams={allowedTeams}
              hideTeamSelector={!shouldShowFilter}
            />
          )}
        </div>
        <div className='min-h-0 h-full'>
          <GBankListNew onError={handleError} selectedTeam={selectedTeam} />
        </div>
      </div>
    </div>
  )
}


