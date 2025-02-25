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
        onChange={(e) => onSelectTeam(e.target.value || null)}
        className='pl-2 pr-8 py-1 rounded-md text-black border border-gray-300'
      >
        <option value=''>All Teams</option>
        {isLoadingTeams ? (
          <option disabled>Loading teams...</option>
        ) : (
          teams.map((team) => (
            <option key={team.id_discord} value={team.id_discord}>
              {team.team_name}
            </option>
          ))
        )}
      </select>
    </div>
  )
}
