import { UserPlus } from '@phosphor-icons/react'
import { X } from '@phosphor-icons/react'
import axios from 'axios'
import { useState, useEffect, useCallback } from 'react'
import Swal from 'sweetalert2'
import { RunData } from '../types/runs-interface'
import { createBuyer } from '../services/api/buyers'
import { getGhostUsers } from '../services/api/users'
import { ErrorDetails } from './error-display'
import { CustomSelect } from './custom-select'

interface AddBuyerProps {
  run: RunData
  onClose: () => void
  onBuyerAddedReload: () => void
  onError?: (error: ErrorDetails) => void
}

interface Advertiser {
  id: string
  id_discord: string
  name: string
  username: string
}

export function AddBuyer({
  run,
  onClose,
  onBuyerAddedReload,
  onError,
}: AddBuyerProps) {
  // State to store form data
  const [formData, setFormData] = useState({
    nameAndRealm: '',
    playerClass: '',
    buyerPot: '',
    buyerDolarPot: '',
    isPaid: false,
    idBuyerAdvertiser: '',
    buyerNote: '',
  })
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const baseFieldClass =
    'balance-filter-control h-12 w-full rounded-md border border-purple-300/25 bg-[rgba(14,10,28,0.9)] px-4 text-left text-base shadow-none outline-none transition focus:border-purple-300/55 focus:ring-2 focus:ring-purple-500/45'
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

  // Function to check if Dolar field should be hidden for M+ team runs ou Leveling
  const shouldHideDolarField = (): boolean => {
    return (
      run.idTeam === import.meta.env.VITE_TEAM_MPLUS ||
      run.idTeam === import.meta.env.VITE_TEAM_LEVELING ||
      run.idTeam === import.meta.env.VITE_TEAM_PVP
    )
  }

  // Function to handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }))
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

  // Function to format the "buyerPot" field value
  const formatBuyerPot = (value: string) => {
    const rawValue = value.replace(/\D/g, '')
    return rawValue ? Number(rawValue).toLocaleString('en-US') : ''
  }

  // Function to format the "buyerDolarPot" field value equal to the dollar input of the balance-control-table calculator
  const formatBuyerDolarPot = (value: string) => {
    // Allows numbers, hyphen and dot (only one dot)
    let rawValue = value
      .replace(/[^0-9.-]/g, '')
      .replace(/(?!^)-/g, '') // only one hyphen at the beginning
      .replace(/^(-?\d*)\.(.*)\./, '$1.$2') // only one dot

    // If there's a decimal point, separates integer and decimal parts
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

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError(null)

    // Validation: only one field should be filled (unless Dolar field is hidden)
    const buyerPotFilled =
      !!formData.buyerPot && Number(formData.buyerPot.replace(/,/g, '')) > 0
    const buyerDolarPotFilled =
      !!formData.buyerDolarPot &&
      Number(formData.buyerDolarPot.replace(/,/g, '')) > 0

    // If Dolar field is hidden, only validate that Pot is filled
    if (shouldHideDolarField()) {
      if (!buyerPotFilled) {
        setFormError('Pot field is required.')
        setIsSubmitting(false)
        return
      }
    } else {
      // Normal validation: only one field should be filled
      if (
        (buyerPotFilled && buyerDolarPotFilled) ||
        (!buyerPotFilled && !buyerDolarPotFilled)
      ) {
        setFormError('Fill only one of the fields: Pot OR Pot (USD).')
        setIsSubmitting(false)
        return
      }
    }

    // Ensure all required fields are filled
    const data = {
      id_run: run.id,
      nameAndRealm: formData.nameAndRealm || '',
      playerClass: formData.playerClass || '',
      buyerPot: Number(formData.buyerPot.replace(/,/g, '')) || 0,
      buyerDolarPot: Number(formData.buyerDolarPot.replace(/,/g, '')) || 0,
      isPaid: formData.isPaid,
      idBuyerAdvertiser: formData.idBuyerAdvertiser || '',
      buyerNote: formData.buyerNote || '',
    }

    try {
      // Sends buyer data to API
      await createBuyer(data)
      await onBuyerAddedReload()

      // Closes dialog immediately after success
      onClose()

      // Shows confirmation alert after closing dialog
      setTimeout(() => {
        Swal.fire({
          title: 'Success!',
          text: 'Buyer added successfully!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: 'swal2-custom-popup',
          },
        })
      }, 150) // Delay um pouco maior para garantir que o dialog foi fechado
    } catch (error) {
      // Captura e armazena erros
      console.error('Error creating buyer:', error)
      const errorDetails = axios.isAxiosError(error)
        ? {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          }
        : { message: 'Unexpected error creating buyer', response: error }

      // Passa o erro para o componente pai
      if (onError) {
        onError(errorDetails)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to fetch advertiser list
  const fetchAdvertisers = useCallback(async () => {
    try {
      const response = await getGhostUsers()
      setAdvertisers(response)
    } catch (error) {
      console.error('Error fetching advertisers:', error)
      const errorDetails = axios.isAxiosError(error)
        ? {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          }
        : {
            message: 'Unexpected error fetching advertisers',
            response: error,
          }

      // Passa o erro para o componente pai
      if (onError) {
        onError(errorDetails)
      }
    }
  }, [onError])

  useEffect(() => {
    fetchAdvertisers() // Fetches advertisers when component loads
  }, [fetchAdvertisers])

  return (
    <div className='fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(8,4,20,0.8)] p-4 backdrop-blur-[2px]'>
      <div className='w-full max-w-3xl rounded-xl border border-purple-300/25 bg-[linear-gradient(180deg,rgba(27,19,44,0.95)_0%,rgba(16,11,30,0.95)_100%)] p-5'>
        {!isSuccess && (
          <div className='mb-4 flex items-center justify-between border-b border-white/10 pb-3'>
            <h2 className='text-lg font-semibold text-white'>Add Buyer</h2>
            <button
              type='button'
              onClick={onClose}
              className='rounded-md p-1 text-white/75 hover:bg-white/10 hover:text-white'
            >
              <X size={18} />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className='mt-2 grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div>
            <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>
              Buyer Name-Realm
            </label>
            <input
              id='nameAndRealm'
              required
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
              triggerClassName='h-12 border-purple-300/25 !bg-[rgba(14,10,28,0.9)] ![background-image:none] !shadow-none text-base'
            />
          </div>

          <div>
            <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>
              Gold Pot
            </label>
            <input
              id='buyerPot'
              required
              value={formData.buyerPot}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  buyerPot: formatBuyerPot(e.target.value),
                }))
              }
              disabled={
                !shouldHideDolarField() &&
                !!formData.buyerDolarPot &&
                Number(formData.buyerDolarPot.replace(/,/g, '')) > 0
              }
              className={`${baseFieldClass} disabled:cursor-not-allowed disabled:opacity-60`}
            />
          </div>

          {!shouldHideDolarField() && (
            <div>
              <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>
                Pot (USD)
              </label>
              <input
                id='buyerDolarPot'
                required
                value={formData.buyerDolarPot}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    buyerDolarPot: formatBuyerDolarPot(e.target.value),
                  }))
                }
                disabled={
                  !!formData.buyerPot &&
                  Number(formData.buyerPot.replace(/,/g, '')) > 0
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
              value={formData.idBuyerAdvertiser}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  idBuyerAdvertiser: value,
                }))
              }
              options={advertisers.map((advertiser) => ({
                value: advertiser.id_discord,
                label: advertiser.username,
              }))}
              placeholder='Select Advertiser'
              minWidthClassName='min-w-full'
              triggerClassName='h-12 border-purple-300/25 !bg-[rgba(14,10,28,0.9)] ![background-image:none] !shadow-none text-base'
            />
          </div>

          <div>
            <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>
              Note
            </label>
            <input
              id='buyerNote'
              value={formData.buyerNote}
              onChange={handleInputChange}
              className={baseFieldClass}
            />
          </div>

          {formError && (
            <div className='col-span-1 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-center font-semibold text-red-300 md:col-span-2'>
              {formError}
            </div>
          )}

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

          <div className='col-span-1 flex items-center justify-center gap-3 md:col-span-2'>
            <button
              type='submit'
              disabled={isSubmitting}
              className='balance-action-btn balance-action-btn--primary inline-flex min-w-[170px] items-center justify-center gap-2 px-5 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {isSubmitting ? (
                <span className='h-5 w-5 animate-spin rounded-full border-b-2 border-white'></span>
              ) : (
                <UserPlus size={20} />
              )}
              {isSubmitting ? 'Creating...' : 'Add Buyer'}
            </button>
            <button type='button' onClick={onClose} className='balance-action-btn px-4'>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
