import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import { TRACKED_TEAM_IDS } from '../../utils/teamConfig'
import {
  getTrackedTeamRoles,
  shouldShowBalanceFilter,
  shouldShowUsGoldButton,
} from '../../utils/roleUtils'
import { GBankListNew } from './components/GBankListNew'
import { BalanceControlTableNew } from './components/BalanceControlTableNew'
import { BalancePageSkeleton } from './components/BalancePageSkeleton'

export function NewBalancePage() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [isDolar, setIsDolar] = useState<boolean>(false)
  const [isBalanceInitialLoaded, setIsBalanceInitialLoaded] = useState(false)
  const [isGBankInitialLoaded, setIsGBankInitialLoaded] = useState(false)
  
  const { userRoles = [], idDiscord, loading: authLoading } = useAuth()

  const shouldShowFilter = useMemo(() => shouldShowBalanceFilter(userRoles), [userRoles])
  const shouldShowCurrencyToggle = useMemo(
    () => shouldShowUsGoldButton(userRoles),
    [userRoles]
  )

  const isChefe = userRoles.includes(import.meta.env.VITE_TEAM_CHEFE)

  const allowedTeams = useMemo(() => {
    // Se tem Chefe, retorna todos os times
    if (isChefe) {
      return TRACKED_TEAM_IDS
    }
    // Para outros usuários, retorna apenas os times que possuem
    return getTrackedTeamRoles(userRoles).filter((t) => TRACKED_TEAM_IDS.includes(t))
  }, [isChefe, userRoles])

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

  useEffect(() => {
    if (!shouldShowCurrencyToggle && isDolar) {
      setIsDolar(false)
    }
  }, [shouldShowCurrencyToggle, isDolar])

  const isInitialPageLoading =
    authLoading || !selectedTeam || !isBalanceInitialLoaded || !isGBankInitialLoaded

  return (
    <div className='relative h-full min-h-0 w-full'>
      {isInitialPageLoading ? (
        <div className='absolute inset-0 z-20'>
          <BalancePageSkeleton />
        </div>
      ) : null}
      <div className={`flex h-full min-h-0 w-full flex-col px-6 pb-8 pt-6 md:px-10 ${isInitialPageLoading ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>
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
                allowedTeams={allowedTeams}
                hideTeamSelector={!shouldShowFilter}
                hideCurrencyToggle={!shouldShowCurrencyToggle}
                onInitialLoadComplete={() => setIsBalanceInitialLoaded(true)}
              />
            )}
          </div>
          <div className='min-h-0 h-full'>
            <GBankListNew
              selectedTeam={selectedTeam}
              onInitialLoadComplete={() => setIsGBankInitialLoaded(true)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}


