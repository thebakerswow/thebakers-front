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
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
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
    const response = await api.get(
      `${import.meta.env.VITE_API_BASE_URL}/team/${teamId}`
    )
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

export function AddRun({ onClose, onRunAddedReload }: AddRunProps) {
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    raid: '',
    runType: '',
    difficulty: '',
    idTeam: '',
    maxBuyers: '',
    raidLeader: [] as string[],
    loot: '',
    note: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [apiOptions, setApiOptions] = useState<ApiOption[]>([])
  // Busca as opções da API ao montar o componente do time Prefeito
  useEffect(() => {
    const teamId = import.meta.env.VITE_TEAM_PREFEITO
    fetchApiOptions(teamId, setError).then(setApiOptions)
  }, [])

  // Atualiza os valores do formulário
  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent
  ) => {
    const { id, value } = e.target as { id: string; value: string }
    setFormData((prev) => ({
      ...prev,
      [id]:
        id === 'maxBuyers' && !/^[0-9]*$/.test(value) ? prev.maxBuyers : value,
    }))
  }

  // Envia os dados do formulário para a API
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.post(`${import.meta.env.VITE_API_BASE_URL}/run`, formData)
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
          maxWidth: isSuccess ? '35vw' : '40vw',
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'relative',
          bgcolor: 'background.paper',
          p: 4,
          borderRadius: 2,
          minHeight: isSuccess ? '8vw' : '20vw',
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
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <TimePicker
                label='Time'
                value={formData.time ? dayjs(formData.time, 'HH:mm') : null}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    time:
                      value && dayjs(value).isValid()
                        ? dayjs(value).format('HH:mm') // Format as HH:mm
                        : '',
                  }))
                }
                ampm={true} // Define                 ampm={true} // Define o formato 12h com AM/PM
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
            <TextField
              type='text'
              label='Raid'
              id='raid'
              required
              value={formData.raid}
              onChange={handleChange}
              variant='outlined'
              fullWidth
            />
            <FormControl fullWidth variant='outlined' required>
              <InputLabel id='runType-label'>Run Type</InputLabel>
              <Select
                id='runType'
                value={formData.runType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    runType: e.target.value,
                  }))
                }
                label='Run Type'
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 200, // Define a altura máxima
                      overflow: 'auto', // Adiciona rolagem
                    },
                  },
                }}
              >
                <MenuItem value='Full Raid'>Full Raid</MenuItem>
                <MenuItem value='AOTC'>AOTC</MenuItem>
                <MenuItem value='Legacy'>Legacy</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth variant='outlined' required>
              <InputLabel id='difficulty-label'>Difficulty</InputLabel>
              <Select
                id='difficulty'
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    difficulty: e.target.value,
                  }))
                }
                label='Difficulty'
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 200, // Define a altura máxima
                      overflow: 'auto', // Adiciona rolagem
                    },
                  },
                }}
              >
                <MenuItem value='Normal'>Normal</MenuItem>
                <MenuItem value='Heroic'>Heroic</MenuItem>
                <MenuItem value='Mythic'>Mythic</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth variant='outlined' required>
              <InputLabel id='idTeam-label'>Team</InputLabel>
              <Select
                id='idTeam'
                value={formData.idTeam}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    idTeam: e.target.value,
                  }))
                }
                label='Team'
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 200, // Define a altura máxima
                      overflow: 'auto', // Adiciona rolagem
                    },
                  },
                }}
              >
                <MenuItem value={import.meta.env.VITE_TEAM_PADEIRINHO}>
                  Padeirinho
                </MenuItem>
                <MenuItem value={import.meta.env.VITE_TEAM_GARCOM}>
                  Garçom
                </MenuItem>
                <MenuItem value={import.meta.env.VITE_TEAM_CONFEITEIROS}>
                  Confeiteiros
                </MenuItem>
                <MenuItem value={import.meta.env.VITE_TEAM_JACKFRUIT}>
                  Jackfruit
                </MenuItem>
                <MenuItem value={import.meta.env.VITE_TEAM_MILHARAL}>
                  Milharal
                </MenuItem>
                <MenuItem value={import.meta.env.VITE_TEAM_RAIO}>Raio</MenuItem>
                <MenuItem value={import.meta.env.VITE_TEAM_APAE}>APAE</MenuItem>
                <MenuItem value={import.meta.env.VITE_TEAM_DTM}>DTM</MenuItem>
              </Select>
            </FormControl>
            <TextField
              type='text'
              id='maxBuyers'
              label='Max Buyers'
              required
              value={formData.maxBuyers}
              onChange={handleChange}
              variant='outlined'
              fullWidth
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
            <FormControl fullWidth variant='outlined' required>
              <InputLabel id='loot-label'>Loot</InputLabel>
              <Select
                id='loot'
                value={formData.loot}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    loot: e.target.value,
                  }))
                }
                label='Loot'
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 200, // Define a altura máxima
                      overflow: 'auto',
                    },
                  },
                }}
              >
                <MenuItem value='Saved'>Saved</MenuItem>
                <MenuItem value='Unsaved'>Unsaved</MenuItem>
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
            <div className='col-span-2 flex items-center justify-center gap-4'>
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
