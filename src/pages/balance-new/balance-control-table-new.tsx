import axios from 'axios'
import { useState, useEffect, useCallback } from 'react'
import { ErrorDetails } from '../../components/error-display'
import { getCurrentUserDate } from '../../utils/timezone-utils'
import {
  getBalanceDaily,
  updateNick,
} from '../../services/api/balance'
import {
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Box,
  Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

type BalanceControlTableNewProps = {
  selectedTeam: string
  selectedDate: string
  setSelectedTeam: (value: string) => void
  setSelectedDate: (value: string) => void
  isDolar: boolean
  setIsDolar: (value: boolean) => void
  onError?: (error: ErrorDetails) => void
  allowedTeams: string[]
  hideTeamSelector?: boolean
}

export function BalanceControlTableNew({
  selectedTeam,
  selectedDate,
  setSelectedTeam,
  setSelectedDate,
  isDolar,
  setIsDolar,
  onError,
  allowedTeams,
  hideTeamSelector = false,
}: BalanceControlTableNewProps) {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newNick, setNewNick] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [isFreelancerDialogOpen, setIsFreelancerDialogOpen] = useState(false)

  const sortedUsers = Array.isArray(users)
    ? [...users].sort((a, b) => {
        if (!sortConfig) return 0
        const { key, direction } = sortConfig
        const order = direction === 'asc' ? 1 : -1

        if (key === 'username') {
          return a.username.localeCompare(b.username) * order
        } else if (key === 'balance_total') {
          return (Number(a.balance_total) - Number(b.balance_total)) * order
        }
        return 0
      })
    : []

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'asc' }
    })
  }

  const getTeamColor = (team: string) => {
    switch (team) {
      case import.meta.env.VITE_TEAM_CHEFE:
        return '#DC2626'
      case import.meta.env.VITE_TEAM_MPLUS:
        return '#7C3AED'
      case import.meta.env.VITE_TEAM_LEVELING:
        return '#059669'
      case import.meta.env.VITE_TEAM_GARCOM:
        return '#2563EB'
      case import.meta.env.VITE_TEAM_CONFEITEIROS:
        return '#EC4899'
      case import.meta.env.VITE_TEAM_JACKFRUIT:
        return '#16A34A'
      case import.meta.env.VITE_TEAM_INSANOS:
        return '#1E40AF'
      case import.meta.env.VITE_TEAM_APAE:
        return '#F87171'
      case import.meta.env.VITE_TEAM_LOSRENEGADOS:
        return '#F59E0B'
      case import.meta.env.VITE_TEAM_DTM:
        return '#8B5CF6'
      case import.meta.env.VITE_TEAM_KFFC:
        return '#047857'
      case import.meta.env.VITE_TEAM_GREENSKY:
        return '#BE185D'
      case import.meta.env.VITE_TEAM_GUILD_AZRALON_1:
        return '#0D9488'
      case import.meta.env.VITE_TEAM_GUILD_AZRALON_2:
        return '#1D4ED8'
      case import.meta.env.VITE_TEAM_ROCKET:
        return '#B91C1C'
      case import.meta.env.VITE_TEAM_BOOTY_REAPER:
        return '#4C1D95'
      case import.meta.env.VITE_TEAM_PADEIRINHO:
        return '#EA580C'
      case import.meta.env.VITE_TEAM_MILHARAL:
        return '#FEF08A'
      case import.meta.env.VITE_TEAM_ADVERTISER:
        return '#9CA3AF'
      case import.meta.env.VITE_TEAM_FREELANCER:
        return '#86EFAC'
      case import.meta.env.VITE_TEAM_BASTARD:
        return '#D97706'
      case import.meta.env.VITE_TEAM_KIWI:
        return '#84CC16'
      default:
        return '#DC2626'
    }
  }

  // Set default date
  useEffect(() => {
    if (!selectedDate) {
      const todayLocal = getCurrentUserDate().toISOString().split('T')[0]
      setSelectedDate(todayLocal)
    }
  }, [selectedDate, setSelectedDate])

  const fetchBalance = useCallback(
    async (showLoading = true, isDolarFlag = isDolar) => {
      if (!selectedDate || !selectedTeam) return
      if (showLoading) setIsLoading(true)
      try {
        const data = await getBalanceDaily({
          id_team: selectedTeam,
          date: selectedDate,
          is_dolar: isDolarFlag,
        })
        setUsers(data)
      } catch (error) {
        const errorDetails = axios.isAxiosError(error)
          ? {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status,
            }
          : { message: 'Unexpected error', response: error }
        if (onError) onError(errorDetails)
      } finally {
        if (showLoading) setIsLoading(false)
      }
    },
    [selectedTeam, selectedDate, isDolar, onError]
  )

  useEffect(() => {
    if (selectedTeam && selectedDate) {
      fetchBalance(true, isDolar)
    }
  }, [fetchBalance, selectedTeam, selectedDate, isDolar])

  // Calculator column removed

  const handleOpenDialog = (userId: string) => {
    setSelectedUserId(userId)
    setIsDialogOpen(true)
  }
  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setNewNick('')
    setSelectedUserId(null)
  }

  const handleSaveNick = async () => {
    if (!selectedUserId || !newNick.trim()) return
    try {
      await updateNick({ nick: newNick.trim(), id_discord: selectedUserId })
      fetchBalance()
    } catch (error) {
      const errorDetails = axios.isAxiosError(error)
        ? {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          }
        : { message: 'Unexpected error', response: error }
      if (onError) onError(errorDetails)
    } finally {
      handleCloseDialog()
    }
  }

  const handleCloseFreelancerDialog = () => setIsFreelancerDialogOpen(false)

  const isTeamAllowed = (team: string) => allowedTeams.includes(team)

  return (
    <>
      <div className='h-full w-full overflow-y-auto rounded-md'>
        <div className='top-0 flex gap-4 bg-zinc-400 p-2'>
          {!hideTeamSelector && (
            <FormControl className='w-[200px]' size='small' data-tutorial="team-selector">
              <Select
                value={selectedTeam}
                onChange={(e: SelectChangeEvent<string>) => setSelectedTeam(e.target.value)}
                displayEmpty
                className='bg-zinc-100 text-black'
                sx={{
                  backgroundColor: 'white',
                  height: '40px',
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  boxShadow: 'none',
                }}
              >
                <MenuItem value='' disabled hidden>
                  <em>Team</em>
                </MenuItem>
                {isTeamAllowed(import.meta.env.VITE_TEAM_MPLUS) && (
                  <MenuItem value={import.meta.env.VITE_TEAM_MPLUS} style={{ backgroundColor: '#7C3AED', color: 'white' }}>
                    M+
                  </MenuItem>
                )}
                {isTeamAllowed(import.meta.env.VITE_TEAM_LEVELING) && (
                  <MenuItem value={import.meta.env.VITE_TEAM_LEVELING} style={{ backgroundColor: '#059669', color: 'white' }}>
                    Leveling
                  </MenuItem>
                )}
                {isTeamAllowed(import.meta.env.VITE_TEAM_GARCOM) && (
                  <MenuItem value={import.meta.env.VITE_TEAM_GARCOM} style={{ backgroundColor: '#2563EB', color: 'white' }}>
                    Garçom
                  </MenuItem>
                )}
                {isTeamAllowed(import.meta.env.VITE_TEAM_CONFEITEIROS) && (
                  <MenuItem value={import.meta.env.VITE_TEAM_CONFEITEIROS} style={{ backgroundColor: '#EC4899', color: 'white' }}>
                    Confeiteiros
                  </MenuItem>
                )}
                {isTeamAllowed(import.meta.env.VITE_TEAM_JACKFRUIT) && (
                  <MenuItem value={import.meta.env.VITE_TEAM_JACKFRUIT} style={{ backgroundColor: '#16A34A', color: 'white' }}>
                    Jackfruit
                  </MenuItem>
                )}
                {isTeamAllowed(import.meta.env.VITE_TEAM_INSANOS) && (
                  <MenuItem value={import.meta.env.VITE_TEAM_INSANOS} style={{ backgroundColor: '#1E40AF', color: 'white' }}>
                    Insanos
                  </MenuItem>
                )}
                {isTeamAllowed(import.meta.env.VITE_TEAM_APAE) && (
                  <MenuItem value={import.meta.env.VITE_TEAM_APAE} style={{ backgroundColor: '#F87171', color: 'white' }}>
                    APAE
                  </MenuItem>
                )}
                {isTeamAllowed(import.meta.env.VITE_TEAM_LOSRENEGADOS) && (
                  <MenuItem value={import.meta.env.VITE_TEAM_LOSRENEGADOS} style={{ backgroundColor: '#F59E0B', color: 'black' }}>
                    Los Renegados
                  </MenuItem>
                )}
                {isTeamAllowed(import.meta.env.VITE_TEAM_PADEIRINHO) && (
                  <MenuItem value={import.meta.env.VITE_TEAM_PADEIRINHO} style={{ backgroundColor: '#EA580C', color: 'white' }}>
                    Padeirinho
                  </MenuItem>
                )}
                {isTeamAllowed(import.meta.env.VITE_TEAM_MILHARAL) && (
                  <MenuItem value={import.meta.env.VITE_TEAM_MILHARAL} style={{ backgroundColor: '#FEF08A', color: 'black' }}>
                    Milharal
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          )}
          <input
            type='date'
            className='w-[200px] rounded-md bg-zinc-100 p-1 px-2 text-black'
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            data-tutorial="date-filter"
          />
          <Button
            variant='contained'
            sx={{
              height: '40px',
              minWidth: '80px',
              backgroundColor: isDolar ? '#ef4444' : '#FFD700',
              color: isDolar ? '#fff' : '#000',
              '&:hover': { backgroundColor: isDolar ? '#dc2626' : '#FFC300' },
            }}
            onClick={() => setIsDolar(!isDolar)}
            data-tutorial="currency-toggle"
          >
            {isDolar ? 'U$' : 'Gold'}
          </Button>
          {/* Calculator bulk send removed */}
        </div>

        <table className='w-full border-collapse'>
          <thead className='sticky top-0 z-10 bg-zinc-200 text-gray-700'>
            <tr className='text-md text-black'>
              {[
                import.meta.env.VITE_TEAM_ADVERTISER,
                import.meta.env.VITE_TEAM_FREELANCER,
              ].includes(selectedTeam) && <th className='h-14 w-[50px] border p-2'>Nick</th>}
              <th className='h-14 w-[150px] cursor-pointer border p-2' onClick={() => handleSort('username')}>
                Player {sortConfig?.key === 'username' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className='w-[150px] border p-2'>Gold Cut</th>
              <th className='w-[150px] border p-2'>Gold Collected</th>
              <th className='w-[150px] border p-2'>Daily Balance</th>
              <th className='w-[150px] cursor-pointer border p-2' onClick={() => handleSort('balance_total')}>
                Balance Total {sortConfig?.key === 'balance_total' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              {/* Calculator column removed */}
            </tr>
          </thead>
          <tbody className='bg-white text-sm font-medium text-zinc-900'>
            {isLoading ? (
              <tr>
                <td colSpan={[import.meta.env.VITE_TEAM_ADVERTISER, import.meta.env.VITE_TEAM_FREELANCER].includes(selectedTeam) ? 6 : 5} className='h-full p-4 text-center'>
                  <span className='inline-block h-6 w-6 animate-spin rounded-full border-4 border-gray-600 border-t-transparent'></span>
                  <p>Loading...</p>
                </td>
              </tr>
            ) : sortedUsers.length === 0 ? (
              <tr>
                <td colSpan={[import.meta.env.VITE_TEAM_ADVERTISER, import.meta.env.VITE_TEAM_FREELANCER].includes(selectedTeam) ? 6 : 5} className='p-4 text-center'>No data available</td>
              </tr>
            ) : (
              sortedUsers.map((user) => (
                <tr key={user.idDiscord} className='border border-gray-300'>
                  {[
                    import.meta.env.VITE_TEAM_ADVERTISER,
                    import.meta.env.VITE_TEAM_FREELANCER,
                  ].includes(selectedTeam) && (
                    <td className='py-4 px-2 text-center' data-tutorial="transaction-actions">
                      <Button variant='contained' size='small' onClick={() => handleOpenDialog(user.idDiscord)}>
                        Add
                      </Button>
                    </td>
                  )}
                  <td
                    className='py-4 px-2 text-center'
                    style={{
                      backgroundColor: getTeamColor(selectedTeam),
                      color: [
                        import.meta.env.VITE_TEAM_MILHARAL,
                        import.meta.env.VITE_TEAM_LOSRENEGADOS,
                      ].includes(selectedTeam)
                        ? 'black'
                        : 'white',
                    }}
                  >
                    {user.username}
                    {(selectedTeam === import.meta.env.VITE_TEAM_FREELANCER || selectedTeam === import.meta.env.VITE_TEAM_ADVERTISER) && user.nick ? (
                      <>
                        <br />
                        <span className='text-sm text-gray-600'>({user.nick})</span>
                      </>
                    ) : null}
                  </td>
                  <td className='py-4 px-2 text-center'>
                    {Math.round(Number(user.gold)).toLocaleString('en-US')}
                  </td>
                  <td className='py-4 px-2 text-center'>
                    {Math.round(Number(user.gold_collect)).toLocaleString('en-US')}
                  </td>
                  <td className='py-4 px-2 text-center'>
                    {Math.round(Number(user.sum_day)).toLocaleString('en-US')}
                  </td>
                  <td className='py-4 px-2 text-center'>
                    {isDolar
                      ? Math.abs(Number(user.balance_total)) === 0
                        ? '0.00'
                        : Number(user.balance_total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : Math.abs(Math.round(Number(user.balance_total))) === 0
                        ? '0'
                        : Math.round(Number(user.balance_total)).toLocaleString('en-US')}
                  </td>
                  {/* Calculator cell removed */}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle className='relative'>
          Update Nick
          <IconButton aria-label='close' onClick={handleCloseDialog} sx={{ position: 'absolute', right: 8, top: 12 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label='Nick'
            type='text'
            fullWidth
            value={newNick}
            onChange={(e) => setNewNick(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveNick()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSaveNick} color='primary'>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isFreelancerDialogOpen} onClose={handleCloseFreelancerDialog} maxWidth='xs' fullWidth>
        <DialogTitle className='relative text-center'>
          {selectedTeam === import.meta.env.VITE_TEAM_FREELANCER ? 'Freelancer Payout' : 'Advertiser Payout'}
          <IconButton aria-label='close' onClick={handleCloseFreelancerDialog} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box className='flex flex-col gap-4'>
            {sortedUsers.filter((user) => Number(user.balance_total) > 0).length > 0 ? (
              <>
                <Box className='max-h-96 overflow-y-auto rounded border p-4'>
                  <Typography component='pre' className='whitespace-pre-wrap text-sm'>
                    {sortedUsers
                      .filter((user) => Number(user.balance_total) > 0)
                      .map(
                        (user) => `${user.nick}, ${Math.abs(Math.round(Number(user.balance_total))) === 0 ? '0' : Math.round(Number(user.balance_total))}`
                      )
                      .join('\n')}
                  </Typography>
                </Box>
                <Box className='flex justify-center'>
                  <Button
                    variant='contained'
                    onClick={() => {
                      const payoutData = sortedUsers
                        .filter((user) => Number(user.balance_total) > 0)
                        .map(
                          (user) => `${user.nick}, ${Math.abs(Math.round(Number(user.balance_total))) === 0 ? '0' : Math.round(Number(user.balance_total))}`
                        )
                        .join('\n')
                      navigator.clipboard.writeText(payoutData)
                    }}
                    sx={{ backgroundColor: 'rgb(147, 51, 234)', '&:hover': { backgroundColor: 'rgb(168, 85, 247)' } }}
                  >
                    Copy
                  </Button>
                </Box>
              </>
            ) : (
              <Box className='flex justify-center'>
                <Typography>No data found.</Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}


