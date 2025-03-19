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
      console.log(params)
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
    <div className='w-[45%] h-[90%] overflow-y-auto border border-gray-300 rounded-md'>
      <div className='flex gap-4 p-2 bg-zinc-400 top-0'>
        <select
          className='bg-zinc-100 w-[140px] rounded-md p-1 text-black'
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
          className='bg-zinc-100 w-[150px] rounded-md p-1 px-2 text-black'
          value={selectedDate}
          onChange={handleDateChange}
        />
        <button
          className={`bg-red-400 text-white px-4 py-1 rounded-md ${
            pendingTransactions.length === 0
              ? 'opacity-50 cursor-not-allowed'
              : ''
          }`}
          disabled={pendingTransactions.length === 0}
          onClick={handleBulkSend}
        >
          {isBulkingSubmitting ? 'Sending...' : 'Send All'}
        </button>
      </div>

      <table className='border-collapse w-full'>
        <thead className='table-header-group sticky top-0 bg-zinc-400 text-gray-700'>
          <tr className='text-md'>
            <th className='p-2 border w-[150px]'>Team</th>
            <th className='p-2 border w-[150px]'>Gold Cut</th>
            <th className='p-2 border w-[150px]'>Gold Collected</th>
            <th className='p-2 border w-[150px]'>Balance Total</th>
            <th className='p-2 border'>Calculadora</th>
          </tr>
        </thead>
        <tbody className='table-row-group text-sm font-medium text-zinc-900 bg-zinc-200'>
          {!selectedDate ? (
            <tr>
              <td colSpan={5} className='p-4 text-center'>
                É necessário preencher os 2 filtros
              </td>
            </tr>
          ) : isLoading ? (
            <tr>
              <td colSpan={5} className='p-4 text-center h-full'>
                <span className='animate-spin border-4 border-t-transparent border-gray-600 rounded-full w-6 h-6 inline-block'></span>
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
                    className='p-1 px-2 bg-zinc-100 rounded-md'
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
