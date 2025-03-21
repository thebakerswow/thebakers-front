import { useEffect, useState } from 'react'
import { api } from '../../../services/axiosConfig'
import {
  Team,
  TeamOrder,
  teamOrder,
  teamColors,
} from '../../../types/team-interface'
import { LoadingSpinner } from '../../../components/loading-spinner'
import axios from 'axios'
import { ErrorComponent, ErrorDetails } from '../../../components/error-display'
import { Modal } from '../../../components/modal'

export function TeamsManagement() {
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<ErrorDetails | null>(null)

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setIsLoading(true)
        const response = await api.get(
          `${import.meta.env.VITE_API_BASE_URL}/teams` ||
            'http://localhost:8000/v1/teams'
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
        if (axios.isAxiosError(error)) {
          const errorDetails = {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          }
          setError(errorDetails)
        } else {
          setError({
            message: 'Erro inesperado',
            response: error,
          })
        }
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

  if (error) {
    return (
      <Modal onClose={() => setError(null)}>
        <ErrorComponent error={error} onClose={() => setError(null)} />
      </Modal>
    )
  }

  if (isLoading) {
    return (
      <div className='absolute inset-0 m-8 flex items-center justify-center rounded-xl bg-zinc-700 text-gray-100 shadow-2xl'>
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className='absolute inset-0 m-8 flex flex-col overflow-y-auto rounded-xl bg-zinc-700 text-gray-100 shadow-2xl scrollbar-thin'>
      <table className='min-w-full border-collapse'>
        <thead className='table-header-group'>
          <tr className='text-md text-gray-700'>
            {teams.map((team, index) => (
              <th
                className={`border p-2 ${index !== teams.length - 1 ? '' : ''} ${
                  teamColors[team.name as TeamOrder] || 'bg-zinc-400'
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
                  className={'border border-r-black p-2'}
                  key={`player-header-${index}`}
                >
                  Player
                </th>,
                <th
                  className={`border p-2 ${!isLastTeam ? 'border-r-black' : ''}`}
                  key={`discord-header-${index}`}
                >
                  Discord
                </th>,
              ]
            })}
          </tr>
        </thead>
        <tbody className='table-row-group bg-zinc-200 text-sm font-medium text-zinc-900'>
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
                    className={'border border-b-black border-r-black p-2'}
                    key={`player-${teamIndex}-${rowIndex}`}
                  >
                    {member?.player || '-'}
                  </td>,
                  <td
                    className={`border border-b-black p-2 ${!isLastTeam ? 'border-r-black' : ''}`}
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
