import { UserPlus, Plus, PencilSimple, Trash } from '@phosphor-icons/react'
import CloseIcon from '@mui/icons-material/Close'
import { useState, useEffect } from 'react'
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
} from '@mui/material'
import { ErrorDetails } from './error-display'
import { AddBuyerToList } from './add-buyer-to-list'
import { AddPaymentDate } from './add-payment-date'
import { EditBuyerName } from './edit-buyer-name'
import { getPayers, deletePayer, getPaymentDates, createSale, type Payer, type PaymentDate } from '../services/api'

interface AddPaymentProps {
  onClose: () => void
  onPaymentAdded: () => void
  onError?: (error: ErrorDetails) => void
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
    paymentDate: '',
  })
  
  const [buyers, setBuyers] = useState<Payer[]>([])
  const [isLoadingBuyers, setIsLoadingBuyers] = useState(true)

  const [paymentDateOptions, setPaymentDateOptions] = useState<PaymentDate[]>([])
  const [isLoadingPaymentDates, setIsLoadingPaymentDates] = useState(true)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isAddBuyerOpen, setIsAddBuyerOpen] = useState(false)
  const [paymentDateAnchorEl, setPaymentDateAnchorEl] = useState<HTMLElement | null>(null)
  const [paymentDatePickerKey, setPaymentDatePickerKey] = useState(0)
  const [editingBuyer, setEditingBuyer] = useState<Payer | null>(null)

  // Função para carregar payers da API
  const fetchPayers = async () => {
    try {
      setIsLoadingBuyers(true)
      const payersData = await getPayers()
      const validPayersData = Array.isArray(payersData) ? payersData : []
      setBuyers(validPayersData)
    } catch (error) {
      console.error('Error fetching payers:', error)
      const errorDetails = {
        message: 'Error fetching payers',
        response: error,
      }
      if (onError) {
        onError(errorDetails)
      }
    } finally {
      setIsLoadingBuyers(false)
    }
  }

  // Função para carregar payment dates da API
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
      const errorDetails = {
        message: 'Error fetching payment dates',
        response: error,
      }
      if (onError) {
        onError(errorDetails)
      }
    } finally {
      setIsLoadingPaymentDates(false)
    }
  }

  // Carregar lista de payers e payment dates ao montar o componente
  useEffect(() => {
    fetchPayers()
    fetchPaymentDates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    if (!formData.paymentDate) {
      setFormError('Please select a payment date.')
      setIsSubmitting(false)
      return
    }

    // Valida que pelo menos um dos valores (gold ou dollar) foi preenchido
    const goldValue = Number(formData.valueGold.replace(/,/g, ''))
    const dollarValue = Number(formData.dollar.replace(/,/g, ''))
    
    if (!goldValue && !dollarValue) {
      setFormError('Please provide at least Gold Value or Dollar Value.')
      setIsSubmitting(false)
      return
    }

    // Busca o ID do buyer selecionado
    const selectedBuyer = buyers.find(b => b.name === formData.buyer)
    if (!selectedBuyer) {
      setFormError('Invalid buyer selected.')
      setIsSubmitting(false)
      return
    }

    // Busca o ID da payment date selecionada
    const selectedPaymentDate = paymentDateOptions.find(pd => pd.name === formData.paymentDate)
    if (!selectedPaymentDate) {
      setFormError('Invalid payment date selected.')
      setIsSubmitting(false)
      return
    }

    const payload = {
      id_payer: Number(selectedBuyer.id),
      id_payment_date: Number(selectedPaymentDate.id),
      gold_value: Number(formData.valueGold.replace(/,/g, '')) || 0,
      dolar_value: Number(formData.dollar.replace(/,/g, '')) || 0,
      note: formData.note,
    }

    try {
      await createSale(payload)
      
      onPaymentAdded()
      
      // Fecha o dialog após um pequeno delay
      setTimeout(() => {
        onClose()
      }, 150)
      
      // Mostra mensagem de sucesso após fechar o dialog
      setTimeout(() => {
        Swal.fire({
          title: 'Success!',
          text: 'Sale added successfully!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#2a2a2a',
          color: 'white',
        })
      }, 150)
    } catch (error) {
      console.error('Error creating sale:', error)
      const errorDetails = {
        message: 'Error creating sale',
        response: error,
      }
      if (onError) {
        onError(errorDetails)
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to create sale.',
        confirmButtonColor: 'rgb(147, 51, 234)',
        background: '#2a2a2a',
        color: 'white',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBuyerAdded = async (buyerName: string, _buyerId: string | number) => {
    // Re-fetch da lista de payers para garantir sincronização
    await fetchPayers()
    
    // Seleciona automaticamente o buyer recém-adicionado
    setFormData((prev) => ({
      ...prev,
      buyer: buyerName,
    }))
  }

  const handleBuyerUpdated = async (updatedBuyer: Payer) => {
    // Re-fetch da lista de payers para garantir sincronização
    await fetchPayers()
    
    // Mantém o buyer selecionado se for o que foi editado
    if (formData.buyer === editingBuyer?.name) {
      setFormData((prev) => ({
        ...prev,
        buyer: updatedBuyer.name,
      }))
    }
  }

  const handleDeleteBuyer = async (buyer: Payer) => {
    const result = await Swal.fire({
      title: 'Delete Buyer?',
      text: `Are you sure you want to delete "${buyer.name}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: '#2a2a2a',
      color: 'white',
    })

    if (result.isConfirmed) {
      try {
        await deletePayer(buyer.id)
        
        // Re-fetch da lista de payers
        await fetchPayers()
        
        // Limpa a seleção se o buyer deletado estava selecionado
        if (formData.buyer === buyer.name) {
          setFormData((prev) => ({
            ...prev,
            buyer: '',
          }))
        }
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Buyer has been deleted successfully.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#2a2a2a',
          color: 'white',
        })
      } catch (error) {
        console.error('Error deleting buyer:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete buyer.',
          confirmButtonColor: 'rgb(147, 51, 234)',
          background: '#2a2a2a',
          color: 'white',
        })
      }
    }
  }

  const handlePaymentDateAdded = async (paymentDateName: string, _paymentDateId: string | number) => {
    // Re-fetch da lista de payment dates para garantir sincronização
    await fetchPaymentDates()
    
    // Seleciona automaticamente a payment date recém-adicionada
    setFormData((prev) => ({
      ...prev,
      paymentDate: paymentDateName,
    }))
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
                    disabled={isLoadingBuyers}
                    startAdornment={
                      isLoadingBuyers ? (
                        <CircularProgress size={20} sx={{ ml: 1 }} />
                      ) : null
                    }
                  >
                    <MenuItem value='' disabled>
                      {isLoadingBuyers ? 'Loading buyers...' : 'Select a Buyer'}
                    </MenuItem>
                    {buyers.map((buyer) => (
                      <MenuItem key={buyer.id} value={buyer.name}>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          width: '100%',
                          gap: 1,
                        }}>
                          <span>{buyer.name}</span>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingBuyer(buyer)
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
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteBuyer(buyer)
                              }}
                              sx={{
                                padding: '4px',
                                color: '#ef4444',
                                '&:hover': {
                                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                },
                              }}
                            >
                              <Trash size={16} />
                            </IconButton>
                          </Box>
                        </Box>
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

              <Box sx={{ display: 'flex', gap: 1, gridColumn: 'span 2' }}>
                <FormControl fullWidth variant='outlined' required>
                  <InputLabel id='payment-date-label'>Payment Date </InputLabel>
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
                    required
                    disabled={isLoadingPaymentDates}
                    startAdornment={
                      isLoadingPaymentDates ? (
                        <CircularProgress size={20} sx={{ ml: 1 }} />
                      ) : null
                    }
                  >
                    <MenuItem value='' disabled>
                      {isLoadingPaymentDates ? 'Loading payment dates...' : 'Select a Payment Date'}
                    </MenuItem>
                    {paymentDateOptions && paymentDateOptions.map((paymentDate) => (
                      <MenuItem key={paymentDate.id} value={paymentDate.name}>
                        {paymentDate.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant='contained'
                  onClick={(e) => {
                    setPaymentDateAnchorEl(e.currentTarget)
                    setPaymentDatePickerKey(prev => prev + 1) // Força remontagem
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

      <AddPaymentDate
        key={paymentDatePickerKey}
        anchorEl={paymentDateAnchorEl}
        onClose={() => setPaymentDateAnchorEl(null)}
        onPaymentDateAdded={handlePaymentDateAdded}
      />

      {editingBuyer && (
        <EditBuyerName
          buyer={editingBuyer}
          onClose={() => setEditingBuyer(null)}
          onBuyerUpdated={handleBuyerUpdated}
        />
      )}
    </>
  )
}

