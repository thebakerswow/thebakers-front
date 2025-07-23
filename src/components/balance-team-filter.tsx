import { useEffect, useMemo, useState } from 'react'
import { Select, MenuItem, FormControl, SelectChangeEvent } from '@mui/material'
import axios from 'axios'
import { getBalanceTeams } from '../services/api/teams'
import { ErrorDetails } from './error-display'
import { useAuth } from '../context/auth-context'

interface BalanceTeamFilterProps {
  selectedTeam: string | null
  onChange: (team: string | null) => void
  onError: (error: ErrorDetails | null) => void
}

export function BalanceTeamFilter({
  selectedTeam,
  onChange,
  onError,
}: BalanceTeamFilterProps) {
  const { userRoles, idDiscord } = useAuth()
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

  const fetchTeams = async () => {
    setIsLoadingTeams(true)
    try {
      const response = await getBalanceTeams()

      const uniqueTeams = response.reduce(
        (acc: any[], team: any) =>
          acc.some((t) => t.team_name === team.team_name)
            ? acc
            : [...acc, team],
        []
      )
      setTeams(uniqueTeams)
      onError(null) // Clear any previous errors
    } catch (error) {
      const errorDetails = axios.isAxiosError(error)
        ? {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          }
        : { message: 'Unexpected error', response: error }
      onError(errorDetails)
    } finally {
      setIsLoadingTeams(false)
    }
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  // Para usuários restritos, define automaticamente o próprio ID como time selecionado
  useEffect(() => {
    if (isRestrictedUser && idDiscord && !selectedTeam) {
      onChange(idDiscord)
    }
  }, [isRestrictedUser, idDiscord, selectedTeam, onChange])

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

  // Remove o useMemo e usa useEffect para definir o time inicial apenas para usuários não restritos
  useEffect(() => {
    if (!isRestrictedUser && !selectedTeam && teams.length > 0) {
      const initialTeam = teams[0].id_discord
      onChange(initialTeam)
    }
  }, [selectedTeam, teams, onChange, isRestrictedUser])

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value
    onChange(value || null)
  }

  // Para usuários restritos, não mostra o filtro de times
  if (isRestrictedUser) return null

  return (
    <FormControl className='relative'>
      <Select
        label='team-filter-label'
        value={selectedTeam || ''} // Usa o time selecionado
        onChange={handleSelectChange}
        disabled={isLoadingTeams}
        className='mt-4 text-black'
        displayEmpty
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
        {teams.length === 0 && (
          <MenuItem value='' disabled>
            {isLoadingTeams ? 'Loading teams...' : 'No teams available'}
          </MenuItem>
        )}
        {options}
      </Select>
    </FormControl>
  )
}
