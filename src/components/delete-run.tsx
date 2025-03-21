import { useState } from 'react'
import axios from 'axios'
import { api } from '../services/axiosConfig'
import { ErrorDetails, ErrorComponent } from './error-display'
import { Modal } from './modal'

interface DeleteRunProps {
  run: {
    id: string
    raid: string
    date: string
  }
  onClose: () => void
  onDeleteSuccess: () => void
}

export function DeleteRun({ run, onClose, onDeleteSuccess }: DeleteRunProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<ErrorDetails | null>(null)

  const handleDelete = async () => {
    setIsSubmitting(true)

    try {
      await api.delete(
        `${import.meta.env.VITE_API_BASE_URL}/run/${run.id}` ||
          `http://localhost:8000/v1/run/${run.id}`
      )
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
      <div className='w-96 rounded-lg bg-white p-4 shadow-lg'>
        {error ? (
          <ErrorComponent error={error} onClose={() => setError(null)} />
        ) : (
          <>
            <h2 className='mb-4 text-lg font-semibold'>Confirm Deletion</h2>
            <p>
              Are you sure you want to delete the run for{' '}
              <strong>{run.raid}</strong> on{' '}
              <strong>{new Date(run.date).toLocaleDateString()}</strong>?
            </p>
            <div className='mt-4 flex gap-2'>
              <button
                className={`rounded bg-red-500 px-4 py-2 text-white ${
                  isSubmitting ? 'cursor-not-allowed opacity-50' : ''
                }`}
                disabled={isSubmitting}
                onClick={handleDelete}
              >
                {isSubmitting ? (
                  <div className='flex gap-4'>
                    <div className='h-5 w-5 animate-spin rounded-full border-b-2 border-white'></div>
                    Deleting...
                  </div>
                ) : (
                  'Delete'
                )}
              </button>
              <button
                className='rounded bg-gray-300 px-4 py-2 text-black'
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
