import { useMemo } from 'react'
import { Select, MenuItem, FormControl } from '@mui/material'

// Define as propriedades do componente BalanceTeamFilter
interface BalanceTeamFilterProps {
  selectedTeam: string | null
  teams: Array<{ id_discord: string; team_name: string }>
  isLoadingTeams: boolean
  onSelectTeam: (teamId: string | null) => void
}

export function BalanceTeamFilter({
  selectedTeam,
  teams,
  isLoadingTeams,
  onSelectTeam,
}: BalanceTeamFilterProps) {
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

  // Define o time inicial se nenhum time estiver selecionado
  const initialTeam = selectedTeam || teams[0]?.id_discord || null

  // Garante que o time inicial seja selecionado ao carregar o componente
  useMemo(() => {
    if (!selectedTeam && initialTeam) {
      onSelectTeam(initialTeam)
    }
  }, [selectedTeam, initialTeam, onSelectTeam])

  return (
    <FormControl className='relative'>
      <Select
        label='team-filter-label'
        value={initialTeam} // Usa o time inicial
        onChange={(e) => onSelectTeam(e.target.value || null)}
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
