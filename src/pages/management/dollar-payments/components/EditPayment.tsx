import { PencilSimple } from '@phosphor-icons/react'
import { X } from '@phosphor-icons/react'
import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { LoadingSpinner } from '../../../../components/LoadingSpinner'
import { handleApiError } from '../../../../utils/apiErrorHandler'
import {
  updateReceiptsSale,
  getReceiptsPayers,
  getReceiptsDates,
  type ReceiptsPayer,
  type ReceiptsDate,
} from '../services/dollarPaymentsApi'

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
        await handleApiError(error, 'Error fetching receipts payers')
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
        await handleApiError(error, 'Error fetching receipts dates')
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
        })
      }, 100)
    } catch (error) {
      await handleApiError(error, 'Failed to update receipt.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='fixed inset-0 z-[240] flex items-center justify-center bg-black/70 p-4'>
      <div className='w-full max-w-2xl rounded-xl border border-white/10 bg-[#1a1a1a] p-4 text-white shadow-2xl'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-xl font-semibold text-white'>Edit Receipt</h2>
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
              Note/Description
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
              className='h-10 min-h-12 w-full resize-none rounded-md border border-white/15 bg-white/[0.05] px-3 py-2 text-sm text-white outline-none transition focus:border-purple-400/50'
            />
          </div>

          <div className='md:col-span-2'>
            <label htmlFor='payer' className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>
              Payer *
            </label>
            <select
              id='payer'
              value={formData.idPayer}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  idPayer: Number(e.target.value),
                }))
              }
              required
              disabled={isLoadingPayers}
              className='h-10 w-full rounded-md border border-white/15 bg-white/[0.05] px-3 text-sm text-white outline-none transition focus:border-purple-400/50'
            >
              <option value={0} disabled>
                {isLoadingPayers ? 'Loading payers...' : 'Select a Payer'}
              </option>
              {payers.map((payer) => (
                <option key={payer.id} value={Number(payer.id)}>
                  {payer.name}
                </option>
              ))}
            </select>
          </div>

          <div className='md:col-span-2'>
            <label htmlFor='dollar' className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>
              Dollar Amount ($)
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
              className='h-10 w-full rounded-md border border-white/15 bg-white/[0.05] px-3 text-sm text-white outline-none transition focus:border-purple-400/50'
              placeholder='0.00'
            />
          </div>

          <div className='md:col-span-2'>
            <label htmlFor='receiptDate' className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>
              Receipts Date
            </label>
            <select
              id='receiptDate'
              value={formData.idReceiptsDate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  idReceiptsDate: Number(e.target.value),
                }))
              }
              disabled={isLoadingDates}
              className='h-10 w-full rounded-md border border-white/15 bg-white/[0.05] px-3 text-sm text-white outline-none transition focus:border-purple-400/50'
            >
              <option value={0} disabled>
                {isLoadingDates ? 'Loading receipts dates...' : 'Select a Receipts Date'}
              </option>
              {dateOptions.map((receiptDate) => (
                <option key={receiptDate.id} value={Number(receiptDate.id)}>
                  {receiptDate.name}
                </option>
              ))}
            </select>
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
                <LoadingSpinner size='sm' color='white' label='Updating receipt' />
              ) : (
                <PencilSimple size={18} />
              )}
              {isSubmitting ? 'Updating...' : 'Update Receipt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


