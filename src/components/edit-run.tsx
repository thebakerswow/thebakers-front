import { useState, useEffect } from 'react'
import { Pencil } from '@phosphor-icons/react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
  Chip,
} from '@mui/material'
import axios from 'axios'
import { RunData } from '../types/runs-interface'
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

export interface EditRunProps {
  run: RunData
  onClose: () => void
  onRunEdit: () => void
}

export function EditRun({ onClose, run, onRunEdit }: EditRunProps) {
  const [apiOptions, setApiOptions] = useState<ApiOption[]>([])
  const [formData, setFormData] = useState({
    date: run.date,
    time: run.time, // Preencher o campo time com o valor vindo do run
    raid: run.raid,
    runType: run.runType,
    difficulty: run.difficulty,
    idTeam: run.idTeam,
    maxBuyers: run.maxBuyers,
    raidLeader:
      run.raidLeaders?.map((rl) => `${rl.idDiscord};${rl.username}`) || [],
    loot: run.loot,
    note: run.note,
    quantityBoss: { String: '', Valid: false },
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<ErrorDetails | null>(null)

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const teamId = import.meta.env.VITE_TEAM_PREFEITO
        const response = await api.get(`/team/${teamId}`)
        if (response.data.info.members)
          setApiOptions(response.data.info.members)
      } catch (err) {
        console.error('Failed to fetch API options:', err)
      }
    }
    fetchOptions()
  }, [])

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!formData.time) {
      setError({ message: 'Time is required', response: null }) // Exibir erro se o campo estiver vazio
      return
    }

    setIsSubmitting(true)

    const data = {
      ...formData,
      id: run.id,
      maxBuyers: formData.maxBuyers.toString(),
      raidLeader: formData.raidLeader.map((value) => {
        const parts = value.split(';')
        return `${parts[0]};${parts[1]}`
      }),
    }

    try {
      await api.put('/run', data)
      await onRunEdit()
      setIsSuccess(true)
      onClose() // Close the modal first
      Swal.fire({
        title: 'Success!',
        text: 'Run edited successfully!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError({
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        })
      } else {
        setError({ message: 'Unexpected error', response: err })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={true} onClose={onClose} fullWidth>
      {!isSuccess && (
        <DialogTitle className='text-center'>Edit Run</DialogTitle>
      )}
      <DialogContent>
        <div className='flex w-full max-w-[95vw] flex-col overflow-y-auto overflow-x-hidden'>
          {error ? (
            <ErrorComponent error={error} onClose={() => setError(null)} />
          ) : (
            <form onSubmit={handleSubmit} className='grid grid-cols-2 gap-4'>
              <TextField
                type='date'
                label='Date'
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                fullWidth
                required
                margin='dense'
              />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  value={formData.time ? dayjs(formData.time, 'HH:mm') : null}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      time:
                        value && dayjs(value).isValid()
                          ? dayjs(value).format('HH:mm') // Ensure correct 24-hour format
                          : '',
                    }))
                  }
                  ampm={true} // Display in 12-hour format
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      margin: 'dense', // Align with other fields
                    },
                  }}
                />
              </LocalizationProvider>
              <TextField
                label='Raid'
                value={formData.raid}
                onChange={(e) => handleChange('raid', e.target.value)}
                fullWidth
                required
              />
              <FormControl fullWidth required>
                <InputLabel>Run Type</InputLabel>
                <Select
                  value={formData.runType}
                  onChange={(e) => handleChange('runType', e.target.value)}
                  label='Run Type'
                >
                  <MenuItem value='Full Raid'>Full Raid</MenuItem>
                  <MenuItem value='AOTC'>AOTC</MenuItem>
                  <MenuItem value='Legacy'>Legacy</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth required>
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={formData.difficulty}
                  onChange={(e) => handleChange('difficulty', e.target.value)}
                  label='Difficulty'
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
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        quantityBoss: { String: e.target.value, Valid: true },
                      }))
                    }
                    label='Mythic Option'
                  >
                    <MenuItem value='Up to 6/8'>Up to 6/8</MenuItem>
                    <MenuItem value='7/8, 8/8 & Last Boss'>
                      7/8, 8/8 & Last Boss
                    </MenuItem>
                  </Select>
                </FormControl>
              )}
              <FormControl fullWidth required>
                <InputLabel>Team</InputLabel>
                <Select
                  value={formData.idTeam}
                  onChange={(e) => handleChange('idTeam', e.target.value)}
                  label='Team'
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
                  <MenuItem value={import.meta.env.VITE_TEAM_RAIO}>
                    Raio
                  </MenuItem>
                  <MenuItem value={import.meta.env.VITE_TEAM_APAE}>
                    APAE
                  </MenuItem>
                  <MenuItem value={import.meta.env.VITE_TEAM_DTM}>DTM</MenuItem>
                  <MenuItem value={import.meta.env.VITE_TEAM_KFFC}>
                    KFFC
                  </MenuItem>
                  <MenuItem value={import.meta.env.VITE_TEAM_SAPOCULEANO}>
                    Sapoculeano
                  </MenuItem>
                  <MenuItem value={import.meta.env.VITE_TEAM_GREENSKY}>
                    Greensky
                  </MenuItem>
                </Select>
              </FormControl>
              <TextField
                label='Max Buyers'
                value={formData.maxBuyers}
                onChange={(e) => handleChange('maxBuyers', e.target.value)}
                fullWidth
                required
              />
              <FormControl fullWidth required>
                <InputLabel>Raid Leader</InputLabel>
                <Select
                  multiple
                  label='Raid Leader'
                  value={formData.raidLeader}
                  onChange={(e) => handleChange('raidLeader', e.target.value)}
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
                      style: { maxHeight: 200, overflow: 'auto' },
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
              <FormControl fullWidth required>
                <InputLabel>Loot</InputLabel>
                <Select
                  value={formData.loot}
                  onChange={(e) => handleChange('loot', e.target.value)}
                  label='Loot'
                >
                  <MenuItem value='Saved'>Saved</MenuItem>
                  <MenuItem value='Unsaved'>Unsaved</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label='Note'
                value={formData.note}
                onChange={(e) => handleChange('note', e.target.value)}
                multiline
                fullWidth
              />
              <div className='col-span-2 flex items-center justify-center gap-4'>
                <Button
                  type='submit'
                  variant='contained'
                  color='primary'
                  disabled={isSubmitting}
                  startIcon={
                    isSubmitting ? (
                      <div className='h-5 w-5 animate-spin rounded-full border-b-2 border-white'></div>
                    ) : (
                      <Pencil size={20} />
                    )
                  }
                  sx={{
                    backgroundColor: 'rgb(239, 68, 68)',
                    '&:hover': { backgroundColor: 'rgb(248, 113, 113)' },
                  }}
                >
                  {isSubmitting ? 'Editing...' : 'Edit Run'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
