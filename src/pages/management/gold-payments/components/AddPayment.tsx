import { UserPlus, Plus, PencilSimple, X } from '@phosphor-icons/react'
import { useState, useEffect, type FormEvent } from 'react'
import Swal from 'sweetalert2'

import { CustomSelect } from '../../../../components/CustomSelect'
import { LoadingSpinner } from '../../../../components/LoadingSpinner'
import { ApiErrorDetails, handleApiError } from '../../../../utils/apiErrorHandler'
import { AddBuyerToList } from './AddBuyerToList'
import { AddPaymentDate } from './AddPaymentDate'
import { EditBuyerName } from './EditBuyerName'
import { getPayers, getPaymentDates, createSale } from '../services/goldPaymentApi'
import type { Payer, PaymentDate } from '../types/goldPayments'
import { sortPaymentDatesByName, toMonthDay } from '../utils/paymentDate'

interface AddPaymentProps {
  onClose: () => void
  onPaymentAdded: () => void
  onError?: (error: ApiErrorDetails) => void
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
      await handleApiError(error, 'Error fetching payers')
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
      
      const convertedDates = validPaymentDatesData.map((date) => ({
        ...date,
        name: toMonthDay(date.name),
      }))
      const sortedDates = sortPaymentDatesByName(convertedDates)
      
