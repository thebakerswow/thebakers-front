import { Eye, Trash, Lock, LockOpen, Pencil } from '@phosphor-icons/react'
import { Tooltip } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
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
import { api } from '../../services/axiosConfig'
import Swal from 'sweetalert2'
import axios from 'axios'

interface RunsDataProps {
  data: RunData[]
  isLoading: boolean
  onDeleteSuccess: () => void
  onEditSuccess?: () => void
  onError?: (error: ErrorDetails) => void
}

export function LevelingDataGrid({
  data,
  isLoading,
  onDeleteSuccess,
  onError,
}: RunsDataProps) {
  const navigate = useNavigate()

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

  const teamColors: { [key: string]: string } = {
    'Chefe de cozinha': '#DC2626', // Vermelho escuro
    'M+': '#7C3AED', // Roxo
    Leveling: '#059669', // Verde esmeralda
    Garçom: '#2563EB', // Azul
    Confeiteiros: '#EC4899', // Rosa
    Jackfruit: '#16A34A', // Verde
    Insanos: '#1E40AF', // Azul escuro
    APAE: '#F87171', // Rosa claro
    'Los Renegados': '#F59E0B', // Amarelo
    DTM: '#8B5CF6', // Violeta
    KFFC: '#047857', // Verde escuro
    Greensky: '#BE185D', // Rosa escuro
    'Guild Azralon BR#1': '#0D9488', // Verde azulado
    'Guild Azralon BR#2': '#1D4ED8', // Azul médio
    Rocket: '#B91C1C', // Vermelho
    'Booty Reaper': '#4C1D95', // Violeta
    Padeirinho: '#EA580C', // Laranja
    Milharal: '#FEF08A', // Amarelo claro
    Advertiser: '#9CA3AF', // Cinza
    Freelancer: '#86EFAC', // Verde claro
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
    navigate(`/bookings-na/leveling/${id}`)
  }

  // Function to toggle the lock status of a run
  const toggleRunLock = async (runId: string, isLocked: boolean) => {
    try {
      const response = await api.put(`/run/${runId}/lock`, {
        isLocked: !isLocked,
      })
      if (response.status === 200) {
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
      }
    } catch (error) {
      console.error('Failed to toggle run lock:', error)
      if (axios.isAxiosError(error)) {
        onError?.({
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        })
      } else {
        onError?.({ message: 'Unexpected error', response: error })
      }
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
        team === 'Rocket') &&
      !hasRequiredRole([import.meta.env.VITE_TEAM_CHEFE])
    ) {
      return '-'
    }

    return raidLeaders && raidLeaders.length > 0
      ? raidLeaders.map((leader) => leader.username).join(', ')
      : '-'
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
                colSpan={6}
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
          ) : runs.length === 0 ? (
            <TableRow style={{ height: '400px', border: 'none' }}>
              <TableCell
                colSpan={6}
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
            runs.map((run: RunData, index: number) => (
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
                {renderTableCell(run.team)}
                {renderTableCell(renderRaidLeaders(run.raidLeaders, run.team))}
                {renderTableCell(run.note)}
                {renderTableCell(
                  hasRequiredRole([
                    import.meta.env.VITE_TEAM_CHEFE,
                    import.meta.env.VITE_TEAM_LEVELING,
                  ]) ? (
                    <>
                      <Tooltip title='Edit'>
                        <IconButton onClick={() => handleOpenEditRunModal(run)}>
                          <Pencil size={20} />
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
                      <div className='mt-1 text-center text-xs text-gray-700'>
                        {run.runIsLocked ? '(locked)' : '(unlocked)'}
                      </div>
                    </>
                  ) : null
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
