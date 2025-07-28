import { useState } from 'react'
import axios from 'axios'
import { updateBuyer } from '../services/api/buyers'
import { ErrorDetails, ErrorComponent } from './error-display'
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import Swal from 'sweetalert2'

interface EditBuyerProps {
  buyer: {
    id: string
    nameAndRealm: string
    buyerPot: number
    buyerDolarPot: number
    buyerNote: string
  }
  onClose: () => void
  onEditSuccess: () => void
  runIdTeam?: string // Added for team-based field visibility
}

export function EditBuyer({
  buyer,
  onClose,
  onEditSuccess,
  runIdTeam,
}: EditBuyerProps) {
  const [formData, setFormData] = useState({
    nameAndRealm: buyer.nameAndRealm,
    buyerPot:
      typeof buyer.buyerPot === 'number'
        ? buyer.buyerPot.toLocaleString('en-US')
        : '',
    buyerDolarPot:
      typeof buyer.buyerDolarPot === 'number'
        ? buyer.buyerDolarPot.toLocaleString('en-US')
        : '',
    buyerNote: buyer.buyerNote,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<ErrorDetails | null>(null)

  // Function to determine if the dollar field should be hidden
  const shouldHideDolarField = (): boolean => {
    return (
      runIdTeam === import.meta.env.VITE_TEAM_MPLUS ||
      runIdTeam === import.meta.env.VITE_TEAM_LEVELING
    )
  }

  // Função para formatar o valor do campo "buyerDolarPot" igual ao input do dólar da calculadora do balance-control-table
  const formatBuyerDolarPot = (value: string) => {
    let rawValue = value
      .replace(/[^0-9.-]/g, '')
      .replace(/(?!^)-/g, '') // apenas um hífen no início
      .replace(/^(-?\d*)\.(.*)\./, '$1.$2') // apenas um ponto

    const parts = rawValue.split('.')
    let formattedValue = parts[0]
      ? Number(parts[0].replace(/,/g, '')).toLocaleString('en-US')
      : ''
    if (rawValue.startsWith('-') && !formattedValue.startsWith('-')) {
      formattedValue = '-' + formattedValue
    }
    if (parts.length > 1) {
      formattedValue += '.' + parts[1].replace(/[^0-9]/g, '')
    }
    return rawValue === '0' ? '' : formattedValue
  }

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        field === 'buyerPot'
          ? e.target.value.replace(/\D/g, '') // Remove non-numeric characters
          : field === 'buyerDolarPot'
            ? formatBuyerDolarPot(e.target.value)
            : e.target.value
      setFormData((prev) => ({
        ...prev,
        [field]:
          field === 'buyerPot' && value
            ? Number(value).toLocaleString('en-US')
            : value,
      }))
    }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    // Validar se os valores são números válidos
    const buyerPotValue = Number(formData.buyerPot.replace(/,/g, ''))
    const buyerDolarPotValue = Number(formData.buyerDolarPot.replace(/,/g, ''))

    if (isNaN(buyerPotValue) || isNaN(buyerDolarPotValue)) {
      setError({
        message: 'Invalid numeric values',
        response: 'Please enter valid numbers for Pot and Dolar Pot fields',
        status: 400,
      })
      setIsSubmitting(false)
      return
    }

    const payload = {
      id_buyer: buyer.id,
      nameAndRealm: formData.nameAndRealm || '',
      buyerPot: buyerPotValue || 0,
      buyerDolarPot: buyerDolarPotValue || 0,
      buyerNote: formData.buyerNote || '',
    }

    try {
      await updateBuyer(buyer.id, payload)
      await onEditSuccess()

      Swal.fire({
        title: 'Success!',
        text: 'Buyer updated successfully',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      })

      onClose()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError({
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        })
      } else {
        setError({ message: 'Unexpected error', response: error })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={true} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle className='relative'>
        Edit Buyer
        <IconButton
          aria-label='close'
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {error ? (
          <ErrorComponent error={error} onClose={() => setError(null)} />
        ) : (
          <div className='flex flex-col gap-4 pt-2'>
            <TextField
              label='Name-Realm'
              variant='outlined'
              fullWidth
              value={formData.nameAndRealm}
              onChange={handleChange('nameAndRealm')}
              slotProps={{ input: { inputProps: { maxLength: 255 } } }}
            />
            <TextField
              label='Pot'
              variant='outlined'
              fullWidth
              value={formData.buyerPot}
              onChange={handleChange('buyerPot')}
            />
            {!shouldHideDolarField() && (
              <TextField
                label='Dolar Pot'
                variant='outlined'
                fullWidth
                value={formData.buyerDolarPot}
                onChange={handleChange('buyerDolarPot')}
              />
            )}
            <TextField
              label='Note'
              variant='outlined'
              fullWidth
              value={formData.buyerNote}
              onChange={handleChange('buyerNote')}
            />
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='inherit'>
          Cancel
        </Button>
        <Button
          variant='contained'
          disabled={isSubmitting}
          onClick={handleSubmit}
          sx={{
            backgroundColor: 'rgb(147, 51, 234)',
            '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
          }}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
