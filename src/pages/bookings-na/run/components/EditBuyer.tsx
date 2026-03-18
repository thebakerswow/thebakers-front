import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Pencil, X } from '@phosphor-icons/react'
import { updateBuyer } from '../services/runApi'
import Swal from 'sweetalert2'
import { LoadingSpinner } from '../../../../components/LoadingSpinner'
import type { EditBuyerProps } from '../types/run'
import { handleApiError } from '../../../../utils/apiErrorHandler'
import { useAuth } from '../../../../context/AuthContext'
import { shouldHideDollarPotInfo } from '../../../../utils/roleUtils'

export function EditBuyer({
  buyer,
  onClose,
  onEditSuccess,
}: EditBuyerProps) {
  const { userRoles } = useAuth()
  const [formData, setFormData] = useState({
    nameAndRealm: buyer.nameAndRealm,
    buyerPot:
      typeof buyer.buyerPot === 'number'
        ? buyer.buyerPot.toLocaleString('en-US')
        : '',
    buyerDolarPot:
      typeof buyer.buyerDolarPot === 'number'
        ? buyer.buyerDolarPot.toLocaleString('en-US')
        : '',
    buyerNote: buyer.buyerNote,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Function to determine if the dollar field should be hidden
  const shouldHideDolarField = (): boolean => {
    return shouldHideDollarPotInfo(userRoles)
  }

  useEffect(() => {
    if (!shouldHideDolarField()) return
    setFormData((prev) => ({
      ...prev,
      buyerDolarPot: '',
    }))
  }, [userRoles])

  // Função para formatar o valor do campo "buyerDolarPot" igual ao input do dólar da calculadora do balance-control-table
  const formatBuyerDolarPot = (value: string) => {
    let rawValue = value
      .replace(/[^0-9.-]/g, '')
      .replace(/(?!^)-/g, '') // apenas um hífen no início
      .replace(/^(-?\d*)\.(.*)\./, '$1.$2') // apenas um ponto

    const parts = rawValue.split('.')
    let formattedValue = parts[0]
      ? Number(parts[0].replace(/,/g, '')).toLocaleString('en-US')
      : ''
    if (rawValue.startsWith('-') && !formattedValue.startsWith('-')) {
      formattedValue = '-' + formattedValue
    }
    if (parts.length > 1) {
      formattedValue += '.' + parts[1].replace(/[^0-9]/g, '')
    }
    return rawValue === '0' ? '' : formattedValue
  }

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        field === 'buyerPot'
          ? e.target.value.replace(/\D/g, '') // Remove non-numeric characters
          : field === 'buyerDolarPot'
            ? formatBuyerDolarPot(e.target.value)
            : e.target.value
      setFormData((prev) => ({
        ...prev,
        [field]:
          field === 'buyerPot' && value
            ? Number(value).toLocaleString('en-US')
            : value,
      }))
    }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    // Validar se os valores são números válidos
    const buyerPotValue = Number(formData.buyerPot.replace(/,/g, ''))
    const buyerDolarPotValue = shouldHideDolarField()
      ? 0
      : Number(formData.buyerDolarPot.replace(/,/g, ''))

    if (isNaN(buyerPotValue) || isNaN(buyerDolarPotValue)) {
      await handleApiError(
        new Error('Please enter valid numbers for Pot and Dollar Pot fields'),
        'Invalid numeric values'
      )
      setIsSubmitting(false)
      return
    }

    const payload = {
      id_buyer: buyer.id,
      nameAndRealm: formData.nameAndRealm || '',
      buyerPot: buyerPotValue || 0,
      buyerDolarPot: shouldHideDolarField() ? 0 : buyerDolarPotValue || 0,
      buyerNote: formData.buyerNote || '',
    }

    try {
      await updateBuyer(buyer.id, payload)
      await onEditSuccess()

      Swal.fire({
        title: 'Success!',
        text: 'Buyer updated successfully',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      })

      onClose()
    } catch (error) {
      await handleApiError(error, 'Failed to update buyer')
    } finally {
      setIsSubmitting(false)
    }
  }

  const baseFieldClass =
    'h-10 w-full rounded-md border border-white/15 bg-white/[0.05] px-3 text-sm text-white outline-none transition focus:border-purple-400/50'

  return createPortal(
    <div className='fixed inset-0 z-[240] flex items-center justify-center bg-black/70 p-4'>
      <div className='w-full max-w-3xl rounded-xl border border-white/10 bg-[#1a1a1a] p-4 text-white shadow-2xl'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-lg font-semibold text-white'>Edit Buyer</h2>
          <button
            type='button'
            onClick={onClose}
            className='rounded-md border border-white/10 bg-white/5 p-1.5 text-white transition hover:border-purple-500/40 hover:text-purple-300'
          >
            <X size={18} />
          </button>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div>
            <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>
              Name-Realm
            </label>
            <input
              value={formData.nameAndRealm}
              onChange={handleChange('nameAndRealm')}
              maxLength={255}
              className={baseFieldClass}
            />
          </div>

          <div>
            <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>
              Gold Pot
            </label>
            <input
              value={formData.buyerPot}
              onChange={handleChange('buyerPot')}
              className={baseFieldClass}
            />
          </div>

          {!shouldHideDolarField() && (
            <div>
              <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>
                Dollar Pot
              </label>
              <input
                value={formData.buyerDolarPot}
                onChange={handleChange('buyerDolarPot')}
                className={baseFieldClass}
              />
            </div>
          )}

          <div>
            <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>
              Note
            </label>
            <input
              value={formData.buyerNote}
              onChange={handleChange('buyerNote')}
              className={baseFieldClass}
            />
          </div>
        </div>

        <div className='mt-4 flex items-center justify-end gap-2'>
          <button
            type='button'
            onClick={onClose}
            className='rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-200 transition hover:bg-white/10'
          >
            Cancel
          </button>
          <button
            type='button'
            disabled={isSubmitting}
            onClick={handleSubmit}
            className='inline-flex min-w-[140px] items-center justify-center gap-2 rounded-md border border-purple-400/40 bg-purple-500/20 px-3 py-2 text-sm font-medium text-purple-100 transition hover:border-purple-300/55 hover:bg-purple-500/30 disabled:cursor-not-allowed disabled:opacity-60'
          >
            {isSubmitting ? <LoadingSpinner size='sm' label='Saving buyer' /> : <Pencil size={18} />}
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
