import { Megaphone, Eye } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { useMemo, useState } from 'react'
import { Modal } from '../../components/modal'
import { BuyerData, BuyersDataGrid } from './run/buyers-data-grid'
import axios from 'axios'

interface RaidLeader {
  idDiscord: string
  username: string
}

interface RunsDataProps {
  data: Array<{
    id: string
    date: string
    time: string
    raid: string
    runType: string
    difficulty: string
    team: string
    maxBuyers: string
    raidLeaders: RaidLeader[]
    goldCollector: string
    note: string
    loot: string
  }>
  isLoading: boolean
}

export function RunsDataGrid({ data, isLoading }: RunsDataProps) {
  const navigate = useNavigate()
  const [isNoteOpen, setIsNoteOpen] = useState(false)
  const [selectedRun, setSelectedRun] = useState<{ note: string } | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isTimeSortedAsc, setIsTimeSortedAsc] = useState(true)
  const [buyersData, setBuyersData] = useState<BuyerData[]>([])
  const [isLoadingBuyers, setIsLoadingBuyers] = useState(false)
  const [errorBuyers, setErrorBuyers] = useState('')
  const [selectedGoldCollector, setSelectedGoldCollector] = useState('')

  function handleOpenNote(run: { note: string }) {
    setSelectedRun(run)
    setIsNoteOpen(true)
  }

  function handleCloseNote() {
    setIsNoteOpen(false)
    setSelectedRun(null)
  }

  const handleOpenPreview = async (runId: string, goldCollector: string) => {
    try {
      setIsLoadingBuyers(true)
      setErrorBuyers('')
      setSelectedGoldCollector(goldCollector)

      const apiUrl = import.meta.env.VITE_GET_RUN_URL
      const response = await axios.get(`${apiUrl}/${runId}/buyers`, {
        headers: {
          APP_TOKEN: import.meta.env.VITE_APP_TOKEN,
          Authorization: `Bearer ${sessionStorage.getItem('jwt')}`,
        },
      })

      setBuyersData(response.data.info ?? [])
      setIsPreviewOpen(true)
    } catch (error) {
      console.error('Erro ao buscar dados dos compradores:', error)
      setErrorBuyers('Failed to fetch buyers data. Please try again later.')
    } finally {
      setIsLoadingBuyers(false)
    }
  }

  const handleClosePreview = () => {
    setIsPreviewOpen(false)
    setBuyersData([])
    setErrorBuyers('')
  }

  const handleRedirect = (id: string) => {
    navigate(`/bookings-na/run/${id}`) // Altere '/sua-url' para o caminho desejado
  }

  const sortedData = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      if (!a.time || !b.time) return 0

      // Converter tempo para minutos para comparação
      const convertTimeToMinutes = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number)
        return hours * 60 + minutes
      }

      const timeA = convertTimeToMinutes(a.time)
      const timeB = convertTimeToMinutes(b.time)

      return isTimeSortedAsc ? timeA - timeB : timeB - timeA
    })
    return sorted
  }, [data, isTimeSortedAsc])

  const handleSortByTime = () => {
    setIsTimeSortedAsc(!isTimeSortedAsc)
  }

  return (
    <div className='overflow-x-auto rounded-sm relative max-h-[350px] text-zinc-700 text-center text-base min-h-[400px]'>
      <table className='min-w-full border-collapse table-fixed'>
        <thead className='bg-zinc-400 text-gray-700 text-left sticky top-0'>
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
            <th className='p-2 border w-[150px]'>Gold Collector</th>
            <th className='p-2 border'></th>
          </tr>
        </thead>

        <tbody className='bg-zinc-200 overflow-y-auto'>
          {isLoading && (
            <tr className='absolute inset-0 bg-white bg-opacity-80 z-10 flex gap-4 flex-col items-center justify-center'>
              <td className='animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-600'></td>
              <p>Loading...</p>
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
                        onClick={() =>
                          handleOpenPreview(run.id, run.goldCollector)
                        }
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
                <td className='p-2'>{run.goldCollector || <span>-</span>}</td>
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
            ))
          )}
        </tbody>
      </table>

      {isNoteOpen && selectedRun && (
        <Modal onClose={handleCloseNote}>
          <div className='p-4'>
            <h2 className='font-bold text-xl'>Note</h2>
            <p className='font-normal'>{selectedRun.note || 'Sem nota'}</p>
          </div>
        </Modal>
      )}

      {isPreviewOpen && (
        <Modal onClose={handleClosePreview}>
          <div className='w-full max-w-[95vw] h-[500px] overflow-y-auto overflow-x-hidden'>
            {isLoadingBuyers ? (
              <div className='flex flex-col items-center justify-center h-full'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-600' />
                <p className='mt-4 text-lg'>Loading buyers...</p>
              </div>
            ) : errorBuyers ? (
              <div className='text-red-500 text-2xl text-center'>
                {errorBuyers}
              </div>
            ) : buyersData.length > 0 ? (
              <BuyersDataGrid
                data={buyersData}
                goldCollector={selectedGoldCollector}
              />
            ) : (
              <div className='flex flex-col items-center justify-center h-full'>
                <p className='mt-4 text-lg'>No buyers found</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
