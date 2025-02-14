import { Megaphone, Eye } from '@phosphor-icons/react'
import { format, parseISO } from 'date-fns'
import { useState, useMemo } from 'react'
import { Modal } from '../../../components/modal'
import { BuyersDataGrid } from './run/buyers-data-grid'
import { buyersData } from '../../../assets/buyers-data' // Importe os dados mockados

interface RunsGridProps {
  data: Array<{
    id: string
    date: string
    time: string
    raid: string
    type: string
    difficulty: string
    team: string
    buyers: string
    leader: string
    collector: string
    status: string
    note: string
  }>
}

export function RunsDataGrid({ data }: RunsGridProps) {
  const [isNoteOpen, setIsNoteOpen] = useState(false)
  const [selectedRun, setSelectedRun] = useState<{ note: string } | null>(null)
  const [isDateSortedAsc, setIsDateSortedAsc] = useState(true)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  function handleOpenNote(run: { note: string }) {
    setSelectedRun(run)
    setIsNoteOpen(true)
  }

  function handleCloseNote() {
    setIsNoteOpen(false)
    setSelectedRun(null)
  }

  function handleSortByDate() {
    setIsDateSortedAsc(!isDateSortedAsc)
  }

  function handleOpenPreview() {
    setIsPreviewOpen(true)
  }

  function handleClosePreview() {
    setIsPreviewOpen(false)
  }

  const sortedData = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      if (!a.date || !b.date) return 0
      const dateA = parseISO(a.date)
      const dateB = parseISO(b.date)
      return isDateSortedAsc
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime()
    })
    return sorted
  }, [data, isDateSortedAsc])

  return (
    <div className='overflow-x-auto rounded-sm relative max-h-[350px] text-zinc-700 text-center text-base'>
      <table className='min-w-full border-collapse table-fixed'>
        <thead className='bg-zinc-400 text-gray-700 text-left sticky top-0'>
          <tr>
            <th className='p-2 border w-[100px]'>Preview</th>
            <th
              className='p-2 border cursor-pointer w-[150px]'
              onClick={handleSortByDate}
            >
              Date {isDateSortedAsc ? '▲' : '▼'}
            </th>
            <th className='p-2 border'>Time</th>
            <th className='p-2 border'>Raid</th>
            <th className='p-2 border'>Run Type</th>
            <th className='p-2 border'>Difficulty</th>
            <th className='p-2 border'>Team</th>
            <th className='p-2 border'>Buyers</th>
            <th className='p-2 border w-[150px]'>Raid Leader</th>
            <th className='p-2 border w-[150px]'>Gold Collector</th>
            <th className='p-2 border'>Status</th>
            <th className='p-2 border'></th>
          </tr>
        </thead>

        <tbody className='bg-zinc-200 overflow-y-auto'>
          {sortedData.map((run, index) => (
            <tr key={index} className='border border-gray-300'>
              <td className='p-2 text-center align-middle'>
                <div className='flex justify-center items-center h-full'>
                  {run.date ? (
                    <Eye
                      className='cursor-pointer'
                      size={20}
                      onClick={() => handleOpenPreview()}
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
              <td className='p-2'>{run.type || <span>-</span>}</td>
              <td className='p-2'>{run.difficulty || <span>-</span>}</td>
              <td className='p-2'>{run.team || <span>-</span>}</td>
              <td className='p-2'>{run.buyers || <span>-</span>}</td>
              <td className='p-2'>{run.leader || <span>-</span>}</td>
              <td className='p-2'>{run.collector || <span>-</span>}</td>
              <td className='p-2'>{run.status || <span>-</span>}</td>
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
            </tr>
          ))}
        </tbody>
      </table>

      {isNoteOpen && selectedRun && (
        <Modal onClose={handleCloseNote}>
          <div className='p-4'>
            <h2>Nota</h2>
            <p>{selectedRun.note || 'Sem nota'}</p>
          </div>
        </Modal>
      )}

      {isPreviewOpen && (
        <Modal onClose={handleClosePreview}>
          <div className='w-full max-w-[95vw] h-[500px] overflow-y-auto overflow-x-hidden'>
            <BuyersDataGrid data={buyersData} />
          </div>
        </Modal>
      )}
    </div>
  )
}
