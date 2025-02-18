import { useEffect, useState } from 'react'
import { RunInfo } from './run-info'
import { BuyersDataGrid } from './buyers-data-grid'
import { buyersData, BuyersData } from '../../../../assets/buyers-data'
import axios from 'axios'
import { useParams } from 'react-router-dom'

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
  goldCollector: string
  loot: string
  note: string
}

export function RunDetails() {
  const { id } = useParams<{ id: string }>()
  const [runData, setRunData] = useState<RunData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [rows] = useState<BuyersData[]>(buyersData)

  useEffect(() => {
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
        console.log(response.data)
      } catch (error) {
        console.error('Erro ao buscar os dados da run:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchRunData()
    }
  }, [id])

  if (isLoading) {
    return <div>Carregando...</div>
  }

  if (!runData) {
    return <div>Run não encontrada.</div>
  }

  return (
    <div
      className='bg-zinc-700 text-gray-100 absolute inset-0 flex flex-col
      rounded-xl shadow-2xl m-8 overflow-y-auto scrollbar-thin'
    >
      <RunInfo run={runData} />
      <div className='container mx-auto mt-2 p-4'>
        <BuyersDataGrid data={rows} />
      </div>
    </div>
  )
}
