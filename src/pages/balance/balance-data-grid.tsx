import { useEffect, useState, useMemo } from 'react'

import axios from 'axios'
import { format, eachDayOfInterval, parseISO } from 'date-fns'
import { getBalance, updateBalanceColor } from '../../services/api/balance'
import { getTextColorForBackground } from './components/color-selector'
import { useAuth } from '../../context/auth-context' // ajuste o path conforme necessário

import {
  BalanceResponse,
  ProcessedPlayer,
  BalanceDataGridProps,
} from '../../types'
import { shouldShowOwnBalanceOnly } from '../../utils/role-utils'

export function BalanceDataGrid({
  selectedTeam: initialSelectedTeam,
  dateRange, // Destructure dateRange
  is_dolar, // Destructure is_dolar
  onError,
}: BalanceDataGridProps) {
  const { userRoles = [], idDiscord } = useAuth() // Garante que userRoles seja um array

  // Determina se o usuário deve ver apenas seu próprio balance
  const isRestrictedUser = useMemo(() => shouldShowOwnBalanceOnly(userRoles), [userRoles])

  // Para usuários restritos, usa o ID do próprio usuário como selectedTeam
  const selectedTeam = isRestrictedUser ? idDiscord : initialSelectedTeam

  // Estado para armazenar os dados de balanceamento, times, estilos de jogadores e erros
  const [balanceData, setBalanceData] = useState<BalanceResponse['info']>({
    player_balance: {},
    balance_total: [],
  })
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)
  const [hasInitialDataLoaded, setHasInitialDataLoaded] = useState(false)
  const [playerStyles, setPlayerStyles] = useState<{
    [key: string]: { background: string; text: string }
  }>({})
  const [openPlayerClassMenu, setOpenPlayerClassMenu] = useState<string | null>(null)

  const classOptions = [
    { name: 'Death Knight', color: '#C41E3A' },
    { name: 'Demon Hunter', color: '#A330C9' },
    { name: 'Druid', color: '#FF7C0A' },
    { name: 'Evoker', color: '#33937F' },
    { name: 'Hunter', color: '#AAD372' },
    { name: 'Mage', color: '#3FC7EB' },
    { name: 'Monk', color: '#00FF98' },
    { name: 'Paladin', color: '#F48CBA' },
    { name: 'Priest', color: '#FFFFFF' },
    { name: 'Rogue', color: '#FFF468' },
    { name: 'Shaman', color: '#0070DD' },
    { name: 'Warlock', color: '#8788EE' },
    { name: 'Warrior', color: '#C69B6D' },
  ]

  // Atualiza os estilos dos jogadores com base nos dados de balanceamento
  useEffect(() => {
    const newStyles = (balanceData.balance_total || []).reduce(
      (acc, player) => ({
        ...acc,
        [player.id_discord]: {
          background: player.color_balance, // Use color_balance from balance_total
          text: getTextColorForBackground(player.color_balance),
        },
      }),
      {}
    )
    setPlayerStyles(newStyles)
  }, [balanceData])

  // Atualiza a cor de fundo de um jogador e envia a alteração para a API
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
      await updateBalanceColor({
        id_discord: playerId,
        color: background,
      })
    } catch (error) {
      console.error('Error updating color:', error)
    }
  }

  // Retorna as datas ordenadas dentro do intervalo selecionado
  const getSortedDates = (): string[] => {
    if (!dateRange) return []
    const { start, end } = dateRange
    return eachDayOfInterval({
      start: parseISO(start),
      end: parseISO(end),
    }).map((date) => format(date, 'yyyy-MM-dd'))
  }

  // Formata o cabeçalho das colunas de datas
  const formatDayHeader = (dateString: string) => {
    try {
      const date = parseISO(dateString)
      return `${format(date, 'dd/MM')} (${format(date, 'EEEE')})`
    } catch {
      return dateString
    }
  }

  // Busca os dados de balanceamento com base no time e intervalo de datas selecionados
  useEffect(() => {
    const fetchBalanceData = async () => {
      
      // Validação mais simples: se não tem dados essenciais, não faz nada
      if (!dateRange || !selectedTeam) {
        setHasInitialDataLoaded(false)
        return
      }

      setIsLoadingBalance(true)
      setHasInitialDataLoaded(false)
      try {
        
        let response

        if (isRestrictedUser) {
          // Para usuários restritos, busca dados de todos os times e filtra no frontend
          const params = {
            date_start: dateRange.start,
            date_end: dateRange.end,
            is_dolar,
          }
          response = await getBalance(params)

          // Filtra os dados para mostrar apenas o usuário logado
          if (response) {
            const filteredResponse: {
              player_balance: { [date: string]: any[] }
              balance_total: any[]
            } = {
              player_balance: {},
              balance_total: response.balance_total.filter(
                (player: any) => player.id_discord === selectedTeam
              ),
            }

            // Filtra também os dados diários
            Object.entries(response.player_balance || {}).forEach(
              ([date, players]) => {
                const filteredPlayers = (players as any[]).filter(
                  (player: any) => player.id_discord === selectedTeam
                )
                if (filteredPlayers.length > 0) {
                  filteredResponse.player_balance[date] = filteredPlayers
                }
              }
            )

            // Se não encontrou dados do usuário, cria um registro vazio com o ID do usuário
            if (filteredResponse.balance_total.length === 0) {
              filteredResponse.balance_total = [{
                id_discord: selectedTeam,
                username: 'Your Balance', // Fallback simples
                balance_total: 0,
                color_balance: '#FFFFFF'
              }]
            }

            response = filteredResponse
          }
        } else {
          // Para usuários normais, busca dados por time
          const params = {
            id_team: selectedTeam,
            date_start: dateRange.start,
            date_end: dateRange.end,
            is_dolar,
          }
          response = await getBalance(params)
        }

        setBalanceData(response || { player_balance: {}, balance_total: [] })
        setHasInitialDataLoaded(true)
        onError(null) // Clear any previous errors
      } catch (error) {
        const errorDetails = axios.isAxiosError(error)
          ? {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status,
            }
          : { message: 'Unexpected error', response: error }
        onError(errorDetails)
        setHasInitialDataLoaded(true)
      } finally {
        setIsLoadingBalance(false)
      }
    }
    fetchBalanceData()
  }, [dateRange, selectedTeam, isRestrictedUser, is_dolar])

  // Processa os dados de balanceamento para exibição na tabela
  const processBalanceData = () => {
    const playersMap = new Map<string, ProcessedPlayer>()

    // Extract balance totals from balance_total
    const balanceTotals = balanceData.balance_total || []

    // Populate playersMap using player_balance for daily values
    Object.entries(balanceData.player_balance || {}).forEach(
      ([date, players]) => {
        players.forEach((player) => {
          if (!playersMap.has(player.id_discord)) {
            playersMap.set(player.id_discord, {
              id: player.id_discord,
              username: '', // Will be updated using balance_total
              balance_total: 0, // Default to 0, will be updated using balance_total
              dailyValues: {},
            })
          }
          const roundedValue = Math.round(player.value)
          playersMap.get(player.id_discord)!.dailyValues[date] =
            roundedValue === 0 ? 0 : roundedValue
        })
      }
    )

    // Update balance_total and username in playersMap using balance_total
    balanceTotals.forEach((total) => {
      if (!playersMap.has(total.id_discord)) {
        const balanceValue = total.balance_total
        playersMap.set(total.id_discord, {
          id: total.id_discord,
          username: total.username, // Use username from balance_total
          balance_total: Math.abs(balanceValue) === 0 ? 0 : balanceValue,
          dailyValues: {}, // No daily values if not in player_balance
        })
      } else {
        const player = playersMap.get(total.id_discord)!
        const balanceValue = total.balance_total
        player.balance_total = Math.abs(balanceValue) === 0 ? 0 : balanceValue
        player.username = total.username // Update username from balance_total
      }
    })

    return Array.from(playersMap.values()).sort((a, b) =>
      a.username.localeCompare(b.username)
    )
  }

  return (
    <div className='px-1 py-1 md:px-0 md:py-0'>
      {isLoadingBalance || !hasInitialDataLoaded ? (
        <div className='flex min-h-[400px] items-center justify-center'>
          <div className='h-10 w-10 animate-spin rounded-full border-b-2 border-purple-400'></div>
        </div>
      ) : (
        <div className='relative rounded-lg bg-transparent'>
          <div className='overflow-x-auto'>
            <table className='w-full min-w-max text-sm'>
            <thead>
              <tr className='border-b border-white/10 text-gray-400'>
                <th className='py-3 pr-3 text-left font-medium'>
                  Player
                </th>
                <th className='py-3 px-3 text-center font-medium'>
                  Total Balance
                </th>
                {getSortedDates().map((date) => (
                  <th
                    key={date}
                    className='py-3 px-3 text-center font-medium whitespace-nowrap'
                  >
                    {formatDayHeader(date)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(balanceData.balance_total?.length || 0) === 0 ? (
                <tr>
                  <td
                    colSpan={getSortedDates().length + 2}
                    className='py-10 text-center text-gray-500'
                  >
                    No data yet
                  </td>
                </tr>
              ) : (
                processBalanceData().map((player) => (
                  <tr key={player.id} className='border-b border-white/5'>
                    <td className='py-3 pr-3'>
                      <div className='relative inline-block'>
                        <button
                          type='button'
                          onClick={() =>
                            setOpenPlayerClassMenu((prev) =>
                              prev === player.id ? null : player.id
                            )
                          }
                          className='inline-flex h-10 w-48 items-center justify-center rounded-md border border-white/10 px-3 text-sm font-medium transition hover:brightness-110'
                          style={{
                            backgroundColor:
                              playerStyles[player.id]?.background || 'rgba(255,255,255,0.05)',
                            color: playerStyles[player.id]?.text || '#fff',
                          }}
                        >
                          {player.username}
                        </button>

                        {openPlayerClassMenu === player.id && (
                          <div className='absolute left-0 top-11 z-20 w-[196px] rounded-md border border-white/10 bg-[#111115] p-2 shadow-2xl'>
                            <div className='grid grid-cols-5 gap-2'>
                              {classOptions.map((option) => (
                                <button
                                  key={option.name}
                                  type='button'
                                  title={option.name}
                                  aria-label={option.name}
                                  onClick={() => {
                                    handleBackgroundChange(player.id, option.color)
                                    setOpenPlayerClassMenu(null)
                                  }}
                                  className='h-7 w-7 rounded border border-white/15 transition hover:scale-105'
                                  style={{
                                    backgroundColor: option.color,
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className='py-3 px-3 text-center text-white'>
                      {is_dolar
                        ? Math.abs(Number(player.balance_total)) === 0
                          ? '0.00'
                          : Number(player.balance_total).toLocaleString(
                              'en-US',
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )
                        : Math.abs(Math.round(Number(player.balance_total))) ===
                            0
                          ? '0'
                          : Math.round(Number(player.balance_total)).toLocaleString(
                              'en-US'
                            )}
                    </td>
                    {getSortedDates().map((date) => (
                      <td
                        key={`${player.id}-${date}`}
                        className='py-3 px-3 text-center text-white/90'
                      >
                        {player.dailyValues[date] !== undefined
                          ? is_dolar
                            ? Math.abs(Number(player.dailyValues[date])) === 0
                              ? '0.00'
                              : Number(player.dailyValues[date]).toLocaleString(
                                  'en-US',
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )
                            : Math.abs(player.dailyValues[date]) === 0
                              ? '0'
                              : Number(player.dailyValues[date]).toLocaleString(
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
        </div>
      )}
    </div>
  )
}
