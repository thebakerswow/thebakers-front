import axios from 'axios'
import { useState, useEffect, useCallback } from 'react'
import {
  ErrorDetails,
  ErrorComponent,
} from '../../../../components/error-display'
import { Modal as MuiModal, Box } from '@mui/material'
import { api } from '../../../../services/axiosConfig'
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
} from '@mui/material'

interface BalanceControlTableProps {
  selectedTeam: string
  selectedDate: string
  setSelectedTeam: (team: string) => void
  setSelectedDate: (date: string) => void
}

export function BalanceControlTable({
  selectedTeam,
  selectedDate,
  setSelectedTeam,
  setSelectedDate,
}: BalanceControlTableProps) {
  const [users, setUsers] = useState<any[]>([])
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [calculatorValues, setCalculatorValues] = useState<{
    [key: string]: string
  }>({})
  const [isBulkingSubmitting, setIsBulkingSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)
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
      case import.meta.env.VITE_TEAM_PADEIRINHO:
        return '#D97706' // Padeirinho
      case import.meta.env.VITE_TEAM_GARCOM:
        return '#2563EB' // Garçom
      case import.meta.env.VITE_TEAM_CONFEITEIROS:
        return '#F472B6' // Confeiteiros
      case import.meta.env.VITE_TEAM_JACKFRUIT:
        return '#16A34A' // Jackfruit
      case import.meta.env.VITE_TEAM_MILHARAL:
        return '#FEF08A' // Milharal
      case import.meta.env.VITE_TEAM_RAIO:
        return '#FACC15' // Raio
      case import.meta.env.VITE_TEAM_APAE:
        return '#F87171' // APAE
      case import.meta.env.VITE_TEAM_DTM:
        return '#A78BFA' // DTM
      case import.meta.env.VITE_TEAM_ADVERTISER:
        return '#D1D5DB' // Advertiser
      case import.meta.env.VITE_TEAM_CHEFE:
        return '#EF4444' // Chefe de Cozinha
      case import.meta.env.VITE_TEAM_FREELANCER:
        return '#86EFAC' // Freelancer
      default:
        return '#FFFFFF' // Default white
    }
  }

  // Define a data atual como padrão caso nenhuma data seja selecionada
  useEffect(() => {
    if (!selectedDate) {
      const today = new Date().toISOString().split('T')[0]
      setSelectedDate(today)
    }
  }, [selectedDate, setSelectedDate])

  // Função para buscar os dados do balance admin
  const fetchBalanceAdmin = useCallback(
    async (showLoading = true) => {
      if (!selectedDate || !selectedTeam) return // Ensure selectedDate and selectedTeam are not empty

      if (showLoading) setIsLoading(true)
      try {
        const { data } = await api.get(
          `${import.meta.env.VITE_API_BASE_URL}/admin`,
          {
            params: {
              id_team: selectedTeam === 'all' ? undefined : selectedTeam,
              date: selectedDate,
            }, // Handle "all" option
          }
        )
        setUsers(data.info)
        console.log(data.info)
      } catch (error) {
        setError(
          axios.isAxiosError(error)
            ? {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
              }
            : { message: 'Erro inesperado', response: error }
        )
      } finally {
        if (showLoading) setIsLoading(false)
      }
    },
    [selectedTeam, selectedDate]
  )

  // Fetch data only when selectedTeam or selectedDate changes
  useEffect(() => {
    if (selectedTeam && selectedDate) {
      fetchBalanceAdmin(true)
    }
  }, [fetchBalanceAdmin, selectedTeam, selectedDate])

  // Atualiza o valor do input da calculadora, formatando com vírgulas
  const handleCalculatorChange = (userId: string, value: string) => {
    if (value.trim() === '') {
      setCalculatorValues((prev) => ({ ...prev, [userId]: '' }))
      return
    }

    const rawValue = value.replace(/[^0-9-]/g, '').replace(/(?!^)-/g, '')
    const formattedValue =
      rawValue === '-' ? '-' : Number(rawValue).toLocaleString('en-US')
    setCalculatorValues((prev) => ({
      ...prev,
      [userId]: rawValue === '0' ? '' : formattedValue,
    }))
  }

  // Confirma o valor da calculadora para um usuário específico
  const handleConfirmCalculator = async (userId: string) => {
    if (!calculatorValues[userId]) return

    try {
      await api.post(`${import.meta.env.VITE_API_BASE_URL}/transaction`, {
        value: Number(calculatorValues[userId].replace(/,/g, '')),
        id_discord: userId,
      })
      setCalculatorValues((prev) => ({ ...prev, [userId]: '' }))
      fetchBalanceAdmin()
    } catch (error) {
      setError(
        axios.isAxiosError(error)
          ? {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status,
            }
          : { message: 'Erro inesperado', response: error }
      )
    }
  }

  // Envia os valores pendentes da calculadora em massa
  const handleBulkSend = async () => {
    const pendingTransactions = Object.entries(calculatorValues).filter(
      ([, value]) => value.trim() !== ''
    )
    if (pendingTransactions.length === 0) return

    setIsBulkingSubmitting(true)
    try {
      await Promise.all(
        pendingTransactions.map(([userId, value]) =>
          api.post(`${import.meta.env.VITE_API_BASE_URL}/transaction`, {
            value: Number(value.replace(/,/g, '')),
            id_discord: userId,
          })
        )
      )
      setCalculatorValues({})
      fetchBalanceAdmin()
    } catch (error) {
      setError(
        axios.isAxiosError(error)
          ? {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status,
            }
          : { message: 'Erro inesperado', response: error }
      )
    } finally {
      setIsBulkingSubmitting(false)
    }
  }

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
      await api.put(`${import.meta.env.VITE_API_BASE_URL}/nick`, {
        id_discord: selectedUserId,
        nick: newNick.trim(),
      })
      fetchBalanceAdmin()
    } catch (error) {
      setError(
        axios.isAxiosError(error)
          ? {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status,
            }
          : { message: 'Erro inesperado', response: error }
      )
    } finally {
      handleCloseDialog()
    }
  }

  const handleOpenFreelancerDialog = () => {
    setIsFreelancerDialogOpen(true)
  }

  const handleCloseFreelancerDialog = () => {
    setIsFreelancerDialogOpen(false)
  }

  if (error) {
    return (
      <MuiModal open={!!error} onClose={() => setError(null)}>
        <Box className='absolute left-1/2 top-1/2 w-96 -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-gray-400 p-4 shadow-lg'>
          <ErrorComponent error={error} onClose={() => setError(null)} />
        </Box>
      </MuiModal>
    )
  }

  return (
    <>
      <div className='h-[90%] w-[45%] overflow-y-auto rounded-md'>
        <div className='top-0 flex gap-4 bg-zinc-400 p-2'>
          <FormControl className='w-[200px]' size='small'>
            <Select
              value={selectedTeam}
              onChange={(e: SelectChangeEvent<string>) =>
                setSelectedTeam(e.target.value)
              }
              displayEmpty
              className='bg-zinc-100 text-black'
              sx={{
                backgroundColor: 'white',
                height: '40px',
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                boxShadow: 'none',
              }}
            >
              <MenuItem value='' disabled hidden>
                <em>Team</em>
              </MenuItem>
              <MenuItem
                value='all'
                style={{ backgroundColor: '#E5E7EB', color: 'black' }}
              >
                All Teams
              </MenuItem>
              <MenuItem
                value={import.meta.env.VITE_TEAM_PADEIRINHO}
                style={{ backgroundColor: '#D97706', color: 'white' }}
              >
                Padeirinho
              </MenuItem>
              <MenuItem
                value={import.meta.env.VITE_TEAM_GARCOM}
                style={{ backgroundColor: '#2563EB', color: 'white' }}
              >
                Garçom
              </MenuItem>
              <MenuItem
                value={import.meta.env.VITE_TEAM_CONFEITEIROS}
                style={{ backgroundColor: '#F472B6', color: 'white' }}
              >
                Confeiteiros
              </MenuItem>
              <MenuItem
                value={import.meta.env.VITE_TEAM_JACKFRUIT}
                style={{ backgroundColor: '#16A34A', color: 'white' }}
              >
                Jackfruit
              </MenuItem>
              <MenuItem
                value={import.meta.env.VITE_TEAM_MILHARAL}
                style={{ backgroundColor: '#FEF08A', color: 'black' }}
              >
                Milharal
              </MenuItem>
              <MenuItem
                value={import.meta.env.VITE_TEAM_RAIO}
                style={{ backgroundColor: '#FACC15', color: 'black' }}
              >
                Raio
              </MenuItem>
              <MenuItem
                value={import.meta.env.VITE_TEAM_APAE}
                style={{ backgroundColor: '#F87171', color: 'white' }}
              >
                APAE
              </MenuItem>
              <MenuItem
                value={import.meta.env.VITE_TEAM_DTM}
                style={{ backgroundColor: '#A78BFA', color: 'white' }}
              >
                DTM
              </MenuItem>
              <MenuItem
                value={import.meta.env.VITE_TEAM_ADVERTISER}
                style={{ backgroundColor: '#D1D5DB', color: 'black' }}
              >
                Advertiser
              </MenuItem>
              <MenuItem
                value={import.meta.env.VITE_TEAM_CHEFE}
                style={{ backgroundColor: '#EF4444', color: 'white' }} // Error color
              >
                Chefe de Cozinha
              </MenuItem>
              <MenuItem
                value={import.meta.env.VITE_TEAM_FREELANCER}
                style={{ backgroundColor: '#86EFAC', color: 'black' }} // Lighter green
              >
                Freelancer
              </MenuItem>
            </Select>
          </FormControl>
          <input
            type='date'
            className='w-[200px] rounded-md bg-zinc-100 p-1 px-2 text-black'
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <Button
            variant='contained'
            color='error'
            size='small'
            disabled={Object.values(calculatorValues).every(
              (value) => value.trim() === ''
            )}
            onClick={handleBulkSend}
            sx={{
              textTransform: 'uppercase',
              opacity: isBulkingSubmitting ? 0.5 : 1,
            }}
          >
            {isBulkingSubmitting ? 'Sending...' : 'Send All'}
          </Button>
          {selectedTeam === import.meta.env.VITE_TEAM_FREELANCER && (
            <Button
              variant='contained'
              color='primary'
              size='small'
              onClick={handleOpenFreelancerDialog}
              sx={{ textTransform: 'uppercase' }}
            >
              Freelancer Payout
            </Button>
          )}
        </div>

        <table className='w-full border-collapse'>
          <thead className='sticky top-0 z-10 bg-zinc-200 text-gray-700'>
            <tr className='text-md text-black'>
              {selectedTeam === import.meta.env.VITE_TEAM_FREELANCER && (
                <th className='h-14 w-[50px] border p-2'>Nick</th>
              )}
              <th
                className='h-14 w-[150px] cursor-pointer border p-2'
                onClick={() => handleSort('username')}
              >
                Player{' '}
                {sortConfig?.key === 'username' &&
                  (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className='w-[150px] border p-2'>Gold Cut</th>
              <th className='w-[150px] border p-2'>Gold Collected</th>
              <th className='w-[150px] border p-2'>Daily Balance</th>
              <th
                className='w-[150px] cursor-pointer border p-2'
                onClick={() => handleSort('balance_total')}
              >
                Balance Total{' '}
                {sortConfig?.key === 'balance_total' &&
                  (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>

              <th className='border p-2'>Calculator</th>
            </tr>
          </thead>
          <tbody className='bg-white text-sm font-medium text-zinc-900'>
            {isLoading ? (
              <tr>
                <td colSpan={7} className='h-full p-4 text-center'>
                  <span className='inline-block h-6 w-6 animate-spin rounded-full border-4 border-gray-600 border-t-transparent'></span>
                  <p>Loading...</p>
                </td>
              </tr>
            ) : sortedUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className='p-4 text-center'>
                  No data available
                </td>
              </tr>
            ) : (
              sortedUsers.map((user) => (
                <tr key={user.idDiscord} className='border border-gray-300'>
                  {selectedTeam === import.meta.env.VITE_TEAM_FREELANCER && (
                    <td className='p-2 text-center'>
                      <Button
                        variant='contained'
                        size='small'
                        onClick={() => handleOpenDialog(user.idDiscord)}
                      >
                        Add
                      </Button>
                    </td>
                  )}
                  <td
                    className='p-2 text-center'
                    style={{
                      backgroundColor: getTeamColor(selectedTeam),
                      color: [
                        'all',
                        import.meta.env.VITE_TEAM_MILHARAL,
                        import.meta.env.VITE_TEAM_RAIO,
                        import.meta.env.VITE_TEAM_ADVERTISER,
                        import.meta.env.VITE_TEAM_FREELANCER,
                      ].includes(selectedTeam)
                        ? 'black'
                        : 'white',
                    }}
                  >
                    {user.username}
                    {selectedTeam === import.meta.env.VITE_TEAM_FREELANCER && (
                      <>
                        <br />
                        <span className='text-sm text-gray-600'>
                          ({user.nick})
                        </span>
                      </>
                    )}
                  </td>
                  <td className='p-2 text-center'>
                    {Math.round(Number(user.gold)).toLocaleString('en-US')}
                  </td>
                  <td className='p-2 text-center'>
                    {Math.round(Number(user.gold_collect)).toLocaleString(
                      'en-US'
                    )}
                  </td>
                  <td className='p-2 text-center'>
                    {Math.round(Number(user.sum_day)).toLocaleString('en-US')}
                  </td>
                  <td className='p-2 text-center'>
                    {Math.round(Number(user.balance_total)).toLocaleString(
                      'en-US'
                    )}
                  </td>

                  <td className='p-2 text-center'>
                    <input
                      className='rounded-sm bg-zinc-100 p-2'
                      type='text'
                      value={calculatorValues[user.idDiscord] || ''}
                      onChange={(e) =>
                        handleCalculatorChange(user.idDiscord, e.target.value)
                      }
                      onKeyDown={(e) =>
                        e.key === 'Enter' &&
                        handleConfirmCalculator(user.idDiscord)
                      }
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Update Nick</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label='Nick'
            type='text'
            fullWidth
            value={newNick}
            onChange={(e) => setNewNick(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveNick()} // Confirm on Enter
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSaveNick} color='primary'>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isFreelancerDialogOpen}
        onClose={handleCloseFreelancerDialog}
      >
        <DialogTitle className='text-center'>Freelancer Payout</DialogTitle>
        <DialogContent className='flex flex-col items-center gap-4'>
          {sortedUsers.filter((user) => Number(user.balance_total) > 0).length >
          0 ? (
            <div className='flex flex-col items-center gap-2'>
              <div className='mb-4 text-center'>
                {sortedUsers
                  .filter((user) => Number(user.balance_total) > 0)
                  .map((user) => (
                    <p key={user.idDiscord} className='font-normal'>
                      {user.nick}, {Math.round(Number(user.balance_total))}.0
                    </p>
                  ))}
              </div>
              <Button
                variant='contained'
                color='primary'
                onClick={() => {
                  const freelancerData = sortedUsers
                    .filter((user) => Number(user.balance_total) > 0)
                    .map(
                      (user) =>
                        `${user.nick}, ${Math.round(Number(user.balance_total))}.0`
                    )
                    .join('\n')
                  navigator.clipboard.writeText(freelancerData)
                }}
              >
                Copy
              </Button>
            </div>
          ) : (
            <p className='text-center'>No data found.</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
