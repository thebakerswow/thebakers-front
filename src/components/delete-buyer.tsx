import { useState, useEffect } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2' // Import SweetAlert2
import { deleteBuyer } from '../services/api/buyers'
import { ErrorDetails, ErrorComponent } from './error-display'
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
  const [, setIsSubmitting] = useState(false)
  const [error, setError] = useState<ErrorDetails | null>(null)

  const handleDelete = async () => {
    Swal.fire({
      title: 'Confirm Deletion',
      text: `Are you sure you want to delete ${buyer.nameAndRealm}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
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
      } else {
        // If user cancels, close the modal
        onClose()
      }
    })
  }

  // Auto-trigger the delete confirmation when component mounts
  useEffect(() => {
    handleDelete()
  }, [])

  return (
    <div className='w-96 rounded-lg bg-white p-4 shadow-lg'>
      {error ? (
        <ErrorComponent error={error} onClose={() => setError(null)} />
      ) : (
        <>
          <h2 className='mb-4 text-lg font-semibold'>Deleting Buyer</h2>
          <p>Please wait while we process your request...</p>
          <div className='mt-4 flex justify-center'>
            <LoadingSpinner />
          </div>
        </>
      )}
    </div>
  )
}
