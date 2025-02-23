import { useState } from 'react'
import axios from 'axios'
import { api } from '../services/axiosConfig'
import { ErrorDetails, ErrorComponent } from './error-display'
import { Modal } from './modal'

interface DeleteBuyerProps {
  buyer: {
    id: string
    nameAndRealm: string
  }
  onClose: () => void
  onDeleteSuccess: () => void
}

export function DeleteBuyer({
  buyer,
  onClose,
  onDeleteSuccess,
}: DeleteBuyerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<ErrorDetails | null>(null)

  const handleDelete = async () => {
    setIsSubmitting(true)

    try {
      await api.delete(`/buyer/${buyer.id}`)
      await onDeleteSuccess()
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

  return (
    <Modal onClose={onClose}>
      <div className='p-4 bg-white rounded-lg shadow-lg w-96'>
        {error ? (
          <ErrorComponent error={error} onClose={() => setError(null)} />
        ) : (
          <>
            <h2 className='text-lg font-semibold mb-4'>Confirm Deletion</h2>
            <p>Are you sure you want to delete {buyer.nameAndRealm}?</p>
            <div className='flex gap-2 mt-4'>
              <button
                className={`bg-red-500 text-white px-4 py-2 rounded ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isSubmitting}
                onClick={handleDelete}
              >
                {isSubmitting ? (
                  <div className='flex gap-4'>
                    <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                    Deleting...
                  </div>
                ) : (
                  'Delete'
                )}
              </button>
              <button
                className='bg-gray-300 text-black px-4 py-2 rounded'
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
