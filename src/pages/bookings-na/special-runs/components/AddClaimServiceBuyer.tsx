import { UserPlus, X } from '@phosphor-icons/react'
import { useCallback, useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { useAuth } from '../../../../context/AuthContext'
import { CustomSelect } from '../../../../components/CustomSelect'
import { LoadingSpinner } from '../../../../components/LoadingSpinner'
import type { Advertiser } from '../../run/types/run'
import { getApiErrorMessage, handleApiError } from '../../../../utils/apiErrorHandler'
import type {
  AddClaimServiceBuyerProps,
  CreateClaimServicePayload,
} from '../types/specialRuns'
import {
  createClaimService,
} from '../services/specialRunsApi'
import {
  getGhostUsers,
  getTeamMembers,
  sendDiscordBulkMessage,
} from '../../run/services/runApi'
import { shouldHideDollarPotInfo } from '../../../../utils/roleUtils'

export function AddClaimServiceBuyer({
  type,
  date,
  onClose,
  onBuyerAddedReload,
}: AddClaimServiceBuyerProps) {
  const { userRoles } = useAuth()
  const isJuniorAdvertiser = userRoles.includes(
    import.meta.env.VITE_TEAM_ADVERTISER_JUNIOR
  )
  const canEditPaidFull = !isJuniorAdvertiser
  const shouldHideDolarInput = shouldHideDollarPotInfo(userRoles)

  const [formData, setFormData] = useState({
    nameAndRealm: '',
    playerClass: '',
    claimServicePot: '',
    claimServiceDolarPot: '',
    isPaid: false,
    claimServiceNote: '',
    idClaimServiceAdvertiser: '',
  })
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const baseFieldClass =
    'h-10 w-full rounded-md border border-white/15 bg-white/[0.05] px-3 text-sm text-white outline-none transition focus:border-purple-400/50'

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

  const formatGoldPot = (value: string) => {
    const rawValue = value.replace(/\D/g, '')
    return rawValue ? Number(rawValue).toLocaleString('en-US') : ''
  }

  const formatDolarPot = (value: string) => {
    const sanitized = value.replace(/[^0-9.]/g, '')
    const parts = sanitized.split('.')
    const integerPartRaw = parts[0] || ''
    const decimalPart = parts.length > 1 ? parts.slice(1).join('') : ''

    const integerPart = integerPartRaw
      ? Number(integerPartRaw).toLocaleString('en-US')
      : ''

    if (parts.length > 1) {
      return `${integerPart}.${decimalPart}`
    }

    return integerPart
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

  const fetchAdvertisers = useCallback(async () => {
    try {
      const response = await getGhostUsers()
      setAdvertisers(response)
    } catch (error) {
      await handleApiError(error, 'Error fetching advertisers')
    }
  }, [])

  const normalizeDiscordId = (value: unknown): string | null => {
    if (typeof value !== 'string' && typeof value !== 'number') return null
    const normalizedId = String(value).trim()
    return normalizedId.length > 0 ? normalizedId : null
  }

  const isDiscordSnowflake = (value: string): boolean => /^\d{17,20}$/.test(value)
  const isDiscordDmBlockedError = (error: unknown): boolean => {
    const rawMessage = getApiErrorMessage(error, '')

    return (
      rawMessage.includes('50007') ||
      rawMessage.includes('Cannot send messages to this user')
    )
  }

  const getMemberDiscordId = (member: unknown): string | null => {
    if (!member || typeof member !== 'object') return null
    const memberRecord = member as Record<string, unknown>

    if (memberRecord.bot === true || memberRecord.is_bot === true) return null

    const userRecord =
      memberRecord.user && typeof memberRecord.user === 'object'
        ? (memberRecord.user as Record<string, unknown>)
        : null
    if (userRecord?.bot === true || userRecord?.is_bot === true) return null

    const rawId =
      memberRecord.id_discord ??
      memberRecord.idDiscord ??
      memberRecord.id ??
      userRecord?.id_discord ??
      userRecord?.idDiscord ??
      userRecord?.id

    const normalizedId = normalizeDiscordId(rawId)
    if (!normalizedId) return null
    return isDiscordSnowflake(normalizedId) ? normalizedId : null
  }

  const sendClaimServiceNotification = useCallback(
    async (
      serviceTypeRaw: string,
      buyerNote: string,
      buyerPrice: string
    ) => {
      const serviceType = serviceTypeRaw.trim().toLowerCase()
      const teamIdsByType: Record<string, string[]> = {
        keys: [
           import.meta.env.VITE_TEAM_MPLUS_SOLO,
           import.meta.env.VITE_TEAM_MPLUS_TEAM,
           import.meta.env.VITE_TEAM_CHEFE,
        ],
        leveling: [import.meta.env.VITE_TEAM_LEVELING, import.meta.env.VITE_TEAM_CHEFE],
        delves: [
          import.meta.env.VITE_TEAM_MPLUS_SOLO,
          import.meta.env.VITE_TEAM_MPLUS_TEAM,
          import.meta.env.VITE_TEAM_CHEFE,
        ],
        achievements: [
          import.meta.env.VITE_TEAM_ACHIEVEMENTS,
          import.meta.env.VITE_TEAM_CHEFE,
        ],
      }

      const targetTeamIds = (teamIdsByType[serviceType] || []).filter(
        (teamId): teamId is string => !!teamId && teamId.trim().length > 0
      )
      if (targetTeamIds.length === 0) return

      const teamsMembers = await Promise.all(
        targetTeamIds.map((teamId) => getTeamMembers(teamId))
      )

      const recipientIds = new Set<string>()
      teamsMembers.forEach((teamMembers) => {
        if (!Array.isArray(teamMembers)) return
        teamMembers.forEach((member) => {
          const discordId = getMemberDiscordId(member)
          if (discordId) recipientIds.add(discordId)
        })
      })

      if (recipientIds.size === 0) return

      const pageLink = window.location.href
      const noteLabel = buyerNote.trim() || '-'
      const priceLabel = buyerPrice.trim() || '-'
      const serviceLabel =
        serviceType === 'leveling'
          ? 'Leveling'
          : serviceType === 'delves'
            ? 'Delves'
            : serviceType === 'achievements'
              ? 'Achievements'
            : 'Keys'
      const message = `New buyer added in ${serviceLabel}\nPrice: ${priceLabel}\nNote: ${noteLabel}\nLink: ${pageLink}`

      try {
        await sendDiscordBulkMessage(Array.from(recipientIds), message)
      } catch (error) {
        if (isDiscordDmBlockedError(error)) return
        throw error
      }
    },
    [date]
  )

  useEffect(() => {
    void fetchAdvertisers()
  }, [fetchAdvertisers])

  useEffect(() => {
    if (!shouldHideDolarInput) return
    setFormData((prev) => ({
      ...prev,
      claimServiceDolarPot: '',
      isPaid: false,
    }))
  }, [shouldHideDolarInput])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError(null)

    const claimServicePot = Number(formData.claimServicePot.replace(/,/g, '')) || 0
    const claimServiceDolarPot =
      Number(formData.claimServiceDolarPot.replace(/,/g, '')) || 0
    const hasGoldPot = claimServicePot > 0
    const hasDolarPot = claimServiceDolarPot > 0

    if (!type || !date) {
      setFormError('Type and date are required.')
      setIsSubmitting(false)
      return
    }

    if (shouldHideDolarInput) {
      if (!hasGoldPot) {
        setFormError('Gold Pot field is required.')
        setIsSubmitting(false)
        return
      }
    } else if ((hasGoldPot && hasDolarPot) || (!hasGoldPot && !hasDolarPot)) {
      setFormError(
        'Fill only one field: Gold Pot OR Pot (USD). At least one must be greater than zero.'
      )
      setIsSubmitting(false)
      return
    }

    const payload: CreateClaimServicePayload = {
      type,
      date,
      isPaid: canEditPaidFull ? formData.isPaid : false,
      claimServiceNote: formData.claimServiceNote || '',
      nameAndRealm: formData.nameAndRealm || '',
      playerClass: formData.playerClass || '',
      idClaimServiceAdvertiser: formData.idClaimServiceAdvertiser || '',
    }

    if (hasGoldPot) {
      payload.claimServicePot = Math.trunc(claimServicePot)
    } else if (!shouldHideDolarInput) {
      payload.claimServiceDolarPot = claimServiceDolarPot
    }

    const buyerPriceLabel = hasGoldPot
      ? `${Math.trunc(claimServicePot).toLocaleString('en-US')} gold`
      : `${claimServiceDolarPot.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} USD`

    try {
      await createClaimService(payload)

      if (['keys', 'key', 'leveling', 'delves', 'achievements'].includes(type.trim().toLowerCase())) {
        try {
          await sendClaimServiceNotification(
            type,
            formData.claimServiceNote || '',
            buyerPriceLabel
          )
        } catch (notificationError) {
          if (!isDiscordDmBlockedError(notificationError)) {
            await handleApiError(
              notificationError,
              'Buyer created, but failed to notify one or more users on Discord'
            )
            setIsSubmitting(false)
            return
          }
        }
      }

      onClose()
      void onBuyerAddedReload()

      setTimeout(() => {
        void Swal.fire({
          title: 'Success!',
          text: 'Buyer added successfully!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        })
      }, 150)
    } catch (error) {
      await handleApiError(error, 'Error creating claim service')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='fixed inset-0 z-[240] flex items-center justify-center bg-black/70 p-4'>
      <div className='w-full max-w-3xl rounded-xl border border-white/10 bg-[#1a1a1a] p-4 text-white shadow-2xl'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-lg font-semibold text-white'>Add Buyer</h2>
          <button
            type='button'
            onClick={onClose}
            className='rounded-md border border-white/10 bg-white/5 p-1.5 text-white transition hover:border-purple-500/40 hover:text-purple-300'
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='mt-2 grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div>
            <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>
              Buyer Name-Realm
            </label>
            <input
              id='nameAndRealm'
              maxLength={255}
              value={formData.nameAndRealm}
              onChange={handleTextFieldChange}
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
              id='claimServicePot'
              value={formData.claimServicePot}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  claimServicePot: formatGoldPot(e.target.value),
                }))
              }
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
                Pot (USD)
              </label>
              <input
                id='claimServiceDolarPot'
                value={formData.claimServiceDolarPot}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    claimServiceDolarPot: formatDolarPot(e.target.value),
                  }))
                }
                disabled={
                  !!formData.claimServicePot &&
                  Number(formData.claimServicePot.replace(/,/g, '')) > 0
                }
                className={`${baseFieldClass} disabled:cursor-not-allowed disabled:opacity-60`}
              />
            </div>
          )}

          <div>
            <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>
              Advertiser
            </label>
            <CustomSelect
              value={formData.idClaimServiceAdvertiser}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  idClaimServiceAdvertiser: value,
                }))
              }
              options={advertisers.map((advertiser) => ({
                value: advertiser.id_discord,
                label: advertiser.username,
              }))}
              placeholder='Select Advertiser'
              minWidthClassName='min-w-full'
              triggerClassName='h-10 ![background-image:none] !border-white/15 !bg-white/[0.05] !shadow-none text-sm !text-white focus:!border-purple-400/50 focus:!ring-0'
              menuClassName='!border-white/15 !bg-[#1a1a1a]'
              optionClassName='text-white/90 hover:bg-white/10'
              renderInPortal
            />
          </div>

          <div>
            <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>
              Note
            </label>
            <input
              id='claimServiceNote'
              value={formData.claimServiceNote}
              onChange={handleTextFieldChange}
              className={baseFieldClass}
            />
          </div>

          {formError && (
            <div className='col-span-1 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-center font-semibold text-red-300 md:col-span-2'>
              {formError}
            </div>
          )}

          {canEditPaidFull && (
            <label className='col-span-1 inline-flex items-center gap-2 text-sm text-neutral-200 md:col-span-2'>
              <input
                id='isPaid'
                type='checkbox'
                checked={formData.isPaid}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isPaid: e.target.checked,
                  }))
                }
                className='h-4 w-4 rounded border-white/40 bg-transparent accent-purple-500'
              />
              Paid Full
            </label>
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
                <LoadingSpinner size='sm' label='Creating buyer' />
              ) : (
                <UserPlus size={18} />
              )}
              {isSubmitting ? 'Creating...' : 'Add Buyer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
