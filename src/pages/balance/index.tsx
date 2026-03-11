import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { BalanceDataGrid } from './balance-data-grid'
import { BalanceTeamFilter } from './components/balance-team-filter'
import { WeekRangeFilter } from './components/week-range-filter'
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

    if (!shouldShowFilter && idDiscord) {
      // Para usuários que não devem ver o filtro, usa o próprio ID como time selecionado
      setSelectedTeam(idDiscord)
    }
    // Para usuários que devem ver o filtro, aguarda o BalanceTeamFilter definir via handleTeamChange
  }, [authLoading, shouldShowFilter, idDiscord])

  const handleError = (error: ErrorDetails | null) => {
    setError(error)
  }

  const handleTeamChange = useCallback((team: string | null) => {
    setSelectedTeam(team)
  }, [])

  const handleDateRangeChange = useCallback((range: { start: string; end: string }) => {
    setDateRange(range)
  }, [])

  // Loading mais simples: só mostra se auth está carregando
  const isLoading = authLoading

  if (isLoading) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <div className='h-10 w-10 animate-spin rounded-full border-b-2 border-purple-400'></div>
      </div>
    )
  }

  return (
    <motion.div
      className='flex w-full flex-col gap-6 px-6 pb-10 pt-6 md:px-10'
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {error && <ErrorComponent error={error} onClose={() => setError(null)} />}

      <section className='relative z-30 rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm md:p-6'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div className='flex flex-wrap items-center gap-2'>
            <BalanceTeamFilter
              selectedTeam={selectedTeam}
              onChange={handleTeamChange}
              onError={handleError}
            />
            {shouldShowUsGoldButtonValue && (
              <button
                className={`balance-action-btn mt-4 min-w-[90px] px-4 ${
                  isDolar
                    ? 'balance-action-btn--active-dollar'
                    : 'balance-action-btn--active-gold'
                }`}
                onClick={() => setIsDolar((prev) => !prev)}
              >
                {isDolar ? 'U$' : 'Gold'}
              </button>
            )}
          </div>
          <WeekRangeFilter onChange={handleDateRangeChange} />
        </div>
      </section>

      <section className='relative z-10 rounded-xl border border-white/10 bg-white/[0.03] p-2 backdrop-blur-sm md:p-4'>
        <BalanceDataGrid
          selectedTeam={selectedTeam}
          dateRange={dateRange}
          is_dolar={isDolar}
          onError={handleError}
        />
      </section>
    </motion.div>
  )
}

// Wrapper que decide entre balance antigo e novo com base nos cargos
export function BalancePageRouter() {
  return <BalancePage />
}