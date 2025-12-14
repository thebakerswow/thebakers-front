import { PencilSimple } from '@phosphor-icons/react'
import CloseIcon from '@mui/icons-material/Close'
import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  IconButton,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
} from '@mui/material'
import { updateSale, getPayers, getPaymentDates, type Payer, type PaymentDate } from '../services/api'

interface Sale {
  id: number
  note: string
  idPayer: number
  status?: string
  buyerName: string
  valueGold: number
  dollar: number
  mValue: number
  idPaymentDate?: number
  paymentDate?: string
}

interface EditSaleProps {
  sale: Sale
  onClose: () => void
  onSaleUpdated: () => void
}

export function EditSale({
  sale,
  onClose,
  onSaleUpdated,
}: EditSaleProps) {
  const [formData, setFormData] = useState({
    note: sale.note,
    idPayer: sale.idPayer,
    idPaymentDate: sale.idPaymentDate || 0,
    valueGold: sale.valueGold.toString(),
    dollar: sale.dollar.toString(),
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [buyers, setBuyers] = useState<Payer[]>([])
  const [isLoadingBuyers, setIsLoadingBuyers] = useState(true)
  const [paymentDateOptions, setPaymentDateOptions] = useState<PaymentDate[]>([])
  const [isLoadingPaymentDates, setIsLoadingPaymentDates] = useState(true)

  useEffect(() => {
    const fetchBuyers = async () => {
      try {
        setIsLoadingBuyers(true)
        const payersData = await getPayers()
        setBuyers(payersData)
      } catch (error) {
        console.error('Error fetching buyers:', error)
      } finally {
        setIsLoadingBuyers(false)
      }
    }

    const fetchPaymentDates = async () => {
      try {
        setIsLoadingPaymentDates(true)
        const paymentDatesData = await getPaymentDates({ is_date_valid: true })
        const validPaymentDatesData = Array.isArray(paymentDatesData) ? paymentDatesData : []
        
        // Converte datas de YYYY-MM-DD para MM/DD
        const convertedDates = validPaymentDatesData.map(date => {
          const match = date.name.match(/^\d{4}-(\d{1,2})-(\d{1,2})$/)
          if (match) {
            const month = match[1]
            const day = match[2]
            return { ...date, name: `${month}/${day}` }
          }
          return date
        })
        
        // Ordenar datas por data parseada (cronologicamente)
        const sortedDates = [...convertedDates].sort((dateA, dateB) => {
          // Função para parsear data no formato MM/DD
          const parseDateString = (dateStr: string) => {
            const match = dateStr.match(/(\d{1,2})\/(\d{1,2})/)
            if (match) {
              const month = parseInt(match[1])
              const day = parseInt(match[2])
              return month * 100 + day
            }
            return 0
          }
          
          // PRIORIDADE 1: Tenta parsear como data MM/DD
          const dateValueA = parseDateString(dateA.name)
          const dateValueB = parseDateString(dateB.name)
          
          if (dateValueA && dateValueB) {
            return dateValueA - dateValueB
          }
          
          // PRIORIDADE 2: Se não conseguir parsear, tenta ordenar por ID
          const idA = Number(dateA.id)
          const idB = Number(dateB.id)
          
          if (!isNaN(idA) && !isNaN(idB)) {
            return idA - idB
          }
          
          // PRIORIDADE 3: Fallback para ordenação alfabética
          return dateA.name.localeCompare(dateB.name)
        })
        
        setPaymentDateOptions(sortedDates)
      } catch (error) {
        console.error('Error fetching payment dates:', error)
      } finally {
        setIsLoadingPaymentDates(false)
      }
    }

    fetchBuyers()
    fetchPaymentDates()
  }, [])

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setIsSubmitting(true)

    // Valida que pelo menos um dos valores (gold ou dollar) foi preenchido
    const goldValue = Number(formData.valueGold.replace(/,/g, ''))
    const dollarValue = Number(formData.dollar.replace(/,/g, ''))
    
    if (!goldValue && !dollarValue) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please provide at least Gold Value or Dollar Value.',
        confirmButtonColor: 'rgb(147, 51, 234)',
        background: '#2a2a2a',
        color: 'white',
      })
      setIsSubmitting(false)
      return
    }

    try {
      const payload = {
        id: sale.id,
        note: formData.note,
        id_payer: formData.idPayer,
        id_payment_date: formData.idPaymentDate || undefined,
        status: sale.status,
        gold_value: goldValue,
        dolar_value: dollarValue,
      }

      await updateSale(payload)
      
      onSaleUpdated()
      onClose()
      
      setTimeout(() => {
        Swal.fire({
          title: 'Success!',
          text: 'Sale updated successfully!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#2a2a2a',
          color: 'white',
        })
      }, 100)
    } catch (error) {
      console.error('Error updating sale:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update sale.',
        confirmButtonColor: 'rgb(147, 51, 234)',
        background: '#2a2a2a',
        color: 'white',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className='relative text-center'>
        Edit Sale
        <IconButton
          aria-label='close'
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit} className='mt-4 grid grid-cols-2 gap-4'>
          <TextField
            id='note'
            label='Note/Description'
            required
            value={formData.note}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                note: e.target.value,
              }))
            }
            variant='outlined'
            fullWidth
            multiline
            rows={2}
            className='col-span-2'
          />

          <FormControl fullWidth variant='outlined' className='col-span-2'>
            <InputLabel id='buyer-label'>Buyer *</InputLabel>
            <Select
              id='buyer'
              labelId='buyer-label'
              value={formData.idPayer}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  idPayer: e.target.value as number,
                }))
              }
              label='Buyer *'
              required
              disabled={isLoadingBuyers}
              startAdornment={
                isLoadingBuyers ? (
                  <CircularProgress size={20} sx={{ ml: 1 }} />
                ) : null
              }
            >
              <MenuItem value={0} disabled>
                {isLoadingBuyers ? 'Loading buyers...' : 'Select a Buyer'}
              </MenuItem>
              {buyers.map((buyer) => (
                <MenuItem key={buyer.id} value={Number(buyer.id)}>
                  {buyer.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            id='valueGold'
            label='Gold Value'
            required
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
            required
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

          <FormControl fullWidth variant='outlined' className='col-span-2' required>
            <InputLabel id='payment-date-label'>Payment Date</InputLabel>
            <Select
              id='paymentDate'
              labelId='payment-date-label'
              value={formData.idPaymentDate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  idPaymentDate: e.target.value as number,
                }))
              }
              label='Payment Date'
              required
              disabled={isLoadingPaymentDates}
              startAdornment={
                isLoadingPaymentDates ? (
                  <CircularProgress size={20} sx={{ ml: 1 }} />
                ) : null
              }
            >
              <MenuItem value={0} disabled>
                {isLoadingPaymentDates ? 'Loading payment dates...' : 'Select a Payment Date'}
              </MenuItem>
              {paymentDateOptions.map((paymentDate) => (
                <MenuItem key={paymentDate.id} value={Number(paymentDate.id)}>
                  {paymentDate.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

        

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
            className='col-span-2'
          >
            {isSubmitting ? 'Updating...' : 'Update Sale'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

