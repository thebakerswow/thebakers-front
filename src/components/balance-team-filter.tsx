import { useMemo } from 'react'

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
  // Memoiza as opções para evitar renderizações desnecessárias quando a lista de times não muda
  const options = useMemo(
    () =>
      teams.map((team) => (
        <option key={team.id_discord} value={team.id_discord}>
          {team.team_name}
        </option>
      )),
    [teams]
  )

  return (
    <div className='relative'>
      <label className='mr-2'>Filter by Team:</label>
      <select
        value={selectedTeam || ''}
        onChange={(e) => onSelectTeam(e.target.value || null)}
        disabled={isLoadingTeams}
        className='rounded border p-1 text-black'
      >
        {options}
      </select>
    </div>
  )
}
