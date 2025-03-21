import { Eye, Trash } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { useCallback, useMemo, useState } from 'react'
import { Modal } from '../../components/modal'
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
  const [isNoteOpen, setIsNoteOpen] = useState(false)
  const [selectedRun, setSelectedRun] = useState<{
    note: string
    id?: string // Adicionando a propriedade 'id' aqui
  } | null>(null)
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
    Padeirinho: 7,
  }

  const handleOpenPreview = (runId: string) => {
    setSelectedRunId(runId)
    setIsPreviewOpen(true)
  }

  const handleClosePreview = () => {
    setIsPreviewOpen(false)
    setSelectedRunId(null)
  }

  const handleOpenDeleteRunModal = (run: {
    id: string
    raid: string
    date: string
  }) => {
    setSelectedRunToDelete(run)
    setIsDeleteRunModalOpen(true)
  }

  const handleCloseDeleteRunModal = () => {
    setIsDeleteRunModalOpen(false)
    setSelectedRunToDelete(null)
  }

  function handleCloseNote() {
    setIsNoteOpen(false)
    setSelectedRun(null)
  }

  const handleRedirect = (id: string) => {
    navigate(`/bookings-na/run/${id}`) // Altere '/sua-url' para o caminho desejado
  }

  const convertTimeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  const sortedData = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      if (!a.time || !b.time) return 0

      const timeA = convertTimeToMinutes(a.time)
      const timeB = convertTimeToMinutes(b.time)

      if (timeA !== timeB) {
        return isTimeSortedAsc ? timeA - timeB : timeB - timeA
      }

      // Ordenação por prioridade do time se os horários forem iguais
      const priorityA = teamPriority[a.team] || 999
      const priorityB = teamPriority[b.team] || 999

      return priorityA - priorityB
    })

    return sorted
  }, [data, isTimeSortedAsc])

  const handleSortByTime = useCallback(() => {
    setIsTimeSortedAsc((prev) => !prev)
  }, [])

  function convertFromEST(timeStr: string) {
    const [hours, minutes] = timeStr.split(':').map(Number)
    let adjustedHours = hours + 1 // Ajuste para BRT

    // Ajustar caso a conversão ultrapasse 24h
    if (adjustedHours === 24) {
      adjustedHours = 0 // Meia-noite
    }

    // Formatar para 12 horas
    const period = adjustedHours >= 12 ? 'PM' : 'AM'
    const formattedHours = adjustedHours % 12 || 12 // Converte 0 para 12 no formato 12h

    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  function formatTo12HourEST(timeStr: string) {
    const [hours, minutes] = timeStr.split(':').map(Number)

    const period = hours >= 12 ? 'PM' : 'AM'
    const formattedHours = hours % 12 || 12 // Converte 0 para 12 no formato 12h

    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  if (error) {
    return (
      <Modal onClose={() => setError(null)}>
        <ErrorComponent error={error} onClose={() => setError(null)} />
      </Modal>
    )
  }

  return (
    <TableContainer
      component={Paper}
      className='relative h-[500px] overflow-x-auto rounded-sm'
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Preview</TableCell>
            <TableCell>Date</TableCell>
            <TableCell onClick={handleSortByTime} style={{ cursor: 'pointer' }}>
              Time {isTimeSortedAsc ? '▲' : '▼'}
            </TableCell>
            <TableCell>Raid</TableCell>
            <TableCell>Run Type</TableCell>
            <TableCell>Difficulty</TableCell>
            <TableCell>Team</TableCell>
            <TableCell>Loot</TableCell>
            <TableCell>Buyers</TableCell>
            <TableCell>Raid Leader</TableCell>
            <TableCell>Note</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={12}
                align='center'
                style={{
                  height: '300px', // Ajusta a altura para centralizar verticalmente
                  textAlign: 'center',
                  border: 'none', // Remove as marcações das linhas
                }}
              >
                <CircularProgress />
              </TableCell>
            </TableRow>
          ) : sortedData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={12}
                align='center'
                style={{
                  height: '300px', // Ajusta a altura para centralizar verticalmente
                  textAlign: 'center',
                  border: 'none', // Remove as marcações das linhas
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
                  backgroundColor:
                    run.team === 'Padeirinho'
                      ? '#F59E0B'
                      : run.team === 'Garçom'
                        ? '#93C5FD'
                        : run.team === 'Confeiteiros'
                          ? '#C4B5FD'
                          : run.team === 'Jackfruit'
                            ? '#86EFAC'
                            : run.team === 'Milharal'
                              ? '#FDE68A'
                              : run.team === 'Raio'
                                ? '#FEF3C7'
                                : run.team === 'APAE'
                                  ? '#FCA5A5'
                                  : undefined,
                }}
              >
                <TableCell align='center'>
                  {run.date ? (
                    <IconButton onClick={() => handleOpenPreview(run.id)}>
                      <Eye size={20} />
                    </IconButton>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {run.date ? format(parseISO(run.date), 'EEEE LL/dd') : '-'}
                </TableCell>
                <TableCell>
                  {run.time && run.date ? (
                    <>
                      {formatTo12HourEST(run.time)} EST
                      <br />
                      {convertFromEST(run.time)} BRT
                    </>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>{run.raid || '-'}</TableCell>
                <TableCell>{run.runType || '-'}</TableCell>
                <TableCell>{run.difficulty || '-'}</TableCell>
                <TableCell>{run.team || '-'}</TableCell>
                <TableCell>{run.loot || '-'}</TableCell>
                <TableCell>{run.buyersCount || '-'}</TableCell>
                <TableCell>
                  {run.raidLeaders && run.raidLeaders.length > 0
                    ? run.raidLeaders
                        .map((raidLeader) => raidLeader.username)
                        .join(', ')
                    : '-'}
                </TableCell>
                <TableCell align='center'>
                  {run.note !== '' ? run.note : '-'}
                </TableCell>
                <TableCell align='center'>
                  {hasRequiredRole(['1101231955120496650']) && (
                    <IconButton onClick={() => handleOpenDeleteRunModal(run)}>
                      <Trash size={20} />
                    </IconButton>
                  )}
                </TableCell>
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

      {isNoteOpen && selectedRun && (
        <Modal onClose={handleCloseNote}>
          <div className='p-4'>
            <h2 className='text-xl font-bold'>Note</h2>
            <p className='font-normal'>{selectedRun.note || 'Sem nota'}</p>
          </div>
        </Modal>
      )}

      {isPreviewOpen && selectedRunId && (
        <BuyersPreview runId={selectedRunId} onClose={handleClosePreview} />
      )}
    </TableContainer>
  )
}
