import { useEffect, useState } from 'react'
import { RunInfo } from './run-info'
import { BuyerData, BuyersDataGrid } from './buyers-data-grid'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { UserPlus } from '@phosphor-icons/react'
import { InviteBuyers } from '../../../components/invite-buyers'

interface RaidLeader {
  idDiscord: string
  username: string
}

interface Players {
  idDiscord: string
  username: string
}

interface SumPot {
  idDiscord: string
  username: string
  sumPot: number
}

export interface RunData {
  id: string
  idTeam: string
  date: string
  time: string
  raid: string
  runType: string
  difficulty: string
  team: string
  backups: number
  actualPot: number
  slotAvailable: number
  maxBuyers: string
  raidLeaders: RaidLeader[]
  loot: string
  note: string
  sumPot: SumPot[]
  players: Players[]
}

export function RunDetails() {
  const { id } = useParams<{ id: string }>()
  const [runData, setRunData] = useState<RunData | null>(null)
  const [isLoadingRun, setIsLoadingRun] = useState(true)
  const [isLoadingBuyers, setIsLoadingBuyers] = useState(true)
  const [rows, setRows] = useState<BuyerData[] | null>(null)
  const [errorRun] = useState('') // Estado para erro na run
  const [errorBuyers] = useState('') // Estado para erro nos buyers
  const [isInviteBuyersOpen, setIsInviteBuyersOpen] = useState(false)
  const [attendance, setAttendance] = useState<{ [key: string]: number }>({})

  const handleAttendanceClick = (playerId: string, value: number) => {
    setAttendance((prev) => ({ ...prev, [playerId]: value }))
  }

  const markAllAsFull = () => {
    const updatedAttendance = runData.players.reduce(
      (acc, player) => {
        acc[player.idDiscord] = 100
        return acc
      },
      {} as { [key: string]: number }
    )
    setAttendance(updatedAttendance)
  }

  // Função para atualizar o número de backups localmente
  const handleBackupUpdate = (newBackups: number) => {
    setRunData((prevRunData) => {
      if (!prevRunData) return prevRunData
      return { ...prevRunData, backups: newBackups }
    })
  }

  // Função para atualizar o número de gold localmente
  const handleActualPotUpdate = (newPot: number) => {
    setRunData((prevRunData) => {
      if (!prevRunData) return prevRunData
      return { ...prevRunData, actualPot: newPot }
    })
  }

  // Função para atualizar o número de gold localmente
  const handleSlotsAvailableUpdate = (newSlotsAvailable: number) => {
    setRunData((prevRunData) => {
      if (!prevRunData) return prevRunData
      return { ...prevRunData, actualPot: newSlotsAvailable }
    })
  }

  // Função para recarregar TODOS os dados (run e buyers)
  const reloadAllData = async () => {
    await fetchRunData() // Atualiza dados da run
    await fetchBuyersData() // Atualiza lista de buyers
  }

  function handleOpenInviteBuyersModal() {
    setIsInviteBuyersOpen(true)
  }

  function handleCloseInviteBuyersModal() {
    setIsInviteBuyersOpen(false)
  }

  // Função para buscar os dados da run
  async function fetchRunData() {
    try {
      const apiUrl = import.meta.env.VITE_GET_RUN_URL
      const response = await axios.get(
        `${apiUrl}/${id}` || `http://localhost:8000/v1/run/${id}`,
        {
          headers: {
            APP_TOKEN: import.meta.env.VITE_APP_TOKEN,
            Authorization: `Bearer ${sessionStorage.getItem('jwt')}`,
          },
        }
      )
      console.log('Dados da run: ', response.data.info)
      const data = response.data.info
      setRunData({
        ...data,
        slotAvailable: Number(data.slotAvailable),
        maxBuyers: Number(data.maxBuyers),
      })
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Erro detalhado:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        })
      } else {
        console.error('Erro inesperado:', error)
      }
    } finally {
      setIsLoadingRun(false)
    }
  }

  // Função para buscar os dados dos buyers
  async function fetchBuyersData() {
    try {
      setIsLoadingBuyers(true)
      const apiUrl = import.meta.env.VITE_GET_RUN_URL
      const response = await axios.get(
        `${apiUrl}/${id}/buyers` || `http://localhost:8000/v1/run/${id}/buyers`,
        {
          headers: {
            APP_TOKEN: import.meta.env.VITE_APP_TOKEN,
            Authorization: `Bearer ${sessionStorage.getItem('jwt')}`,
          },
        }
      )
      console.log('buyer data:', response.data.info)

      setRows(response.data.info ?? [])
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Erro detalhado:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        })
      } else {
        console.error('Erro inesperado:', error)
      }
    } finally {
      setIsLoadingBuyers(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchRunData()
      fetchBuyersData()
    }
  }, [id])

  return (
    <div
      className={`bg-zinc-700 text-gray-100 absolute inset-0 flex flex-col
    rounded-xl shadow-2xl m-8 overflow-y-auto scrollbar-thin ${
      isLoadingRun || !runData ? 'justify-center items-center' : ''
    }`}
    >
      {isLoadingRun ? (
        <div className='flex flex-col items-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white' />
          <p className='mt-4 text-lg'>Loading...</p>
        </div>
      ) : errorRun ? ( // Exibe mensagem de erro da run
        <div className='text-red-500 text-2xl'>{errorRun}</div>
      ) : !runData ? (
        <div className='text-4xl'>Run not found</div>
      ) : (
        <div>
          <RunInfo
            run={runData}
            onBuyerAddedReload={reloadAllData}
            onRunEdit={fetchRunData}
          />
          <div></div>
          <div className='w-[95%] mx-auto mt-2 p-4'>
            {isLoadingBuyers ? (
              <div className='flex flex-col items-center mt-40'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white' />
                <p className='mt-4 text-lg'>Loading buyers...</p>
              </div>
            ) : (
              <div>
                <button
                  onClick={handleOpenInviteBuyersModal}
                  className='flex items-center gap-2 bg-red-400 text-gray-100 hover:bg-red-500 rounded-md p-2 mb-2'
                >
                  <UserPlus size={18} />
                  Invite Buyers
                </button>
                <BuyersDataGrid
                  run={runData}
                  data={rows}
                  onBackupUpdate={handleBackupUpdate}
                  onPotUpdate={handleActualPotUpdate}
                  onSlotsUpdate={handleSlotsAvailableUpdate}
                />
              </div>
            )}
          </div>
          <div className='w-[95%] mx-auto mt-2 p-4'>
            {isLoadingBuyers ? (
              <div className='flex flex-col items-center mt-40'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white' />
                <p className='mt-4 text-lg'>Loading buyers...</p>
              </div>
            ) : (
              <div>
                <table className='w-[50%] border-collapse'>
                  <thead className='table-header-group'>
                    <tr className='text-md bg-zinc-400 text-gray-700'>
                      <th className='p-2 border'>Player</th>
                      <th className='p-2 border flex items-center justify-center'>
                        Attendance
                        <button
                          className='ml-2 px-2 py-1 text-xs font-semibold border rounded bg-green-500 text-white hover:bg-green-600 transition'
                          onClick={markAllAsFull}
                        >
                          100%
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody className='table-row-group text-sm font-medium text-zinc-900 bg-zinc-200'>
                    {runData.players && runData.players.length > 0 ? (
                      runData.players.map((player) => (
                        <tr
                          key={player.idDiscord}
                          className='border border-gray-300'
                        >
                          <td className='p-2 text-center'>{player.username}</td>
                          <td className='p-2 text-center'>
                            <div className='flex gap-2 px-2 justify-center'>
                              <select
                                value={attendance[player.idDiscord]}
                                onChange={(e) =>
                                  handleAttendanceClick(
                                    player.idDiscord,
                                    Number(e.target.value)
                                  )
                                }
                                className={`px-2 py-1 text-xs border rounded transition-colors ${
                                  attendance[player.idDiscord] === 0
                                    ? 'bg-red-500 text-white'
                                    : attendance[player.idDiscord] === 100
                                      ? 'bg-green-500 text-white'
                                      : 'bg-yellow-500 text-white'
                                }`}
                              >
                                {[
                                  0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100,
                                ].map((value) => (
                                  <option key={value} value={value}>
                                    {value}%
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={2}
                          className='p-2 text-center text-gray-500'
                        >
                          No players found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      {isInviteBuyersOpen && runData && (
        <InviteBuyers
          onClose={handleCloseInviteBuyersModal}
          runId={runData.id}
        />
      )}
    </div>
  )
}
