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
import { useAuth } from '../../context/auth-context'

interface PlayerBalance {
  id_discord: string
  username: string
  value: number
  balance_total: number
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
  balance_total: number
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
  const { userRoles } = useAuth()

  const hasRequiredRole = (requiredRoles: string[]): boolean => {
    return requiredRoles.some((required) =>
      userRoles.some((userRole) => userRole.toString() === required.toString())
    )
  }

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

        // Definir automaticamente o time do usuário como o primeiro da lista
        if (uniqueTeams.length > 0) {
          setSelectedTeam(uniqueTeams[0].id_discord)
        }
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
      if (!dateRange || !selectedTeam) return // Aguarda o time estar definido

      try {
        setIsLoadingBalance(true)

        const params = {
          id_team: selectedTeam,
          date_start: dateRange.start,
          date_end: dateRange.end,
        }
        const response = await api.get<BalanceResponse>(
          `${import.meta.env.VITE_API_BASE_URL}/balance`,
          { params }
        )

        setBalanceData(response.data.info || {})
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError({
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          })
        } else {
          setError({ message: 'Erro inesperado', response: error })
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
            balance_total: player.balance_total,
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
        <div className='flex h-[80%] items-center justify-center'>
          <LoadingSpinner />
        </div>
      )}

      {!isLoadingBalance && (
        <div className='mt-6 flex h-[80%] justify-center'>
          <table className='min-w-[1000px] border-collapse text-lg'>
            <thead className='table-header-group'>
              <tr className='text-md bg-zinc-400 text-gray-700'>
                <th className='w-[200px] border p-2'>Player</th>
                <th className='w-[150px] border p-2'>Total Balance</th>
                {getSortedDates().map((date) => (
                  <th key={date} className='w-[200px] border p-2'>
                    {formatDayHeader(date)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className='table-row-group bg-zinc-200 text-center text-base font-medium text-zinc-900'>
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
                    <td
                      className='relative border p-0'
                      style={{
                        backgroundColor:
                          playerStyles[player.id]?.background || 'transparent',
                        color: playerStyles[player.id]?.text || 'inherit',
                      }}
                    >
                      {hasRequiredRole(['1101231955120496650']) && (
                        <div
                          className='absolute inset-y-0 left-0 z-20 w-2 cursor-pointer bg-gray-600 transition-all hover:w-2'
                          onClick={(e) => toggleDropdown(player.id, e)}
                        />
                      )}
                      {menuOpenForPlayer === player.id && (
                        <div
                          ref={dropdownRef}
                          className='absolute left-4 top-0 z-50 mt-6 w-64 rounded border bg-white p-2 shadow-lg'
                        >
                          <h4 className='mb-2 font-semibold text-gray-700'>
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
                    <td className='border p-2'>
                      {Math.round(Number(player.balance_total)).toLocaleString(
                        'en-US'
                      )}
                    </td>

                    {getSortedDates().map((date) => (
                      <td
                        key={`${player.id}-${date}`}
                        className='border p-2 text-center'
                      >
                        {player.dailyValues[date]
                          ? Number(player.dailyValues[date]).toLocaleString(
                              'en-US',
                              {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              }
                            )
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
