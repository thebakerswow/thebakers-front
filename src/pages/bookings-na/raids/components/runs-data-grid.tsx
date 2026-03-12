import {
  Eye,
  Trash,
  Clipboard,
  Pencil,
  Lock,
  LockOpen,
} from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { useCallback, useMemo, useState, useEffect } from 'react'
import { RunData } from '../../../../types/runs-interface'
import { ErrorDetails } from '../../../../components/error-display'
import { DeleteRun } from '../../../../components/delete-run'
import { BuyersPreview } from '../../../../components/buyers-preview'
import { EditRun } from '../../../../components/edit-run'
import { format, parseISO } from 'date-fns'
import { useAuth } from '../../../../context/auth-context'
import { toggleRunLock as toggleRunLockService } from '../../../../services/api/runs'
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
    Garçom: 'linear-gradient(90deg, rgba(59,130,246,0.72), rgba(37,99,235,0.62))',
    Confeiteiros: 'linear-gradient(90deg, rgba(244,114,182,0.72), rgba(236,72,153,0.62))',
    Jackfruit: 'linear-gradient(90deg, rgba(34,197,94,0.72), rgba(22,163,74,0.62))',
    Insanos: 'linear-gradient(270deg, rgba(59,130,246,0.72), rgba(30,64,175,0.62))',
    APAE: 'linear-gradient(90deg, rgba(252,165,165,0.68), rgba(248,113,113,0.6))',
    'Los Renegados': 'linear-gradient(90deg, rgba(252,211,77,0.72), rgba(245,158,11,0.62))',
    DTM: 'linear-gradient(90deg, rgba(167,139,250,0.72), rgba(139,92,246,0.62))',
    KFFC: 'linear-gradient(90deg, rgba(52,211,153,0.72), rgba(4,120,87,0.62))',
    Greensky: 'linear-gradient(90deg, rgba(244,114,182,0.72), rgba(190,24,93,0.62))',
    'Guild Azralon BR#1': 'linear-gradient(270deg, rgba(45,212,191,0.72), rgba(13,148,136,0.62))',
    'Guild Azralon BR#2': 'linear-gradient(270deg, rgba(96,165,250,0.72), rgba(29,78,216,0.62))',
    Rocket: 'linear-gradient(90deg, rgba(248,113,113,0.72), rgba(185,28,28,0.62))',
    'Booty Reaper': 'linear-gradient(90deg, rgba(139,92,246,0.72), rgba(76,29,149,0.62))',
    Padeirinho: 'linear-gradient(90deg, rgba(251,146,60,0.72), rgba(234,88,12,0.62))',
    Milharal: 'linear-gradient(90deg, rgba(254,243,199,0.62), rgba(254,240,138,0.54))',
    'Bastard Munchen': 'linear-gradient(90deg, rgba(245,158,11,0.72), rgba(217,119,6,0.62))',
    'Kiwi': 'linear-gradient(90deg, rgba(163,230,53,0.72), rgba(132,204,22,0.62))',
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

  const renderTableCell = (content: string | number | JSX.Element | null) => (
    <td className='px-3 py-3 text-center text-sm text-white/90'>{content || '-'}</td>
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
    <div className='overflow-x-auto rounded-xl border border-white/10 bg-black/30'>
      <table className='w-full min-w-[1200px] text-sm'>
        <thead>
          <tr className='border-b border-white/10 bg-white/[0.03] text-neutral-300'>
            <th className='px-3 py-3 text-center font-semibold'>Preview</th>
            <th className='px-3 py-3 text-center font-semibold'>Date</th>
            <th className='px-3 py-3 text-center font-semibold'>
              <button
                type='button'
                onClick={handleSortByTime}
                className='inline-flex items-center gap-1 text-neutral-200 hover:text-white'
              >
                Time (EST)
                <span className='text-xs'>{isTimeSortedAsc ? '▲' : '▼'}</span>
              </button>
            </th>
            <th className='px-3 py-3 text-center font-semibold'>Raid</th>
            <th className='px-3 py-3 text-center font-semibold'>Buyers</th>
            <th className='px-3 py-3 text-center font-semibold'>Team</th>
            <th className='px-3 py-3 text-center font-semibold'>Raid Leader</th>
            <th className='px-3 py-3 text-center font-semibold'>Run Type</th>
            <th className='px-3 py-3 text-center font-semibold'>Difficulty</th>
            <th className='px-3 py-3 text-center font-semibold'>Loot</th>
            <th className='px-3 py-3 text-center font-semibold'>Note</th>
            <th className='px-3 py-3 text-center font-semibold'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr className='h-[320px]'>
              <td colSpan={12} className='text-center align-middle'>
                <div className='mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-purple-400'></div>
              </td>
            </tr>
          ) : sortedData.length === 0 ? (
            <tr className='h-[320px]'>
              <td colSpan={12} className='text-center align-middle text-neutral-400'>
                No runs today
              </td>
            </tr>
          ) : (
            sortedData.map((run, index) => (
              <tr
                key={index}
                onDoubleClick={() => handleRedirect(run.id)}
                className='cursor-pointer border-b border-white/5'
                style={getTeamColor(run.team)}
              >
                {renderTableCell(
                  run.date ? (
                    <button
                      type='button'
                      onClick={() => handleOpenPreview(run.id)}
                      className='rounded-md p-1 text-white/80 hover:bg-white/10 hover:text-white'
                    >
                      <Eye size={20} />
                    </button>
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
                  <div className='flex flex-col items-center gap-1'>
                    {hasRequiredRole([import.meta.env.VITE_TEAM_CHEFE]) && (
                      <div className='grid grid-cols-2 gap-1'>
                        <button
                          type='button'
                          title='Edit'
                          onClick={() => handleOpenEditRunModal(run)}
                          className='rounded-md p-1 text-white/80 hover:bg-white/10 hover:text-white'
                        >
                          <Pencil size={20} />
                        </button>
                        <button
                          type='button'
                          title='Copy'
                          onClick={() => copyRunToClipboard(run)}
                          className='rounded-md p-1 text-white/80 hover:bg-white/10 hover:text-white'
                        >
                          <Clipboard size={20} />
                        </button>
                        <button
                          type='button'
                          title='Delete'
                          onClick={() => handleOpenDeleteRunModal(run)}
                          className='rounded-md p-1 text-white/80 hover:bg-white/10 hover:text-white'
                        >
                          <Trash size={20} />
                        </button>
                        <button
                          type='button'
                          title={run.runIsLocked ? 'Unlock' : 'Lock'}
                          onClick={() => toggleRunLock(run.id, run.runIsLocked)}
                          className='rounded-md p-1 text-white/80 hover:bg-white/10 hover:text-white'
                        >
                          {run.runIsLocked ? <LockOpen size={20} /> : <Lock size={20} />}
                        </button>
                      </div>
                    )}
                    <div className='mt-1 text-center text-normal'>
                      {run.runIsLocked ? '(locked)' : '(unlocked)'}
                    </div>
                  </div>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

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
    </div>
  )
}
