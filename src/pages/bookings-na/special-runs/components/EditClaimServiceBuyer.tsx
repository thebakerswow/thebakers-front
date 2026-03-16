import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Pencil, X } from '@phosphor-icons/react'
import Swal from 'sweetalert2'
import { LoadingSpinner } from '../../../../components/LoadingSpinner'
import { CustomSelect } from '../../../../components/CustomSelect'
import { useAuth } from '../../../../context/AuthContext'
import type {
  EditClaimServiceBuyerProps,
  UpdateClaimServicePayload,
} from '../types/specialRuns'
import { handleApiError } from '../../../../utils/apiErrorHandler'
import { updateClaimService } from '../services/specialRunsApi'

export function EditClaimServiceBuyer({
  buyer,
  onClose,
  onEditSuccess,
}: EditClaimServiceBuyerProps) {
  const { userRoles } = useAuth()
  const isJuniorAdvertiser = userRoles.includes(
    import.meta.env.VITE_TEAM_ADVERTISER_JUNIOR
  )
  const shouldHideDolarInput = isJuniorAdvertiser

  const [formData, setFormData] = useState({
    nameAndRealm: buyer.nameAndRealm,
    claimServicePot:
      typeof buyer.goldPot === 'number' && buyer.goldPot > 0
        ? buyer.goldPot.toLocaleString('en-US')
        : '',
    claimServiceDolarPot:
      typeof buyer.dolarPot === 'number' && buyer.dolarPot > 0
        ? buyer.dolarPot.toLocaleString('en-US')
        : '',
    claimServiceNote: buyer.note,
    playerClass: buyer.playerClass || '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const classOptions = [
    'Warrior',
    'Paladin',
    'Hunter',
    'Rogue',
    'Priest',
    'Shaman',
    'Mage',
    'Warlock',
    'Monk',
    'Druid',
    'Demon Hunter',
    'Death Knight',
    'Evoker',
  ].map((cls) => ({ value: cls, label: cls }))

  const baseFieldClass =
    'h-10 w-full rounded-md border border-white/15 bg-white/[0.05] px-3 text-sm text-white outline-none transition focus:border-purple-400/50'

  const formatGoldPot = (value: string) => {
    const rawValue = value.replace(/\D/g, '')
    return rawValue ? Number(rawValue).toLocaleString('en-US') : ''
  }

  const formatDolarPot = (value: string) => {
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
      formattedValue += '.' + parts[1].replace(/[^0-9]/g, '')
    }
    return rawValue === '0' ? '' : formattedValue
  }

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        field === 'claimServicePot'
          ? formatGoldPot(e.target.value)
          : field === 'claimServiceDolarPot'
          ? formatDolarPot(e.target.value)
          : e.target.value

      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }

  useEffect(() => {
    if (!isJuniorAdvertiser) return
    setFormData((prev) => ({
      ...prev,
      claimServiceDolarPot: '',
    }))
  }, [isJuniorAdvertiser])

  const handleSubmit = async () => {
    setIsSubmitting(true)

    const claimServicePot =
      Number(formData.claimServicePot.replace(/,/g, '')) || 0
    const claimServiceDolarPot =
      Number(formData.claimServiceDolarPot.replace(/,/g, '')) || 0
    const hasGoldPot = claimServicePot > 0
    const hasDolarPot = claimServiceDolarPot > 0

    if (shouldHideDolarInput) {
      if (!hasGoldPot) {
        await handleApiError(
          new Error('Gold Pot field is required.'),
          'Invalid pot values'
        )
        setIsSubmitting(false)
        return
      }
    } else if ((hasGoldPot && hasDolarPot) || (!hasGoldPot && !hasDolarPot)) {
      await handleApiError(
        new Error('Fill only one field: Gold Pot OR Pot (USD).'),
        'Invalid pot values'
      )
      setIsSubmitting(false)
      return
    }

    const parsedId = Number(buyer.id)
    if (!Number.isFinite(parsedId) || parsedId <= 0) {
      await handleApiError(
        new Error('Invalid claim service id'),
        'Failed to update claim service'
      )
      setIsSubmitting(false)
      return
    }

    const payload: UpdateClaimServicePayload = {
      id: parsedId,
      nameAndRealm: formData.nameAndRealm || '',
      claimServiceNote: formData.claimServiceNote || '',
    }

    if (hasGoldPot) {
      payload.claimServicePot = Math.trunc(claimServicePot)
    } else if (!shouldHideDolarInput) {
      payload.claimServiceDolarPot = claimServiceDolarPot
    }

    try {
      await updateClaimService(payload)
      await onEditSuccess()
      await Swal.fire({
        title: 'Success!',
        text: 'Buyer updated successfully',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      })
      onClose()
    } catch (error) {
      await handleApiError(error, 'Failed to update claim service')
    } finally {
      setIsSubmitting(false)
    }
  }

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
              Class
            </label>
            <CustomSelect
              value={formData.playerClass}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  playerClass: value,
                }))
              }
              options={classOptions}
              placeholder='Select Class'
              minWidthClassName='min-w-full'
              triggerClassName='h-10 ![background-image:none] !border-white/15 !bg-white/[0.05] !shadow-none text-sm !text-white focus:!border-purple-400/50 focus:!ring-0'
              menuClassName='!border-white/15 !bg-[#1a1a1a]'
              optionClassName='text-white/90 hover:bg-white/10'
              renderInPortal
            />
          </div>

          <div>
            <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>
              Gold Pot
            </label>
            <input
              value={formData.claimServicePot}
              onChange={handleChange('claimServicePot')}
              disabled={
                !shouldHideDolarInput &&
                !!formData.claimServiceDolarPot &&
                Number(formData.claimServiceDolarPot.replace(/,/g, '')) > 0
              }
              className={`${baseFieldClass} disabled:cursor-not-allowed disabled:opacity-60`}
            />
          </div>

          {!shouldHideDolarInput && (
            <div>
              <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>
                Dollar Pot
              </label>
              <input
                value={formData.claimServiceDolarPot}
                onChange={handleChange('claimServiceDolarPot')}
                disabled={
                  !!formData.claimServicePot &&
                  Number(formData.claimServicePot.replace(/,/g, '')) > 0
                }
                className={`${baseFieldClass} disabled:cursor-not-allowed disabled:opacity-60`}
              />
            </div>
          )}

          <div className='md:col-span-2'>
            <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>
              Note
            </label>
            <input
              value={formData.claimServiceNote}
              onChange={handleChange('claimServiceNote')}
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
            {isSubmitting ? (
              <LoadingSpinner size='sm' label='Saving buyer' />
            ) : (
              <Pencil size={18} />
            )}
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
