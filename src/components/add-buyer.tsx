import { UserPlus } from '@phosphor-icons/react'
import axios from 'axios'
import { useState, useEffect, useCallback } from 'react'
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
} from '@mui/material'
import { RunData } from '../types/runs-interface'
import { api } from '../services/axiosConfig'
import { ErrorComponent, ErrorDetails } from './error-display'
import Swal from 'sweetalert2'

interface AddBuyerProps {
  run: RunData
  onClose: () => void
  onBuyerAddedReload: () => void
}

interface Advertiser {
  id: string
  id_discord: string
  name: string
  username: string
}

export function AddBuyer({ run, onClose, onBuyerAddedReload }: AddBuyerProps) {
  // Estado para armazenar os dados do formulário
  const [formData, setFormData] = useState({
    nameAndRealm: '',
    playerClass: '',
    buyerPot: '',
    isPaid: false,
    idBuyerAdvertiser: '',
    buyerNote: '',
  })
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<ErrorDetails | null>(null)

  // Função para lidar com mudanças nos inputs do formulário
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

  // Função para formatar o valor do campo "buyerPot"
  const formatBuyerPot = (value: string) => {
    const rawValue = value.replace(/\D/g, '')
    return rawValue ? Number(rawValue).toLocaleString('en-US') : ''
  }

  // Função para lidar com o envio do formulário
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Garantir que todos os campos obrigatórios estão preenchidos
    const data = {
      id_run: run.id,
      nameAndRealm: formData.nameAndRealm || '',
      playerClass: formData.playerClass || '',
      buyerPot: Number(formData.buyerPot.replace(/,/g, '')) || 0,
      isPaid: formData.isPaid,
      idBuyerAdvertiser: formData.idBuyerAdvertiser || '',
      buyerNote: formData.buyerNote || '',
    }

    try {
      // Envia os dados do comprador para a API
      await api.post('/buyer', data)
      await onBuyerAddedReload()
      setIsSuccess(true)
      onClose()
      Swal.fire({
        title: 'Success!',
        text: 'Buyer added successfully!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error) {
      // Captura e armazena erros
      setError(
        axios.isAxiosError(error)
          ? {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status,
            }
          : { message: 'Unexpected error', response: error }
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Função para buscar a lista de anunciantes
  const fetchAdvertisers = useCallback(async () => {
    try {
      const response = await api.get('/users/ghost')
      setAdvertisers(response.data.info)
    } catch (error) {
      setError(
        axios.isAxiosError(error)
          ? {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status,
            }
          : { message: 'Unexpected error', response: error }
      )
    }
  }, [])

  useEffect(() => {
    fetchAdvertisers() // Busca anunciantes ao carregar o componente
  }, [fetchAdvertisers])

  // Classe reutilizável para estilizar inputs e selects

  return (
    <Dialog open={true} onClose={onClose}>
      {!isSuccess && (
        <DialogTitle className='text-center'>Add Buyer</DialogTitle>
      )}
      <DialogContent>
        <div className='flex w-full max-w-[95vw] flex-col overflow-y-auto overflow-x-hidden'>
          {error ? (
            <ErrorComponent error={error} onClose={() => setError(null)} />
          ) : (
            <form
              onSubmit={handleSubmit}
              className='mt-2 grid grid-cols-2 gap-4'
            >
              <TextField
                id='nameAndRealm'
                label='Buyer Name-Realm'
                required
                value={formData.nameAndRealm}
                onChange={handleTextFieldChange}
                variant='outlined'
                fullWidth
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
                    'Demonhunter',
                    'Deathknight',
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
                label='Pot'
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
              />
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
                  backgroundColor: 'rgb(239, 68, 68)',
                  '&:hover': { backgroundColor: 'rgb(248, 113, 113)' },
                }}
                className='col-span-2'
              >
                {isSubmitting ? 'Creating...' : 'Add Buyer'}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
