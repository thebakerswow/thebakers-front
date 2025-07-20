import { useState, useEffect } from 'react'
import { UserPlus } from '@phosphor-icons/react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  SelectChangeEvent,
  Chip,
  Button,
  CircularProgress,
} from '@mui/material'
import axios from 'axios'
import { api } from '../services/axiosConfig'
import { ErrorComponent, ErrorDetails } from './error-display'
import Swal from 'sweetalert2'

interface ApiOption {
  id: string
  username: string
  global_name: string
}

const fetchApiOptions = async (
  teamId: string,
  onError: (error: ErrorDetails) => void
) => {
  try {
    const response = await api.get(`/team/${teamId}`)
    return response.data.info.members || []
  } catch (error) {
    const errorDetails = axios.isAxiosError(error)
      ? {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        }
      : { message: 'Erro inesperado', response: error }
    onError(errorDetails)
    return []
  }
}

export interface AddRunProps {
  onClose: () => void
  onRunAddedReload: () => void
}

// (Removed unused commonInputStyles declaration)

export function AddKeyRun({ onClose, onRunAddedReload }: AddRunProps) {
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], // Set today's date as default
    time: '',
    raid: '',
    runType: '',
    difficulty: '',
    idTeam: import.meta.env.VITE_TEAM_MILHARAL, // Always set to Milharal
    maxBuyers: '999',
    raidLeader: [] as string[],
    loot: '',
    note: '',
    quantityBoss: { String: '', Valid: false }, // precisa ser objeto para o backend Go
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [apiOptions, setApiOptions] = useState<ApiOption[]>([])
  // Busca as opções da API ao montar o componente do time Milharal
  useEffect(() => {
    const teamId = import.meta.env.VITE_TEAM_MILHARAL
    fetchApiOptions(teamId, setError).then(setApiOptions)
  }, [])

  // Atualiza os valores do formulário
  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent
  ) => {
    const target = e.target as { id?: string; name?: string; value: string }
    const key = target.id || target.name
    if (!key) return
    if (key === 'quantityBoss') {
      setFormData((prev) => ({
        ...prev,
        quantityBoss: {
          String: target.value,
          Valid: !!target.value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [key]:
          key === 'maxBuyers' && !/^[0-9]*$/.test(target.value)
            ? prev.maxBuyers
            : target.value,
      }))
    }
  }

  // Envia os dados do formulário para a API
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.post('/run', {
        ...formData,
        quantityBoss: formData.quantityBoss, // envia como objeto para o backend Go
      })
      await onRunAddedReload()
      setIsSuccess(true)
      onClose() // Close the modal before showing Swal
      Swal.fire({
        title: 'Success!',
        text: 'Run created successfully!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error) {
      setError(
        axios.isAxiosError(error)
          ? {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status,
            }
          : { message: 'Erro inesperado', response: error }
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={true} onClose={onClose} fullWidth>
      <DialogTitle
        sx={{
          textAlign: 'center', // Centraliza o título
          fontWeight: 'bold', // Opcional: adiciona destaque ao título
        }}
      >
        {isSuccess ? 'Success' : 'Add Run'}
      </DialogTitle>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'relative',
          bgcolor: 'background.paper',
          p: 4,
          borderRadius: 2,
        }}
      >
        {error ? (
          // Exibe o componente de erro caso ocorra algum problema
          <ErrorComponent error={error} onClose={() => setError(null)} />
        ) : (
          // Formulário para criar uma nova run
          <form onSubmit={handleSubmit} className='mt-2 grid grid-cols-2 gap-4'>
            {/* Inputs e selects para os dados da run */}
            <TextField
              type='date'
              id='date'
              label='Date'
              required
              value={formData.date}
              onChange={handleChange}
              variant='outlined'
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              type='text'
              id='runType'
              label='Run Type'
              value='Keys'
              variant='outlined'
              fullWidth
              disabled
            />

            <TextField
              type='text'
              id='idTeam'
              label='Team'
              value='Milharal'
              variant='outlined'
              fullWidth
              disabled
            />

            <FormControl fullWidth variant='outlined' required>
              <InputLabel id='raidLeader-label'>Raid Leader</InputLabel>
              <Select
                id='raidLeader'
                multiple
                value={formData.raidLeader}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    raidLeader: e.target.value as string[],
                  }))
                }
                label='Raid Leader'
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip
                        key={value}
                        label={
                          apiOptions.find(
                            (option) =>
                              `${option.id};${option.username}` === value
                          )?.global_name || value
                        }
                      />
                    ))}
                  </Box>
                )}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 200, // Define a altura máxima
                      overflow: 'auto', // Adiciona rolagem
                    },
                  },
                }}
              >
                {apiOptions.map((option) => (
                  <MenuItem
                    key={option.username}
                    value={`${option.id};${option.username}`}
                  >
                    {option.global_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              placeholder='Note'
              id='note'
              value={formData.note}
              onChange={handleChange}
              variant='outlined'
              fullWidth
              multiline
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <div className='col-span-2 flex items-center justify-center'>
              <Button
                type='submit'
                variant='contained'
                sx={{
                  backgroundColor: 'rgb(239, 68, 68)',
                  '&:hover': { backgroundColor: 'rgb(248, 113, 113)' },
                  padding: '10px 20px',
                  boxShadow: 3,
                }}
                size='medium'
                disabled={isSubmitting}
                startIcon={
                  isSubmitting ? (
                    <CircularProgress size={20} color='inherit' />
                  ) : (
                    <UserPlus size={20} />
                  )
                }
              >
                {isSubmitting ? 'Creating...' : 'Add Run'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
