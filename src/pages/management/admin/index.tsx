import axios from 'axios'
import { DotsThreeVertical } from '@phosphor-icons/react'
import { useEffect, useRef, useState, useCallback } from 'react'
import { api } from '../../../services/axiosConfig'
import { ErrorComponent, ErrorDetails } from '../../../components/error-display'
import { Modal } from '../../../components/modal'

interface ConfirmingCalculatorData {
  userId: string
  value: string
}

export function AdminPage() {
  const [openRowIndex, setOpenRowIndex] = useState<number | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTeam, setSelectedTeam] = useState('')
  // Armazena os valores digitados para cada usuário
  const [calculatorValues, setCalculatorValues] = useState<{
    [key: string]: string
  }>({})
  // Modal para transação individual
  const [confirmingCalculator, setConfirmingCalculator] =
    useState<ConfirmingCalculatorData | null>(null)
  const [isCalculatorSubmitting, setIsCalculatorSubmitting] = useState(false)
  const [calculatorError, setCalculatorError] = useState<ErrorDetails | null>(
    null
  )
  // Modal para envio em lote
  const [bulkConfirmingTransactions, setBulkConfirmingTransactions] = useState<
    ConfirmingCalculatorData[]
  >([])
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false)
  const [bulkError, setBulkError] = useState<ErrorDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false) // Estado para o loading

  const menuRef = useRef<HTMLDivElement | null>(null)

  function toggleActionsDropdown(index: number) {
    setOpenRowIndex((prev) => (prev === index ? null : index))
  }

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
    setSelectedDate(e.target.value) // formato yyyy-mm-dd
    console.log('Data selecionada:', e.target.value)
  }

  const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTeam(e.target.value)
    console.log('Team selecionado:', e.target.value)
  }

  // Função que busca os dados do balanceadmin com os filtros atuais
  const fetchBalanceAdmin = useCallback(async () => {
    if (!selectedTeam || !selectedDate) return

    setIsLoading(true) // Ativa o loading antes da requisição

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
      setIsLoading(false) // Desativa o loading após a requisição
    }
  }, [selectedTeam, selectedDate])

  // Requisição GET: atualiza os dados sempre que os filtros são preenchidos
  useEffect(() => {
    fetchBalanceAdmin()
  }, [selectedTeam, selectedDate, fetchBalanceAdmin])

  // Atualiza o valor digitado no input "Calculadora" para cada usuário
  const handleCalculatorChange = (userId: string, value: string) => {
    setCalculatorValues((prev) => ({
      ...prev,
      [userId]: value,
    }))
  }

  // Envio individual: ao pressionar Enter, abre o modal de confirmação para aquele usuário
  const handleCalculatorKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    userId: string
  ) => {
    if (event.key === 'Enter') {
      setConfirmingCalculator({
        userId,
        value: calculatorValues[userId],
      })
    }
  }

  // Envio individual: efetua o POST após confirmação e atualiza o balanceadmin
  const handleConfirmCalculator = async () => {
    if (!confirmingCalculator) return

    setIsCalculatorSubmitting(true)
    try {
      const payload = {
        value: Number(confirmingCalculator.value),
        id_discord: confirmingCalculator.userId,
      }
      const response = await api.post(
        `${import.meta.env.VITE_API_BASE_URL}/transaction`,
        payload
      )
      console.log('POST realizado com sucesso:', response.data)
      setCalculatorValues((prev) => ({
        ...prev,
        [confirmingCalculator.userId]: '',
      }))
      setConfirmingCalculator(null)
      await fetchBalanceAdmin()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorDetails = {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        }
        setCalculatorError(errorDetails)
      } else {
        setCalculatorError({
          message: 'Erro inesperado',
          response: error,
        })
      }
    } finally {
      setIsCalculatorSubmitting(false)
    }
  }

  // Reúne todas as transações pendentes (entradas não vazias)
  const pendingTransactions = Object.entries(calculatorValues)
    .filter(([, value]) => value.trim() !== '')
    .map(([userId, value]) => ({ userId, value }))

  // Abre o modal para envio em lote
  const handleBulkSend = () => {
    setBulkConfirmingTransactions(pendingTransactions)
  }

  // Envio em lote: envia todas as transações pendentes
  const handleConfirmBulk = async () => {
    if (bulkConfirmingTransactions.length === 0) return

    setIsBulkSubmitting(true)
    try {
      await Promise.all(
        bulkConfirmingTransactions.map(({ userId, value }) =>
          api.post(`${import.meta.env.VITE_API_BASE_URL}/transaction`, {
            value: Number(value),
            id_discord: userId,
          })
        )
      )
  
      setCalculatorValues((prev) => {
        const newValues = { ...prev }
        bulkConfirmingTransactions.forEach(({ userId }) => {
          newValues[userId] = ''
        })
        return newValues
      })
      setBulkConfirmingTransactions([])
      await fetchBalanceAdmin()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorDetails = {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        }
        setBulkError(errorDetails)
      } else {
        setBulkError({
          message: 'Erro inesperado',
          response: error,
        })
      }
    } finally {
      setIsBulkSubmitting(false)
    }
  }

  if (error) {
    return (
      <Modal onClose={() => setError(null)}>
        <ErrorComponent error={error} onClose={() => setError(null)} />
      </Modal>
    )
  }

  // Para exibir o nome do usuário no modal individual
  const confirmingUser = confirmingCalculator
    ? users.find((u) => u.idDiscord === confirmingCalculator.userId)
    : null

  return (
    <div className='bg-zinc-700 text-gray-100 absolute inset-0 flex gap-10 items-center justify-center rounded-xl shadow-2xl m-8 overflow-y-auto scrollbar-thin'>
      {/* Primeira Tabela */}
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
            Send All
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
            {!selectedTeam || !selectedDate ? (
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
                  <td className='p-2 text-center'>{user.gold}</td>
                  <td className='p-2 text-center'>{user.gold_collect}</td>
                  <td className='p-2 text-center'>{user.balance_total}</td>
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

      {/* Segunda Tabela */}
      <div className='w-[25%] h-[90%] overflow-y-auto border border-gray-300 rounded-md flex flex-col'>
        <div className='flex gap-4 p-2 bg-zinc-400 top-0'>
          <input className='rounded-md text-black px-1' type='text' />
          <button className='bg-red-400 px-4 py-1 rounded-md hover:bg-red-500 transition-colors'>
            Add G-Bank
          </button>
        </div>
        <table className='border-collapse w-full'>
          <thead className='sticky top-0 bg-zinc-400 text-gray-700'>
            <tr className='text-md'>
              <th className='p-2 border' />
              <th className='p-2 border w-[150px]'>GBANKS</th>
              <th className='p-2 border w-[150px]'>SALDO</th>
              <th className='p-2 border w-[150px]'>CALCULADORA</th>
            </tr>
          </thead>
          <tbody className='table-row-group text-sm font-medium text-zinc-900 bg-zinc-200'>
            {Array.from({ length: 20 }).map((_, index) => (
              <tr key={index} className='border border-gray-300'>
                <td className='p-2 relative'>
                  <button onClick={() => toggleActionsDropdown(index)}>
                    <DotsThreeVertical size={20} />
                  </button>
                  {openRowIndex === index && (
                    <div
                      ref={menuRef}
                      className='absolute left-8 top-0 flex flex-col gap-2 p-2 px-4 bg-white border rounded shadow-md z-50'
                    >
                      <button className='text-left hover:bg-gray-100'>
                        Edit
                      </button>
                      <button className='text-left hover:bg-gray-100'>
                        Delete
                      </button>
                    </div>
                  )}
                </td>
                <td className='p-2 text-center'>G-Bank {index + 1}</td>
                <td className='p-2 text-center'></td>
                <td className='p-2 text-center'>
                  <input className='p-2 bg-zinc-100 rounded-md' type='text' />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Terceira Tabela */}
      <div className='w-[20%] h-[90%] overflow-y-auto rounded-md'>
        <table className='border-collapse w-full'>
          <thead className='sticky top-0 bg-zinc-400 text-gray-700'>
            <tr className='text-md'>
              <th className='p-2 border w-[150px]'>GBANKS SOMA</th>
              <th className='p-2 border w-[150px]'>SOMA BALANCE TOTAL</th>
            </tr>
          </thead>
          <tbody className='table-row-group text-sm font-medium text-zinc-900 bg-zinc-200'>
            {Array.from({ length: 1 }).map((_, index) => (
              <tr key={index} className='border border-gray-300'>
                <td className='p-2 text-center'>10</td>
                <td className='p-2 text-center'>10</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Confirmação para a Calculadora */}
      {confirmingCalculator && (
        <Modal
          onClose={() => {
            setConfirmingCalculator(null)
            setCalculatorError(null)
          }}
        >
          <div className='p-4 bg-white rounded-lg shadow-lg w-96'>
            {calculatorError ? (
              <ErrorComponent
                error={calculatorError}
                onClose={() => setCalculatorError(null)}
              />
            ) : (
              <>
                <h2 className='text-lg font-semibold mb-4'>Confirmar Envio</h2>
                <p>
                  Você confirma o envio do valor{' '}
                  <strong>{confirmingCalculator.value}</strong> para o usuário{' '}
                  <strong>
                    {confirmingUser
                      ? confirmingUser.username
                      : confirmingCalculator.userId}
                  </strong>
                  ?
                </p>
                <div className='flex gap-2 mt-4'>
                  <button
                    className={`bg-red-400 text-white px-4 py-2 rounded ${
                      isCalculatorSubmitting
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                    disabled={isCalculatorSubmitting}
                    onClick={handleConfirmCalculator}
                  >
                    {isCalculatorSubmitting ? (
                      <div className='flex gap-2'>
                        <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                        Enviando...
                      </div>
                    ) : (
                      'Confirmar'
                    )}
                  </button>
                  <button
                    className='bg-gray-300 text-black px-4 py-2 rounded'
                    onClick={() => {
                      setConfirmingCalculator(null)
                      setCalculatorError(null)
                    }}
                    disabled={isCalculatorSubmitting}
                  >
                    Cancelar
                  </button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}

      {/* Modal de Confirmação para envio em lote */}
      {bulkConfirmingTransactions.length > 0 && (
        <Modal
          onClose={() => {
            setBulkConfirmingTransactions([])
            setBulkError(null)
          }}
        >
          <div className='p-4 bg-white rounded-lg shadow-lg w-96'>
            {bulkError ? (
              <ErrorComponent
                error={bulkError}
                onClose={() => setBulkError(null)}
              />
            ) : (
              <>
                <h2 className='text-lg font-semibold mb-4'>
                  Confirmar Envio em Lote
                </h2>
                <p className='mb-4'>
                  Você confirma o envio das seguintes transações?
                </p>
                <ul className='mb-4'>
                  {bulkConfirmingTransactions.map(({ userId, value }) => {
                    const user = users.find((u) => u.idDiscord === userId)
                    return (
                      <li key={userId} className='text-sm'>
                        {user ? user.username : userId}:{' '}
                        <strong>{value}</strong>
                      </li>
                    )
                  })}
                </ul>
                <div className='flex gap-2 mt-4'>
                  <button
                    className={`bg-blue-500 text-white px-4 py-2 rounded ${
                      isBulkSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={isBulkSubmitting}
                    onClick={handleConfirmBulk}
                  >
                    {isBulkSubmitting ? (
                      <div className='flex gap-2'>
                        <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                        Enviando...
                      </div>
                    ) : (
                      'Confirmar'
                    )}
                  </button>
                  <button
                    className='bg-gray-300 text-black px-4 py-2 rounded'
                    onClick={() => {
                      setBulkConfirmingTransactions([])
                      setBulkError(null)
                    }}
                    disabled={isBulkSubmitting}
                  >
                    Cancelar
                  </button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
