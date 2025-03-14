import { useState } from 'react'
import axios from 'axios'
import { api } from '../services/axiosConfig'
import { ErrorDetails, ErrorComponent } from './error-display'
import { Modal } from './modal'

interface EditBuyerProps {
  buyer: {
    id: string
    nameAndRealm: string
    buyerPot: number
    buyerNote: string
  }
  onClose: () => void
  onEditSuccess: () => void
}

export function EditBuyer({ buyer, onClose, onEditSuccess }: EditBuyerProps) {
  const [nameAndRealm, setNameAndRealm] = useState(buyer.nameAndRealm)
  const [buyerPot, setBuyerPot] = useState(
    buyer.buyerPot.toLocaleString('en-US')
  ) // Formatar com vírgulas
  const [buyerNote, setBuyerNote] = useState(buyer.buyerNote)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<ErrorDetails | null>(null)

  const handleSubmit = async () => {
    setIsSubmitting(true)

    // Remover as vírgulas ao enviar para o backend
    const buyerPotValue = Number(buyerPot.replace(/,/g, ''))

    const payload = {
      id_buyer: buyer.id,
      nameAndRealm,
      buyerPot: buyerPotValue,
      buyerNote,
    }

    try {
      await api.put(
        `${import.meta.env.VITE_API_BASE_URL}/buyer` ||
          'http://localhost:8000/v1/buyer',
        payload
      )

      await onEditSuccess()
      onClose()
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
          message: 'Unexpected error',
          response: error,
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBuyerPotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '') // Remove tudo que não for número
    if (rawValue) {
      const formattedValue = Number(rawValue).toLocaleString('en-US')
      setBuyerPot(formattedValue)
    } else {
      setBuyerPot('')
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className='p-4 bg-white rounded-lg shadow-lg w-96'>
        {error ? (
          <ErrorComponent error={error} onClose={() => setError(null)} />
        ) : (
          <>
            <h2 className='text-lg font-semibold mb-4'>Edit Buyer</h2>
            <label className='block mb-2'>Name-Realm</label>
            <input
              type='text'
              className='w-full p-2 border rounded mb-4'
              value={nameAndRealm}
              onChange={(e) => setNameAndRealm(e.target.value)}
            />
            <label className='block mb-2'>Pot</label>
            <input
              type='text'
              className='w-full p-2 border rounded mb-4'
              value={buyerPot}
              onChange={handleBuyerPotChange} // Chama a função para formatar o valor com vírgulas
            />
            <label className='block mb-2'>Note</label>
            <input
              type='text'
              className='w-full p-2 border rounded mb-4'
              value={buyerNote}
              onChange={(e) => setBuyerNote(e.target.value)}
            />
            <button
              className={`bg-red-400 text-white px-4 py-2 rounded ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <div className='flex gap-4'>
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                  Saving...
                </div>
              ) : (
                'Save'
              )}
            </button>
          </>
        )}
      </div>
    </Modal>
  )
}
