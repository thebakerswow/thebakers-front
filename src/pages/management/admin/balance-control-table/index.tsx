import axios from 'axios'
import { useState, useRef, useEffect, useCallback } from 'react'
import {
  ErrorDetails,
  ErrorComponent,
} from '../../../../components/error-display'
import { Modal } from '../../../../components/modal'
import { api } from '../../../../services/axiosConfig'

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
  const [_, setOpenRowIndex] = useState<number | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [calculatorValues, setCalculatorValues] = useState<{
    [key: string]: string
  }>({})
  const [isBulkingSubmitting, setIsBulkingSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!selectedDate) {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      const formattedDate = `${year}-${month}-${day}`
      setSelectedDate(formattedDate)
    }
  }, [selectedDate, setSelectedDate])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenRowIndex(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value)
  }

  const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTeam(e.target.value)
  }

  const fetchBalanceAdmin = useCallback(async () => {
    if (!selectedDate) return

    try {
      const params = {
        id_team: selectedTeam,
        date: selectedDate,
      }

      const response = await api.get(
        `${import.meta.env.VITE_API_BASE_URL}/admin`,
        { params }
      )
      setUsers(response.data.info)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorDetails = {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        }
        setError(errorDetails)
      } else {
        setError({
          message: 'Erro inesperado',
          response: error,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [selectedTeam, selectedDate])

  useEffect(() => {
    fetchBalanceAdmin() // Faz a primeira chamada imediata

    const interval = setInterval(() => {
      fetchBalanceAdmin()
    }, 5000) // 30 segundos

    return () => clearInterval(interval) // Limpa o intervalo ao desmontar o componente
  }, [selectedTeam, selectedDate, fetchBalanceAdmin])

  const handleCalculatorChange = (userId: string, value: string) => {
    // Permitir apenas números e um único '-' no início
    const rawValue = value.replace(/[^0-9-]/g, '').replace(/(?!^)-/g, '')

    const formattedValue =
      rawValue === '-' ? '-' : Number(rawValue).toLocaleString('en-US')

    setCalculatorValues((prev) => ({
      ...prev,
      [userId]: formattedValue,
    }))
  }

  const handleCalculatorKeyDown = async (
    event: React.KeyboardEvent<HTMLInputElement>,
    userId: string
  ) => {
    if (event.key === 'Enter') {
      handleConfirmCalculator(userId)
    }
  }

  const handleConfirmCalculator = async (userId: string) => {
    if (!calculatorValues[userId]) return

    try {
      const payload = {
        value: Number(calculatorValues[userId].replace(/,/g, '')), // Remove vírgulas
        id_discord: userId,
      }
      await api.post(
        `${import.meta.env.VITE_API_BASE_URL}/transaction`,
        payload
      )

      setCalculatorValues((prev) => ({
        ...prev,
        [userId]: '',
      }))
      await fetchBalanceAdmin()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorDetails = {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        }
        setError(errorDetails)
      } else {
        setError({
          message: 'Erro inesperado',
          response: error,
        })
      }
    }
  }

  const pendingTransactions = Object.entries(calculatorValues)
    .filter(([, value]) => value.trim() !== '')
    .map(([userId, value]) => ({ userId, value }))

  const handleBulkSend = async () => {
    if (pendingTransactions.length === 0) return

    setIsBulkingSubmitting(true)

    try {
      await Promise.all(
        pendingTransactions.map(({ userId, value }) =>
          api.post(`${import.meta.env.VITE_API_BASE_URL}/transaction`, {
            value: Number(value.replace(/,/g, '')),
            id_discord: userId,
          })
        )
      )

      setCalculatorValues({})
      await fetchBalanceAdmin()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorDetails = {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        }
        setError(errorDetails)
      } else {
        setError({
          message: 'Erro inesperado',
          response: error,
        })
      }
    } finally {
      setIsBulkingSubmitting(false)
    }
  }

  if (error) {
    return (
      <Modal onClose={() => setError(null)}>
        <ErrorComponent error={error} onClose={() => setError(null)} />
      </Modal>
    )
  }

  return (
    <div className='h-[90%] w-[45%] overflow-y-auto rounded-md border border-gray-300'>
      <div className='top-0 flex gap-4 bg-zinc-400 p-2'>
        <select
          className='w-[140px] rounded-md bg-zinc-100 p-1 text-black'
          value={selectedTeam}
          onChange={handleTeamChange}
        >
          <option value='' disabled hidden className='text-zinc-400'>
            Team
          </option>
          <option className='text-black' value='1119092171157541006'>
            Padeirinho
          </option>
          <option className='text-black' value='1153459315907235971'>
            Garçom
          </option>
          <option className='text-black' value='1224792109241077770'>
            Confeiteiros
          </option>
          <option className='text-black' value='1328892768034226217'>
            Jackfruit
          </option>
          <option className='text-black' value='1328938639949959209'>
            Milharal
          </option>
          <option className='text-black' value='1346914505392783372'>
            Raio
          </option>
          <option className='text-black' value='1337818949831626753'>
            APAE
          </option>
          <option className='text-black' value='1284914400297226313'>
            Advertiser
          </option>
          <option className='text-black' value='1101231955120496650'>
            Chefe de Cozinha
          </option>
          <option className='text-black' value='1107728166031720510'>
            Freelancer
          </option>
        </select>
        <input
          type='date'
          className='w-[150px] rounded-md bg-zinc-100 p-1 px-2 text-black'
          value={selectedDate}
          onChange={handleDateChange}
        />
        <button
          className={`rounded-md bg-red-400 px-4 py-1 text-white ${
            pendingTransactions.length === 0
              ? 'cursor-not-allowed opacity-50'
              : ''
          }`}
          disabled={pendingTransactions.length === 0}
          onClick={handleBulkSend}
        >
          {isBulkingSubmitting ? 'Sending...' : 'Send All'}
        </button>
      </div>

      <table className='w-full border-collapse'>
        <thead className='sticky top-0 table-header-group bg-zinc-400 text-gray-700'>
          <tr className='text-md'>
            <th className='w-[150px] border p-2'>Team</th>
            <th className='w-[150px] border p-2'>Gold Cut</th>
            <th className='w-[150px] border p-2'>Gold Collected</th>
            <th className='w-[150px] border p-2'>Balance Total</th>
            <th className='border p-2'>Calculadora</th>
          </tr>
        </thead>
        <tbody className='table-row-group bg-zinc-200 text-sm font-medium text-zinc-900'>
          {!selectedDate ? (
            <tr>
              <td colSpan={5} className='p-4 text-center'>
                É necessário preencher os 2 filtros
              </td>
            </tr>
          ) : isLoading ? (
            <tr>
              <td colSpan={5} className='h-full p-4 text-center'>
                <span className='inline-block h-6 w-6 animate-spin rounded-full border-4 border-gray-600 border-t-transparent'></span>
                <p>Loading...</p>
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
                    className='rounded-md bg-zinc-100 p-1 px-2'
                    type='text'
                    value={calculatorValues[user.idDiscord] || ''}
                    onChange={(e) =>
                      handleCalculatorChange(user.idDiscord, e.target.value)
                    }
                    onKeyDown={(e) =>
                      handleCalculatorKeyDown(e, user.idDiscord)
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
