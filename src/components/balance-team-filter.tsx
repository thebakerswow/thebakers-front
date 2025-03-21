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
  return (
    <div className='relative'>
      <label className='mr-2'>Filter by Team:</label>
      <select
        value={selectedTeam || ''}
        onChange={(e) => onSelectTeam(e.target.value)}
        disabled={isLoadingTeams}
        className='rounded border p-1 text-black'
      >
        {teams.map((team) => (
          <option key={team.id_discord} value={team.id_discord}>
            {team.team_name}
          </option>
        ))}
      </select>
    </div>
  )
}
