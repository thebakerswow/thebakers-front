import { UserPlus, X } from '@phosphor-icons/react'
import { useState, type FormEvent } from 'react'
import Swal from 'sweetalert2'
import { LoadingSpinner } from '../../../../components/LoadingSpinner'
import { handleApiError } from '../../../../utils/apiErrorHandler'
import { createPayer } from '../services/goldPaymentApi'

interface AddBuyerToListProps {
  onClose: () => void
  onBuyerAdded: (buyerName: string, buyerId: string | number) => void
}

export function AddBuyerToList({
  onClose,
  onBuyerAdded,
}: AddBuyerToListProps) {
  const [buyerName, setBuyerName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!buyerName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Name required',
        text: 'Please enter the buyer name.',
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Chama API para criar o payer
      const newPayer = await createPayer({ name: buyerName.trim() })
      
      // Atualiza a lista no componente pai e fecha o modal
      onBuyerAdded(newPayer.name, newPayer.id)
      onClose()
      
      // Mostra mensagem de sucesso após fechar o modal
      setTimeout(() => {
        Swal.fire({
          title: 'Success!',
          text: 'Buyer added to list!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        })
      }, 100)
    } catch (error) {
      console.error('Error adding buyer:', error)
      await handleApiError(error, 'Failed to add buyer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const baseFieldClass =
    'h-10 w-full rounded-md border border-white/15 bg-white/[0.05] px-3 text-sm text-white outline-none transition focus:border-purple-400/50'

  return (
    <div className='fixed inset-0 z-[240] flex items-center justify-center bg-black/70 p-4'>
      <div className='w-full max-w-md rounded-xl border border-white/10 bg-[#1a1a1a] p-4 text-white shadow-2xl'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-xl font-semibold text-white'>Add Buyer to List</h2>
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
            <label htmlFor='buyer-name' className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>
              Buyer Name
            </label>
            <input
              id='buyer-name'
              required
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              className={baseFieldClass}
              placeholder='Enter buyer name...'
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
              className='inline-flex min-w-[130px] items-center justify-center gap-2 rounded-md border border-purple-400/40 bg-purple-500/20 px-3 py-2 text-sm font-medium text-purple-100 transition hover:border-purple-300/55 hover:bg-purple-500/30 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {isSubmitting ? (
                <LoadingSpinner size='sm' color='white' label='Adding buyer' />
              ) : (
                <UserPlus size={18} />
              )}
              {isSubmitting ? 'Adding...' : 'Add to List'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

