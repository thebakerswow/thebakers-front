import { UserPlus, Plus, PencilSimple } from '@phosphor-icons/react'
import { X } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { CustomSelect } from '../../../../components/CustomSelect'
import { LoadingSpinner } from '../../../../components/LoadingSpinner'
import { ApiErrorDetails, handleApiError } from '../../../../utils/apiErrorHandler'
import { AddReceiptsPayer } from './AddPaymentsPayer'
import { AddReceiptsDate } from './AddPaymentDate'
import { EditReceiptsPayerName } from './EditPaymentPayerName'
import {
  getReceiptsPayers,
  getReceiptsDates,
  createReceiptsSale,
  type ReceiptsPayer,
  type ReceiptsDate,
} from '../services/dollarPaymentsApi'

interface AddReceiptProps {
  onClose: () => void
  onReceiptAdded: () => void
  onError?: (error: ApiErrorDetails) => void
}

export function AddReceipt({ onClose, onReceiptAdded, onError }: AddReceiptProps) {
  const [formData, setFormData] = useState({
    note: '',
    payerId: '',
    dollar: '',
    receiptDateId: '',
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
      await handleApiError(error, 'Error fetching receipts payers')
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
      await handleApiError(error, 'Error fetching receipts dates')
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

    if (!formData.payerId) {
      setFormError('Please select a payer.')
      setIsSubmitting(false)
      return
    }

    if (!formData.receiptDateId) {
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

    const selectedPayer = payers.find((payer) => Number(payer.id) === Number(formData.payerId))
    const selectedReceiptDate = receiptDateOptions.find(
      (date) => Number(date.id) === Number(formData.receiptDateId)
    )

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
        })
      }, 150)
    } catch (error) {
      await handleApiError(error, 'Failed to create receipt.')
      const errorDetails = {
        message: 'Error creating receipt',
        response: error,
      }
      if (onError) {
        onError(errorDetails)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePayerAdded = async (_payerName: string, payerId: string | number) => {
    await fetchPayers()

    setFormData((prev) => ({
      ...prev,
      payerId: String(payerId),
    }))
  }

  const handlePayerUpdated = async (updatedPayer: ReceiptsPayer) => {
    await fetchPayers()

    if (Number(formData.payerId) === Number(editingPayer?.id)) {
      setFormData((prev) => ({
        ...prev,
        payerId: String(updatedPayer.id),
      }))
    }
  }

  const handleReceiptDateAdded = async (_receiptDateName: string, receiptDateId: number) => {
    await fetchReceiptDates()

    setFormData((prev) => ({
      ...prev,
      receiptDateId: String(receiptDateId),
    }))
  }

  const customSelectTriggerClass =
    'h-10 ![background-image:none] !border-white/15 !bg-white/[0.05] !shadow-none text-sm !text-white focus:!border-purple-400/50 focus:!ring-0'
  const payerSelectOptions = payers.map((payer) => ({
    value: String(payer.id),
    label: payer.name,
  }))
  const receiptDateSelectOptions = receiptDateOptions.map((receiptDate) => ({
    value: String(receiptDate.id),
    label: receiptDate.name,
  }))

  return (
    <>
      <div className='fixed inset-0 z-[240] flex items-center justify-center bg-black/70 p-4'>
        <div className='w-full max-w-2xl rounded-xl border border-white/10 bg-[#1a1a1a] p-4 text-white shadow-2xl'>
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='text-xl font-semibold text-white'>Add Receipt</h2>
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
                onChange={handleTextFieldChange}
                rows={2}
                className='h-10 min-h-12 w-full resize-none rounded-md border border-white/15 bg-white/[0.05] px-3 py-2 text-sm text-white outline-none transition focus:border-purple-400/50'
              />
            </div>

            <div className='md:col-span-2'>
              <label htmlFor='payer' className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>
                Payer *
              </label>
              <div className='flex gap-2'>
                <div className='flex-1'>
                  <CustomSelect
                    value={formData.payerId}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        payerId: value,
                      }))
                    }
                    options={payerSelectOptions}
                    placeholder={isLoadingPayers ? 'Loading payers...' : 'Select a Payer'}
                    disabled={isLoadingPayers}
                    minWidthClassName='min-w-full'
                    triggerClassName={customSelectTriggerClass}
                    menuClassName='!border-white/15 !bg-[#1a1a1a]'
                    optionClassName='text-white/90 hover:bg-white/10'
                    renderInPortal
                  />
                </div>
                <button
                  type='button'
                  onClick={() => {
                    const selected = payers.find(
                      (payer) => Number(payer.id) === Number(formData.payerId)
                    )
                    if (selected) setEditingPayer(selected)
                  }}
                  disabled={!formData.payerId}
                  className='inline-flex min-w-[90px] items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-200 transition hover:bg-white/10 disabled:opacity-60'
                >
                  <PencilSimple size={16} />
                  Edit
                </button>
                <button
                  type='button'
                  onClick={() => setIsAddPayerOpen(true)}
                  className='inline-flex min-w-[90px] items-center justify-center gap-2 rounded-md border border-purple-400/40 bg-purple-500/20 px-3 py-2 text-sm font-medium text-purple-100 transition hover:border-purple-300/55 hover:bg-purple-500/30'
                >
                  <Plus size={18} />
                  New
                </button>
              </div>
            </div>

            <div className='md:col-span-2'>
              <label htmlFor='receiptDate' className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>
                Receipts Date *
              </label>
              <div className='flex gap-2'>
                <div className='flex-1'>
                  <CustomSelect
                    value={formData.receiptDateId}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        receiptDateId: value,
                      }))
                    }
                    options={receiptDateSelectOptions}
                    placeholder={
                      isLoadingReceiptDates ? 'Loading receipts dates...' : 'Select a Receipts Date'
                    }
                    disabled={isLoadingReceiptDates}
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
                    setReceiptDateAnchorEl(e.currentTarget)
                    setReceiptDatePickerKey((prev) => prev + 1)
                  }}
                  className='inline-flex min-w-[90px] items-center justify-center gap-2 rounded-md border border-purple-400/40 bg-purple-500/20 px-3 py-2 text-sm font-medium text-purple-100 transition hover:border-purple-300/55 hover:bg-purple-500/30'
                >
                  <Plus size={18} />
                  New
                </button>
              </div>
            </div>

            {formError && (
              <div className='md:col-span-2 text-center font-semibold text-red-500'>
                {formError}
              </div>
            )}

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
                  <LoadingSpinner size='sm' color='white' label='Adding receipt' />
                ) : (
                  <UserPlus size={18} />
                )}
                {isSubmitting ? 'Adding...' : 'Add Receipt'}
              </button>
            </div>
          </form>
        </div>
      </div>

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


