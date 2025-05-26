import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import {
  Modal as MuiModal,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { format, startOfWeek, addDays } from 'date-fns'
import { api } from '../../services/axiosConfig'
import { useNavigate } from 'react-router-dom'

type DiscordTokenPayload = {
  username: string
  discriminator: string
  avatar: string
  roles: string
  id: string
}

export function HomePage() {
  const [username, setUsername] = useState('')
  const [userRoles, setUserRoles] = useState<string[]>([])
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [weekRuns, setWeekRuns] = useState<Record<number, any[]>>({})
  // Pegue as roles do .env
  const TEAM_ADVERTISER = import.meta.env.VITE_TEAM_ADVERTISER
  const TEAM_CHEFE = import.meta.env.VITE_TEAM_CHEFE
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('jwt')
    if (!token) return

    try {
      const decoded = jwtDecode<DiscordTokenPayload>(token)
      setUsername(decoded.username)
      // roles pode ser string separada por vírgula ou array, ajuste conforme necessário
      const rolesArray = Array.isArray(decoded.roles)
        ? decoded.roles
        : decoded.roles?.split(',').map((r) => r.trim()) || []
      setUserRoles(rolesArray)
    } catch (err) {
      const errorDetails = axios.isAxiosError(err)
        ? {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status,
          }
        : { message: 'Erro inesperado', response: err }
      setError(errorDetails)
    }
  }, [])

  // Buscar runs da semana atual
  useEffect(() => {
    const fetchWeekRuns = async () => {
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 }) // Domingo
      const days: string[] = []
      for (let i = 0; i < 7; i++) {
        days.push(format(addDays(weekStart, i), 'yyyy-MM-dd'))
      }
      try {
        // Supondo que a API aceite múltiplas datas ou precise de várias requisições
        const results = await Promise.all(
          days.map((date) =>
            api.get('/run', { params: { date } }).then((res) => ({
              date,
              runs: res.data.info || [],
            }))
          )
        )
        // Organiza as runs por índice do dia da semana (0=Domingo, 6=Sábado)
        const runsByDay: Record<number, any[]> = {}
        results.forEach((result, idx) => {
          runsByDay[idx] = result.runs
        })
        setWeekRuns(runsByDay)
      } catch (err) {
        // ignore errors for now
      }
    }

    fetchWeekRuns()
  }, [])

  const hasRequiredRole = (requiredRoles: string[]): boolean => {
    return requiredRoles.some((required) =>
      userRoles.some((userRole) => userRole.toString() === required.toString())
    )
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

  // Renderize outra homepage se o usuário possuir a role do .env
  if (hasRequiredRole([TEAM_ADVERTISER, TEAM_CHEFE])) {
    return (
      <div className='relative max-h-screen overflow-x-hidden'>
        {/* Seção principal com imagem de fundo */}
        <div
          className='flex h-screen'
          style={{
            backgroundImage: "url('/src/assets/gally.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '100vw',
            overflowX: 'hidden',
          }}
        >
          {/* Esquerda: Tabela */}
          <div className='flex flex-1 items-center justify-center p-8'>
            <TableContainer
              component={Paper}
              style={{ maxWidth: 400, width: '100%' }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      align='center'
                      style={{
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        background: '#ECEBEE',
                      }}
                      className='bg-gray-200 text-base font-bold'
                    >
                      Service
                    </TableCell>
                    <TableCell
                      align='center'
                      style={{
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        background: '#ECEBEE',
                      }}
                      className='bg-gray-200 text-base font-bold'
                    >
                      Price
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell align='center' className='text-center'>
                      Heroic Full Raid
                    </TableCell>
                    <TableCell align='center' className='text-center'>
                      999999999
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align='center' className='text-center'>
                      Normal Full Raid
                    </TableCell>
                    <TableCell align='center' className='text-center'>
                      999999999
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align='center' className='text-center'>
                      Mythic 6/8
                    </TableCell>
                    <TableCell align='center' className='text-center'>
                      999999999
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align='center' className='text-center'>
                      Mythic 7/8, 8/8
                    </TableCell>
                    <TableCell align='center' className='text-center'>
                      999999999
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align='center' className='text-center'>
                      Mythic Last Boss
                    </TableCell>
                    <TableCell align='center' className='text-center'>
                      999999999
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </div>
          {/* Direita: Texto introdutório */}
          <div className='flex flex-1 items-center justify-center p-8'>
            <div className='flex min-h-[400px] max-w-[600px] flex-col justify-center rounded-xl bg-zinc-900 p-8 text-center text-4xl font-semibold text-gray-100 shadow-md'>
              <div>
                Welcome to TheBakers{' '}
                <span className='font-bold text-red-700'>Hub</span>
              </div>
              {username && (
                <div className='mt-4 text-2xl'>
                  Hello, <span className='text-red-500'>{username}</span>!
                </div>
              )}
              <div className='mt-4 text-lg font-normal text-gray-200'>
                The Bakers is a solid boosting team of premade friends who
                formed this guild after leaving our first one together. We've
                been boosting as a team since the end of Shadowlands. All of our
                services are 100% Terms of Service friendly.
              </div>
            </div>
          </div>
          {/* Seta para baixo */}
          <div
            className='flex w-full justify-center'
            style={{ position: 'absolute', bottom: 48, left: 0, zIndex: 10 }}
          >
            <button
              onClick={() => {
                const section = document.getElementById('semana-tabelas')
                if (section) {
                  section.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              aria-label='Rolar para baixo'
              className='rounded-full bg-white/70 p-2 shadow transition-colors hover:bg-white'
            >
              <svg
                width='32'
                height='32'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='feather feather-arrow-down'
              >
                <line x1='12' y1='5' x2='12' y2='19'></line>
                <polyline points='19 12 12 19 5 12'></polyline>
              </svg>
            </button>
          </div>
        </div>
        {/* Conteúdo extra: 7 tabelas para os dias da semana */}
        <div className='flex min-h-screen w-full flex-col items-center justify-center gap-14'>
          <h2 className='text-6xl font-bold tracking-wide text-white'>
            SCHEDULE
          </h2>
          <div
            id='semana-tabelas'
            className='flex w-full justify-center gap-8 px-8'
          >
            {[
              'Domingo',
              'Segunda',
              'Terça',
              'Quarta',
              'Quinta',
              'Sexta',
              'Sábado',
            ].map((dia, idx) => {
              // Nova ordem de prioridade dos times
              const teamOrder = [
                'Garçom',
                'Padeirinho',
                'Confeiteiros',
                'Jackfruit',
                'APAE',
                'Jackfruit',
                'Sapoculeano',
                'KFFC',
                'DTM',
                'Greensky',
                'Guild Azralon BR#1',
                'Guild Azralon BR#2',
                'Advertiser',
                'Milharal',
                'Raio',
              ]
              // Ordena as runs do dia pelo horário e prioridade do time
              const runsSorted = (weekRuns[idx] || []).slice().sort((a, b) => {
                if (!a?.time || !b?.time) return 0
                const [ha, ma] = a.time.split(':').map(Number)
                const [hb, mb] = b.time.split(':').map(Number)
                if (ha !== hb) return ha - hb
                if (ma !== mb) return ma - mb
                // Se o horário for igual, ordena pela ordem dos times
                const pa = teamOrder.indexOf(a.team)
                const pb = teamOrder.indexOf(b.team)
                if (pa === -1 && pb === -1) return 0
                if (pa === -1) return 1
                if (pb === -1) return -1
                return pa - pb
              })
              const runsToShow = runsSorted.length
                ? runsSorted
                : [null, null, null, null, null]
              return (
                <TableContainer
                  key={dia}
                  component={Paper}
                  className='max-w-xs flex-1'
                  style={{ minWidth: 160, minHeight: 400, maxHeight: 600 }}
                >
                  <Table size='small' style={{ minHeight: 400 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          align='center'
                          style={{
                            fontWeight: 'bold',
                            background: '#ECEBEE',
                            fontSize: '1.1rem',
                            position: 'sticky',
                            top: 0,
                            zIndex: 1,
                          }}
                        >
                          {(() => {
                            // Tradução dos dias para inglês
                            const daysEn = [
                              'Sunday',
                              'Monday',
                              'Tuesday',
                              'Wednesday',
                              'Thursday',
                              'Friday',
                              'Saturday',
                            ]
                            return daysEn[idx]
                          })()}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {runsToShow.map((run, i) =>
                        run ? (
                          <TableRow
                            key={run.id}
                            style={{
                              background: teamColors[run.team] || undefined,
                            }}
                            onDoubleClick={() =>
                              navigate(`/bookings-na/run/${run.id}`)
                            }
                            className='cursor-pointer'
                          >
                            <TableCell align='center'>
                              <div>
                                <div>
                                  <b>{run.time}</b>
                                </div>
                                <div>{run.raid}</div>
                                <div>{run.difficulty}</div>
                                <div>{run.loot}</div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          <TableRow key={i}>
                            <TableCell align='center'>&nbsp;</TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='mt-20 flex h-[400px] w-[800px] flex-col items-center justify-center rounded-xl bg-zinc-900 p-4 text-4xl font-semibold text-gray-100 shadow-2xl'>
      <div>
        Welcome to TheBakers <span className='font-bold text-red-700'>Hub</span>
      </div>
      {username && (
        <div className='mt-4 text-2xl'>
          Hello, <span className='text-red-500'>{username}</span>!
        </div>
      )}
    </div>
  )
}

const teamColors: { [key: string]: string } = {
  Padeirinho: 'linear-gradient(90deg, #FDE68A, #ca8a04)',
  Garçom: 'linear-gradient(90deg, #60A5FA, #2563EB)',
  Confeiteiros: 'linear-gradient(90deg, #A78BFA, #f472b6)',
  Jackfruit: 'linear-gradient(90deg, #86EFAC, #16a34a)',
  Milharal: 'linear-gradient(90deg, #FCD34D, #fef08a)',
  Raio: 'linear-gradient(90deg, #fef08a, #facc15)',
  APAE: 'linear-gradient(90deg, #F87171, #ef4444)',
  DTM: 'linear-gradient(90deg, #D1D5DB, #9CA3AF)',
  KFFC: 'linear-gradient(90deg, #065F46, #34D399)',
  Sapoculeano: 'linear-gradient(90deg, #1E3A8A,#7DD3FC )',
  Greensky: 'linear-gradient(90deg, #f472b6, #fde68a)',
  'Guild Azralon BR#1': 'linear-gradient(90deg, #fbbf24, #16a34a)',
  'Guild Azralon BR#2': 'linear-gradient(90deg, #16a34a, #ffff)',
}
