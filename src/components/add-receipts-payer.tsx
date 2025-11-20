import { UserPlus } from '@phosphor-icons/react'
import CloseIcon from '@mui/icons-material/Close'
import { useState } from 'react'
import Swal from 'sweetalert2'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  IconButton,
} from '@mui/material'
import { createReceiptsPayer } from '../services/api'

interface AddReceiptsPayerProps {
  onClose: () => void
  onPayerAdded: (payerName: string, payerId: number) => void
}

export function AddReceiptsPayer({ onClose, onPayerAdded }: AddReceiptsPayerProps) {
  const [payerName, setPayerName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!payerName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Name required',
        text: 'Please enter the payer name.',
        confirmButtonColor: 'rgb(147, 51, 234)',
        background: '#2a2a2a',
        color: 'white',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const newPayer = await createReceiptsPayer({ name: payerName.trim() })

      onPayerAdded(newPayer.name, newPayer.id)
      onClose()

      setTimeout(() => {
        Swal.fire({
          title: 'Success!',
          text: 'Payer added successfully!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#2a2a2a',
          color: 'white',
        })
      }, 100)
    } catch (error) {
      console.error('Error adding receipts payer:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add payer.',
        confirmButtonColor: 'rgb(147, 51, 234)',
        background: '#2a2a2a',
        color: 'white',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className='relative text-center'>
        Add Receipts Payer
        <IconButton
          aria-label='close'
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit} className='mt-4 flex flex-col gap-4'>
          <TextField
            label='Payer Name'
            required
            value={payerName}
            onChange={(e) => setPayerName(e.target.value)}
            variant='outlined'
            fullWidth
            placeholder='Enter payer name...'
            autoFocus
          />

          <Button
            type='submit'
            variant='contained'
            fullWidth
            disabled={isSubmitting}
            startIcon={
              isSubmitting ? (
                <div className='h-5 w-5 animate-spin rounded-full border-b-2 border-white'></div>
              ) : (
                <UserPlus size={20} />
              )
            }
            sx={{
              backgroundColor: 'rgb(147, 51, 234)',
              '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
              mt: 2,
            }}
          >
            {isSubmitting ? 'Adding...' : 'Add Payer'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}


