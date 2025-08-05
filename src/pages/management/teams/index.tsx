import { useEffect, useState } from 'react'
import { getTeams } from '../../../services/api/teams'
import { Team, teamOrder } from '../../../types/team-interface'
import axios from 'axios'
import { ErrorDetails, ErrorComponent } from '../../../components/error-display'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  CircularProgress,
} from '@mui/material'

const localTeamColors: Record<string, string> = {
  'Chefe de cozinha': '#DC2626',
  'M+': '#7C3AED',
  Leveling: '#059669',
  Garçom: '#2563EB',
  Confeiteiros: '#EC4899',
  Jackfruit: '#16A34A',
  Insanos: '#1E40AF',
  APAE: '#F87171',
  'Los Renegados': '#F59E0B',
  DTM: '#8B5CF6',
  KFFC: '#047857',
  Greensky: '#BE185D',
  'Guild Azralon BR#1': '#0D9488',
  'Guild Azralon BR#2': '#1D4ED8',
  Rocket: '#B91C1C',
  'Booty Reaper': '#4C1D95',
  Padeirinho: '#EA580C',
  Milharal: '#FEF08A',
  Advertiser: '#9CA3AF',
}

interface TeamsManagementProps {
  onError?: (error: ErrorDetails) => void
}

export function TeamsManagement({ onError }: TeamsManagementProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setIsLoading(true)
        const response = await getTeams()
        const uniqueTeamOrder = Array.from(new Set(teamOrder)) // Remove duplicates
        const orderedTeams = uniqueTeamOrder.map((teamName) => ({
          name: teamName,
          members: (response[teamName] || []).map((member: any) => ({
            global_name: member.global_name,
            username: member.username,
          })),
        }))
        setTeams(orderedTeams)
      } catch (error) {
        const errorDetails = axios.isAxiosError(error)
          ? {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status,
            }
          : { message: 'Unexpected error', response: error }

        if (onError) {
          onError(errorDetails)
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchTeams()
  }, [onError])

  const renderTableHeader = () => (
    <TableHead>
      <TableRow>
        <TableCell
          align='center'
          style={{
            fontWeight: 'bold',
            border: '1px solid #E5E7EB',
            backgroundColor: '#ECEBEE',
          }}
        >
          #
        </TableCell>
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
        <TableCell
          align='center'
          style={{
            fontWeight: 'bold',
            border: '1px solid #E5E7EB',
          }}
        >
          #
        </TableCell>
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
            <TableCell
              align='center'
              style={{
                fontWeight: 'bold',
                border: '1px solid #E5E7EB',
              }}
            >
              {rowIndex + 1}
            </TableCell>
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

  if (isLoading) {
    return (
      <div className='absolute inset-0 m-8 flex items-center justify-center rounded-xl bg-zinc-700 text-gray-100 shadow-2xl'>
        <CircularProgress />
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

// Wrapper component for centralized error handling
export default function TeamsManagementPage() {
  const [error, setError] = useState<ErrorDetails | null>(null)

  const handleError = (errorDetails: ErrorDetails) => {
    setError(errorDetails)
  }

  return (
    <>
      <TeamsManagement onError={handleError} />
      {error && <ErrorComponent error={error} onClose={() => setError(null)} />}
    </>
  )
}
