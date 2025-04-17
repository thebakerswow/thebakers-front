import { useEffect, useState } from 'react'

import axios from 'axios'
import { format, eachDayOfInterval, parseISO } from 'date-fns'
import { api } from '../../services/axiosConfig'
import { LoadingSpinner } from '../../components/loading-spinner'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import { Modal as MuiModal, Box } from '@mui/material'
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
} from '@mui/material'
import { useAuth } from '../../context/auth-context' // ajuste o path conforme necessário

interface PlayerBalance {
  id_discord: string
  username: string
  value: number
  balance_total: number
  color: string
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

interface BalanceDataGridProps {
  selectedTeam: string | null
  dateRange: { start: string; end: string } | undefined // Add dateRange prop
}

export function BalanceDataGrid({
  selectedTeam,
  dateRange, // Destructure dateRange
}: BalanceDataGridProps) {
  const { userRoles } = useAuth()
  const restrictedRole = import.meta.env.VITE_TEAM_FREELANCER
  const isRestrictedUser =
    userRoles.includes(restrictedRole) && userRoles.length === 1

  // Estado para armazenar os dados de balanceamento, times, estilos de jogadores e erros
  const [balanceData, setBalanceData] = useState<BalanceResponse['info']>({})
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [playerStyles, setPlayerStyles] = useState<{
    [key: string]: { background: string; text: string }
  }>({})

  // Atualiza os estilos dos jogadores com base nos dados de balanceamento
  useEffect(() => {
    const newStyles = Object.values(balanceData)
      .flatMap((players) =>
        players.map((player) => ({
          [player.id_discord]: {
            background: player.color,
            text: getTextColorForBackground(player.color),
          },
        }))
      )
      .reduce((acc, style) => ({ ...acc, ...style }), {})
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
      await api.put(`${import.meta.env.VITE_API_BASE_URL}/balance/color`, {
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
      if (!dateRange || selectedTeam === null) return

      setIsLoadingBalance(true)
      try {
        // Se for usuário restrito, força team como string vazia
        const teamParam = isRestrictedUser ? '' : selectedTeam
        const response = await api.get<BalanceResponse>(
          `${import.meta.env.VITE_API_BASE_URL}/balance`,
          {
            params: {
              id_team: teamParam,
              date_start: dateRange.start,
              date_end: dateRange.end,
            },
          }
        )

        setBalanceData(response.data.info || {})
      } catch (error) {
        setError(
          axios.isAxiosError(error)
            ? {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
              }
            : { message: 'Unexpected error', response: error }
        )
      } finally {
        setIsLoadingBalance(false)
      }
    }
    fetchBalanceData()
  }, [dateRange, selectedTeam, isRestrictedUser])

  // Processa os dados de balanceamento para exibição na tabela
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
        playersMap.get(player.id_discord)!.dailyValues[date] = Math.round(
          player.value
        )
      })
    })
    return Array.from(playersMap.values())
  }

  if (error) {
    return (
      <MuiModal open={!!error} onClose={() => setError(null)}>
        <Box className='absolute left-1/2 top-1/2 w-96 -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-gray-400 p-4 shadow-lg'>
          <ErrorComponent error={error} onClose={() => setError(null)} />
        </Box>
      </MuiModal>
    )
  }

  return (
    <div className='px-4 py-8'>
      {isLoadingBalance ? (
        <div className='flex h-screen items-center justify-center'>
          <LoadingSpinner />
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
              {processBalanceData().length === 0 ? (
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
                        color: 'black', // Alterado para preto
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
                          color: 'black', // Alterado para preto
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
                      {Math.round(Number(player.balance_total)).toLocaleString(
                        'en-US'
                      )}
                    </TableCell>
                    {getSortedDates().map((date) => (
                      <TableCell key={`${player.id}-${date}`} align='center'>
                        {player.dailyValues[date]
                          ? Number(player.dailyValues[date]).toLocaleString(
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
