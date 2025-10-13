import { UserPlus, Plus } from '@phosphor-icons/react'
import CloseIcon from '@mui/icons-material/Close'
import { useState } from 'react'
import Swal from 'sweetalert2'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  IconButton,
  Box,
} from '@mui/material'
import { ErrorDetails } from './error-display'
import { AddBuyerToList } from './add-buyer-to-list'
import { AddStatusToList } from './add-status-to-list'

interface AddPaymentProps {
  onClose: () => void
  onPaymentAdded: () => void
  onError?: (error: ErrorDetails) => void
}

interface BuyerOption {
  id: string | number
  name: string
}

interface StatusOption {
  value: string
  label: string
}

export function AddPayment({
  onClose,
  onPaymentAdded,
  onError,
}: AddPaymentProps) {
  const [formData, setFormData] = useState({
    note: '',
    buyer: '',
    valueGold: '',
    dollar: '',
    mValue: '',
    date: '',
    paymentDate: 'payment 01/10',
    paymentStatus: 'pending' as 'pending' | 'completed',
  })
  
  const [buyers, setBuyers] = useState<BuyerOption[]>([
    // Mock data - substituir por chamada à API
    { id: 1, name: 'João Silva' },
    { id: 2, name: 'Maria Santos' },
    { id: 3, name: 'Pedro Costa' },
  ])

  const [paymentDateOptions, setPaymentDateOptions] = useState<StatusOption[]>([
    { value: 'payment 01/10', label: 'Payment 01/10' },
    { value: 'payment 07/10', label: 'Payment 07/10' },
    { value: 'payment 15/10', label: 'Payment 15/10' },
  ])

  const paymentStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
  ]
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isAddBuyerOpen, setIsAddBuyerOpen] = useState(false)
  const [isAddPaymentDateOpen, setIsAddPaymentDateOpen] = useState(false)

  // Função para formatar valor em gold
  const formatGoldValue = (value: string) => {
    const rawValue = value.replace(/\D/g, '')
    return rawValue ? Number(rawValue).toLocaleString('en-US') : ''
  }

  // Função para formatar valor em dólar
  const formatDollarValue = (value: string) => {
    let rawValue = value
      .replace(/[^0-9.-]/g, '')
      .replace(/(?!^)-/g, '')
      .replace(/^(-?\d*)\.(.*)\./, '$1.$2')

    const parts = rawValue.split('.')
    let formattedValue = parts[0]
      ? Number(parts[0].replace(/,/g, '')).toLocaleString('en-US')
      : ''
    
    if (rawValue.startsWith('-') && !formattedValue.startsWith('-')) {
      formattedValue = '-' + formattedValue
    }
    
    if (parts.length > 1) {
      formattedValue += '.' + parts[1].replace(/[^0-9]/g, '').substring(0, 2)
    }
    
    return formattedValue
  }

  const handleTextFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError(null)

    // Validação
    if (!formData.buyer) {
      setFormError('Please select a buyer.')
      setIsSubmitting(false)
      return
    }

    if (!formData.valueGold && !formData.dollar) {
      setFormError('Please fill in at least Gold Value or Dollar Value.')
      setIsSubmitting(false)
      return
    }

    const data = {
      note: formData.note,
      buyer: formData.buyer,
      valueGold: Number(formData.valueGold.replace(/,/g, '')) || 0,
      dollar: Number(formData.dollar.replace(/,/g, '')) || 0,
      mValue: Number(formData.mValue.replace(/,/g, '')) || 0,
      date: formData.date,
      paymentDate: formData.paymentDate,
      paymentStatus: formData.paymentStatus,
    }

    try {
      // TODO: Substituir por chamada real à API
      // await createPayment(data)
      console.log('Payment data:', data)
      
      onPaymentAdded()
      onClose()

      setTimeout(() => {
        Swal.fire({
          title: 'Success!',
          text: 'Payment added successfully!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: 'swal2-custom-popup',
          },
        })
      }, 150)
    } catch (error) {
      console.error('Error creating payment:', error)
      const errorDetails = {
        message: 'Error creating payment',
        response: error,
      }

      if (onError) {
        onError(errorDetails)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBuyerAdded = (buyerName: string) => {
    // Adiciona o novo buyer à lista
    const newBuyer = {
      id: Date.now(),
      name: buyerName,
    }
    setBuyers((prev) => [...prev, newBuyer])
    
    // Seleciona automaticamente o buyer recém-adicionado
    setFormData((prev) => ({
      ...prev,
      buyer: buyerName,
    }))
    
    setIsAddBuyerOpen(false)
  }

  const handlePaymentDateAdded = (statusLabel: string, statusValue: string) => {
    // Adiciona a nova payment date à lista
    const newPaymentDate = {
      value: statusValue,
      label: statusLabel,
    }
    setPaymentDateOptions((prev) => [...prev, newPaymentDate])
    
    // Seleciona automaticamente a payment date recém-adicionada
    setFormData((prev) => ({
      ...prev,
      paymentDate: statusValue,
    }))
    
    setIsAddPaymentDateOpen(false)
  }

  return (
    <>
      <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle className='relative text-center'>
          Add Payment
          <IconButton
            aria-label='close'
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <div className='flex w-full flex-col overflow-y-auto overflow-x-hidden'>
            <form onSubmit={handleSubmit} className='mt-4 grid grid-cols-2 gap-4'>
              <TextField
                id='note'
                label='Note/Description'
                required
                value={formData.note}
                onChange={handleTextFieldChange}
                variant='outlined'
                fullWidth
                multiline
                rows={2}
                className='col-span-2'
              />

              <Box sx={{ display: 'flex', gap: 1, gridColumn: 'span 2' }}>
                <FormControl fullWidth variant='outlined'>
                  <InputLabel id='buyer-label'>Buyer *</InputLabel>
                  <Select
                    id='buyer'
                    labelId='buyer-label'
                    value={formData.buyer}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        buyer: e.target.value,
                      }))
                    }
                    label='Buyer *'
                    required
                  >
                    <MenuItem value='' disabled>
                      Select a Buyer
                    </MenuItem>
                    {buyers.map((buyer) => (
                      <MenuItem key={buyer.id} value={buyer.name}>
                        {buyer.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant='contained'
                  onClick={() => setIsAddBuyerOpen(true)}
                  startIcon={<Plus size={20} />}
                  sx={{
                    backgroundColor: 'rgb(147, 51, 234)',
                    '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
                    minWidth: '120px',
                  }}
                >
                  New
                </Button>
              </Box>

              <TextField
                id='valueGold'
                label='Gold Value'
                value={formData.valueGold}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    valueGold: formatGoldValue(e.target.value),
                  }))
                }
                variant='outlined'
                fullWidth
                placeholder='0'
              />

              <TextField
                id='dollar'
                label='Dollar Value ($)'
                value={formData.dollar}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    dollar: formatDollarValue(e.target.value),
                  }))
                }
                variant='outlined'
                fullWidth
                placeholder='0.00'
              />

              <TextField
                id='mValue'
                label='M Value in $ (optional)'
                value={formData.mValue}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    mValue: formatDollarValue(e.target.value),
                  }))
                }
                variant='outlined'
                fullWidth
                placeholder='0.00'
              />

              <TextField
                id='date'
                label='Date'
                type='datetime-local'
                required
                value={formData.date}
                onChange={handleTextFieldChange}
                variant='outlined'
                fullWidth
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />

              <Box sx={{ display: 'flex', gap: 1, gridColumn: 'span 2' }}>
                <FormControl fullWidth variant='outlined'>
                  <InputLabel id='payment-date-label'>Payment Date</InputLabel>
                  <Select
                    id='paymentDate'
                    labelId='payment-date-label'
                    value={formData.paymentDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        paymentDate: e.target.value,
                      }))
                    }
                    label='Payment Date'
                  >
                    {paymentDateOptions.map((paymentDate) => (
                      <MenuItem key={paymentDate.value} value={paymentDate.value}>
                        {paymentDate.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant='contained'
                  onClick={() => setIsAddPaymentDateOpen(true)}
                  startIcon={<Plus size={20} />}
                  sx={{
                    backgroundColor: 'rgb(147, 51, 234)',
                    '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
                    minWidth: '120px',
                  }}
                >
                  New
                </Button>
              </Box>

              <FormControl fullWidth variant='outlined' className='col-span-2'>
                <InputLabel id='payment-status-label'>Status</InputLabel>
                <Select
                  id='paymentStatus'
                  labelId='payment-status-label'
                  value={formData.paymentStatus}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      paymentStatus: e.target.value as 'pending' | 'completed',
                    }))
                  }
                  label='Status'
                >
                  {paymentStatusOptions.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {formError && (
                <div className='col-span-2 text-center font-semibold text-red-600'>
                  {formError}
                </div>
              )}

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
                }}
                className='col-span-2'
              >
                {isSubmitting ? 'Adding...' : 'Add Payment'}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {isAddBuyerOpen && (
        <AddBuyerToList
          onClose={() => setIsAddBuyerOpen(false)}
          onBuyerAdded={handleBuyerAdded}
        />
      )}

      {isAddPaymentDateOpen && (
        <AddStatusToList
          onClose={() => setIsAddPaymentDateOpen(false)}
          onStatusAdded={handlePaymentDateAdded}
        />
      )}
    </>
  )
}

