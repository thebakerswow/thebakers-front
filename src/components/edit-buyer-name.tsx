import { PencilSimple } from '@phosphor-icons/react'
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
import { updatePayer, type Payer } from '../services/api'

interface EditBuyerNameProps {
  buyer: Payer
  onClose: () => void
  onBuyerUpdated: (updatedBuyer: Payer) => void
}

export function EditBuyerName({
  buyer,
  onClose,
  onBuyerUpdated,
}: EditBuyerNameProps) {
  const [buyerName, setBuyerName] = useState(buyer.name)
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

    if (buyerName.trim() === buyer.name) {
      Swal.fire({
        icon: 'info',
        title: 'No changes',
        text: 'The name is the same as before.',
        confirmButtonColor: 'rgb(147, 51, 234)',
        background: '#2a2a2a',
        color: 'white',
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Chama API para atualizar o payer
      const updatedPayer = await updatePayer({ 
        id: buyer.id, 
        name: buyerName.trim() 
      })
      
      // Atualiza a lista no componente pai e fecha o modal
      onBuyerUpdated(updatedPayer)
      onClose()
      
      // Mostra mensagem de sucesso após fechar o modal
      setTimeout(() => {
        Swal.fire({
          title: 'Success!',
          text: 'Buyer updated successfully!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#2a2a2a',
          color: 'white',
        })
      }, 100)
    } catch (error) {
      console.error('Error updating buyer:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update buyer.',
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
        Edit Buyer Name
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
                <PencilSimple size={20} />
              )
            }
            sx={{
              backgroundColor: 'rgb(147, 51, 234)',
              '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
              mt: 2,
            }}
          >
            {isSubmitting ? 'Updating...' : 'Update'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

