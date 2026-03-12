import { PencilSimple } from '@phosphor-icons/react'
import { X } from '@phosphor-icons/react'
import { useState } from 'react'
import Swal from 'sweetalert2'
import { LoadingSpinner } from '../../../../components/LoadingSpinner'
import { handleApiError } from '../../../../utils/apiErrorHandler'
import { updateReceiptsPayer, type ReceiptsPayer } from '../services/dollarPaymentsApi'

interface EditReceiptsPayerNameProps {
  payer: ReceiptsPayer
  onClose: () => void
  onPayerUpdated: (updatedPayer: ReceiptsPayer) => void
}

export function EditReceiptsPayerName({
  payer,
  onClose,
  onPayerUpdated,
}: EditReceiptsPayerNameProps) {
  const [payerName, setPayerName] = useState(payer.name)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!payerName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Name required',
        text: 'Please enter the payer name.',
      })
      return
    }

    if (payerName.trim() === payer.name) {
      Swal.fire({
        icon: 'info',
        title: 'No changes',
        text: 'The name is the same as before.',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const updatedPayer = await updateReceiptsPayer({
        id: payer.id,
        name: payerName.trim(),
      })

      onPayerUpdated(updatedPayer)
      onClose()

      setTimeout(() => {
        Swal.fire({
          title: 'Success!',
          text: 'Payer updated successfully!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        })
      }, 100)
    } catch (error) {
      await handleApiError(error, 'Failed to update payer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='fixed inset-0 z-[240] flex items-center justify-center bg-black/70 p-4'>
      <div className='w-full max-w-md rounded-xl border border-white/10 bg-[#1a1a1a] p-4 text-white shadow-2xl'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-xl font-semibold text-white'>Edit Receipts Payer</h2>
          <button
            type='button'
            onClick={onClose}
            className='rounded-md border border-white/10 bg-white/5 p-1.5 text-white transition hover:border-purple-500/40 hover:text-purple-300'
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div>
            <label htmlFor='payer-name' className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>
              Payer Name
            </label>
            <input
              id='payer-name'
              required
              value={payerName}
              onChange={(e) => setPayerName(e.target.value)}
              className='h-10 w-full rounded-md border border-white/15 bg-white/[0.05] px-3 text-sm text-white outline-none transition focus:border-purple-400/50'
              placeholder='Enter payer name...'
              autoFocus
            />
          </div>
          <div className='flex items-center justify-end gap-2'>
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
              className='inline-flex min-w-[120px] items-center justify-center gap-2 rounded-md border border-purple-400/40 bg-purple-500/20 px-3 py-2 text-sm font-medium text-purple-100 transition hover:border-purple-300/55 hover:bg-purple-500/30 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {isSubmitting ? (
                <LoadingSpinner size='sm' color='white' label='Updating payer' />
              ) : (
                <PencilSimple size={18} />
              )}
              {isSubmitting ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


