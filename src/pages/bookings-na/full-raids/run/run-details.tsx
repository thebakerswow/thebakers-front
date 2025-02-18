import { useEffect, useState } from 'react'
import { RunInfo } from './run-info'
import { BuyerData, BuyersDataGrid } from './buyers-data-grid'
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
  const [rows, setRows] = useState<BuyerData[] | null>(null)

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

  useEffect(() => {
    async function fetchBuyersData() {
      try {
        const apiUrl = import.meta.env.VITE_GET_RUN_URL
        const response = await axios.get(
          `${apiUrl}/${id}/buyers` ||
            `http://localhost:8000/v1/run/${id}/buyers`,
          {
            headers: {
              APP_TOKEN: import.meta.env.VITE_APP_TOKEN,
              Authorization: `Bearer ${sessionStorage.getItem('jwt')}`,
            },
          }
        )
        console.log('buyers:', response.data.info)

        // Se a resposta for nula, definir como array vazio
        setRows(response.data.info ?? [])
      } catch (error) {
        console.error('Erro ao buscar os dados dos buyers:', error)
      }
    }

    if (id) {
      fetchBuyersData()
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
        {rows && rows.length > 0 ? (
          <BuyersDataGrid data={rows} goldCollector={runData.goldCollector} />
        ) : (
          <p>Nenhum buyer encontrado.</p>
        )}
      </div>
    </div>
  )
}
