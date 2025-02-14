import { CaretLeft, CaretRight, Megaphone, Eye } from '@phosphor-icons/react'
import { Button } from '../../../components/button'
import { format, parseISO } from 'date-fns'
import { useState, useMemo } from 'react'
import { Modal } from '../../../components/modal'
import { BuyersDataGrid } from './run/buyers-data-grid'
import { buyersData } from '../../../assets/buyers-data' // Importe os dados mockados

interface RunsGridProps {
  data: Array<{
    name: string
    raid: string
    status: string
    date: string
    time: string
    buyers: string
    difficulty: string
    loot: string
    team: string
    collector: string
    leader: string
    note: string
  }>
  currentPage: number
  setCurrentPage: (page: number) => void
}

const itemsPerPage = 8

export function RunsDataGrid({
  data,
  currentPage,
  setCurrentPage,
}: RunsGridProps) {
  const [isNoteOpen, setIsNoteOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<{ note: string } | null>(null)
  const [isDateSortedAsc, setIsDateSortedAsc] = useState(true)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const totalPages = Math.ceil(data.length / itemsPerPage)

  function handleNextPage() {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  function handlePreviousPage() {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  function handleOpenNote(row: { note: string }) {
    setSelectedRow(row)
    setIsNoteOpen(true)
  }

  function handleCloseNote() {
    setIsNoteOpen(false)
    setSelectedRow(null)
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

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = sortedData.slice(startIndex, endIndex)

  const filledData = [...currentData]
  while (filledData.length < itemsPerPage) {
    filledData.push({
      name: '',
      raid: '',
      status: '',
      date: '',
      time: '',
      buyers: '',
      difficulty: '',
      loot: '',
      team: '',
      collector: '',
      leader: '',
      note: '',
    })
  }

  return (
    <div className='overflow-x-auto rounded-sm relative'>
      <table className='min-w-full border-collapse'>
        <thead className='table-header-group'>
          <tr className='text-md bg-zinc-400 text-gray-700 text-left'>
            <th className='p-2 border'>Preview</th>
            <th
              className='p-2 border cursor-pointer'
              onClick={handleSortByDate}
            >
              Date {isDateSortedAsc ? '▲' : '▼'}
            </th>
            <th className='p-2 border'>Time</th>
            <th className='p-2 border'>Raid</th>
            <th className='p-2 border'>Run Type</th>
            <th className='p-2 border'>Difficulty</th>
            <th className='p-2 border'>Buyers</th>
            <th className='p-2 border'>Leader</th>
            <th className='p-2 border'>Gold Collector</th>
            <th className='p-2 border'>Status</th>
            <th className='p-2 border'></th>
          </tr>
        </thead>
        <tbody className='table-row-group text-sm font-medium text-zinc-900 bg-zinc-200'>
          {filledData.map((row, index) => (
            <tr key={index} className='border border-gray-300 '>
              <td className='p-2 flex justify-center'>
                {row.date ? (
                  <Eye
                    className='cursor-pointer'
                    size={20}
                    onClick={() => handleOpenPreview()}
                  />
                ) : (
                  <span>-</span>
                )}
              </td>
              <td className='p-2'>
                {row.date ? (
                  format(parseISO(row.date), 'EEEE LL/dd')
                ) : (
                  <span>-</span>
                )}
              </td>
              <td className='p-2'>{row.time || <span>-</span>}</td>
              <td className='p-2'>{row.raid || <span>-</span>}</td>
              <td className='p-2'>{row.loot || <span>-</span>}</td>
              <td className='p-2'>{row.difficulty || <span>-</span>}</td>
              <td className='p-2'>{row.buyers || <span>-</span>}</td>
              <td className='p-2'>{row.leader || <span>-</span>}</td>
              <td className='p-2'>{row.collector || <span>-</span>}</td>
              <td className='p-2'>{row.status || <span>-</span>}</td>
              <td className='p-2 flex justify-center'>
                {row.time && row.note !== '' ? (
                  <Megaphone
                    className='text-red-500'
                    weight='fill'
                    onClick={() => handleOpenNote(row)}
                  />
                ) : (
                  <span></span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className='flex justify-end gap-4 items-center mt-4 text-gray-100'>
        <Button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          variant='pagination'
          size='pagination'
        >
          <CaretLeft weight='bold' />
        </Button>
        <span className='text-sm'>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          variant='pagination'
          size='pagination'
        >
          <CaretRight weight='bold' />
        </Button>
      </div>

      {isNoteOpen && selectedRow && (
        <Modal onClose={handleCloseNote}>
          <div className='p-4'>
            <h2>Nota</h2>
            <p>{selectedRow.note || 'Sem nota'}</p>
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
