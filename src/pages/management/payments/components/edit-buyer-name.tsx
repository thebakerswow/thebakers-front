import { PencilSimple, X } from '@phosphor-icons/react'
import { useState, type FormEvent } from 'react'
import Swal from 'sweetalert2'
import { updatePayer, type Payer } from '../../../../services/api'

interface EditBuyerNameProps {
  buyer: Payer
  onClose: () => void
  onBuyerUpdated: (updatedBuyer: Payer) => void
}

export function EditBuyerName({
  buyer,
  onClose,
  onBuyerUpdated,
}: EditBuyerNameProps) {
  const [buyerName, setBuyerName] = useState(buyer.name)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!buyerName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Name required',
        text: 'Please enter the buyer name.',
        confirmButtonColor: 'rgb(147, 51, 234)',
        background: '#2a2a2a',
        color: 'white',
      })
      return
    }

    if (buyerName.trim() === buyer.name) {
      Swal.fire({
        icon: 'info',
        title: 'No changes',
        text: 'The name is the same as before.',
        confirmButtonColor: 'rgb(147, 51, 234)',
        background: '#2a2a2a',
        color: 'white',
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Chama API para atualizar o payer
      const updatedPayer = await updatePayer({ 
        id: buyer.id, 
        name: buyerName.trim() 
      })
      
      // Atualiza a lista no componente pai e fecha o modal
      onBuyerUpdated(updatedPayer)
      onClose()
      
      // Mostra mensagem de sucesso após fechar o modal
      setTimeout(() => {
        Swal.fire({
          title: 'Success!',
          text: 'Buyer updated successfully!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#2a2a2a',
          color: 'white',
        })
      }, 100)
    } catch (error) {
      console.error('Error updating buyer:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update buyer.',
        confirmButtonColor: 'rgb(147, 51, 234)',
        background: '#2a2a2a',
        color: 'white',
      })
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
          <h2 className='text-xl font-semibold text-white'>Edit Buyer Name</h2>
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
              className='inline-flex min-w-[120px] items-center justify-center gap-2 rounded-md border border-purple-400/40 bg-purple-500/20 px-3 py-2 text-sm font-medium text-purple-100 transition hover:border-purple-300/55 hover:bg-purple-500/30 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {isSubmitting ? (
                <span className='h-4 w-4 animate-spin rounded-full border-b-2 border-white'></span>
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

