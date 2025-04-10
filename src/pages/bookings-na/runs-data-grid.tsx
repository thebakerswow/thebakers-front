import { Eye, Trash } from '@phosphor-icons/react'
import { TableSortLabel } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useCallback, useMemo, useState } from 'react'
import { Modal as MuiModal, Box } from '@mui/material'
import { RunData } from '../../types/runs-interface'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import { DeleteRun } from '../../components/delete-run'
import { BuyersPreview } from '../../components/buyers-preview'
import { format, parseISO } from 'date-fns'
import { useAuth } from '../../context/auth-context'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  IconButton,
} from '@mui/material'

interface RunsDataProps {
  data: RunData[]
  isLoading: boolean
  onDeleteSuccess: () => void
}

export function RunsDataGrid({
  data,
  isLoading,
  onDeleteSuccess,
}: RunsDataProps) {
  const navigate = useNavigate()

  const [isTimeSortedAsc, setIsTimeSortedAsc] = useState(true)
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [isDeleteRunModalOpen, setIsDeleteRunModalOpen] = useState(false)
  const [selectedRunToDelete, setSelectedRunToDelete] = useState<{
    id: string
    raid: string
    date: string
  } | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)
  const { userRoles } = useAuth()

  // Verifica se o usuário possui os papéis necessários
  const hasRequiredRole = (requiredRoles: string[]): boolean => {
    return requiredRoles.some((required) =>
      userRoles.some((userRole) => userRole.toString() === required.toString())
    )
  }

  const teamPriority: { [key: string]: number } = {
    Garçom: 1,
    Confeiteiros: 2,
    Jackfruit: 3,
    Raio: 4,
    APAE: 5,
    Milharal: 6,
    DTM: 7,
    Padeirinho: 8,
  }

  const teamColors: { [key: string]: string } = {
    Padeirinho: 'linear-gradient(90deg, #FDE68A, #ca8a04)',
    Garçom: 'linear-gradient(90deg, #60A5FA, #2563EB)',
    Confeiteiros: 'linear-gradient(90deg, #A78BFA, #f472b6)',
    Jackfruit: 'linear-gradient(90deg, #86EFAC, #16a34a)',
    Milharal: 'linear-gradient(90deg, #FCD34D, #fef08a)',
    Raio: 'linear-gradient(90deg, #fef08a, #facc15)',
    APAE: 'linear-gradient(90deg, #F87171, #ef4444)',
    DTM: 'linear-gradient(90deg, #A78BFA, #7C3AED)',
  }

  // Retorna o estilo de fundo associado a um time
  const getTeamColor = (team: string) => ({
    background: teamColors[team] || 'transparent',
  })

  // Abre o modal de visualização para uma run específica
  const handleOpenPreview = (runId: string) => {
    setSelectedRunId(runId)
    setIsPreviewOpen(true)
  }

  // Fecha o modal de visualização
  const handleClosePreview = () => {
    setIsPreviewOpen(false)
    setSelectedRunId(null)
  }

  // Abre o modal de exclusão de uma run
  const handleOpenDeleteRunModal = (run: {
    id: string
    raid: string
    date: string
  }) => {
    setSelectedRunToDelete(run)
    setIsDeleteRunModalOpen(true)
  }

  // Fecha o modal de exclusão de uma run
  const handleCloseDeleteRunModal = () => {
    setIsDeleteRunModalOpen(false)
    setSelectedRunToDelete(null)
  }

  // Redireciona para a página de detalhes da run
  const handleRedirect = (id: string) => {
    navigate(`/bookings-na/run/${id}`)
  }

  // Converte o horário no formato HH:mm para minutos totais
  const convertTimeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  // Ordena os dados por horário e prioridade do time
  const sortedData = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      if (!a.time || !b.time) return 0

      const timeA = convertTimeToMinutes(a.time)
      const timeB = convertTimeToMinutes(b.time)

      if (timeA !== timeB) {
        return isTimeSortedAsc ? timeA - timeB : timeB - timeA
      }

      const priorityA = teamPriority[a.team] || 999
      const priorityB = teamPriority[b.team] || 999

      return priorityA - priorityB
    })

    return sorted
  }, [data, isTimeSortedAsc])

  // Alterna a ordem de classificação por horário
  const handleSortByTime = useCallback(() => {
    setIsTimeSortedAsc((prev) => !prev)
  }, [])

  // Converte o horário de EST para BRT
  const convertFromEST = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    let adjustedHours = hours + 1

    if (adjustedHours === 24) {
      adjustedHours = 0
    }

    const period = adjustedHours >= 12 ? 'PM' : 'AM'
    const formattedHours = adjustedHours % 12 || 12

    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  // Formata o horário para o formato de 12 horas EST
  const formatTo12HourEST = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number)

    const period = hours >= 12 ? 'PM' : 'AM'
    const formattedHours = hours % 12 || 12

    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  // Renderiza uma célula da tabela com conteúdo padrão
  const renderTableCell = (
    content: string | number | JSX.Element | null,
    align: 'center' | 'left' = 'left'
  ) => (
    <TableCell
      align={align}
      style={{ fontSize: '1rem' }} // Aumenta o tamanho da fonte das células
    >
      {content || '-'}
    </TableCell>
  )

  // Renderiza os líderes do raid como uma string separada por vírgulas
  const renderRaidLeaders = (
    raidLeaders: { username: string }[] | undefined
  ) =>
    raidLeaders && raidLeaders.length > 0
      ? raidLeaders.map((leader) => leader.username).join(', ')
      : '-'

  // Renderiza o horário em ambos os formatos EST e BRT
  const renderTime = (time: string | undefined, date: string | undefined) =>
    time && date ? (
      <>
        {formatTo12HourEST(time)} EST
        <br />
        {convertFromEST(time)} BRT
      </>
    ) : (
      '-'
    )

  if (error) {
    return (
      <MuiModal open={!!error} onClose={() => setError(null)}>
        <Box className='absolute left-1/2 top-1/2 w-96 -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-gray-400 p-4 shadow-lg'>
          <ErrorComponent error={error} onClose={() => setError(null)} />
        </Box>
      </MuiModal>
    )
  }

  return (
    <TableContainer
      component={Paper}
      className='relative mb-8 rounded-sm'
      style={{
        fontSize: '1rem',
        overflow: 'hidden',
      }}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE',
              }}
            >
              Preview
            </TableCell>
            <TableCell
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE', // Added background color
              }}
            >
              Date
            </TableCell>
            <TableCell
              sortDirection={isTimeSortedAsc ? 'asc' : 'desc'}
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE', // Added background color
              }}
            >
              <TableSortLabel
                active
                direction={isTimeSortedAsc ? 'asc' : 'desc'}
                onClick={handleSortByTime}
                style={{ cursor: 'pointer' }}
              >
                Time
              </TableSortLabel>
            </TableCell>
            <TableCell
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE', // Added background color
              }}
            >
              Raid
            </TableCell>
            <TableCell
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE', // Added background color
              }}
            >
              Run Type
            </TableCell>
            <TableCell
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE', // Added background color
              }}
            >
              Difficulty
            </TableCell>
            <TableCell
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE', // Added background color
              }}
            >
              Team
            </TableCell>
            <TableCell
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE', // Added background color
              }}
            >
              Loot
            </TableCell>
            <TableCell
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE', // Added background color
              }}
            >
              Buyers
            </TableCell>
            <TableCell
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE', // Added background color
              }}
            >
              Raid Leader
            </TableCell>
            <TableCell
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE', // Added background color
              }}
            >
              Note
            </TableCell>
            <TableCell
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE', // Added background color
              }}
            />
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableRow style={{ height: '400px', border: 'none' }}>
              <TableCell
                colSpan={12}
                align='center'
                style={{
                  verticalAlign: 'middle',
                  display: 'table-cell',
                  height: '400px',
                  border: 'none',
                }}
              >
                <CircularProgress />
              </TableCell>
            </TableRow>
          ) : sortedData.length === 0 ? (
            <TableRow style={{ height: '400px', border: 'none' }}>
              <TableCell
                colSpan={12}
                align='center'
                style={{
                  verticalAlign: 'middle',
                  display: 'table-cell',
                  height: '400px',
                  border: 'none',
                }}
              >
                No runs today
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((run, index) => (
              <TableRow
                key={index}
                onDoubleClick={() => handleRedirect(run.id)}
                style={{
                  cursor: 'pointer',
                  ...getTeamColor(run.team), // Apply gradient background
                }}
              >
                {renderTableCell(
                  run.date ? (
                    <IconButton onClick={() => handleOpenPreview(run.id)}>
                      <Eye size={20} />
                    </IconButton>
                  ) : null,
                  'center'
                )}
                {renderTableCell(
                  run.date ? format(parseISO(run.date), 'EEEE LL/dd') : null
                )}
                {renderTableCell(renderTime(run.time, run.date))}
                {renderTableCell(run.raid)}
                {renderTableCell(run.runType)}
                {renderTableCell(run.difficulty)}
                {renderTableCell(run.team)}
                {renderTableCell(run.loot)}
                {renderTableCell(run.buyersCount)}
                {renderTableCell(renderRaidLeaders(run.raidLeaders))}
                {renderTableCell(run.note, 'center')}
                {renderTableCell(
                  hasRequiredRole(['1101231955120496650']) ? (
                    <IconButton onClick={() => handleOpenDeleteRunModal(run)}>
                      <Trash size={20} />
                    </IconButton>
                  ) : null,
                  'center'
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {isDeleteRunModalOpen && selectedRunToDelete && (
        <DeleteRun
          run={selectedRunToDelete}
          onClose={handleCloseDeleteRunModal}
          onDeleteSuccess={onDeleteSuccess}
        />
      )}

      {isPreviewOpen && selectedRunId && (
        <BuyersPreview runId={selectedRunId} onClose={handleClosePreview} />
      )}
    </TableContainer>
  )
}
