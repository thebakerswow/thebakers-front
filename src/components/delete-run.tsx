import { useState } from 'react'
import axios from 'axios'
import { deleteRun } from '../services/api/runs'
import { ErrorDetails, ErrorComponent } from './error-display'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material'
import Swal from 'sweetalert2'

import { DeleteRunProps } from '../types'

export function DeleteRun({ run, onClose, onDeleteSuccess }: DeleteRunProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  return (
    <Dialog open onClose={onClose}>
      {error ? (
        <ErrorComponent error={error} onClose={() => setError(null)} />
      ) : (
        <>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <p>
              Are you sure you want to delete the run for{' '}
              <strong>{run.raid}</strong> on{' '}
              <strong>
                {new Date(run.date).toLocaleDateString(undefined, {
                  timeZone: 'UTC',
                })}
              </strong>
              ?
            </p>
          </DialogContent>
          <DialogActions>
            <Button
              variant='contained'
              color='error'
              onClick={handleDelete}
              disabled={isSubmitting}
              startIcon={isSubmitting && <CircularProgress size={20} />}
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </Button>
            <Button
              variant='outlined'
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  )
}
