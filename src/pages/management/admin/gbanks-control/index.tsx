import { DotsThreeVertical } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import {
  ErrorDetails,
  ErrorComponent,
} from '../../../../components/error-display'
import { Modal } from '../../../../components/modal'
import { api } from '../../../../services/axiosConfig'

interface GBank {
  id: string
  name: string
  balance: number
  calculatorValue: string
}

export function GBanksTable() {
  const [gbanks, setGbanks] = useState<GBank[]>([])
  const [newGBankName, setNewGBankName] = useState('')
  const [editGBank, setEditGBank] = useState<GBank | null>(null)
  const [deleteGBank, setDeleteGBank] = useState<GBank | null>(null)
  const [openRowIndex, setOpenRowIndex] = useState<number | null>(null)
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const formatCalculatorValue = (value: string) => {
    // Permite números e um único '-' no início
    const rawValue = value
      .replace(/[^0-9-]/g, '')
      .replace(/(?!^)-/g, '') // Remove hífens que não estão no início
      .replace(/(?<=^-.*)-/g, '') // Remove hífens extras se já tiver um no início

    // Mantém o hífen se for o único caractere
    if (rawValue === '-') return '-'

    // Formata o número removendo zeros à esquerda não significativos
    const numberValue = Number(rawValue.replace(/,/g, ''))
    return isNaN(numberValue) ? '' : numberValue.toLocaleString('en-US')
  }

  // Função para buscar os GBanks
  const fetchGBanks = async () => {
    try {
      const response = await api.get(
        `${import.meta.env.VITE_API_BASE_URL}/gbanks`
      )
      const formattedGBanks = response.data?.info?.length
        ? response.data.info.map((gbank: any) => ({
            ...gbank,
            calculatorValue: gbank.calculatorValue
              ? formatCalculatorValue(gbank.calculatorValue.toString())
              : '',
          }))
        : []

      setGbanks(formattedGBanks)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('API Error:', error.response?.data) // Depuração
        setError({
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        })
      } else {
        setError({
          message: 'Erro inesperado',
          response: error,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGBanks() // Faz a primeira chamada imediata

    const interval = setInterval(() => {
      fetchGBanks()
    }, 10000) // 30 segundos

    return () => clearInterval(interval) // Limpa o intervalo ao desmontar o componente
  }, [])

  // Handler para adicionar um novo GBank
  const handleAddGBank = async () => {
    if (!newGBankName.trim()) return

    setIsSubmitting(true)
    try {
      await api.post(`${import.meta.env.VITE_API_BASE_URL}/gbanks`, {
        name: newGBankName,
      })
      setNewGBankName('')
      await fetchGBanks()
    } catch (error) {
      handleError(error, 'Erro ao adicionar GBank')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handler para editar o nome (modal de edição)
  const handleUpdateGBank = async () => {
    if (!editGBank?.name.trim()) return

    setIsSubmitting(true)
    try {
      const payload = {
        id: editGBank.id,
        name: editGBank.name,
      }
      await api.put(`${import.meta.env.VITE_API_BASE_URL}/gbanks`, payload)
      setEditGBank(null)
      await fetchGBanks()
    } catch (error) {
      handleError(error, 'Erro ao atualizar GBank')
    } finally {
      setIsSubmitting(false)
    }
  }

  // NOVO: Handler para atualizar a calculadora do GBank via PUT
  const handleUpdateGBankCalculator = async (
    gbank: GBank,
    newValue: string
  ) => {
    if (!newValue.trim()) return

    setIsSubmitting(true)
    try {
      const numericValue = Number(
        newValue
          .replace(/,/g, '') // Remove formatação
          .replace(/^-[0]+/, '-0') // Mantém o negativo se for zero
      )
      const payload = {
        id: gbank.id,
        balance: numericValue,
      }

      await api.put(
        `${import.meta.env.VITE_API_BASE_URL}/gbanks/value`,
        payload
      )

      await fetchGBanks()
    } catch (error) {
      handleError(error, 'Erro ao atualizar calculadora do GBank')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handler para excluir um GBank
  const handleDeleteGBank = async () => {
    if (!deleteGBank) return

    setIsSubmitting(true)
    try {
      await api.delete(
        `${import.meta.env.VITE_API_BASE_URL}/gbanks/${deleteGBank.id}`
      )
      setDeleteGBank(null)
      await fetchGBanks()
    } catch (error) {
      handleError(error, 'Erro ao deletar GBank')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handler de erro
  const handleError = (error: unknown, defaultMessage: string) => {
    if (axios.isAxiosError(error)) {
      setError({
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      })
    } else {
      setError({
        message: defaultMessage,
        response: error,
      })
    }
  }

  const toggleActionsDropdown = (index: number) => {
    setOpenRowIndex((prev) => (prev === index ? null : index))
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenRowIndex(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className='flex h-[90%] w-[25%] flex-col overflow-y-auto rounded-md border border-gray-300'>
      <div className='top-0 flex gap-4 bg-zinc-400 p-2'>
        <input
          className='rounded-md px-1 text-black'
          type='text'
          value={newGBankName}
          onChange={(e) => setNewGBankName(e.target.value)}
          placeholder='Novo GBank'
        />
        <button
          className={`rounded-md bg-red-400 px-4 py-1 transition-colors hover:bg-red-500 ${
            isSubmitting ? 'cursor-not-allowed opacity-50' : ''
          }`}
          onClick={handleAddGBank}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adicionando...' : 'Add G-Bank'}
        </button>
      </div>

      <table className='w-full border-collapse'>
        <thead className='sticky top-0 bg-zinc-400 text-gray-700'>
          <tr className='text-md'>
            <th className='border p-2' />
            <th className='w-[150px] border p-2'>GBANKS</th>
            <th className='w-[150px] border p-2'>SALDO</th>
            <th className='w-[150px] border p-2'>CALCULADORA</th>
          </tr>
        </thead>
        <tbody className='table-row-group bg-zinc-200 text-sm font-medium text-zinc-900'>
          {isLoading ? (
            <tr>
              <td colSpan={4} className='p-4 text-center'>
                <span className='inline-block h-6 w-6 animate-spin rounded-full border-4 border-gray-600 border-t-transparent' />
                <p>Carregando...</p>
              </td>
            </tr>
          ) : (
            gbanks?.map((gbank, index) => (
              <tr key={gbank.id} className='border border-gray-300'>
                <td className='relative p-2'>
                  <button onClick={() => toggleActionsDropdown(index)}>
                    <DotsThreeVertical size={20} />
                  </button>
                  {openRowIndex === index && (
                    <div
                      ref={menuRef}
                      className='absolute left-8 top-0 z-50 flex flex-col gap-2 rounded border bg-white p-2 px-4 shadow-md'
                    >
                      <button
                        onClick={() => {
                          setEditGBank(gbank)
                        }}
                        className='text-left hover:bg-gray-100'
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteGBank(gbank)}
                        className='text-left text-red-500 hover:bg-gray-100'
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
                <td className='p-2 text-center'>{gbank.name}</td>
                <td className='p-2 text-center'>
                  {Math.round(Number(gbank.balance)).toLocaleString('en-US')}
                </td>
                <td className='p-2 text-center'>
                  <input
                    className='rounded-md bg-zinc-100 p-2'
                    type='text'
                    value={gbank.calculatorValue}
                    onChange={(e) => {
                      const formatted = formatCalculatorValue(e.target.value)
                      setGbanks((prev) =>
                        prev.map((g) =>
                          g.id === gbank.id
                            ? { ...g, calculatorValue: formatted }
                            : g
                        )
                      )
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdateGBankCalculator(
                          gbank,
                          e.currentTarget.value
                        )
                      }
                    }}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal de Edição */}
      {editGBank && (
        <Modal onClose={() => setEditGBank(null)}>
          <div className='w-96 rounded-lg bg-white p-4 shadow-lg'>
            <h2 className='mb-4 text-lg font-semibold'>Editar GBank</h2>
            <input
              type='text'
              className='mb-4 w-full rounded border p-2'
              value={editGBank.name}
              onChange={(e) =>
                setEditGBank({ ...editGBank, name: e.target.value })
              }
            />
            <div className='flex justify-end gap-2'>
              <button
                className={`rounded bg-blue-500 px-4 py-2 text-white ${
                  isSubmitting ? 'cursor-not-allowed opacity-50' : ''
                }`}
                onClick={handleUpdateGBank}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                className='rounded bg-gray-300 px-4 py-2'
                onClick={() => setEditGBank(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de Exclusão */}
      {deleteGBank && (
        <Modal onClose={() => setDeleteGBank(null)}>
          <div className='w-96 rounded-lg bg-white p-4 shadow-lg'>
            <h2 className='mb-4 text-lg font-semibold'>Confirmar Exclusão</h2>
            <p>Tem certeza que deseja excluir o GBank "{deleteGBank.name}"?</p>
            <div className='mt-4 flex justify-end gap-2'>
              <button
                className={`rounded bg-red-500 px-4 py-2 text-white ${
                  isSubmitting ? 'cursor-not-allowed opacity-50' : ''
                }`}
                onClick={handleDeleteGBank}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Excluindo...' : 'Excluir'}
              </button>
              <button
                className='rounded bg-gray-300 px-4 py-2'
                onClick={() => setDeleteGBank(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de Erro */}
      {error && (
        <Modal onClose={() => setError(null)}>
          <ErrorComponent error={error} onClose={() => setError(null)} />
        </Modal>
      )}
    </div>
  )
}
