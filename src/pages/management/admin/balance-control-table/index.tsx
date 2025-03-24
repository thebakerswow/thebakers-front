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
      if (!selectedDate) return

      if (showLoading) setIsLoading(true)
      try {
        const { data } = await api.get(
          `${import.meta.env.VITE_API_BASE_URL}/admin`,
          {
            params: { id_team: selectedTeam, date: selectedDate },
          }
        )
        setUsers(data.info)
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

  // Executa a busca inicial e configura o polling para atualizar os dados periodicamente
  useEffect(() => {
    fetchBalanceAdmin(true)

    const interval = setInterval(() => {
      fetchBalanceAdmin(false)
    }, 5000)

    return () => clearInterval(interval)
  }, [fetchBalanceAdmin])

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
            <MenuItem value='1119092171157541006'>Padeirinho</MenuItem>
            <MenuItem value='1153459315907235971'>Garçom</MenuItem>
            <MenuItem value='1224792109241077770'>Confeiteiros</MenuItem>
            <MenuItem value='1328892768034226217'>Jackfruit</MenuItem>
            <MenuItem value='1328938639949959209'>Milharal</MenuItem>
            <MenuItem value='1346914505392783372'>Raio</MenuItem>
            <MenuItem value='1337818949831626753'>APAE</MenuItem>
            <MenuItem value='1284914400297226313'>Advertiser</MenuItem>
            <MenuItem value='1101231955120496650'>Chefe de Cozinha</MenuItem>
            <MenuItem value='1107728166031720510'>Freelancer</MenuItem>
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
          sx={{ textTransform: 'none', opacity: isBulkingSubmitting ? 0.5 : 1 }}
        >
          {isBulkingSubmitting ? 'Sending...' : 'Send All'}
        </Button>
      </div>

      <table className='w-full border-collapse'>
        <thead className='sticky top-0 bg-zinc-400 text-gray-700'>
          <tr className='text-md'>
            <th className='w-[150px] border p-2'>Team</th>
            <th className='w-[150px] border p-2'>Gold Cut</th>
            <th className='w-[150px] border p-2'>Gold Collected</th>
            <th className='w-[150px] border p-2'>Balance Total</th>
            <th className='border p-2'>Calculator</th>
          </tr>
        </thead>
        <tbody className='bg-zinc-200 text-sm font-medium text-zinc-900'>
          {isLoading ? (
            <tr>
              <td colSpan={5} className='h-full p-4 text-center'>
                <span className='inline-block h-6 w-6 animate-spin rounded-full border-4 border-gray-600 border-t-transparent'></span>
                <p>Loading...</p>
              </td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={5} className='p-4 text-center'>
                No data available
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.idDiscord} className='border border-gray-300'>
                <td className='p-2 text-center'>{user.username}</td>
                <td className='p-2 text-center'>
                  {Math.round(Number(user.gold)).toLocaleString('en-US')}
                </td>
                <td className='p-2 text-center'>
                  {Math.round(Number(user.gold_collect)).toLocaleString(
                    'en-US'
                  )}
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
  )
}
