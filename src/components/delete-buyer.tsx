import { useState } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2' // Import SweetAlert2
import { deleteBuyer } from '../services/api/buyers'
import { ErrorDetails, ErrorComponent } from './error-display'
import Button from '@mui/material/Button'
import { LoadingSpinner } from './loading-spinner' // Import reusable spinner

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
    setError(null) // Reset error state before attempting deletion

    try {
      await deleteBuyer(buyer.id)
      Swal.fire({
        title: 'Success!',
        text: 'Buyer deleted successfully',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      }) // Show success confirmation
      onDeleteSuccess()
      onClose()
    } catch (err) {
      const errorDetails = axios.isAxiosError(err)
        ? {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status,
          }
        : { message: 'Unexpected error', response: err }
      setError(errorDetails)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='w-96 rounded-lg bg-white p-4 shadow-lg'>
      {error ? (
        <ErrorComponent error={error} onClose={() => setError(null)} />
      ) : (
        <>
          <h2 className='mb-4 text-lg font-semibold'>Confirm Deletion</h2>
          <p>
            Are you sure you want to delete{' '}
            <span className='font-bold'>{buyer.nameAndRealm}</span>?
          </p>
          <div className='mt-4 flex gap-2'>
            <Button
              variant='contained'
              color='error'
              disabled={isSubmitting}
              onClick={handleDelete}
            >
              {isSubmitting ? (
                <div className='flex gap-4'>
                  <LoadingSpinner /> Deleting...
                </div>
              ) : (
                'Delete'
              )}
            </Button>
            <Button
              variant='contained'
              color='inherit'
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
