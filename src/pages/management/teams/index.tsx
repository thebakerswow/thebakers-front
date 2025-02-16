import { useEffect, useState } from 'react'
import axios from 'axios'

interface TeamMember {
  global_name: string
  username: string
}

interface Team {
  name: string
  members: TeamMember[]
}

const teamOrder = [
  'Padeirinho',
  'Garçom',
  'Confeiteiros',
  'Jackfruit',
  'Milharal',
  'APAE',
  'Advertiser',
]

const teamColors: { [key: string]: string } = {
  Padeirinho: 'bg-yellow-400',
  Garçom: 'bg-green-600',
  Confeiteiros: 'bg-pink-400',
  Jackfruit: 'bg-green-300',
  Milharal: 'bg-yellow-200',
  APAE: 'bg-red-400',
  Advertiser: 'bg-gray-300',
}

export function TeamsManagement() {
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get(
          import.meta.env.VITE_GET_TEAMS_URL ||
            'http://localhost:8000/v1/teams',
          {
            headers: {
              APP_TOKEN: import.meta.env.VITE_APP_TOKEN,
            },
          }
        )

        const orderedTeams = teamOrder.map((teamName) => ({
          name: teamName,
          members: (response.data.info[teamName] || []).map((member: any) => ({
            global_name: member.global_name,
            username: member.username,
          })),
        }))

        setTeams(orderedTeams)
      } catch (error) {
        console.error('Erro ao buscar teams:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTeams()
  }, [])

  const columns = teams.map((team) =>
    team.members.map((member) => ({
      player: member.global_name,
      discord: member.username,
    }))
  )

  const maxRows = Math.max(...columns.map((team) => team.length), 0)

  if (isLoading) {
    return (
      <div
        className='bg-zinc-700 text-gray-100 absolute inset-0 flex items-center justify-center 
        rounded-xl shadow-2xl m-8'
      >
        <div className='flex flex-col items-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white'></div>
          <p className='mt-4 text-lg'>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-zinc-700 text-gray-100 absolute inset-0 flex flex-col rounded-xl shadow-2xl m-8 overflow-y-auto scrollbar-thin'>
      <table className='min-w-full border-collapse'>
        <thead className='table-header-group'>
          <tr className='text-md text-gray-700'>
            {teams.map((team, index) => (
              <th
                className={`p-2 border ${index !== teams.length - 1 ? 'border-r-black' : ''} ${
                  teamColors[team.name] || 'bg-zinc-400'
                }`}
                colSpan={2}
                key={`team-${index}`}
              >
                {team.name}
              </th>
            ))}
          </tr>
          <tr className='text-md bg-zinc-400 text-gray-800'>
            {teams.flatMap((_, index) => {
              const isLastTeam = index === teams.length - 1
              return [
                <th
                  className={`p-2 border ${!isLastTeam ? 'border-r-black' : ''}`}
                  key={`player-header-${index}`}
                >
                  Player
                </th>,
                <th
                  className={`p-2 border ${!isLastTeam ? 'border-r-black' : ''}`}
                  key={`discord-header-${index}`}
                >
                  Discord
                </th>,
              ]
            })}
          </tr>
        </thead>
        <tbody className='table-row-group text-sm font-medium text-zinc-900 bg-zinc-200'>
          {Array.from({ length: maxRows }, (_, rowIndex) => (
            <tr
              className={`text-center ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-zinc-200'}`}
              key={`row-${rowIndex}`}
            >
              {columns.flatMap((teamMembers, teamIndex) => {
                const member = teamMembers[rowIndex]
                const isLastTeam = teamIndex === teams.length - 1
                return [
                  <td
                    className={`p-2 border border-b-black ${!isLastTeam ? 'border-r-black' : ''}`}
                    key={`player-${teamIndex}-${rowIndex}`}
                  >
                    {member?.player || '-'}
                  </td>,
                  <td
                    className={`p-2 border border-b-black ${!isLastTeam ? 'border-r-black' : ''}`}
                    key={`discord-${teamIndex}-${rowIndex}`}
                  >
                    {member?.discord || '-'}
                  </td>,
                ]
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
