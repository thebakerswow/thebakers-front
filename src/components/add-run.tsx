import { useState, useEffect, useCallback } from 'react'
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
  IconButton,
} from '@mui/material'
import axios from 'axios'
import { getTeamMembers } from '../services/api/users'
import { createRun } from '../services/api/runs'
import { ErrorDetails } from './error-display'
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'
import CloseIcon from '@mui/icons-material/Close'

interface ApiOption {
  id: string
  username: string
  global_name: string
}

export interface AddRunProps {
  onClose: () => void
  onRunAddedReload: () => void
  onError: (error: ErrorDetails | null) => void
}

export function AddRun({ onClose, onRunAddedReload, onError }: AddRunProps) {
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
    quantityBoss: { String: '', Valid: false }, // precisa ser objeto para o backend Go
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [apiOptions, setApiOptions] = useState<ApiOption[]>([])

  // Function to fetch team members
  const fetchTeamMembers = useCallback(async () => {
    try {
      const teamId = import.meta.env.VITE_TEAM_PREFEITO
      const response = await getTeamMembers(teamId)
      setApiOptions(response)
      onError(null) // Clear any previous errors
    } catch (error) {
      console.error('Error fetching team members:', error)
      const errorDetails = axios.isAxiosError(error)
        ? {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          }
        : {
            message: 'Unexpected error fetching team members',
            response: error,
          }
      onError(errorDetails)
    }
  }, [onError])

  // Fetches API options when mounting the Prefeito team component
  useEffect(() => {
    fetchTeamMembers()
  }, [fetchTeamMembers])

  // Updates form values
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

  // Sends form data to API
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    onError(null)

    try {
      await createRun({
        ...formData,
        quantityBoss: formData.quantityBoss, // envia como objeto para o backend Go
      })
      await onRunAddedReload()
      setIsSuccess(true)
      onClose() // Close the modal before showing Swal

      // Shows confirmation alert after closing dialog
      setTimeout(() => {
        Swal.fire({
          title: 'Success!',
          text: 'Run created successfully!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        })
      }, 150) // Delay um pouco maior para garantir que o dialog foi fechado
    } catch (error) {
      console.error('Error creating run:', error)
      const errorDetails = axios.isAxiosError(error)
        ? {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          }
        : { message: 'Unexpected error creating run', response: error }
      onError(errorDetails)
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
        <IconButton
          aria-label='close'
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
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
        {/* Formulário para criar uma nova run */}
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
              ampm={true} // Define o formato 12h com AM/PM
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
                  quantityBoss: { String: '', Valid: false }, // limpa a opção extra se mudar a dificuldade
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
          {formData.difficulty === 'Mythic' && (
            <FormControl fullWidth variant='outlined' required>
              <InputLabel id='quantityBoss-label'>Mythic Cut</InputLabel>
              <Select
                id='quantityBoss'
                name='quantityBoss'
                value={formData.quantityBoss.String}
                onChange={handleChange}
                label='Mythic Option'
              >
                <MenuItem value='Up to 6/8'>Up to 6/8</MenuItem>
                <MenuItem value='7/8, 8/8 & Last Boss'>
                  7/8, 8/8 & Last Boss
                </MenuItem>
              </Select>
            </FormControl>
          )}
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
              <MenuItem value={import.meta.env.VITE_TEAM_GARCOM}>
                Garçom
              </MenuItem>
              <MenuItem value={import.meta.env.VITE_TEAM_CONFEITEIROS}>
                Confeiteiros
              </MenuItem>
              <MenuItem value={import.meta.env.VITE_TEAM_JACKFRUIT}>
                Jackfruit
              </MenuItem>
              <MenuItem value={import.meta.env.VITE_TEAM_INSANOS}>
                Insanos
              </MenuItem>
              <MenuItem value={import.meta.env.VITE_TEAM_APAE}>APAE</MenuItem>
              <MenuItem value={import.meta.env.VITE_TEAM_LOSRENEGADOS}>Los Renegados</MenuItem>
              <MenuItem value={import.meta.env.VITE_TEAM_DTM}>DTM</MenuItem>
              <MenuItem value={import.meta.env.VITE_TEAM_KFFC}>KFFC</MenuItem>
              <MenuItem value={import.meta.env.VITE_TEAM_GREENSKY}>
                Greensky
              </MenuItem>
              <MenuItem value={import.meta.env.VITE_TEAM_GUILD_AZRALON_1}>
                Guild Azralon BR#1
              </MenuItem>
              <MenuItem value={import.meta.env.VITE_TEAM_GUILD_AZRALON_2}>
                Guild Azralon BR#2
              </MenuItem>
              <MenuItem value={import.meta.env.VITE_TEAM_ROCKET}>
                Rocket
              </MenuItem>
              <MenuItem value={import.meta.env.VITE_TEAM_PADEIRINHO}>
                Padeirinho
              </MenuItem>
              <MenuItem value={import.meta.env.VITE_TEAM_MILHARAL}>
                Milharal
              </MenuItem>
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
          <div className='col-span-2 flex items-center justify-center'>
            <Button
              type='submit'
              variant='contained'
              sx={{
                backgroundColor: 'rgb(147, 51, 234)',
                '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
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
      </DialogContent>
    </Dialog>
  )
}
