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
import { createRun } from '../services/api/runs'
import { getTeamMembers } from '../services/api/users'
import { ErrorDetails } from './error-display'
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
  onError?: (error: ErrorDetails) => void
}

export function AddLevelingRun({
  onClose,
  onRunAddedReload,
  onError,
}: AddRunProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], // Set today's date as default
    time: '23:59',
    raid: '',
    runType: '',
    difficulty: '',
    idTeam: import.meta.env.VITE_TEAM_LEVELING, // Always set to Leveling
    maxBuyers: '999',
    raidLeader: [] as string[],
    loot: '',
    note: '',
    quantityBoss: { String: '', Valid: false }, // precisa ser objeto para o backend Go
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [apiOptions, setApiOptions] = useState<ApiOption[]>([])

  // Função para buscar membros do time
  const fetchTeamMembers = useCallback(async () => {
    try {
      const teamId = import.meta.env.VITE_TEAM_LEVELING
      const response = await getTeamMembers(teamId)
      setApiOptions(response)
    } catch (error) {
      console.error('Error fetching team members:', error)
      if (axios.isAxiosError(error)) {
        onError?.({
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        })
      } else {
        onError?.({ message: 'Unexpected error', response: error })
      }
    }
  }, [onError])

  // Busca as opções da API ao montar o componente do time Leveling
  useEffect(() => {
    fetchTeamMembers()
  }, [fetchTeamMembers])

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
      await createRun({
        ...formData,
        quantityBoss: formData.quantityBoss, // envia como objeto para o backend Go
      })
      await onRunAddedReload()
      setIsSuccess(true)
      onClose() // Close the modal before showing Swal

      // Mostra alerta de confirmação após fechar o dialog
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
      if (axios.isAxiosError(error)) {
        onError?.({
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        })
      } else {
        onError?.({ message: 'Unexpected error', response: error })
      }
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
            value='Leveling'
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