      setPaymentDateOptions(sortedDates)
    } catch (error) {
      console.error('Error fetching payment dates:', error)
      await handleApiError(error, 'Error fetching payment dates')
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
        })
      }, 150)
    } catch (error) {
      console.error('Error creating sale:', error)
      await handleApiError(error, 'Error creating sale')
      const errorDetails = {
        message: 'Error creating sale',
        response: error,
      }
      if (onError) {
        onError(errorDetails)
      }
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

  const handlePaymentDateAdded = async (paymentDateName: string, _paymentDateId: string | number) => {
    // Re-fetch da lista de payment dates para garantir sincronização
    await fetchPaymentDates()
    
    // Seleciona automaticamente a payment date recém-adicionada
    setFormData((prev) => ({
      ...prev,
      paymentDate: paymentDateName,
    }))
  }

  const baseFieldClass =
    'h-10 w-full rounded-md border border-white/15 bg-white/[0.05] px-3 text-sm text-white outline-none transition focus:border-purple-400/50'
  const customSelectTriggerClass =
    'h-10 ![background-image:none] !border-white/15 !bg-white/[0.05] !shadow-none text-sm !text-white focus:!border-purple-400/50 focus:!ring-0'
  const buyerOptions = buyers.map((buyer) => ({
    value: buyer.name,
    label: buyer.name,
  }))
  const paymentDateSelectOptions = paymentDateOptions.map((paymentDate) => ({
    value: paymentDate.name,
    label: paymentDate.name,
  }))
  const selectedBuyer = buyers.find((buyer) => buyer.name === formData.buyer) || null

  return (
    <>
      <div className='fixed inset-0 z-[240] flex items-center justify-center bg-black/70 p-4'>
        <div className='w-full max-w-2xl rounded-xl border border-white/10 bg-[#1a1a1a] p-4 text-white shadow-2xl'>
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='text-xl font-semibold text-white'>Add Sale</h2>
            <button
              type='button'
              onClick={onClose}
              className='rounded-md border border-white/10 bg-white/5 p-1.5 text-white transition hover:border-purple-500/40 hover:text-purple-300'
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='md:col-span-2'>
              <label htmlFor='note' className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>
                Note / Description
              </label>
              <textarea
                id='note'
                required
                value={formData.note}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    note: e.target.value,
                  }))
                }
                rows={2}
                className={`${baseFieldClass} h-auto min-h-12 resize-none overflow-hidden py-3`}
              />
            </div>

            <div className='md:col-span-2'>
              <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>Buyer *</label>
              <div className='flex gap-2'>
                <div className='flex-1'>
                  <CustomSelect
                    value={formData.buyer}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        buyer: value,
                      }))
                    }
                    options={buyerOptions}
                    placeholder={isLoadingBuyers ? 'Loading buyers...' : 'Select a Buyer'}
                    disabled={isLoadingBuyers}
                    minWidthClassName='min-w-full'
                    triggerClassName={customSelectTriggerClass}
                    menuClassName='!border-white/15 !bg-[#1a1a1a]'
                    optionClassName='text-white/90 hover:bg-white/10'
                    renderInPortal
                  />
                </div>
                <button
                  type='button'
                  onClick={() => setIsAddBuyerOpen(true)}
                  className='inline-flex min-w-[84px] items-center justify-center gap-2 rounded-md border border-purple-400/40 bg-purple-500/20 px-3 py-2 text-sm font-medium text-purple-100 transition hover:border-purple-300/55 hover:bg-purple-500/30'
                >
                  <Plus size={16} />
                  New
                </button>
                <button
                  type='button'
                  onClick={() => selectedBuyer && setEditingBuyer(selectedBuyer)}
                  disabled={!selectedBuyer}
                  className='inline-flex min-w-[84px] items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <PencilSimple size={16} />
                  Edit
                </button>
              </div>
            </div>

            <div>
              <label htmlFor='valueGold' className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>
                Gold Value
              </label>
              <input
                id='valueGold'
                required
                value={formData.valueGold}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    valueGold: formatGoldValue(e.target.value),
                  }))
                }
                className={baseFieldClass}
                placeholder='0'
              />
            </div>

            <div>
              <label htmlFor='dollar' className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>
                Dollar Value ($)
              </label>
              <input
                id='dollar'
                required
                value={formData.dollar}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    dollar: formatDollarValue(e.target.value),
                  }))
                }
                className={baseFieldClass}
                placeholder='0.00'
              />
            </div>

            <div className='md:col-span-2'>
              <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>Payment Date</label>
              <div className='flex gap-2'>
                <div className='flex-1'>
                  <CustomSelect
                    value={formData.paymentDate}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        paymentDate: value,
                      }))
                    }
                    options={paymentDateSelectOptions}
                    placeholder={isLoadingPaymentDates ? 'Loading payment dates...' : 'Select a Payment Date'}
                    disabled={isLoadingPaymentDates}
                    minWidthClassName='min-w-full'
                    triggerClassName={customSelectTriggerClass}
                    menuClassName='!border-white/15 !bg-[#1a1a1a]'
                    optionClassName='text-white/90 hover:bg-white/10'
                    renderInPortal
                  />
                </div>
                <button
                  type='button'
                  onClick={(e) => {
                    setPaymentDateAnchorEl(e.currentTarget)
                    setPaymentDatePickerKey((prev) => prev + 1)
                  }}
                  className='inline-flex min-w-[84px] items-center justify-center gap-2 rounded-md border border-purple-400/40 bg-purple-500/20 px-3 py-2 text-sm font-medium text-purple-100 transition hover:border-purple-300/55 hover:bg-purple-500/30'
                >
                  <Plus size={16} />
                  New
                </button>
              </div>
            </div>

            {formError && (
              <div className='col-span-1 text-center font-semibold text-red-500 md:col-span-2'>
                {formError}
              </div>
            )}

            <div className='col-span-1 flex items-center justify-end gap-2 md:col-span-2'>
              <button
                type='button'
                onClick={onClose}
                className='rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-200 transition hover:bg-white/10'
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={isSubmitting}
                className='inline-flex min-w-[140px] items-center justify-center gap-2 rounded-md border border-purple-400/40 bg-purple-500/20 px-3 py-2 text-sm font-medium text-purple-100 transition hover:border-purple-300/55 hover:bg-purple-500/30 disabled:cursor-not-allowed disabled:opacity-60'
              >
                {isSubmitting ? (
                  <LoadingSpinner size='sm' color='white' label='Adding sale' />
                ) : (
                  <UserPlus size={18} />
                )}
                {isSubmitting ? 'Adding...' : 'Add Sale'}
              </button>
            </div>
          </form>
        </div>
      </div>

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

