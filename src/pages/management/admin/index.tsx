import axios from 'axios'
import { useState, useEffect } from 'react'
import { ErrorDetails, ErrorComponent } from '../../../components/error-display'
import { LoadingSpinner } from '../../../components/loading-spinner'
import { Modal } from '../../../components/modal'
import { api } from '../../../services/axiosConfig'
import { Team, teamOrder } from '../../../types/team-interface'

export function AdminPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string>('')
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

  // const selectedPlayers =
  //   teams.find((team) => team.name === selectedTeam)?.members || []

  // const columns = teams.map((team) =>
  //   team.members.map((member) => ({
  //     player: member.global_name,
  //     discord: member.username,
  //   }))
  // )

  // const maxRows = Math.max(...columns.map((team) => team.length), 0)

  if (error) {
    return (
      <Modal onClose={() => setError(null)}>
        <ErrorComponent error={error} onClose={() => setError(null)} />
      </Modal>
    )
  }

  if (isLoading) {
    return (
      <div
        className='bg-zinc-700 text-gray-100 absolute inset-0 flex items-center justify-center 
        rounded-xl shadow-2xl m-8'
      >
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className='bg-zinc-700 text-gray-100 absolute inset-0 flex gap-10 items-center justify-center rounded-xl shadow-2xl m-8 overflow-y-auto scrollbar-thin'>
      <table className='border-collapse h-[90%]'>
        <thead className='table-header-group'>
          <tr className='text-md bg-zinc-400 text-gray-700'>
            {/* Cabeçalhos com selects */}
            <th className='p-2 border w-[150px]'>
              <select
                className='bg-zinc-100 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition w-full'
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
              >
                <option value=''>Select Team</option>
                {teams.map((team) => (
                  <option key={team.name} value={team.name}>
                    {team.name}
                  </option>
                ))}
              </select>
            </th>
            <th className='p-2 border w-[150px]'>
              <select className='bg-zinc-100 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition w-full'>
                <option value=''>Select Day</option>
                <option value='monday'>Monday</option>
                <option value='tuesday'>Tuesday</option>
                <option value='wednesday'>Wednesday</option>
                <option value='thursday'>Thursday</option>
                <option value='friday'>Friday</option>
                <option value='saturday'>Saturday</option>
                <option value='sunday'>Sunday</option>
              </select>
            </th>
            <th className='p-2 border w-[150px]'>
              <select className='bg-zinc-100 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition w-full'>
                <option value=''>Select Day</option>
                <option value='monday'>Monday</option>
                <option value='tuesday'>Tuesday</option>
                <option value='wednesday'>Wednesday</option>
                <option value='thursday'>Thursday</option>
                <option value='friday'>Friday</option>
                <option value='saturday'>Saturday</option>
                <option value='sunday'>Sunday</option>
              </select>
            </th>
          </tr>
        </thead>
        <tbody className='table-row-group text-sm font-medium text-zinc-900 bg-zinc-200'>
          {/* Dados fixos apenas para visualização */}
          {Array.from({ length: 15 }).map((_, index) => (
            <tr key={index} className='border border-gray-300'>
              <td className='p-2 text-center'>Player {index + 1} </td>
              <td className='p-2 text-center'>Gold ganho {index + 1}</td>
              <td className='p-2 text-center'>Valor coletado {index + 1}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <table className=' border-collapse h-[90%]'>
        <thead className='table-header-group '>
          <tr className='text-md bg-zinc-400 text-gray-700'>
            {/* Cabeçalhos com selects */}
            <th className='p-2 border w-[150px]'>BALANCE TOTAL</th>
            <th className='p-2 border w-[150px]'>CALCULADORA</th>
          </tr>
        </thead>
        <tbody className='table-row-group text-sm font-medium text-zinc-900 bg-zinc-200'>
          {/* Dados fixos apenas para visualização */}
          {Array.from({ length: 15 }).map((_, index) => (
            <tr key={index} className='border border-gray-300'>
              <td className='p-2 text-center'> </td>
              <td className='p-2 text-center'>
                <input type='text' />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <table className=' border-collapse h-[90%]'>
        <thead className='table-header-group '>
          <tr className='text-md bg-zinc-400 text-gray-700'>
            {/* Cabeçalhos com selects */}
            <th className='p-2 border w-[150px]'>GBANKS</th>
            <th className='p-2 border w-[150px]'>SALDO</th>
            <th className='p-2 border w-[150px]'>CALCULADORA</th>
          </tr>
        </thead>
        <tbody className='table-row-group text-sm font-medium text-zinc-900 bg-zinc-200'>
          {/* Dados fixos apenas para visualização */}
          {Array.from({ length: 15 }).map((_, index) => (
            <tr key={index} className='border border-gray-300'>
              <td className='p-2 text-center'> </td>
              <td className='p-2 text-center'> </td>
              <td className='p-2 text-center'>
                <input type='text' />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
