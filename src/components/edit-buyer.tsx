import { useState } from 'react'
import axios from 'axios'
import { api } from '../services/axiosConfig'
import { ErrorDetails, ErrorComponent } from './error-display'
import { Button, TextField } from '@mui/material'

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
}

export function EditBuyer({ buyer, onClose, onEditSuccess }: EditBuyerProps) {
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
    const payload = {
      id_buyer: buyer.id,
      nameAndRealm: formData.nameAndRealm,
      buyerPot: Number(formData.buyerPot.replace(/,/g, '')), // Remove commas for backend
      buyerDolarPot: Number(formData.buyerDolarPot.replace(/,/g, '')),
      buyerNote: formData.buyerNote,
    }

    try {
      await api.put('/buyer', payload)
      await onEditSuccess()
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

  return error ? (
    <ErrorComponent error={error} onClose={() => setError(null)} />
  ) : (
    <>
      <h2 className='mb-4 text-center text-lg font-semibold'>Edit Buyer</h2>
      <div className='flex flex-col gap-4'>
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
        <TextField
          label='Dolar Pot'
          variant='outlined'
          fullWidth
          value={formData.buyerDolarPot}
          onChange={handleChange('buyerDolarPot')}
        />
        <TextField
          label='Note'
          variant='outlined'
          fullWidth
          value={formData.buyerNote}
          onChange={handleChange('buyerNote')}
        />
      </div>
      <Button
        variant='contained'
        color='error'
        fullWidth
        disabled={isSubmitting}
        onClick={handleSubmit}
        sx={{
          backgroundColor: 'rgb(239, 68, 68)',
          '&:hover': { backgroundColor: 'rgb(248, 113, 113)' },
          mt: 2,
        }}
      >
        {isSubmitting ? 'Saving...' : 'Save'}
      </Button>
    </>
  )
}
