import { UserPlus, Plus, PencilSimple } from '@phosphor-icons/react'
import CloseIcon from '@mui/icons-material/Close'
import { useEffect, useState } from 'react'
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
  CircularProgress,
  Autocomplete,
} from '@mui/material'
import { ErrorDetails } from './error-display'
import { AddReceiptsPayer } from './add-receipts-payer'
import { AddReceiptsDate } from './add-receipt-date'
import { EditReceiptsPayerName } from './edit-receipts-payer-name'
import {
  getReceiptsPayers,
  getReceiptsDates,
  createReceiptsSale,
  type ReceiptsPayer,
  type ReceiptsDate,
} from '../services/api'

interface AddReceiptProps {
  onClose: () => void
  onReceiptAdded: () => void
  onError?: (error: ErrorDetails) => void
}

export function AddReceipt({ onClose, onReceiptAdded, onError }: AddReceiptProps) {
  const [formData, setFormData] = useState({
    note: '',
    payer: '',
    dollar: '',
    receiptDate: '',
  })

  const [payers, setPayers] = useState<ReceiptsPayer[]>([])
  const [isLoadingPayers, setIsLoadingPayers] = useState(true)

  const [receiptDateOptions, setReceiptDateOptions] = useState<ReceiptsDate[]>([])
  const [isLoadingReceiptDates, setIsLoadingReceiptDates] = useState(true)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isAddPayerOpen, setIsAddPayerOpen] = useState(false)
  const [receiptDateAnchorEl, setReceiptDateAnchorEl] = useState<HTMLElement | null>(null)
  const [receiptDatePickerKey, setReceiptDatePickerKey] = useState(0)
  const [editingPayer, setEditingPayer] = useState<ReceiptsPayer | null>(null)

  const fetchPayers = async () => {
    try {
      setIsLoadingPayers(true)
      const payersData = await getReceiptsPayers()
      const validPayersData = Array.isArray(payersData) ? payersData : []
      setPayers(validPayersData)
    } catch (error) {
      console.error('Error fetching receipts payers:', error)
      const errorDetails = {
        message: 'Error fetching receipts payers',
        response: error,
      }
      if (onError) {
        onError(errorDetails)
      }
    } finally {
      setIsLoadingPayers(false)
    }
  }

  const fetchReceiptDates = async () => {
    try {
      setIsLoadingReceiptDates(true)
      const receiptDatesData = await getReceiptsDates({ is_date_valid: true })
      const validReceiptDatesData = Array.isArray(receiptDatesData) ? receiptDatesData : []

      const convertedDates = validReceiptDatesData.map((date) => {
        const match = date.name.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
        if (match) {
          const month = match[2]
          const day = match[3]
          return { ...date, name: `${month}/${day}` }
        }
        return date
      })

      const sortedDates = [...convertedDates].sort((dateA, dateB) => {
        const parseDateString = (dateStr: string) => {
          const match = dateStr.match(/(\d{1,2})\/(\d{1,2})/)
          if (match) {
            const month = parseInt(match[1])
            const day = parseInt(match[2])
            return month * 100 + day
          }
          return 0
        }

        const dateValueA = parseDateString(dateA.name)
        const dateValueB = parseDateString(dateB.name)

        if (dateValueA && dateValueB) {
          return dateValueA - dateValueB
        }

        const idA = Number(dateA.id)
        const idB = Number(dateB.id)

        if (!Number.isNaN(idA) && !Number.isNaN(idB)) {
          return idA - idB
        }

        return dateA.name.localeCompare(dateB.name)
      })

      setReceiptDateOptions(sortedDates)
    } catch (error) {
      console.error('Error fetching receipts dates:', error)
      const errorDetails = {
        message: 'Error fetching receipts dates',
        response: error,
      }
      if (onError) {
        onError(errorDetails)
      }
    } finally {
      setIsLoadingReceiptDates(false)
    }
  }

  useEffect(() => {
    fetchPayers()
    fetchReceiptDates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    if (!formData.payer) {
      setFormError('Please select a payer.')
      setIsSubmitting(false)
      return
    }

    if (!formData.receiptDate) {
      setFormError('Please select a receipts date.')
      setIsSubmitting(false)
      return
    }

    const dollarValue = Number(formData.dollar.replace(/,/g, ''))

    if (!dollarValue) {
      setFormError('Please provide Dollar Amount.')
      setIsSubmitting(false)
      return
    }

    const selectedPayer = payers.find((payer) => payer.name === formData.payer)
    const selectedReceiptDate = receiptDateOptions.find((date) => date.name === formData.receiptDate)

    if (!selectedPayer) {
      setFormError('Invalid payer selected.')
      setIsSubmitting(false)
      return
    }

    if (!selectedReceiptDate) {
      setFormError('Invalid receipts date selected.')
      setIsSubmitting(false)
      return
    }

    try {
      await createReceiptsSale({
        id_payer: Number(selectedPayer.id),
        id_receipts_dolar_date: Number(selectedReceiptDate.id),
        status: 'pending',
        dolar_amount: dollarValue || 0,
        note: formData.note,
      })

      onReceiptAdded()

      setTimeout(() => {
        onClose()
      }, 150)

      setTimeout(() => {
        Swal.fire({
          title: 'Success!',
          text: 'Receipt added successfully!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#2a2a2a',
          color: 'white',
        })
      }, 150)
    } catch (error) {
      console.error('Error creating receipt:', error)
      const errorDetails = {
        message: 'Error creating receipt',
        response: error,
      }
      if (onError) {
        onError(errorDetails)
      }

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to create receipt.',
        confirmButtonColor: 'rgb(147, 51, 234)',
        background: '#2a2a2a',
        color: 'white',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePayerAdded = async (payerName: string, _payerId: string | number) => {
    await fetchPayers()

    setFormData((prev) => ({
      ...prev,
      payer: payerName,
    }))
  }

  const handlePayerUpdated = async (updatedPayer: ReceiptsPayer) => {
    await fetchPayers()

    if (formData.payer === editingPayer?.name) {
      setFormData((prev) => ({
        ...prev,
        payer: updatedPayer.name,
      }))
    }
  }

  const handleReceiptDateAdded = async (receiptDateName: string, _receiptDateId: number) => {
    await fetchReceiptDates()

    setFormData((prev) => ({
      ...prev,
      receiptDate: receiptDateName,
    }))
  }

  return (
    <>
      <Dialog open={true} onClose={onClose} maxWidth='md' fullWidth>
        <DialogTitle className='relative text-center'>
          Add Receipt
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
                <Autocomplete
                  fullWidth
                  id='payer'
                  options={payers}
                  getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
                  value={payers.find((payer) => payer.name === formData.payer) || null}
                  onChange={(_, newValue) => {
                    setFormData((prev) => ({
                      ...prev,
                      payer: newValue ? newValue.name : '',
                    }))
                  }}
                  disabled={isLoadingPayers}
                  loading={isLoadingPayers}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label='Payer'
                      required
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {isLoadingPayers ? <CircularProgress size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, payer) => (
                    <li {...props} key={payer.id}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          width: '100%',
                          gap: 1,
                        }}
                      >
                        <span>{payer.name}</span>
                        <IconButton
                          size='small'
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingPayer(payer)
                          }}
                          sx={{
                            padding: '4px',
                            color: 'rgb(147, 51, 234)',
                            '&:hover': {
                              backgroundColor: 'rgba(147, 51, 234, 0.1)',
                            },
                          }}
                        >
                          <PencilSimple size={16} />
                        </IconButton>
                      </Box>
                    </li>
                  )}
                />
                <Button
                  variant='contained'
                  onClick={() => setIsAddPayerOpen(true)}
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

              <Box sx={{ display: 'flex', gap: 1, gridColumn: 'span 2' }}>
                <FormControl fullWidth variant='outlined' required>
                  <InputLabel id='receipt-date-label'>Receipts Date</InputLabel>
                  <Select
                    id='receiptDate'
                    labelId='receipt-date-label'
                    value={formData.receiptDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        receiptDate: e.target.value,
                      }))
                    }
                    label='Receipts Date'
                    required
                    disabled={isLoadingReceiptDates}
                    startAdornment={
                      isLoadingReceiptDates ? (
                        <CircularProgress size={20} sx={{ ml: 1 }} />
                      ) : null
                    }
                  >
                    <MenuItem value='' disabled>
                      {isLoadingReceiptDates ? 'Loading receipts dates...' : 'Select a Receipts Date'}
                    </MenuItem>
                    {receiptDateOptions.map((receiptDate) => (
                      <MenuItem key={receiptDate.id} value={receiptDate.name}>
                        {receiptDate.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant='contained'
                  onClick={(e) => {
                    setReceiptDateAnchorEl(e.currentTarget)
                    setReceiptDatePickerKey((prev) => prev + 1)
                  }}
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

              {formError && (
                <div className='col-span-2 text-center font-semibold text-red-600'>
                  {formError}
                </div>
              )}

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
                {isSubmitting ? 'Adding...' : 'Add Receipt'}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {isAddPayerOpen && (
        <AddReceiptsPayer
          onClose={() => setIsAddPayerOpen(false)}
          onPayerAdded={handlePayerAdded}
        />
      )}

      <AddReceiptsDate
        key={receiptDatePickerKey}
        anchorEl={receiptDateAnchorEl}
        onClose={() => setReceiptDateAnchorEl(null)}
        onDateAdded={handleReceiptDateAdded}
      />

      {editingPayer && (
        <EditReceiptsPayerName
          payer={editingPayer}
          onClose={() => setEditingPayer(null)}
          onPayerUpdated={handlePayerUpdated}
        />
      )}
    </>
  )
}


