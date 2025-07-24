import { useEffect, useState } from 'react'

import axios from 'axios'
import { format, eachDayOfInterval, parseISO } from 'date-fns'
import { getBalance, updateBalanceColor } from '../../services/api/balance'
import { getTextColorForBackground } from '../../components/color-selector'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material'
import { useAuth } from '../../context/auth-context' // ajuste o path conforme necessário

import {
  BalanceResponse,
  ProcessedPlayer,
  BalanceDataGridProps,
} from '../../types'

export function BalanceDataGrid({
  selectedTeam: initialSelectedTeam,
  dateRange, // Destructure dateRange
  is_dolar, // Destructure is_dolar
  onError,
}: BalanceDataGridProps) {
  const { userRoles = [], idDiscord } = useAuth() // Garante que userRoles seja um array
  const restrictedFreelancerRole = import.meta.env.VITE_TEAM_FREELANCER
  const restrictedAdvertiserRole = import.meta.env.VITE_TEAM_ADVERTISER

  const isRestrictedUser =
    (userRoles.includes(restrictedFreelancerRole) ||
      userRoles.includes(restrictedAdvertiserRole)) &&
    userRoles.length <= 2 &&
    userRoles.every((role) =>
      [restrictedFreelancerRole, restrictedAdvertiserRole].includes(role)
    )

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
      if (
        !dateRange ||
        selectedTeam === null ||
        selectedTeam === undefined ||
        (selectedTeam === '' && !isRestrictedUser) // Só impede se não for usuário restrito
      ) {
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

            response = filteredResponse
          }
        } else {
          // Para usuários normais, busca dados por time
          const params = {
            id_team:
              selectedTeam && selectedTeam !== '' ? selectedTeam : undefined,
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
  }, [dateRange, selectedTeam, isRestrictedUser, is_dolar, onError])

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
          playersMap.get(player.id_discord)!.dailyValues[date] = Math.round(
            player.value
          )
        })
      }
    )

    // Update balance_total and username in playersMap using balance_total
    balanceTotals.forEach((total) => {
      if (!playersMap.has(total.id_discord)) {
        playersMap.set(total.id_discord, {
          id: total.id_discord,
          username: total.username, // Use username from balance_total
          balance_total: total.balance_total,
          dailyValues: {}, // No daily values if not in player_balance
        })
      } else {
        const player = playersMap.get(total.id_discord)!
        player.balance_total = total.balance_total
        player.username = total.username // Update username from balance_total
      }
    })

    return Array.from(playersMap.values()).sort((a, b) =>
      a.username.localeCompare(b.username)
    )
  }

  return (
    <div className='px-4 py-8'>
      {isLoadingBalance || !hasInitialDataLoaded ? (
        <div className='flex min-h-[400px] items-center justify-center'>
          <CircularProgress />
        </div>
      ) : (
        <TableContainer
          className='relative'
          component={Paper}
          style={{
            fontSize: '1rem',
            overflow: 'hidden',
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  align='center'
                  style={{
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    backgroundColor: '#ECEBEE',
                  }}
                >
                  Player
                </TableCell>
                <TableCell
                  align='center'
                  style={{
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    backgroundColor: '#ECEBEE',
                  }}
                >
                  Total Balance
                </TableCell>
                {getSortedDates().map((date) => (
                  <TableCell
                    key={date}
                    align='center'
                    style={{
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      backgroundColor: '#ECEBEE',
                    }}
                  >
                    {formatDayHeader(date)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {(balanceData.balance_total?.length || 0) === 0 ? ( // Check if balance_total is null or empty
                <TableRow>
                  <TableCell
                    colSpan={getSortedDates().length + 2}
                    align='center'
                  >
                    No data yet
                  </TableCell>
                </TableRow>
              ) : (
                processBalanceData().map((player) => (
                  <TableRow key={player.id}>
                    <TableCell
                      align='center'
                      style={{
                        backgroundColor:
                          playerStyles[player.id]?.background || 'transparent',
                        color: 'black',
                      }}
                    >
                      <Select
                        value={playerStyles[player.id]?.background || ''}
                        onChange={(e) =>
                          handleBackgroundChange(player.id, e.target.value)
                        }
                        displayEmpty
                        style={{
                          backgroundColor:
                            playerStyles[player.id]?.background ||
                            'transparent',
                          color: 'black',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          minWidth: '80px',
                          height: '30px',
                        }}
                        renderValue={() => player.username}
                      >
                        <MenuItem value='' disabled>
                          Select Class
                        </MenuItem>
                        <MenuItem value='#C41E3A'>Death Knight</MenuItem>
                        <MenuItem value='#A330C9'>Demon Hunter</MenuItem>
                        <MenuItem value='#FF7C0A'>Druid</MenuItem>
                        <MenuItem value='#33937F'>Evoker</MenuItem>
                        <MenuItem value='#AAD372'>Hunter</MenuItem>
                        <MenuItem value='#3FC7EB'>Mage</MenuItem>
                        <MenuItem value='#00FF98'>Monk</MenuItem>
                        <MenuItem value='#F48CBA'>Paladin</MenuItem>
                        <MenuItem value='#FFFFFF'>Priest</MenuItem>
                        <MenuItem value='#FFF468'>Rogue</MenuItem>
                        <MenuItem value='#0070DD'>Shaman</MenuItem>
                        <MenuItem value='#8788EE'>Warlock</MenuItem>
                        <MenuItem value='#C69B6D'>Warrior</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell align='center'>
                      {is_dolar
                        ? Number(player.balance_total).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : Math.round(
                            Number(player.balance_total)
                          ).toLocaleString('en-US')}
                    </TableCell>
                    {getSortedDates().map((date) => (
                      <TableCell key={`${player.id}-${date}`} align='center'>
                        {player.dailyValues[date] !== undefined
                          ? is_dolar
                            ? Number(player.dailyValues[date]).toLocaleString(
                                'en-US',
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )
                            : Number(player.dailyValues[date]).toLocaleString(
                                'en-US',
                                {
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0,
                                }
                              )
                          : '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  )
}
