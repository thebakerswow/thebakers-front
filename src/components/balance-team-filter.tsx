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

// Função para ordenar times por prioridade baseada nos nomes
const sortTeamsByPriority = (
  teams: Array<{ id_discord: string; team_name: string }>
) => {
  // Define a ordem de prioridade dos times
  const priorityOrder = [
    'Chefe de cozinha',
    'M+',
    'Leveling',
    'Garçom',
    'Confeiteiros',
    'Jackfruit',
    'Insanos',
    'APAE',
    'Los Renegados',
    'DTM',
    'KFFC',
    'Greensky',
    'Guild Azralon BR#1',
    'Guild Azralon BR#2',
    'Rocket',
    'Fuck Bear',
    'Padeirinho',
    'Milharal',
  ]

  return teams.sort((a, b) => {
    const aIndex = priorityOrder.indexOf(a.team_name)
    const bIndex = priorityOrder.indexOf(b.team_name)

    // Se ambos estão na lista de prioridade, ordena pela posição
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex
    }

    // Se apenas um está na lista de prioridade, ele vem primeiro
    if (aIndex !== -1 && bIndex === -1) {
      return -1
    }
    if (aIndex === -1 && bIndex !== -1) {
      return 1
    }

    // Se nenhum está na lista de prioridade, ordena alfabeticamente
    return a.team_name.localeCompare(b.team_name)
  })
}

export function BalanceTeamFilter({
  selectedTeam,
  onChange,
  onError,
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

      // Aplica a ordenação por prioridade
      const sortedTeams = sortTeamsByPriority(uniqueTeams)
      setTeams(sortedTeams)
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
    // Só busca teams se não for usuário restrito
    if (!isRestrictedUser) {
      fetchTeams()
    }
  }, [isRestrictedUser])

  // Para usuários restritos, define automaticamente o próprio ID como time selecionado
  // REMOVIDO: Agora isso é feito no componente pai para evitar conflitos

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

  // Define o time inicial apenas para usuários não restritos quando teams são carregados
  useEffect(() => {
    if (
      !isRestrictedUser &&
      !selectedTeam &&
      teams.length > 0 &&
      !isLoadingTeams
    ) {
      const initialTeam = teams[0].id_discord
      onChange(initialTeam)
    }
  }, [selectedTeam, teams, onChange, isRestrictedUser, isLoadingTeams])

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
