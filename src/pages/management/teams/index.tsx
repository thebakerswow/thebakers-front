import { useEffect, useState } from 'react'
import { api } from '../../../services/axiosConfig'
import { Team, teamOrder } from '../../../types/team-interface'
import { LoadingSpinner } from '../../../components/loading-spinner'
import axios from 'axios'
import { ErrorComponent, ErrorDetails } from '../../../components/error-display'
import { Modal as MuiModal, Box } from '@mui/material'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
} from '@mui/material'

const localTeamColors: Record<string, string> = {
  Padeirinho: '#D97706',
  Garçom: '#2563EB',
  Confeiteiros: '#F472B6',
  Jackfruit: '#16A34A',
  Milharal: '#FEF08A',
  Raio: '#FACC15',
  APAE: '#F87171',
  Advertiser: '#D1D5DB',
}

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
        setError(
          axios.isAxiosError(error)
            ? {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
              }
            : { message: 'Erro inesperado', response: error }
        )
      } finally {
        setIsLoading(false)
      }
    }
    fetchTeams()
  }, [])

  const renderTableHeader = () => (
    <TableHead>
      <TableRow>
        {teams
          .filter((team) => team.members.length > 0) // Skip teams with no members
          .map((team, index) => (
            <TableCell
              align='center'
              colSpan={2}
              key={`team-${index}`}
              style={{
                backgroundColor: localTeamColors[team.name] || '#9CA3AF',
                color: '#FFFFFF',
                fontWeight: 'bold',
                fontSize: '1rem',
                border: '1px solid #E5E7EB',
              }}
            >
              {team.name}
            </TableCell>
          ))}
      </TableRow>
      <TableRow style={{ backgroundColor: '#ECEBEE', color: '#FFFFFF' }}>
        {teams
          .filter((team) => team.members.length > 0) // Skip teams with no members
          .flatMap((_, index) => [
            <TableCell
              align='center'
              key={`player-header-${index}`}
              style={{
                fontWeight: 'bold',
                border: '1px solid #E5E7EB',
              }}
            >
              Player
            </TableCell>,
            <TableCell
              align='center'
              key={`discord-header-${index}`}
              style={{
                fontWeight: 'bold',
                border: '1px solid #E5E7EB',
              }}
            >
              Discord
            </TableCell>,
          ])}
      </TableRow>
    </TableHead>
  )

  const renderTableBody = () => {
    const columns = teams
      .filter((team) => team.members.length > 0) // Skip teams with no members
      .map((team) =>
        team.members.map((member) => ({
          player: member.global_name,
          discord: member.username,
        }))
      )
    const maxRows = Math.max(...columns.map((team) => team.length), 0)

    return (
      <TableBody>
        {Array.from({ length: maxRows }, (_, rowIndex) => (
          <TableRow
            key={`row-${rowIndex}`}
            style={{
              backgroundColor: rowIndex % 2 === 0 ? '#FFFFFF' : '#E5E7EB',
            }}
          >
            {columns.flatMap((teamMembers, teamIndex) => {
              const member = teamMembers[rowIndex]
              return [
                <TableCell
                  align='center'
                  key={`player-${teamIndex}-${rowIndex}`}
                >
                  {member?.player || '-'}
                </TableCell>,
                <TableCell
                  align='center'
                  key={`discord-${teamIndex}-${rowIndex}`}
                >
                  {member?.discord || '-'}
                </TableCell>,
              ]
            })}
          </TableRow>
        ))}
      </TableBody>
    )
  }

  if (error) {
    return (
      <MuiModal open={!!error} onClose={() => setError(null)}>
        <Box className='absolute left-1/2 top-1/2 w-96 -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-gray-400 p-4 shadow-lg'>
          <ErrorComponent error={error} onClose={() => setError(null)} />
        </Box>
      </MuiModal>
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
    <div className='absolute inset-0 m-8 flex flex-col rounded-md bg-zinc-700 text-gray-100 shadow-2xl'>
      <TableContainer component={Paper}>
        <Table>
          {renderTableHeader()}
          {renderTableBody()}
        </Table>
      </TableContainer>
    </div>
  )
}
