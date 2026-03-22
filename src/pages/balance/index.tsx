import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { BalanceDataGrid } from './components/BalanceGrid'
import { BalanceTeamFilter } from './components/BalanceTeamFilter'
import { WeekRangeFilter } from './components/WeekFilter'
import { BalancePageSkeleton } from './components/BalanceSkeleton'
import { useAuth } from '../../context/AuthContext'
import {
  shouldShowBalanceFilter,
  shouldShowOwnBalanceOnly,
  shouldShowUsGoldButton,
} from '../../utils/roleUtils'
import { NewBalancePage } from '../balance-new'
import { BalanceDateRange } from './types/balance'
import { isSoftwareRenderingLikely } from '../../utils/renderingMode'

export function BalancePage() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<BalanceDateRange | undefined>(undefined)
  const [isDolar, setIsDolar] = useState(false)
  const [useLightVisualEffects, setUseLightVisualEffects] = useState(false)
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

  const handleTeamChange = useCallback((team: string | null) => {
    setSelectedTeam(team)
  }, [])

  const handleDateRangeChange = useCallback((range: BalanceDateRange) => {
    setDateRange(range)
  }, [])

  // Loading mais simples: só mostra se auth está carregando
  const isLoading = authLoading

  useEffect(() => {
    setUseLightVisualEffects(isSoftwareRenderingLikely())
  }, [])

  if (isLoading) {
    return <BalancePageSkeleton />
  }

  return (
    <motion.div
      className='flex w-full flex-col gap-6 px-6 pb-10 pt-6 md:px-10'
      initial={useLightVisualEffects ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: useLightVisualEffects ? 0 : 0.25 }}
    >
      <section
        className={`relative z-30 rounded-xl border border-white/10 p-4 md:p-6 ${
          useLightVisualEffects
            ? 'bg-white/[0.05]'
            : 'bg-white/[0.03] backdrop-blur-sm'
        }`}
      >
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div className='flex flex-wrap items-center gap-2'>
            <BalanceTeamFilter
              selectedTeam={selectedTeam}
              onChange={handleTeamChange}
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

      <section
        className={`relative z-10 rounded-xl border border-white/10 p-2 md:p-4 ${
          useLightVisualEffects
            ? 'bg-white/[0.05]'
            : 'bg-white/[0.03] backdrop-blur-sm'
        }`}
      >
        <BalanceDataGrid
          selectedTeam={selectedTeam}
          dateRange={dateRange}
          is_dolar={isDolar}
        />
      </section>
    </motion.div>
  )
}

// Wrapper que decide entre balance antigo e novo com base nos cargos
export function BalancePageRouter() {
  const { userRoles = [], loading } = useAuth()
  const isChefe = userRoles.includes(import.meta.env.VITE_TEAM_CHEFE)
  const shouldUseRestrictedBalance = shouldShowOwnBalanceOnly(userRoles)

  if (loading) {
    return <BalancePageSkeleton />
  }

  if (shouldUseRestrictedBalance) {
    return <BalancePage />
  }

  return isChefe ? <BalancePage /> : <NewBalancePage />
}