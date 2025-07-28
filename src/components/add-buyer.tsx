import { UserPlus } from '@phosphor-icons/react'
import CloseIcon from '@mui/icons-material/Close'
import axios from 'axios'
import { useState, useEffect, useCallback } from 'react'
import Swal from 'sweetalert2'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
  FormControlLabel,
  Button,
  IconButton,
} from '@mui/material'
import { RunData } from '../types/runs-interface'
import { createBuyer } from '../services/api/buyers'
import { getGhostUsers } from '../services/api/users'
import { ErrorDetails } from './error-display'

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

  // Function to check if Dolar field should be hidden for M+ team runs ou Leveling
  const shouldHideDolarField = (): boolean => {
    return (
      run.idTeam === import.meta.env.VITE_TEAM_MPLUS ||
      run.idTeam === import.meta.env.VITE_TEAM_LEVELING
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
    <Dialog open={true} onClose={onClose}>
      {!isSuccess && (
        <DialogTitle className='relative text-center'>
          Add Buyer
          <IconButton
            aria-label='close'
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
      )}
      <DialogContent>
        <div className='flex w-full max-w-[95vw] flex-col overflow-y-auto overflow-x-hidden'>
          <form onSubmit={handleSubmit} className='mt-2 grid grid-cols-2 gap-4'>
            <TextField
              id='nameAndRealm'
              label='Buyer Name-Realm'
              required
              value={formData.nameAndRealm}
              onChange={handleTextFieldChange}
              variant='outlined'
              fullWidth
              slotProps={{ input: { inputProps: { maxLength: 255 } } }}
            />
            <FormControl fullWidth variant='outlined'>
              <InputLabel id='playerClass-label'>Class</InputLabel>
              <Select
                id='playerClass'
                labelId='playerClass-label'
                value={formData.playerClass}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    playerClass: e.target.value,
                  }))
                }
                label='Class'
              >
                <MenuItem value='' disabled>
                  Select Class
                </MenuItem>
                {[
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
                ].map((cls) => (
                  <MenuItem key={cls} value={cls}>
                    {cls}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              id='buyerPot'
              label='Gold Pot'
              required
              value={formData.buyerPot}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  buyerPot: formatBuyerPot(e.target.value),
                }))
              }
              variant='outlined'
              fullWidth
              disabled={
                !shouldHideDolarField() &&
                !!formData.buyerDolarPot &&
                Number(formData.buyerDolarPot.replace(/,/g, '')) > 0
              }
            />
            {!shouldHideDolarField() && (
              <TextField
                id='buyerDolarPot'
                label='Pot (USD)'
                required
                value={formData.buyerDolarPot}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    buyerDolarPot: formatBuyerDolarPot(e.target.value),
                  }))
                }
                variant='outlined'
                fullWidth
                disabled={
                  !!formData.buyerPot &&
                  Number(formData.buyerPot.replace(/,/g, '')) > 0
                }
              />
            )}
            {formError && (
              <div className='col-span-2 text-center font-semibold text-red-600'>
                {formError}
              </div>
            )}
            <FormControl fullWidth variant='outlined'>
              <InputLabel id='idBuyerAdvertiser-label'>Advertiser</InputLabel>
              <Select
                id='idBuyerAdvertiser'
                labelId='idBuyerAdvertiser-label'
                value={formData.idBuyerAdvertiser}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    idBuyerAdvertiser: e.target.value,
                  }))
                }
                label='Advertiser'
              >
                <MenuItem value='' disabled>
                  Select Advertiser
                </MenuItem>
                {advertisers.map((advertiser) => (
                  <MenuItem key={advertiser.id} value={advertiser.id_discord}>
                    {advertiser.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              id='buyerNote'
              label='Note'
              value={formData.buyerNote}
              onChange={handleInputChange}
              variant='outlined'
              fullWidth
            />
            <FormControlLabel
              control={
                <Checkbox
                  id='isPaid'
                  checked={formData.isPaid}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isPaid: e.target.checked,
                    }))
                  }
                  color='primary'
                />
              }
              label='Paid Full'
            />
            <Button
              type='submit'
              variant='contained'
              fullWidth
              disabled={isSubmitting}
              startIcon={
                isSubmitting ? (
                  <div className='h-5 w-5 animate-spin rounded-full border-b-2 border-white'></div>
                ) : (
                  <UserPlus size={20} />
                )
              }
              sx={{
                backgroundColor: 'rgb(147, 51, 234)',
                '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
              }}
              className='col-span-2'
            >
              {isSubmitting ? 'Creating...' : 'Add Buyer'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
