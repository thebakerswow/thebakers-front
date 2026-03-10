import { useState } from 'react'
import { UserPlus } from '@phosphor-icons/react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  CircularProgress,
  IconButton,
} from '@mui/material'
import axios from 'axios'
import { createSpecialRun } from '../services/api/runs'
import { ErrorDetails } from './error-display'
import Swal from 'sweetalert2'
import CloseIcon from '@mui/icons-material/Close'

interface AddSpecialRunProps {
  onClose: () => void
  onRunAddedReload: () => void
  onError?: (error: ErrorDetails) => void
  variant: 'keys' | 'leveling' | 'pvp'
}

const getVariantConfig = (variant: AddSpecialRunProps['variant']) => {
  if (variant === 'keys') {
    return {
      runTypeLabel: 'Keys',
    }
  }
  if (variant === 'leveling') {
    return {
      runTypeLabel: 'Leveling',
    }
  }
  if (variant === 'pvp') {
    return {
      runTypeLabel: 'PVP',
    }
  }
  return {
    runTypeLabel: 'Keys',
  }
}

export function AddSpecialRun({
  onClose,
  onRunAddedReload,
  onError,
  variant,
}: AddSpecialRunProps) {
  const config = getVariantConfig(variant)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    runType: config.runTypeLabel,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleDateChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      date: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createSpecialRun(formData.date, formData.runType)
      await onRunAddedReload()
      setIsSuccess(true)
      onClose()
      setTimeout(() => {
        Swal.fire({
          title: 'Success!',
          text: 'Run created successfully!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        })
      }, 150)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        onError?.({
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        })
      } else {
        onError?.({ message: 'Unexpected error', response: error })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={true} onClose={onClose} fullWidth>
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
        {isSuccess ? 'Success' : 'Add Run'}
        <IconButton
          aria-label='close'
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', width: '100%', p: 4 }}>
        <form onSubmit={handleSubmit} className='mt-2 grid grid-cols-2 gap-4'>
          <TextField
            type='date'
            id='date'
            label='Date'
            required
            value={formData.date}
            onChange={handleDateChange}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            type='text'
            id='runType'
            label='Run Type'
            value={config.runTypeLabel}
            fullWidth
            disabled
          />

          <div className='col-span-2 flex items-center justify-center'>
            <Button
              type='submit'
              variant='contained'
              sx={{
                backgroundColor: 'rgb(147, 51, 234)',
                '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
                padding: '10px 20px',
                boxShadow: 3,
              }}
              disabled={isSubmitting}
              startIcon={
                isSubmitting ? (
                  <CircularProgress size={20} color='inherit' />
                ) : (
                  <UserPlus size={20} />
                )
              }
            >
              {isSubmitting ? 'Creating...' : 'Add Run'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
