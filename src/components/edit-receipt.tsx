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
import {
  updateReceiptsSale,
  getReceiptsPayers,
  getReceiptsDates,
  type ReceiptsPayer,
  type ReceiptsDate,
} from '../services/api'

interface ReceiptSale {
  id: number
  note: string
  idPayer: number
  payerName: string
  dollar: number
  status?: string
  idReceiptsDate?: number
  receiptDate?: string
}

interface EditReceiptProps {
  sale: ReceiptSale
  onClose: () => void
  onReceiptUpdated: () => void
}

export function EditReceipt({ sale, onClose, onReceiptUpdated }: EditReceiptProps) {
  const [formData, setFormData] = useState({
    note: sale.note,
    idPayer: sale.idPayer,
    idReceiptsDate: sale.idReceiptsDate ?? 0,
    dollar: sale.dollar.toString(),
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [payers, setPayers] = useState<ReceiptsPayer[]>([])
  const [isLoadingPayers, setIsLoadingPayers] = useState(true)
  const [dateOptions, setDateOptions] = useState<ReceiptsDate[]>([])
  const [isLoadingDates, setIsLoadingDates] = useState(true)

  useEffect(() => {
    const fetchPayers = async () => {
      try {
        setIsLoadingPayers(true)
        const payersData = await getReceiptsPayers()
        setPayers(payersData)
      } catch (error) {
        console.error('Error fetching receipts payers:', error)
      } finally {
        setIsLoadingPayers(false)
      }
    }

    const fetchDates = async () => {
      try {
        setIsLoadingDates(true)
        const datesData = await getReceiptsDates({ is_date_valid: true })
        const validDates = Array.isArray(datesData) ? datesData : []

        const convertedDates = validDates.map((date) => {
          const match = date.name.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
          if (match) {
            const month = match[2]
            const day = match[3]
            return { ...date, name: `${month}/${day}` }
          }
          return date
        })

        setDateOptions(convertedDates)
      } catch (error) {
        console.error('Error fetching receipts dates:', error)
      } finally {
        setIsLoadingDates(false)
      }
    }

    fetchPayers()
    fetchDates()
  }, [])

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

    const dollarValue = Number(formData.dollar.replace(/,/g, ''))

    if (!dollarValue) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please provide Dollar Amount.',
        confirmButtonColor: 'rgb(147, 51, 234)',
        background: '#2a2a2a',
        color: 'white',
      })
      setIsSubmitting(false)
      return
    }

    try {
      await updateReceiptsSale({
        id: sale.id,
        note: formData.note,
        id_payer: formData.idPayer,
        id_receipts_dolar_date: formData.idReceiptsDate || undefined,
        status: sale.status,
        dolar_amount: dollarValue,
      })

      onReceiptUpdated()
      onClose()

      setTimeout(() => {
        Swal.fire({
          title: 'Success!',
          text: 'Receipt updated successfully!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#2a2a2a',
          color: 'white',
        })
      }, 100)
    } catch (error) {
      console.error('Error updating receipt:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update receipt.',
        confirmButtonColor: 'rgb(147, 51, 234)',
        background: '#2a2a2a',
        color: 'white',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={true} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle className='relative text-center'>
        Edit Receipt
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
            <InputLabel id='payer-label'>Payer *</InputLabel>
            <Select
              id='payer'
              labelId='payer-label'
              value={formData.idPayer}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  idPayer: e.target.value as number,
                }))
              }
              label='Payer *'
              required
              disabled={isLoadingPayers}
              startAdornment={
                isLoadingPayers ? <CircularProgress size={20} sx={{ ml: 1 }} /> : null
              }
            >
              <MenuItem value={0} disabled>
                {isLoadingPayers ? 'Loading payers...' : 'Select a Payer'}
              </MenuItem>
              {payers.map((payer) => (
                <MenuItem key={payer.id} value={Number(payer.id)}>
                  {payer.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            id='dollar'
            label='Dollar Amount ($)'
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

          <FormControl fullWidth variant='outlined' className='col-span-2'>
            <InputLabel id='receipt-date-label'>Receipts Date</InputLabel>
            <Select
              id='receiptDate'
              labelId='receipt-date-label'
              value={formData.idReceiptsDate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  idReceiptsDate: e.target.value as number,
                }))
              }
              label='Receipts Date'
              disabled={isLoadingDates}
              startAdornment={
                isLoadingDates ? <CircularProgress size={20} sx={{ ml: 1 }} /> : null
              }
            >
              <MenuItem value={0} disabled>
                {isLoadingDates ? 'Loading receipts dates...' : 'Select a Receipts Date'}
              </MenuItem>
              {dateOptions.map((receiptDate) => (
                <MenuItem key={receiptDate.id} value={Number(receiptDate.id)}>
                  {receiptDate.name}
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
            {isSubmitting ? 'Updating...' : 'Update Receipt'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}


