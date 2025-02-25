import { useEffect, useState } from 'react'
import { WeekRangeFilter } from './week-range-filter'
import axios from 'axios'
import { format, eachDayOfInterval, parseISO } from 'date-fns'
import { api } from '../../services/axiosConfig'
import { LoadingSpinner } from '../../components/loading-spinner'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import { Modal } from '../../components/modal'
import { BalanceTeamFilter } from '../../components/balance-team-filter'

interface BalanceResponse {
  info: {
    [date: string]: Array<{
      id_discord: string
      username: string
      value: number
    }>
  }
  errors: string[]
}

interface ProcessedPlayer {
  id: string
  username: string
  dailyValues: {
    [date: string]: number
  }
}

export function BalanceDataGrid() {
  const [balanceData, setBalanceData] = useState<BalanceResponse['info']>({})
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [teams, setTeams] = useState<
    Array<{ id_discord: string; team_name: string }>
  >([])
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>()
  const [isLoadingTeams, setIsLoadingTeams] = useState(false)
  const [error, setError] = useState<ErrorDetails | null>(null)

  const getSortedDates = (): string[] => {
    if (!dateRange) return []

    const startDate = parseISO(dateRange.start)
    const endDate = parseISO(dateRange.end)

    const dates = eachDayOfInterval({ start: startDate, end: endDate })
    return dates.map((date) => format(date, 'yyyy-MM-dd'))
  }

  const formatDayHeader = (dateString: string) => {
    try {
      const date = parseISO(dateString)
      return `${format(date, 'dd/MM')} (${format(date, 'EEEE')})`
    } catch {
      return dateString
    }
  }

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setIsLoadingTeams(true)
        const response = await api.get(
          `${import.meta.env.VITE_API_BASE_URL}/teams/balance`
        )
        const uniqueTeams = response.data.info.reduce(
          (acc: any[], team: any) => {
            if (!acc.some((t) => t.team_name === team.team_name)) {
              acc.push(team)
            }
            return acc
          },
          []
        )
        setTeams(uniqueTeams)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorDetails = {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          }
          setError(errorDetails)
        } else {
          setError({
            message: 'Erro inesperado',
            response: error,
          })
        }
      } finally {
        setIsLoadingTeams(false)
      }
    }
    fetchTeams()
  }, [])

  useEffect(() => {
    const fetchBalanceData = async () => {
      if (!dateRange) return
      try {
        setIsLoadingBalance(true)

        const params = {
          id_team: selectedTeam,
          date_start: dateRange.start,
          date_end: dateRange.end,
        }

        console.log('Enviando requisição com:', params)
        const response = await api.get<BalanceResponse>(
          `${import.meta.env.VITE_API_BASE_URL}/balance`,
          {
            params,
          }
        )

        setBalanceData(response.data.info || {})
        console.log('Dados recebidos:', response.data.info)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorDetails = {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          }
          setError(errorDetails)
        } else {
          setError({
            message: 'Erro inesperado',
            response: error,
          })
        }
      } finally {
        setIsLoadingBalance(false)
      }
    }

    fetchBalanceData()
  }, [dateRange, selectedTeam])

  if (error) {
    return (
      <Modal onClose={() => setError(null)}>
        <ErrorComponent error={error} onClose={() => setError(null)} />
      </Modal>
    )
  }

  const processBalanceData = () => {
    const playersMap = new Map<string, ProcessedPlayer>()

    Object.entries(balanceData).forEach(([date, players]) => {
      players.forEach((player) => {
        if (!playersMap.has(player.id_discord)) {
          playersMap.set(player.id_discord, {
            id: player.id_discord,
            username: player.username || 'N/A',
            dailyValues: {},
          })
        }
        const playerData = playersMap.get(player.id_discord)!
        playerData.dailyValues[date] = Math.round(player.value)
      })
    })

    return Array.from(playersMap.values())
  }

  return (
    <div className='min-w-full min-h-full'>
      <div className='mx-10 flex items-center justify-between'>
        <BalanceTeamFilter
          selectedTeam={selectedTeam}
          teams={teams}
          isLoadingTeams={isLoadingTeams}
          onSelectTeam={setSelectedTeam}
        />
        <WeekRangeFilter onChange={setDateRange} />
      </div>

      {isLoadingBalance && (
        <div className='flex justify-center items-center h-[80%]'>
          <LoadingSpinner />
        </div>
      )}

      {!isLoadingBalance && (
        <table className='min-w-full border-collapse'>
          <thead className='table-header-group'>
            <tr className='text-md bg-zinc-400 text-gray-700'>
              <th className='p-2 border'>Player</th>
              <th className='p-2 border'>Total Balance</th>
              {getSortedDates().map((date) => (
                <th key={date} className='p-2 border'>
                  {formatDayHeader(date)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='table-row-group text-sm font-medium text-zinc-900 bg-zinc-200 text-center'>
            {processBalanceData().length === 0 ? (
              <tr>
                <td
                  colSpan={getSortedDates().length + 2}
                  className='p-2 text-center'
                >
                  No data yet
                </td>
              </tr>
            ) : (
              processBalanceData().map((player) => (
                <tr key={player.id} className='border border-gray-300'>
                  <td className='p-2 border'>{player.username}</td>
                  <td className='p-2 border'>Implementar</td>
                  {getSortedDates().map((date) => (
                    <td
                      key={`${player.id}-${date}`}
                      className='p-2 border text-center'
                    >
                      {player.dailyValues[date]
                        ? player.dailyValues[date].toLocaleString() + 'g'
                        : '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
