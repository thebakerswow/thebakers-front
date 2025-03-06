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

  // Função para buscar os GBanks
  const fetchGBanks = async () => {
    setIsLoading(true)
    try {
      const response = await api.get(
        `${import.meta.env.VITE_API_BASE_URL}/gbanks`
      )
      setGbanks(response.data.info)
    } catch (error) {
      handleError(error, 'Erro ao carregar GBanks')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGBanks()
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
      const payload = {
        id: gbank.id,
        balance: Number(newValue),
      }
      // Atualiza o campo "calculatorValue" do GBank via PUT.
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
    <div className='w-[25%] h-[90%] overflow-y-auto border border-gray-300 rounded-md flex flex-col'>
      <div className='flex gap-4 p-2 bg-zinc-400 top-0'>
        <input
          className='rounded-md text-black px-1'
          type='text'
          value={newGBankName}
          onChange={(e) => setNewGBankName(e.target.value)}
          placeholder='Novo GBank'
        />
        <button
          className={`bg-red-400 px-4 py-1 rounded-md hover:bg-red-500 transition-colors ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={handleAddGBank}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adicionando...' : 'Add G-Bank'}
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
          {isLoading ? (
            <tr>
              <td colSpan={4} className='p-4 text-center'>
                <span className='animate-spin border-4 border-t-transparent border-gray-600 rounded-full w-6 h-6 inline-block' />
                <p>Carregando...</p>
              </td>
            </tr>
          ) : (
            gbanks?.map((gbank, index) => (
              <tr key={gbank.id} className='border border-gray-300'>
                <td className='p-2 relative'>
                  <button onClick={() => toggleActionsDropdown(index)}>
                    <DotsThreeVertical size={20} />
                  </button>
                  {openRowIndex === index && (
                    <div
                      ref={menuRef}
                      className='absolute left-8 top-0 flex flex-col gap-2 p-2 px-4 bg-white border rounded shadow-md z-50'
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
                        className='text-left hover:bg-gray-100 text-red-500'
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
                <td className='p-2 text-center'>{gbank.name}</td>
                <td className='p-2 text-center'>{gbank.balance}</td>
                <td className='p-2 text-center'>
                  <input
                    className='p-2 bg-zinc-100 rounded-md'
                    type='text'
                    value={gbank.calculatorValue}
                    onChange={(e) =>
                      setGbanks((prev) =>
                        prev.map((g) =>
                          g.id === gbank.id
                            ? { ...g, calculatorValue: e.target.value }
                            : g
                        )
                      )
                    }
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
          <div className='p-4 bg-white rounded-lg shadow-lg w-96'>
            <h2 className='text-lg font-semibold mb-4'>Editar GBank</h2>
            <input
              type='text'
              className='w-full p-2 mb-4 border rounded'
              value={editGBank.name}
              onChange={(e) =>
                setEditGBank({ ...editGBank, name: e.target.value })
              }
            />
            <div className='flex gap-2 justify-end'>
              <button
                className={`bg-blue-500 text-white px-4 py-2 rounded ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={handleUpdateGBank}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                className='bg-gray-300 px-4 py-2 rounded'
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
          <div className='p-4 bg-white rounded-lg shadow-lg w-96'>
            <h2 className='text-lg font-semibold mb-4'>Confirmar Exclusão</h2>
            <p>Tem certeza que deseja excluir o GBank "{deleteGBank.name}"?</p>
            <div className='flex gap-2 justify-end mt-4'>
              <button
                className={`bg-red-500 text-white px-4 py-2 rounded ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={handleDeleteGBank}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Excluindo...' : 'Excluir'}
              </button>
              <button
                className='bg-gray-300 px-4 py-2 rounded'
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
