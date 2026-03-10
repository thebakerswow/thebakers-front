import { useState, useEffect, useMemo, useCallback } from 'react'
import { BalanceDataGrid } from './balance-data-grid'
import { BalanceTeamFilter } from '../../components/balance-team-filter'
import { WeekRangeFilter } from '../../components/week-range-filter'
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useAuth } from '../../context/auth-context'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import { shouldShowBalanceFilter, shouldShowUsGoldButton, shouldUseNewBalance } from '../../utils/role-utils'
import { NewBalancePage } from '../balance-new'
import { createGBank } from '../../services/api/gbanks'

const teamIdToLabelMap: Record<string, string> = {
  [import.meta.env.VITE_TEAM_CHEFE]: 'Chefe de cozinha',
  [import.meta.env.VITE_TEAM_MPLUS]: 'M+',
  [import.meta.env.VITE_TEAM_LEVELING]: 'Leveling',
  [import.meta.env.VITE_TEAM_GARCOM]: 'Garcom',
  [import.meta.env.VITE_TEAM_CONFEITEIROS]: 'Confeiteiros',
  [import.meta.env.VITE_TEAM_JACKFRUIT]: 'Jackfruit',
  [import.meta.env.VITE_TEAM_INSANOS]: 'Insanos',
  [import.meta.env.VITE_TEAM_APAE]: 'APAE',
  [import.meta.env.VITE_TEAM_LOSRENEGADOS]: 'Los Renegados',
  [import.meta.env.VITE_TEAM_DTM]: 'DTM',
  [import.meta.env.VITE_TEAM_KFFC]: 'KFFC',
  [import.meta.env.VITE_TEAM_GREENSKY]: 'Greensky',
  [import.meta.env.VITE_TEAM_GUILD_AZRALON_1]: 'Guild Azralon BR#1',
  [import.meta.env.VITE_TEAM_GUILD_AZRALON_2]: 'Guild Azralon BR#2',
  [import.meta.env.VITE_TEAM_ROCKET]: 'Rocket',
  [import.meta.env.VITE_TEAM_BOOTY_REAPER]: 'Booty Reaper',
  [import.meta.env.VITE_TEAM_PADEIRINHO]: 'Padeirinho',
  [import.meta.env.VITE_TEAM_MILHARAL]: 'Milharal',
  [import.meta.env.VITE_TEAM_BASTARD]: 'Bastard Munchen',
  [import.meta.env.VITE_TEAM_KIWI]: 'Kiwi',
}

export function BalancePage() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<
    { start: string; end: string } | undefined
  >(undefined)
  const [isDolar, setIsDolar] = useState(false)
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [addGBankModalOpen, setAddGBankModalOpen] = useState(false)
  const [newGBankName, setNewGBankName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { userRoles = [], idDiscord, loading: authLoading } = useAuth()
  const canCreateGBank = userRoles.includes(import.meta.env.VITE_TEAM_PREFEITO)
  const selectedTeamLabel = useMemo(
    () => (selectedTeam ? teamIdToLabelMap[selectedTeam] || selectedTeam : '-'),
    [selectedTeam]
  )

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

  const handleCreateGBank = async () => {
    if (!selectedTeam) {
      handleError({ message: 'No selected team for G-Bank creation' })
      return
    }

    setIsSubmitting(true)
    try {
      await createGBank({
        name: newGBankName,
        idTeam: selectedTeam,
      })
      setNewGBankName('')
      setAddGBankModalOpen(false)
    } catch (error) {
      handleError({ message: 'Error adding G-Bank', response: error })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading mais simples: só mostra se auth está carregando
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
          {canCreateGBank && (
            <Button
              variant='contained'
              sx={{
                height: '40px',
                minWidth: '120px',
                marginTop: '16px',
                backgroundColor: 'rgb(147, 51, 234)',
                '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
              }}
              onClick={() => setAddGBankModalOpen(true)}
            >
              Add G-Bank
            </Button>
          )}
        </div>
        <WeekRangeFilter onChange={handleDateRangeChange} />
      </div>
      {addGBankModalOpen && (
        <Dialog open={addGBankModalOpen} onClose={() => setAddGBankModalOpen(false)}>
          <DialogTitle className='relative text-center'>
            Add New G-Bank
            <IconButton
              aria-label='close'
              onClick={() => setAddGBankModalOpen(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              margin='dense'
              variant='outlined'
              label='Team'
              value={selectedTeamLabel}
              InputProps={{ readOnly: true }}
            />
            <TextField
              fullWidth
              margin='dense'
              variant='outlined'
              label='Name'
              value={newGBankName}
              onChange={(e) => setNewGBankName(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center' }}>
            <Button
              variant='contained'
              onClick={handleCreateGBank}
              disabled={isSubmitting}
              sx={{
                backgroundColor: 'rgb(147, 51, 234)',
                '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
              }}
            >
              {isSubmitting ? 'Adding...' : 'Save'}
            </Button>
            <Button variant='outlined' onClick={() => setAddGBankModalOpen(false)}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      )}
      <BalanceDataGrid
        selectedTeam={selectedTeam}
        dateRange={dateRange}
        is_dolar={isDolar}
        onError={handleError}
      />
    </div>
  )
}

// Wrapper que decide entre balance antigo e novo com base nos cargos
export function BalancePageRouter() {
  const { userRoles = [] } = useAuth()
  const useNew = useMemo(() => shouldUseNewBalance(userRoles), [userRoles])
  return useNew ? <NewBalancePage /> : <BalancePage />
}