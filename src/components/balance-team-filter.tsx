import { useEffect, useMemo, useState } from 'react'
import { Select, MenuItem, FormControl, SelectChangeEvent } from '@mui/material'
import axios from 'axios'
import { api } from '../services/axiosConfig'
import { ErrorComponent, ErrorDetails } from './error-display'
import { Modal as MuiModal, Box } from '@mui/material'
import { useAuth } from '../context/auth-context'

interface BalanceTeamFilterProps {
  selectedTeam: string | null
  onChange: (team: string | null) => void
}

export function BalanceTeamFilter({
  selectedTeam,
  onChange,
}: BalanceTeamFilterProps) {
  const { userRoles } = useAuth()
  const restrictedRoles = [
    import.meta.env.VITE_TEAM_FREELANCER,
    import.meta.env.VITE_TEAM_ADVERTISER,
  ]
  const isRestrictedUser =
    userRoles.every((role) => restrictedRoles.includes(role)) &&
    userRoles.length <= restrictedRoles.length

  const [isLoadingTeams, setIsLoadingTeams] = useState(false)
  const [teams, setTeams] = useState<
    Array<{ id_discord: string; team_name: string }>
  >([])
  const [error, setError] = useState<ErrorDetails | null>(null)

  const fetchTeams = async () => {
    if (isRestrictedUser) return

    setIsLoadingTeams(true)
    try {
      const response = await api.get('/teams/balance')

      const uniqueTeams = response.data.info.reduce(
        (acc: any[], team: any) =>
          acc.some((t) => t.team_name === team.team_name)
            ? acc
            : [...acc, team],
        []
      )
      setTeams(uniqueTeams)
    } catch (error) {
      console.error('Error fetching teams:', error)
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
      setIsLoadingTeams(false)
    }
  }

  useEffect(() => {
    if (!isRestrictedUser) {
      fetchTeams()
    }
  }, [isRestrictedUser])

  // Memoriza as opções para evitar renderizações desnecessárias quando a lista de times não muda
  const options = useMemo(
    () =>
      teams.map((team) => (
        <MenuItem key={team.id_discord} value={team.id_discord}>
          {team.team_name}
        </MenuItem>
      )),
    [teams]
  )

  // Remove o useMemo e usa useEffect para definir o time inicial
  useEffect(() => {
    if (!selectedTeam && teams.length > 0) {
      onChange(teams[0].id_discord)
    }
  }, [selectedTeam, teams, onChange])

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value || null)
  }

  if (isRestrictedUser) return null

  if (error) {
    return (
      <MuiModal open={!!error} onClose={() => setError(null)}>
        <Box className='absolute left-1/2 top-1/2 w-96 -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-gray-400 p-4 shadow-lg'>
          <ErrorComponent error={error} onClose={() => setError(null)} />
        </Box>
      </MuiModal>
    )
  }

  return (
    <FormControl className='relative'>
      <Select
        label='team-filter-label'
        value={selectedTeam || ''} // Usa o time selecionado
        onChange={handleSelectChange}
        disabled={isLoadingTeams}
        className='mt-4 text-black'
        sx={{
          backgroundColor: 'white',
          height: '40px', // Define uma altura menor para o Select
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            border: 'none', // Remove a borda ao focar
          },
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none', // Remove a borda padrão
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            border: 'none', // Remove a borda ao passar o mouse
          },
          boxShadow: 'none', // Remove qualquer sombra
        }}
        MenuProps={{
          PaperProps: {
            style: {
              boxShadow: 'none', // Remove sombra do menu dropdown
            },
          },
        }}
      >
        {options}
      </Select>
    </FormControl>
  )
}
