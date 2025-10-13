import { Plus } from '@phosphor-icons/react'
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

interface AddStatusToListProps {
  onClose: () => void
  onStatusAdded: (statusLabel: string, statusValue: string) => void
}

export function AddStatusToList({
  onClose,
  onStatusAdded,
}: AddStatusToListProps) {
  const [statusLabel, setStatusLabel] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!statusLabel.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Name required',
        text: 'Please enter the status name.',
        confirmButtonColor: 'rgb(147, 51, 234)',
      })
      return
    }

    setIsSubmitting(true)

    try {
      // TODO: Adicionar chamada à API para salvar a situação se necessário
      // await saveStatus({ label: statusLabel })
      
      // Gera um valor baseado no label (lowercase, sem espaços)
      const statusValue = statusLabel.toLowerCase().replace(/\s+/g, '_')
      
      onStatusAdded(statusLabel, statusValue)
      
      Swal.fire({
        title: 'Success!',
        text: 'Status added to list!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error('Error adding status:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add status.',
        confirmButtonColor: 'rgb(147, 51, 234)',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className='relative text-center'>
        Add New Status
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
            label='Status Name'
            required
            value={statusLabel}
            onChange={(e) => setStatusLabel(e.target.value)}
            variant='outlined'
            fullWidth
            placeholder='Ex: Under Review, Awaiting Confirmation...'
            autoFocus
            helperText='Enter the name of the new payment status'
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
                <Plus size={20} />
              )
            }
            sx={{
              backgroundColor: 'rgb(147, 51, 234)',
              '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
              mt: 2,
            }}
          >
            {isSubmitting ? 'Adding...' : 'Add to List'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

