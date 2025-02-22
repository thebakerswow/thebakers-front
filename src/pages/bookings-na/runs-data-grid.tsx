import { Megaphone, Eye, DotsThreeVertical } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { useCallback, useMemo, useState } from 'react'
import { Modal } from '../../components/modal'
import { RunData } from '../../types/runs-interface'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import { DeleteRun } from '../../components/delete-run'
import { BuyersPreview } from '../../components/buyers-preview'

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
  const [openActionsDropdown, setOpenActionsDropdown] = useState<string | null>(
    null
  )
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)

  const handleOpenPreview = (runId: string) => {
    setSelectedRunId(runId)
    setIsPreviewOpen(true)
  }

  const handleClosePreview = () => {
    setIsPreviewOpen(false)
    setSelectedRunId(null)
  }

  const toggleActionsDropdown = (runId: string) => {
    setOpenActionsDropdown(openActionsDropdown === runId ? null : runId)
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

  function handleOpenNote(run: { note: string; id: string }) {
    setSelectedRun(run)
    setIsNoteOpen(true)
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

      // Converter tempo para minutos para comparação

      const timeA = convertTimeToMinutes(a.time)
      const timeB = convertTimeToMinutes(b.time)

      return isTimeSortedAsc ? timeA - timeB : timeB - timeA
    })
    return sorted
  }, [data, isTimeSortedAsc])

  const handleSortByTime = useCallback(() => {
    setIsTimeSortedAsc((prev) => !prev)
  }, [])

  if (error) {
    return (
      <Modal onClose={() => setError(null)}>
        <ErrorComponent error={error} onClose={() => setError(null)} />
      </Modal>
    )
  }

  return (
    <div className='overflow-x-auto rounded-sm relative max-h-[350px] text-zinc-700 text-center text-base min-h-[400px]'>
      <table className='min-w-full border-collapse table-fixed'>
        <thead className='bg-zinc-400 text-gray-700 text-left'>
          <tr>
            <th className='p-2 border w-[100px]'>Preview</th>
            <th className='p-2 border cursor-pointer w-[150px]'>Date</th>
            <th
              className='p-2 border cursor-pointer'
              onClick={handleSortByTime}
            >
              Time {isTimeSortedAsc ? '▲' : '▼'}
            </th>
            <th className='p-2 border'>Raid</th>
            <th className='p-2 border'>Run Type</th>
            <th className='p-2 border'>Difficulty</th>
            <th className='p-2 border'>Team</th>
            <th className='p-2 border'>Loot</th>
            <th className='p-2 border'>Buyers</th>
            <th className='p-2 border w-[150px]'>Raid Leader</th>
            <th className='p-2 border'>Note</th>
            <th className='p-2 border' />
          </tr>
        </thead>

        <tbody className='bg-zinc-200 overflow-y-auto'>
          {isLoading && (
            <tr className='absolute inset-0 bg-white bg-opacity-80 z-10 flex gap-4 flex-col items-center justify-center'>
              <td className='animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-600' />
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
                className='border border-gray-300'
              >
                <td className='p-2 text-center align-middle'>
                  <div className='flex justify-center items-center h-full'>
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
                <td className='p-2'>{run.time || <span>-</span>}</td>
                <td className='p-2'>{run.raid || <span>-</span>}</td>
                <td className='p-2'>{run.runType || <span>-</span>}</td>
                <td className='p-2'>{run.difficulty || <span>-</span>}</td>
                <td className='p-2'>{run.team || <span>-</span>}</td>
                <td className='p-2'>{run.loot || <span>-</span>}</td>
                <td className='p-2'>{run.maxBuyers || <span>-</span>}</td>
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
                  <div className='flex justify-center items-center h-full'>
                    {run.note !== '' ? (
                      <Megaphone
                        className='text-red-500 cursor-pointer'
                        weight='fill'
                        onClick={() => handleOpenNote(run)}
                      />
                    ) : (
                      <span>-</span>
                    )}
                  </div>
                </td>
                <td className='text-center'>
                  <button onClick={() => toggleActionsDropdown(run.id)}>
                    <DotsThreeVertical size={20} />
                  </button>
                  {openActionsDropdown === run.id && (
                    <div className='absolute right-0 w-32 bg-white border rounded shadow-md'>
                      <button
                        onClick={() => handleOpenDeleteRunModal(run)}
                        className='block w-full px-4 py-2 text-left hover:bg-gray-100 text-red-500'
                      >
                        Delete
                      </button>
                    </div>
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
            <h2 className='font-bold text-xl'>Note</h2>
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
