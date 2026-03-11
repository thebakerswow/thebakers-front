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
import { createPayer } from '../../../../services/api'

interface AddBuyerToListProps {
  onClose: () => void
  onBuyerAdded: (buyerName: string, buyerId: string | number) => void
}

export function AddBuyerToList({
  onClose,
  onBuyerAdded,
}: AddBuyerToListProps) {
  const [buyerName, setBuyerName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!buyerName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Name required',
        text: 'Please enter the buyer name.',
        confirmButtonColor: 'rgb(147, 51, 234)',
        background: '#2a2a2a',
        color: 'white',
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Chama API para criar o payer
      const newPayer = await createPayer({ name: buyerName.trim() })
      
      // Atualiza a lista no componente pai e fecha o modal
      onBuyerAdded(newPayer.name, newPayer.id)
      onClose()
      
      // Mostra mensagem de sucesso após fechar o modal
      setTimeout(() => {
        Swal.fire({
          title: 'Success!',
          text: 'Buyer added to list!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#2a2a2a',
          color: 'white',
        })
      }, 100)
    } catch (error) {
      console.error('Error adding buyer:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add buyer.',
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
        Add Buyer to List
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
            label='Buyer Name'
            required
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            variant='outlined'
            fullWidth
            placeholder='Enter buyer name...'
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
            {isSubmitting ? 'Adding...' : 'Add to List'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

