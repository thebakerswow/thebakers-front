import React, { useState } from 'react'
import axios from 'axios'
import { deleteRun } from '../services/api/runs'
import { ErrorDetails, ErrorComponent } from './error-display'
import Swal from 'sweetalert2'

import { DeleteRunProps } from '../types'

export function DeleteRun({ run, onClose, onDeleteSuccess }: DeleteRunProps) {
  const [, setIsSubmitting] = useState(false)
  const [error, setError] = useState<ErrorDetails | null>(null)

  const handleDelete = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      await deleteRun(run.id)
      onClose() // Close the modal before showing the alert
      await Swal.fire({
        title: 'Deleted!',
        text: 'The run has been successfully deleted.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      })
      onDeleteSuccess()
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

  const confirmDelete = async () => {
    const result = await Swal.fire({
      title: 'Confirm Deletion',
      text: 'Are you sure you want to delete?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          await handleDelete()
          return true
        } catch (error) {
          Swal.showValidationMessage(`Request failed: ${error}`)
          return false
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    })

    if (result.isConfirmed) {
      // The deletion was successful and already handled in preConfirm
      return
    }
  }

  // Show the confirmation dialog immediately when component mounts
  React.useEffect(() => {
    confirmDelete()
  }, [])

  // If there's an error, show it
  if (error) {
    return <ErrorComponent error={error} onClose={() => setError(null)} />
  }

  // Return null since we're using Swal for the UI
  return null
}
