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
import { RunScreenFlag } from '../../constants/run-flags'

interface SharedRunsDataGridProps {
  data: RunData[]
  isLoading: boolean
  onDeleteSuccess: () => void
  onError?: (error: ErrorDetails) => void
  runScreen: RunScreenFlag
  detailsRoutePrefix: string
  manageTeamRole: string
}

export function SharedRunsDataGrid({
  data,
  isLoading,
  onDeleteSuccess,
  onError,
  runScreen,
  detailsRoutePrefix,
  manageTeamRole,
}: SharedRunsDataGridProps) {
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
  const [selectedRunToEdit, setSelectedRunToEdit] = useState<RunData | null>(null)
  const { userRoles } = useAuth()
  const [runs, setRuns] = useState<RunData[]>(data)

  useEffect(() => {
    setRuns(data)
  }, [data])

  const hasRequiredRole = (requiredRoles: string[]): boolean => {
    return requiredRoles.some((required) =>
      userRoles.some((userRole) => userRole.toString() === required.toString())
    )
  }

  const teamColors: { [key: string]: string } = {
    'Chefe de cozinha': '#DC2626',
    'M+': '#7C3AED',
    Leveling: '#059669',
    PVP: '#DC2626',
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
    Freelancer: '#86EFAC',
    'Bastard Munchen': '#D97706',
    Kiwi: '#84CC16',
  }

  const getTeamColor = (team: string) => ({
    background: teamColors[team] || 'transparent',
  })

  const handleRedirect = (id: string) => {
    navigate(`${detailsRoutePrefix}/${id}`)
  }

  const toggleRunLock = async (runId: string, isLocked: boolean) => {
    try {
      const response = await api.put(`/run/${runId}/lock`, { isLocked: !isLocked })
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

  const renderTableCell = (content: string | number | JSX.Element | null) => (
    <TableCell align='center' style={{ fontSize: '1rem' }}>
      {content || '-'}
    </TableCell>
  )

  return (
    <TableContainer component={Paper} className='relative mb-8 rounded-sm'>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell style={{ fontWeight: 'bold', backgroundColor: '#ECEBEE', textAlign: 'center' }}>
              Preview
            </TableCell>
            <TableCell style={{ fontWeight: 'bold', backgroundColor: '#ECEBEE', textAlign: 'center' }}>
              Date
            </TableCell>
            <TableCell style={{ fontWeight: 'bold', backgroundColor: '#ECEBEE', textAlign: 'center' }}>
              Team
            </TableCell>
            <TableCell style={{ fontWeight: 'bold', backgroundColor: '#ECEBEE', textAlign: 'center' }}>
              Note
            </TableCell>
            <TableCell style={{ fontWeight: 'bold', backgroundColor: '#ECEBEE', textAlign: 'center' }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableRow style={{ height: '400px', border: 'none' }}>
              <TableCell colSpan={5} align='center' style={{ border: 'none' }}>
                <CircularProgress />
              </TableCell>
            </TableRow>
          ) : runs.length === 0 ? (
            <TableRow style={{ height: '400px', border: 'none' }}>
              <TableCell colSpan={5} align='center' style={{ border: 'none' }}>
                No runs today
              </TableCell>
            </TableRow>
          ) : (
            runs.map((run, index) => (
              <TableRow
                key={index}
                onDoubleClick={() => handleRedirect(run.id)}
                style={{ cursor: 'pointer', ...getTeamColor(run.team) }}
              >
                {renderTableCell(
                  <IconButton onClick={() => { setSelectedRunId(run.id); setIsPreviewOpen(true) }}>
                    <Eye size={20} />
                  </IconButton>
                )}
                {renderTableCell(run.date ? format(parseISO(run.date), 'EEEE LL/dd') : null)}
                {renderTableCell(run.team)}
                {renderTableCell(run.note)}
                {renderTableCell(
                  hasRequiredRole([import.meta.env.VITE_TEAM_CHEFE, manageTeamRole]) ? (
                    <>
                      <Tooltip title='Edit'>
                        <IconButton onClick={() => { setSelectedRunToEdit(run); setIsEditRunModalOpen(true) }}>
                          <Pencil size={20} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Delete'>
                        <IconButton onClick={() => { setSelectedRunToDelete(run); setIsDeleteRunModalOpen(true) }}>
                          <Trash size={20} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={run.runIsLocked ? 'Unlock' : 'Lock'}>
                        <IconButton onClick={() => toggleRunLock(run.id, run.runIsLocked)}>
                          {run.runIsLocked ? <LockOpen size={20} /> : <Lock size={20} />}
                        </IconButton>
                      </Tooltip>
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
          onClose={() => { setIsDeleteRunModalOpen(false); setSelectedRunToDelete(null) }}
          onDeleteSuccess={onDeleteSuccess}
        />
      )}

      {isPreviewOpen && selectedRunId && (
        <BuyersPreview
          runId={selectedRunId}
          runScreen={runScreen}
          onClose={() => { setIsPreviewOpen(false); setSelectedRunId(null) }}
        />
      )}

      {isEditRunModalOpen && selectedRunToEdit && (
        <EditRun
          run={selectedRunToEdit}
          onClose={() => { setIsEditRunModalOpen(false); setSelectedRunToEdit(null) }}
          onRunEdit={onDeleteSuccess}
        />
      )}
    </TableContainer>
  )
}
