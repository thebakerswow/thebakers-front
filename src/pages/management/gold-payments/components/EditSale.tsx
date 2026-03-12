import { PencilSimple, X } from '@phosphor-icons/react'
import { useEffect, useState, type FormEvent } from 'react'
import Swal from 'sweetalert2'
import { CustomSelect } from '../../../../components/CustomSelect'
import { LoadingSpinner } from '../../../../components/LoadingSpinner'
import { handleApiError } from '../../../../utils/apiErrorHandler'

import { updateSale, getPayers, getPaymentDates } from '../services/goldPaymentApi'
import type { Payer, PaymentDate } from '../types/goldPayments'
import { sortPaymentDatesByName, toMonthDay } from '../utils/paymentDate'

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
        await handleApiError(error, 'Error fetching buyers')
      } finally {
        setIsLoadingBuyers(false)
      }
    }

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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
        })
      }, 100)
    } catch (error) {
      console.error('Error updating sale:', error)
      await handleApiError(error, 'Failed to update sale.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const baseFieldClass =
    'h-10 w-full rounded-md border border-white/15 bg-white/[0.05] px-3 text-sm text-white outline-none transition focus:border-purple-400/50'
  const baseSelectClass = `${baseFieldClass} appearance-none ![background-image:none]`
  const customSelectTriggerClass =
    'h-10 ![background-image:none] !border-white/15 !bg-white/[0.05] !shadow-none text-sm !text-white focus:!border-purple-400/50 focus:!ring-0'
  const paymentDateSelectOptions = paymentDateOptions.map((paymentDate) => ({
    value: String(paymentDate.id),
    label: paymentDate.name,
  }))

  return (
    <div className='fixed inset-0 z-[240] flex items-center justify-center bg-black/70 p-4'>
      <div className='w-full max-w-2xl rounded-xl border border-white/10 bg-[#1a1a1a] p-4 text-white shadow-2xl'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-xl font-semibold text-white'>Edit Sale</h2>
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
            <label htmlFor='buyer' className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>
              Buyer *
            </label>
            <select
              id='buyer'
              value={formData.idPayer}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  idPayer: Number(e.target.value),
                }))
              }
              required
              disabled={isLoadingBuyers}
              className={baseSelectClass}
            >
              <option value={0} disabled>
                {isLoadingBuyers ? 'Loading buyers...' : 'Select a Buyer'}
              </option>
              {buyers.map((buyer) => (
                <option key={buyer.id} value={Number(buyer.id)}>
                  {buyer.name}
                </option>
              ))}
            </select>
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
            <label htmlFor='paymentDate' className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>
              Payment Date
            </label>
            <CustomSelect
              value={formData.idPaymentDate ? String(formData.idPaymentDate) : ''}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  idPaymentDate: Number(value),
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
                <LoadingSpinner size='sm' color='white' label='Updating sale' />
              ) : (
                <PencilSimple size={18} />
              )}
              {isSubmitting ? 'Updating...' : 'Update Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

