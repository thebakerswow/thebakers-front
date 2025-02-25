// BalanceDataGrid.tsx
import { useEffect, useRef, useState } from 'react'
import { WeekRangeFilter } from './week-range-filter'
import axios from 'axios'
import { format, eachDayOfInterval, parseISO } from 'date-fns'
import { api } from '../../services/axiosConfig'
import { LoadingSpinner } from '../../components/loading-spinner'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import { Modal } from '../../components/modal'
import { BalanceTeamFilter } from '../../components/balance-team-filter'
import {
  getTextColorForBackground,
  ColorSelector,
} from '../../components/color-selector'

interface PlayerBalance {
  id_discord: string
  username: string
  value: number
  color: string // nova propriedade
}

interface BalanceResponse {
  info: {
    [date: string]: Array<PlayerBalance>
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
  const [playerStyles, setPlayerStyles] = useState<{
    [key: string]: { background: string; text: string }
  }>({})
  const [menuOpenForPlayer, setMenuOpenForPlayer] = useState<string | null>(
    null
  )
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Ao receber os dados, atualiza o estilo padrão de cada jogador com a cor retornada da API
  useEffect(() => {
    const newStyles: { [key: string]: { background: string; text: string } } =
      {}

    Object.values(balanceData).forEach((players) => {
      players.forEach((player) => {
        if (player.color) {
          newStyles[player.id_discord] = {
            background: player.color,
            text: getTextColorForBackground(player.color),
          }
        }
      })
    })

    setPlayerStyles(newStyles)
  }, [balanceData])

  // Função que envia a atualização da cor para a API e atualiza o estado local
  const handleBackgroundChange = async (
    playerId: string,
    background: string
  ) => {
    const textColor = getTextColorForBackground(background)
    setPlayerStyles((prev) => ({
      ...prev,
      [playerId]: { background, text: textColor },
    }))

    try {
      await api.put(`${import.meta.env.VITE_API_BASE_URL}/balance/color`, {
        id_discord: playerId, // envia o discord id
        color: background, // envia a nova cor
      })
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Erro ao atualizar a cor:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        })
      } else {
        console.error('Erro inesperado ao atualizar a cor:', error)
      }
    }

    setMenuOpenForPlayer(null)
  }

  const toggleDropdown = (playerId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setMenuOpenForPlayer((prev) => (prev === playerId ? null : playerId))
  }

  // Efeito para fechar o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setMenuOpenForPlayer(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

        // Atualiza os dados de balanço
        setBalanceData(response.data.info || {})

        // A atualização do estado de cores será feita pelo useEffect que depende de balanceData
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
    <div className='min-h-full'>
      <div className='flex items-end justify-between'>
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
        <div className=' flex justify-center h-[80%] mt-6 '>
          <table className='border-collapse text-lg min-w-[1000px]'>
            <thead className='table-header-group'>
              <tr className='text-md bg-zinc-400 text-gray-700'>
                <th className='p-2 border w-[200px]'>Player</th>
                <th className='p-2 border w-[150px]'>Total Balance</th>
                {getSortedDates().map((date) => (
                  <th key={date} className='p-2 border w-[200px]'>
                    {formatDayHeader(date)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className='table-row-group text-base  font-medium text-zinc-900 bg-zinc-200 text-center'>
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
                  <tr key={player.id} className='border border-gray-300 '>
                    <td
                      className='relative p-0 border '
                      style={{
                        backgroundColor:
                          playerStyles[player.id]?.background || 'transparent',
                        color: playerStyles[player.id]?.text || 'inherit',
                      }}
                    >
                      <div
                        className='absolute inset-y-0 left-0 w-2 bg-gray-600 cursor-pointer hover:w-2 transition-all z-20'
                        onClick={(e) => toggleDropdown(player.id, e)}
                      />
                      {menuOpenForPlayer === player.id && (
                        <div
                          ref={dropdownRef}
                          className='absolute left-4 top-0 mt-6 z-50 w-64 bg-white border shadow-lg p-2 rounded'
                        >
                          <h4 className='font-semibold mb-2 text-gray-700'>
                            Class Colors
                          </h4>
                          <ColorSelector
                            onSelectColor={(color) =>
                              handleBackgroundChange(player.id, color)
                            }
                          />
                        </div>
                      )}
                      <span className='relative z-10 block p-2'>
                        {player.username}
                      </span>
                    </td>
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
        </div>
      )}
    </div>
  )
}
