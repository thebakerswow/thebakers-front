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

export interface RunData {
  id: string
  date: string
  time: string
  raid: string
  runType: string
  difficulty: string
  team: string
  maxBuyers: string
  raidLeaders: RaidLeader[]
  loot: string
  note: string
}

export function RunDetails() {
  const { id } = useParams<{ id: string }>()
  const [runData, setRunData] = useState<RunData | null>(null)
  const [isLoadingRun, setIsLoadingRun] = useState(true)
  const [isLoadingBuyers, setIsLoadingBuyers] = useState(true)
  const [rows, setRows] = useState<BuyerData[] | null>(null)
  const [errorRun, setErrorRun] = useState('') // Estado para erro na run
  const [errorBuyers, setErrorBuyers] = useState('') // Estado para erro nos buyers
  const [isInviteBuyersOpen, setIsInviteBuyersOpen] = useState(false)

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
      setRunData(response.data.info)
    } catch (error) {
      console.error('Erro ao buscar os dados da run:', error)
      setErrorRun('Failed to fetch run data. Please try again later.')
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

      setRows(response.data.info ?? [])
    } catch (error) {
      console.error('Erro ao buscar os dados dos buyers:', error)
      setErrorBuyers('Failed to fetch buyers data. Please try again later.')
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
            onBuyerAddedReload={fetchBuyersData}
            onRunEdit={fetchRunData}
          />
          <div className='container mx-auto mt-2 p-4'>
            {isLoadingBuyers ? (
              <div className='flex flex-col items-center mt-40'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white' />
                <p className='mt-4 text-lg'>Loading buyers...</p>
              </div>
            ) : errorBuyers ? ( // Exibe mensagem de erro dos buyers
              <div className='text-red-500 text-2xl'>{errorBuyers}</div>
            ) : rows && rows.length > 0 ? (
              <div>
                <button
                  onClick={handleOpenInviteBuyersModal}
                  className='flex items-center gap-2 bg-red-400 text-gray-100 hover:bg-red-500 rounded-md p-2 mb-2'
                >
                  <UserPlus size={18} />
                  Invite Buyers
                </button>
                <BuyersDataGrid
                  data={rows}
                />
              </div>
            ) : (
              <div className='flex flex-col items-center mt-40'>
                <p className='mt-4 text-lg'>No buyers found</p>
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
