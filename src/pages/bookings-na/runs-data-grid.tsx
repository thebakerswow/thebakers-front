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
    <div className='relative max-h-[450px] min-h-[400px] overflow-x-auto rounded-sm text-center text-base text-zinc-700'>
      <table className='min-w-full table-fixed border-collapse'>
        <thead className='bg-zinc-400 text-left text-gray-700'>
          <tr>
            <th className='w-[100px] border p-2'>Preview</th>
            <th className='w-[150px] cursor-pointer border p-2'>Date</th>
            <th
              className='cursor-pointer border p-2'
              onClick={handleSortByTime}
            >
              Time {isTimeSortedAsc ? '▲' : '▼'}
            </th>
            <th className='border p-2'>Raid</th>
            <th className='border p-2'>Run Type</th>
            <th className='border p-2'>Difficulty</th>
            <th className='border p-2'>Team</th>
            <th className='border p-2'>Loot</th>
            <th className='border p-2'>Buyers</th>
            <th className='w-[150px] border p-2'>Raid Leader</th>
            <th className='border p-2'>Note</th>
            <th className='border p-2' />
          </tr>
        </thead>

        <tbody className='cursor-pointer overflow-y-auto bg-zinc-200'>
          {isLoading && (
            <tr className='absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-white bg-opacity-80'>
              <td className='h-12 w-12 animate-spin rounded-full border-b-2 border-zinc-600' />
            </tr>
          )}
          {!isLoading && sortedData.length === 0 ? (
            <tr>
              <td colSpan={12} className='p-4 text-center text-zinc-500'>
                No runs today
              </td>
            </tr>
          ) : (
            sortedData.map((run, index) => (
              <tr
                onDoubleClick={() => handleRedirect(run.id)}
                key={index}
                className={`border border-gray-300 ${
                  run.team === 'Padeirinho'
                    ? 'bg-yellow-600'
                    : run.team === 'Garçom'
                      ? 'bg-blue-300'
                      : run.team === 'Confeiteiros'
                        ? 'bg-purple-300'
                        : run.team === 'Jackfruit'
                          ? 'bg-green-300'
                          : run.team === 'Milharal'
                            ? 'bg-yellow-400'
                            : run.team === 'Raio'
                              ? 'bg-yellow-200'
                              : run.team === 'APAE'
                                ? 'bg-red-300'
                                : ''
                }`}
              >
                <td className='p-2 text-center align-middle'>
                  <div className='flex h-full items-center justify-center'>
                    {run.date ? (
                      <Eye
                        className='cursor-pointer'
                        size={20}
                        onClick={() => handleOpenPreview(run.id)}
                      />
                    ) : (
                      <span>-</span>
                    )}
                  </div>
                </td>
                <td className='p-2'>
                  {run.date ? (
                    format(parseISO(run.date), 'EEEE LL/dd')
                  ) : (
                    <span>-</span>
                  )}
                </td>
                <td className='p-2'>
                  {run.time && run.date ? (
                    <>
                      {formatTo12HourEST(run.time)} EST{' '}
                      {/* Exibe o horário original recebido do backend */}
                      <br />
                      {convertFromEST(run.time)} BRT
                    </>
                  ) : (
                    <span>-</span>
                  )}
                </td>
                <td className='p-2'>{run.raid || <span>-</span>}</td>
                <td className='p-2'>{run.runType || <span>-</span>}</td>
                <td className='p-2'>{run.difficulty || <span>-</span>}</td>
                <td className='p-2'>{run.team || <span>-</span>}</td>
                <td className='p-2'>{run.loot || <span>-</span>}</td>
                <td className='p-2'>{run.buyersCount || <span>-</span>}</td>
                <td className='p-2'>
                  {run.raidLeaders && run.raidLeaders.length > 0 ? (
                    run.raidLeaders
                      .map((raidLeader) => raidLeader.username)
                      .join(', ')
                  ) : (
                    <span>-</span>
                  )}
                </td>
                <td className='p-2 text-center align-middle'>
                  <div className='flex h-full items-center justify-center'>
                    {run.note !== '' ? run.note : <span>-</span>}
                  </div>
                </td>

                <td className='text-center'>
                  {hasRequiredRole(['1101231955120496650']) && (
                    <button onClick={() => handleOpenDeleteRunModal(run)}>
                      <Trash size={20} />
                    </button>
                  )}
                </td>
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
    </div>
  )
}
