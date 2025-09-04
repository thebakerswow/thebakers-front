import axios from 'axios'
import { useState, useEffect, useCallback } from 'react'
import { ErrorDetails } from '../../../components/error-display'
import { getCurrentUserDate } from '../../../utils/timezone-utils'
import {
  getBalanceAdmin,
  createTransaction,
  updateNick,
} from '../../../services/api/balance'
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

import { BalanceControlTableProps } from '../../../types'

interface ExtendedBalanceControlTableProps extends BalanceControlTableProps {
  onError?: (error: ErrorDetails) => void
}

export function BalanceControlTable({
  selectedTeam,
  selectedDate,
  setSelectedTeam,
  setSelectedDate,
  isDolar,
  setIsDolar,
  onError,
}: ExtendedBalanceControlTableProps) {
  const [users, setUsers] = useState<any[]>([])
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
      case import.meta.env.VITE_TEAM_CHEFE:
        return '#DC2626' // Chefe de Cozinha - Vermelho escuro
      case import.meta.env.VITE_TEAM_MPLUS:
        return '#7C3AED' // M+ - Roxo
      case import.meta.env.VITE_TEAM_LEVELING:
        return '#059669' // Leveling - Verde esmeralda
      case import.meta.env.VITE_TEAM_GARCOM:
        return '#2563EB' // Garçom - Azul
      case import.meta.env.VITE_TEAM_CONFEITEIROS:
        return '#EC4899' // Confeiteiros - Rosa
      case import.meta.env.VITE_TEAM_JACKFRUIT:
        return '#16A34A' // Jackfruit - Verde
      case import.meta.env.VITE_TEAM_INSANOS:
        return '#1E40AF' // Insanos - Azul escuro
      case import.meta.env.VITE_TEAM_APAE:
        return '#F87171' // APAE - Rosa claro
      case import.meta.env.VITE_TEAM_LOSRENEGADOS:
        return '#F59E0B' // Los Renegados - Amarelo
      case import.meta.env.VITE_TEAM_DTM:
        return '#8B5CF6' // DTM - Violeta
      case import.meta.env.VITE_TEAM_KFFC:
        return '#047857' // KFFC - Verde escuro
      case import.meta.env.VITE_TEAM_GREENSKY:
        return '#BE185D' // Greensky - Rosa escuro
      case import.meta.env.VITE_TEAM_GUILD_AZRALON_1:
        return '#0D9488' // Guild Azralon BR#1 - Verde azulado
      case import.meta.env.VITE_TEAM_GUILD_AZRALON_2:
        return '#1D4ED8' // Guild Azralon BR#2 - Azul médio
      case import.meta.env.VITE_TEAM_ROCKET:
        return '#B91C1C' // Rocket - Vermelho
      case import.meta.env.VITE_TEAM_BOOTY_REAPER:
        return '#4C1D95' // Booty Reaper - Violeta
      case import.meta.env.VITE_TEAM_PADEIRINHO:
        return '#EA580C' // Padeirinho - Laranja
      case import.meta.env.VITE_TEAM_MILHARAL:
        return '#FEF08A' // Milharal - Amarelo claro
      case import.meta.env.VITE_TEAM_ADVERTISER:
        return '#9CA3AF' // Advertiser - Cinza
      case import.meta.env.VITE_TEAM_FREELANCER:
        return '#86EFAC' // Freelancer - Verde claro
      case import.meta.env.VITE_TEAM_BASTARD:
        return '#D97706' // Bastard Munchen - Âmbar
      case import.meta.env.VITE_TEAM_KIWI:
        return '#84CC16' // Kiwi - Verde lima
      default:
        return '#FFFFFF' // Default white
    }
  }

  // Define a data atual no timezone local do usuário como padrão
  useEffect(() => {
    if (!selectedDate) {
      const todayLocal = getCurrentUserDate().toISOString().split('T')[0]
      setSelectedDate(todayLocal)
    }
  }, [selectedDate, setSelectedDate])

  // Função para buscar os dados do balance admin
  const fetchBalanceAdmin = useCallback(
    async (showLoading = true, isDolarFlag = isDolar) => {
      if (!selectedDate || !selectedTeam) return // Ensure selectedDate and selectedTeam are not empty

      if (showLoading) setIsLoading(true)
      try {
        const data = await getBalanceAdmin({
          id_team: selectedTeam === 'all' ? undefined : selectedTeam,
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

        if (onError) {
          onError(errorDetails)
        }
      } finally {
        if (showLoading) setIsLoading(false)
      }
    },
    [selectedTeam, selectedDate, isDolar, onError]
  )

  // Fetch data only when selectedTeam, selectedDate ou isDolar mudam
  useEffect(() => {
    if (selectedTeam && selectedDate) {
      fetchBalanceAdmin(true, isDolar)
    }
  }, [fetchBalanceAdmin, selectedTeam, selectedDate, isDolar])

  // Atualiza o valor do input da calculadora, formatando com vírgulas
  const handleCalculatorChange = (userId: string, value: string) => {
    if (value.trim() === '') {
      setCalculatorValues((prev) => ({ ...prev, [userId]: '' }))
      return
    }

    let rawValue: string
    if (isDolar) {
      // Permite números, hífen e ponto (apenas um ponto)
      rawValue = value
        .replace(/[^0-9.-]/g, '')
        .replace(/(?!^)-/g, '') // apenas um hífen no início
        .replace(/^(-?\d*)\.(.*)\./, '$1.$2') // apenas um ponto

      // Se o valor for apenas um hífen, mantém como está
      if (rawValue === '-') {
        setCalculatorValues((prev) => ({ ...prev, [userId]: '-' }))
        return
      }

      // Se houver ponto decimal, separa parte inteira e decimal
      const parts = rawValue.split('.')
      const isNegative = rawValue.startsWith('-')
      let numericPart = parts[0].replace(/^-/, '') // Remove o hífen para processar

      let formattedValue = ''

      // Trata a parte inteira
      if (numericPart !== '') {
        formattedValue = Number(numericPart).toLocaleString('en-US')
      }

      // Adiciona o sinal negativo se necessário
      if (isNegative) {
        formattedValue = '-' + formattedValue
      }

      // Adiciona a parte decimal se existir
      if (parts.length > 1) {
        formattedValue += '.' + parts[1].replace(/[^0-9]/g, '')
      }

      // Se o valor final for "-0" ou "0", limpa o campo
      if (formattedValue === '-0' || formattedValue === '0') {
        formattedValue = ''
      }

      setCalculatorValues((prev) => ({
        ...prev,
        [userId]: formattedValue,
      }))
      return
    } else {
      // Apenas números e hífen
      rawValue = value.replace(/[^0-9-]/g, '').replace(/(?!^)-/g, '')

      // Se o valor for apenas um hífen, mantém como está
      if (rawValue === '-') {
        setCalculatorValues((prev) => ({ ...prev, [userId]: '-' }))
        return
      }

      const isNegative = rawValue.startsWith('-')
      const numericPart = rawValue.replace(/^-/, '') // Remove o hífen para processar

      let formattedValue = ''
      if (numericPart !== '') {
        formattedValue = Number(numericPart).toLocaleString('en-US')
      }

      // Adiciona o sinal negativo se necessário
      if (isNegative) {
        formattedValue = '-' + formattedValue
      }

      // Se o valor final for "-0" ou "0", limpa o campo
      if (formattedValue === '-0' || formattedValue === '0') {
        formattedValue = ''
      }

      setCalculatorValues((prev) => ({
        ...prev,
        [userId]: formattedValue,
      }))
      return
    }
  }

  // Confirma o valor da calculadora para um usuário específico
  const handleConfirmCalculator = async (userId: string) => {
    if (!calculatorValues[userId]) return

    try {
      await createTransaction({
        value: isDolar
          ? Number(calculatorValues[userId].replace(/,/g, ''))
          : Number(calculatorValues[userId].replace(/,/g, '')),
        id_discord: userId,
        is_dolar: isDolar,
      })
      setCalculatorValues((prev) => ({ ...prev, [userId]: '' }))
      fetchBalanceAdmin()
    } catch (error) {
      const errorDetails = axios.isAxiosError(error)
        ? {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          }
        : { message: 'Unexpected error', response: error }

      if (onError) {
        onError(errorDetails)
      }
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
          createTransaction({
            value: isDolar
              ? Number(value.replace(/,/g, ''))
              : Number(value.replace(/,/g, '')),
            id_discord: userId,
            is_dolar: isDolar,
          })
        )
      )
      setCalculatorValues({})
      fetchBalanceAdmin()
    } catch (error) {
      const errorDetails = axios.isAxiosError(error)
        ? {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          }
        : { message: 'Unexpected error', response: error }

      if (onError) {
        onError(errorDetails)
      }
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
      await updateNick({
        nick: newNick.trim(),
        id_discord: selectedUserId,
      })
      fetchBalanceAdmin()
    } catch (error) {
      const errorDetails = axios.isAxiosError(error)
        ? {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          }
        : { message: 'Unexpected error', response: error }

      if (onError) {
        onError(errorDetails)
      }
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
                value={import.meta.env.VITE_TEAM_CHEFE}
                style={{ backgroundColor: '#DC2626', color: 'white' }} // Vermelho escuro
              >
                Chefe de Cozinha
              </MenuItem>
              <MenuItem
                value={import.meta.env.VITE_TEAM_MPLUS}
                style={{ backgroundColor: '#7C3AED', color: 'white' }} // Roxo
              >
                M+
              </MenuItem>
              <MenuItem
                value={import.meta.env.VITE_TEAM_LEVELING}
                style={{ backgroundColor: '#059669', color: 'white' }} // Verde esmeralda
              >
                Leveling
              </MenuItem>
              <MenuItem
                value={import.meta.env.VITE_TEAM_GARCOM}
                style={{ backgroundColor: '#2563EB', color: 'white' }} // Azul
              >
                Garçom
              </MenuItem>
              <MenuItem
                value={import.meta.env.VITE_TEAM_CONFEITEIROS}
                style={{ backgroundColor: '#EC4899', color: 'white' }} // Rosa
              >
                Confeiteiros
              </MenuItem>
              <MenuItem
                value={import.meta.env.VITE_TEAM_JACKFRUIT}
                style={{ backgroundColor: '#16A34A', color: 'white' }} // Verde
              >
                Jackfruit
              </MenuItem>
              <MenuItem
                value={import.meta.env.VITE_TEAM_INSANOS}
                style={{ backgroundColor: '#1E40AF', color: 'white' }} // Azul escuro
              >
                Insanos
              </MenuItem>
              <MenuItem
                value={import.meta.env.VITE_TEAM_APAE}
                style={{ backgroundColor: '#F87171', color: 'white' }} // Rosa claro
              >
                APAE
              </MenuItem>
              <MenuItem
                value={import.meta.env.VITE_TEAM_LOSRENEGADOS}
                style={{ backgroundColor: '#F59E0B', color: 'black' }} // Amarelo
              >
                Los Renegados
              </MenuItem>
              <MenuItem
                value={import.meta.env.VITE_TEAM_DTM}
                style={{ backgroundColor: '#8B5CF6', color: 'white' }} // Violeta
              >
                DTM
              </MenuItem>
              <MenuItem
                value={import.meta.env.VITE_TEAM_KFFC}
                style={{ backgroundColor: '#047857', color: 'white' }} // Verde escuro
              >
                KFFC
              </MenuItem>
              <MenuItem
                value={import.meta.env.VITE_TEAM_GREENSKY}
                style={{ backgroundColor: '#BE185D', color: 'white' }} // Rosa escuro
              >
                Greensky
              </MenuItem>
              <MenuItem
                value={import.meta.env.VITE_TEAM_GUILD_AZRALON_1}
                style={{ backgroundColor: '#0D9488', color: 'white' }} // Verde azulado
              >
                Guild Azralon BR#1
              </MenuItem>
              <MenuItem
                value={import.meta.env.VITE_TEAM_GUILD_AZRALON_2}
                style={{ backgroundColor: '#1D4ED8', color: 'white' }} // Azul médio
              >
                Guild Azralon BR#2
              </MenuItem>
              <MenuItem
                value={import.meta.env.VITE_TEAM_ROCKET}
                style={{ backgroundColor: '#B91C1C', color: 'white' }} // Vermelho
              >
                Rocket
              </MenuItem>
              <MenuItem
                value={import.meta.env.VITE_TEAM_BOOTY_REAPER}
                style={{ backgroundColor: '#4C1D95', color: 'white' }} // Booty Reaper - Violeta
              >
                Booty Reaper
              </MenuItem>
              <MenuItem
                value={import.meta.env.VITE_TEAM_PADEIRINHO}
                style={{ backgroundColor: '#EA580C', color: 'white' }} // Laranja
              >
                Padeirinho
              </MenuItem>
              <MenuItem
                value={import.meta.env.VITE_TEAM_MILHARAL}
                style={{ backgroundColor: '#FEF08A', color: 'black' }} // Amarelo claro
              >
                Milharal
              </MenuItem>
              <MenuItem
                value={import.meta.env.VITE_TEAM_ADVERTISER}
                style={{ backgroundColor: '#9CA3AF', color: 'black' }} // Cinza
              >
                Advertiser
              </MenuItem>
              <MenuItem
                value={import.meta.env.VITE_TEAM_FREELANCER}
                style={{ backgroundColor: '#86EFAC', color: 'black' }} // Verde claro
              >
                Freelancer
              </MenuItem>
              <MenuItem
                value={import.meta.env.VITE_TEAM_BASTARD}
                style={{ backgroundColor: '#D97706', color: 'white' }} // Âmbar
              >
                Bastard Munchen
              </MenuItem>
              <MenuItem
                value={import.meta.env.VITE_TEAM_KIWI}
                style={{ backgroundColor: '#84CC16', color: 'white' }} // Verde lima
              >
                Kiwi
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
            sx={{
              height: '40px',
              minWidth: '80px',
              backgroundColor: isDolar ? '#ef4444' : '#FFD700',
              color: isDolar ? '#fff' : '#000',
              '&:hover': {
                backgroundColor: isDolar ? '#dc2626' : '#FFC300',
              },
            }}
            onClick={() => setIsDolar(!isDolar)}
          >
            {isDolar ? 'U$' : 'Gold'}
          </Button>
          <Button
            variant='contained'
            size='small'
            disabled={Object.values(calculatorValues).every(
              (value) => value.trim() === ''
            )}
            onClick={handleBulkSend}
            sx={{
              textTransform: 'uppercase',
              opacity: isBulkingSubmitting ? 0.5 : 1,
              backgroundColor: 'rgb(147, 51, 234)',
              '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
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
          {selectedTeam === import.meta.env.VITE_TEAM_ADVERTISER && (
            <Button
              variant='contained'
              color='primary'
              size='small'
              onClick={handleOpenFreelancerDialog}
              sx={{ textTransform: 'uppercase' }}
            >
              Advertiser Payout
            </Button>
          )}
        </div>

        <table className='w-full border-collapse'>
          <thead className='sticky top-0 z-10 bg-zinc-200 text-gray-700'>
            <tr className='text-md text-black'>
              {[
                import.meta.env.VITE_TEAM_ADVERTISER,
                import.meta.env.VITE_TEAM_FREELANCER,
              ].includes(selectedTeam) && (
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
                  {[
                    import.meta.env.VITE_TEAM_ADVERTISER,
                    import.meta.env.VITE_TEAM_FREELANCER,
                  ].includes(selectedTeam) && (
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
                        import.meta.env.VITE_TEAM_LOSRENEGADOS,
                        import.meta.env.VITE_TEAM_ADVERTISER,
                        import.meta.env.VITE_TEAM_FREELANCER,
                      ].includes(selectedTeam)
                        ? 'black'
                        : 'white',
                    }}
                  >
                    {user.username}
                    {(selectedTeam === import.meta.env.VITE_TEAM_FREELANCER ||
                      selectedTeam === import.meta.env.VITE_TEAM_ADVERTISER) &&
                    user.nick ? (
                      <>
                        <br />
                        <span className='text-sm text-gray-600'>
                          ({user.nick})
                        </span>
                      </>
                    ) : null}
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
                    {isDolar
                      ? Math.abs(Number(user.balance_total)) === 0
                        ? '0.00'
                        : Number(user.balance_total).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                      : Math.abs(Math.round(Number(user.balance_total))) === 0
                        ? '0'
                        : Math.round(Number(user.balance_total)).toLocaleString(
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
        <DialogTitle className='relative'>
          Update Nick
          <IconButton
            aria-label='close'
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 12 }}
          >
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
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle className='relative text-center'>
          {selectedTeam === import.meta.env.VITE_TEAM_FREELANCER
            ? 'Freelancer Payout'
            : 'Advertiser Payout'}
          <IconButton
            aria-label='close'
            onClick={handleCloseFreelancerDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box className='flex flex-col gap-4'>
            {sortedUsers.filter((user) => Number(user.balance_total) > 0)
              .length > 0 ? (
              <>
                <Box className='max-h-96 overflow-y-auto rounded border p-4'>
                  <Typography
                    component='pre'
                    className='whitespace-pre-wrap text-sm'
                  >
                    {sortedUsers
                      .filter((user) => Number(user.balance_total) > 0)
                      .map(
                        (user) =>
                          `${user.nick}, ${Math.abs(Math.round(Number(user.balance_total))) === 0 ? '0' : Math.round(Number(user.balance_total))}`
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
                          (user) =>
                            `${user.nick}, ${Math.abs(Math.round(Number(user.balance_total))) === 0 ? '0' : Math.round(Number(user.balance_total))}`
                        )
                        .join('\n')
                      navigator.clipboard.writeText(payoutData)
                    }}
                    sx={{
                      backgroundColor: 'rgb(147, 51, 234)',
                      '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
                    }}
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
