import {
  Eye,
  Trash,
  Clipboard,
  Pencil,
  Lock,
  LockOpen,
} from '@phosphor-icons/react'
import { TableSortLabel, Tooltip } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useCallback, useMemo, useState, useEffect } from 'react'
import { RunData } from '../../types/runs-interface'
import { ErrorDetails } from '../../components/error-display'
import { DeleteRun } from '../../components/delete-run'
import { BuyersPreview } from '../../components/buyers-preview'
import { EditRun } from '../../components/edit-run'
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
import { toggleRunLock as toggleRunLockService } from '../../services/api/runs'
import Swal from 'sweetalert2'

interface RunsDataProps {
  data: RunData[]
  isLoading: boolean
  onDeleteSuccess: () => void
  onEditSuccess?: () => void
  onError: (error: ErrorDetails | null) => void
}

export function RunsDataGrid({
  data,
  isLoading,
  onDeleteSuccess,
}: RunsDataProps) {
  const navigate = useNavigate()

  const [isTimeSortedAsc, setIsTimeSortedAsc] = useState(true)
  const [isDeleteRunModalOpen, setIsDeleteRunModalOpen] = useState(false)
  const [selectedRunToDelete, setSelectedRunToDelete] = useState<{
    id: string
    raid: string
    date: string
  } | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)
  const [isEditRunModalOpen, setIsEditRunModalOpen] = useState(false)
  const [selectedRunToEdit, setSelectedRunToEdit] = useState<RunData | null>(
    null
  )
  const { userRoles } = useAuth()
  const [runs, setRuns] = useState<RunData[]>(data)

  useEffect(() => {
    setRuns(data)
  }, [data])

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
    Insanos: 4,
    APAE: 5,
    'Los Renegados': 6,
    DTM: 7,
    KFFC: 8,
    Greensky: 9,
    'Guild Azralon BR#1': 10,
    'Guild Azralon BR#2': 11,
    Rocket: 12,
    'Booty Reaper': 13,
    Padeirinho: 14,
    Milharal: 15,
  }

  const teamColors: { [key: string]: string } = {
    Garçom: 'linear-gradient(90deg, #3B82F6, #2563EB)', // Azul claro para azul (esquerda para direita)
    Confeiteiros: 'linear-gradient(90deg, #F472B6, #EC4899)', // Rosa claro para rosa
    Jackfruit: 'linear-gradient(90deg, #22C55E, #16A34A)', // Verde claro para verde
    Insanos: 'linear-gradient(270deg, #3B82F6, #1E40AF)', // Azul claro para azul escuro (direita para esquerda)
    APAE: 'linear-gradient(90deg, #FCA5A5, #F87171)', // Rosa muito claro para rosa claro
    'Los Renegados': 'linear-gradient(90deg, #FCD34D, #F59E0B)', // Amarelo claro para amarelo
    DTM: 'linear-gradient(90deg, #A78BFA, #8B5CF6)', // Violeta claro para violeta
    KFFC: 'linear-gradient(90deg, #34D399, #047857)', // Verde claro para verde escuro
    Greensky: 'linear-gradient(90deg, #F472B6, #BE185D)', // Rosa claro para rosa escuro
    'Guild Azralon BR#1': 'linear-gradient(270deg, #2DD4BF, #0D9488)', // Verde azulado claro para verde azulado (direita para esquerda)
    'Guild Azralon BR#2': 'linear-gradient(270deg, #60A5FA, #1D4ED8)', // Azul claro para azul médio (direita para esquerda)
    Rocket: 'linear-gradient(90deg, #F87171, #B91C1C)', // Rosa claro para vermelho
    'Booty Reaper': 'linear-gradient(90deg, #8B5CF6, #4C1D95)', // Violeta para violeta escuro
    Padeirinho: 'linear-gradient(90deg, #FB923C, #EA580C)', // Laranja claro para laranja
    Milharal: 'linear-gradient(90deg, #FEF3C7, #FEF08A)', // Amarelo muito claro para amarelo claro
    'Bastard Munchen': 'linear-gradient(90deg, #F59E0B, #D97706)', // Âmbar claro para âmbar
    'Kiwi': 'linear-gradient(90deg, #A3E635, #84CC16)', // Verde lima claro para verde lima
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

  // Abre o modal de edição de uma run
  const handleOpenEditRunModal = (run: RunData) => {
    setSelectedRunToEdit(run)
    setIsEditRunModalOpen(true)
  }

  // Fecha o modal de edição de uma run
  const handleCloseEditRunModal = () => {
    setIsEditRunModalOpen(false)
    setSelectedRunToEdit(null)
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
    // Filtra as runs do time MPlus
    const filteredRuns = runs.filter(
      (run) =>
        run.idTeam !== import.meta.env.VITE_TEAM_MPLUS &&
        run.idTeam !== import.meta.env.VITE_TEAM_LEVELING
    )

    const sorted = [...filteredRuns].sort((a, b) => {
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
  }, [runs, isTimeSortedAsc])

  // Alterna a ordem de classificação por horário
  const handleSortByTime = useCallback(() => {
    setIsTimeSortedAsc((prev) => !prev)
  }, [])

  // Formata o horário para o formato de 12 horas EST
  const formatTo12HourEST = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number)

    const period = hours >= 12 ? 'PM' : 'AM'
    const formattedHours = hours % 12 || 12

    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  // Function to copy an individual run's data to the clipboard
  const copyRunToClipboard = (run: RunData) => {
    const formattedRun = {
      name: run.name,
      date: run.date,
      time: run.time,
      raid: run.raid,
      runType: run.runType,
      difficulty: run.difficulty,
      idTeam: run.idTeam,
      maxBuyers: run.maxBuyers.toString(),
      raidLeader:
        run.raidLeaders?.map(
          (leader) => `${leader.idDiscord};${leader.username}`
        ) || [],
      loot: run.loot,
      note: run.note || '',
      quantityBoss: run.quantityBoss,
    }

    navigator.clipboard
      .writeText(JSON.stringify(formattedRun, null, 2))
      .catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Failed to copy run.',
          text: 'Please try again.',
        })
      })
  }

  // Function to toggle the lock status of a run
  const toggleRunLock = async (runId: string, isLocked: boolean) => {
    try {
      await toggleRunLockService(runId, isLocked)
      setRuns((prevRuns) =>
        prevRuns.map((run) =>
          run.id === runId ? { ...run, runIsLocked: !isLocked } : run
        )
      )
      Swal.fire({
        icon: 'success',
        title: `Run ${!isLocked ? 'locked' : 'unlocked'} successfully.`,
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error('Failed to toggle run lock:', error)
      Swal.fire({
        icon: 'error',
        title: 'Failed to toggle run lock.',
        text: 'Please try again later.',
      })
    }
  }

  // Renderiza uma célula da tabela com conteúdo padrão
  const renderTableCell = (content: string | number | JSX.Element | null) => (
    <TableCell
      align='center'
      style={{ fontSize: '1rem' }} // Aumenta o tamanho da fonte das células
    >
      {content || '-'}
    </TableCell>
  )

  // Renderiza os líderes do raid como uma string separada por vírgulas
  const renderRaidLeaders = (
    raidLeaders: { username: string }[] | undefined,
    team: string
  ) => {
    if (
      (team === 'DTM' ||
        team === 'KFFC' ||
        team === 'Insanos' ||
        team === 'Greensky' ||
        team === 'Booty Reaper' ||
        team === 'Guild Azralon BR#1' ||
        team === 'Guild Azralon BR#2' ||
        team === 'Rocket' 
       ) &&
      !hasRequiredRole([import.meta.env.VITE_TEAM_CHEFE])
    ) {
      return '-'
    }

    return raidLeaders && raidLeaders.length > 0
      ? raidLeaders.map((leader) => leader.username).join(', ')
      : '-'
  }

  // Renderiza o horário em formato 12 horas EST
  const renderTime = (time: string | undefined, date: string | undefined) =>
    time && date ? (
      <>
        {formatTo12HourEST(time)}
      </>
    ) : (
      '-'
    )

  return (
    <TableContainer component={Paper} className='rounded-sm'>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE',
                textAlign: 'center',
              }}
            >
              Preview
            </TableCell>
            <TableCell
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE',
                textAlign: 'center',
              }}
            >
              Date
            </TableCell>
            <TableCell
              sortDirection={isTimeSortedAsc ? 'asc' : 'desc'}
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE',
                textAlign: 'center',
              }}
            >
              <TableSortLabel
                active
                direction={isTimeSortedAsc ? 'asc' : 'desc'}
                onClick={handleSortByTime}
                style={{ cursor: 'pointer' }}
              >
                Time (EST)
              </TableSortLabel>
            </TableCell>
            <TableCell
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE',
                textAlign: 'center',
              }}
            >
              Raid
            </TableCell>
            <TableCell
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE',
                textAlign: 'center',
              }}
            >
              Buyers
            </TableCell>
            <TableCell
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE',
                textAlign: 'center',
              }}
            >
              Team
            </TableCell>
            <TableCell
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE',
                textAlign: 'center',
              }}
            >
              Raid Leader
            </TableCell>
            <TableCell
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE',
                textAlign: 'center',
              }}
            >
              Run Type
            </TableCell>
            <TableCell
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE',
                textAlign: 'center',
              }}
            >
              Difficulty
            </TableCell>
            <TableCell
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE',
                textAlign: 'center',
              }}
            >
              Loot
            </TableCell>
            <TableCell
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE',
                textAlign: 'center',
              }}
            >
              Note
            </TableCell>
            <TableCell
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE',
                textAlign: 'center',
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
                  ...getTeamColor(run.team),
                }}
              >
                {renderTableCell(
                  run.date ? (
                    <IconButton onClick={() => handleOpenPreview(run.id)}>
                      <Eye size={20} />
                    </IconButton>
                  ) : null
                )}
                {renderTableCell(
                  run.date ? format(parseISO(run.date), 'EEEE LL/dd') : null
                )}
                {renderTableCell(renderTime(run.time, run.date))}
                {renderTableCell(run.raid)}
                {renderTableCell(run.buyersCount)}
                {renderTableCell(run.team)}
                {renderTableCell(renderRaidLeaders(run.raidLeaders, run.team))}
                {renderTableCell(run.runType)}
                {renderTableCell(run.difficulty)}
                {renderTableCell(run.loot)}
                {renderTableCell(run.note)}
                {renderTableCell(
                  <>
                    {hasRequiredRole([import.meta.env.VITE_TEAM_CHEFE]) && (
                      <>
                        <Tooltip title='Edit'>
                          <IconButton onClick={() => handleOpenEditRunModal(run)}>
                            <Pencil size={20} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Copy'>
                          <IconButton onClick={() => copyRunToClipboard(run)}>
                            <Clipboard size={20} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Delete'>
                          <IconButton
                            onClick={() => handleOpenDeleteRunModal(run)}
                          >
                            <Trash size={20} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={run.runIsLocked ? 'Unlock' : 'Lock'}>
                          <IconButton
                            onClick={() => toggleRunLock(run.id, run.runIsLocked)}
                          >
                            {run.runIsLocked ? (
                              <LockOpen size={20} />
                            ) : (
                              <Lock size={20} />
                            )}
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    <div className='mt-1 text-center text-normal'>
                      {run.runIsLocked ? '(locked)' : '(unlocked)'}
                    </div>
                  </>
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

      {isEditRunModalOpen && selectedRunToEdit && (
        <EditRun
          run={selectedRunToEdit}
          onClose={handleCloseEditRunModal}
          onRunEdit={onDeleteSuccess}
        />
      )}
    </TableContainer>
  )
}
