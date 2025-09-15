import { useState, useEffect, useMemo, useCallback } from 'react'
import { CircularProgress } from '@mui/material'
import { useAuth } from '../../context/auth-context'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import { getTrackedTeamRoles, shouldShowBalanceFilter } from '../../utils/role-utils'
import { GBankListNew } from './gbank-list-new'
import { BalanceControlTableNew } from './balance-control-table-new'
import { TutorialOverlay } from '../../components/tutorial-overlay'
import { TutorialButton } from '../../components/tutorial-button'
import { balanceTutorialSteps } from '../../components/tutorial-steps'

export function NewBalancePage() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [isDolar, setIsDolar] = useState<boolean>(false)
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false)
  
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

  const allowedTeams = useMemo(() => (
    isChefe ? tenTeams : getTrackedTeamRoles(userRoles).filter((t) => tenTeams.includes(t))
  ), [isChefe, userRoles])

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

  const handleTutorialOpen = useCallback(() => {
    // Fecha todos os accordions de GBank antes de abrir o tutorial
    const accordionSummaries = document.querySelectorAll('[data-tutorial="gbank-expand"]')
    
    accordionSummaries.forEach(summary => {
      const accordion = summary.closest('.MuiAccordion-root') as HTMLElement
      if (accordion) {
        // Verifica se o accordion está expandido usando múltiplas formas
        const ariaExpanded = accordion.getAttribute('aria-expanded') === 'true'
        const hasExpandedClass = accordion.classList.contains('Mui-expanded')
        const expandIcon = summary.querySelector('.MuiAccordionSummary-expandIconWrapper')
        const iconStyle = expandIcon ? window.getComputedStyle(expandIcon) : null
        const iconRotated = iconStyle ? iconStyle.transform.includes('rotate(180deg)') : false
        
        // Se qualquer indicação mostra que está expandido, fecha
        if (ariaExpanded || hasExpandedClass || iconRotated) {
          ;(summary as HTMLElement).click()
        }
      }
    })
    
    // Aguarda um pouco para o fechamento completar antes de abrir o tutorial
    setTimeout(() => {
      setIsTutorialOpen(true)
    }, 200)
  }, [])
  const handleTutorialClose = useCallback(() => setIsTutorialOpen(false), [])

  const isLoading = authLoading

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
        <div className='flex items-center gap-2'>{/* Header controls trimmed; table owns its toggles */}</div>
      </div>
        <div className='flex w-full gap-6 px-4' style={{ height: 'calc(100vh - 180px)' }}>
          <div className='basis-2/3 h-full' data-tutorial="balance-table">
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
        <div className='basis-1/3 h-full' data-tutorial="gbank-list">
          <GBankListNew onError={handleError} />
        </div>
      </div>

      {/* Tutorial Components */}
      <TutorialButton onClick={handleTutorialOpen} />
      <TutorialOverlay
        isOpen={isTutorialOpen}
        onClose={handleTutorialClose}
        steps={balanceTutorialSteps}
      />
    </div>
  )
}


