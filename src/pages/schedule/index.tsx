import { useEffect, useState } from 'react'
import { format, addDays } from 'date-fns'
import { getRuns } from '../../services/api/runs'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth-context'
import schedule from '../../assets/schedule_new.png'
import manaforge from '../../assets/manaforge.png'

export function SchedulePage() {
  const [weekRuns, setWeekRuns] = useState<Record<string, any[]>>({})
  const [loadingRuns, setLoadingRuns] = useState(true)
  const navigate = useNavigate()
  const { isAuthenticated, loading, userRoles } = useAuth()

  // Pegue as roles do .env
  const TEAM_FREELANCER = import.meta.env.VITE_TEAM_FREELANCER

  // Função utilitária para verificar se o usuário tem apenas o cargo freelancer (usando env)
  const isOnlyFreelancer = () => {
    return userRoles.length === 1 && userRoles[0] === TEAM_FREELANCER
  }

  // Verifica se o usuário está autenticado
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, loading, navigate])

  // Buscar runs da semana atual
  useEffect(() => {
    const fetchWeekRuns = async () => {
      setLoadingRuns(true)
      const today = new Date()
      const days: string[] = []
      for (let i = 0; i < 7; i++) {
        days.push(format(addDays(today, i), 'yyyy-MM-dd'))
      }
      try {
        // Supondo que a API aceite múltiplas datas ou precise de várias requisições
        const results = await Promise.all(
          days.map((date) =>
            getRuns(date).then((runs) => ({
              date,
              runs: runs || [],
            }))
          )
        )
        // Organiza as runs por data (yyyy-MM-dd)
        const runsByDate: Record<string, any[]> = {}
        results.forEach((result) => {
          runsByDate[result.date] = result.runs
        })
        setWeekRuns(runsByDate)
      } catch (err) {
        // ignore errors for now
      } finally {
        setLoadingRuns(false)
      }
    }

    fetchWeekRuns()
  }, [])

  // Mostra loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <p className='text-lg text-white'>Loading...</p>
      </div>
    )
  }

  // Redireciona se não estiver autenticado
  if (!isAuthenticated) {
    return null // O useEffect já vai redirecionar
  }

  // Se for apenas freelancer, não mostra a página de schedule
  if (isOnlyFreelancer()) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <p className='text-lg text-white'>Access denied for freelancers.</p>
      </div>
    )
  }

  return (
    <div
      className='schedule-page relative w-full overflow-auto bg-cover bg-fixed bg-center bg-no-repeat'
      style={{ backgroundImage: `url(${manaforge})` }}
    >
      {/* Sessão: Tabelas dos dias da semana */}
      <section
        id='semana-tabelas'
        className='relative z-10 mb-10 flex min-h-screen w-full flex-col items-center'
      >
        <div className='-mt-20 flex w-full flex-col items-center'>
          <img src={schedule} alt='Schedule' className='w-96 drop-shadow-lg' />
        </div>
        <div className='relative z-10 -mt-20 w-[96%] rounded-2xl bg-black/30 p-10 backdrop-blur-md'>
          <div className='flex w-full flex-wrap justify-center gap-4'>
            {(() => {
              // Dias em inglês
              const daysEn = [
                'Sunday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
              ]
              const todayDate = new Date()
              return Array.from({ length: 7 }, (_, colIdx) => {
                // Calcula a data do dia da coluna (hoje + colIdx)
                const columnDate = new Date(todayDate)
                columnDate.setDate(todayDate.getDate() + colIdx)
                const dayNumber = columnDate
                  .getDate()
                  .toString()
                  .padStart(2, '0')
                const monthNumber = (columnDate.getMonth() + 1)
                  .toString()
                  .padStart(2, '0')
                const weekDayIdx = columnDate.getDay()
                const columnDateString = format(columnDate, 'yyyy-MM-dd')
                // Nova ordem de prioridade dos times
                const teamOrder = [
                  'Garçom',
                  'Confeiteiros',
                  'Jackfruit',
                  'Insanos',
                  'APAE',
                  'Los Renegados',
                  'DTM',
                  'KFFC',
                  'Greensky',
                  'Guild Azralon BR#1',
                  'Guild Azralon BR#2',
                  'Rocket',
                  'Padeirinho',
                  'Milharal',
                ]
                // Filtra as runs dos times MPlus e Leveling
                const filteredRuns = (weekRuns[columnDateString] || []).filter(
                  (run) =>
                    run.idTeam !== import.meta.env.VITE_TEAM_MPLUS &&
                    run.idTeam !== import.meta.env.VITE_TEAM_LEVELING
                )

                // Ordena as runs do dia pelo horário e prioridade do time
                const runsSorted = filteredRuns.slice().sort((a, b) => {
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
                const runsToShow = runsSorted.length ? runsSorted : []
                return (
                  <div
                    key={daysEn[weekDayIdx] + monthNumber + dayNumber}
                    className='flex h-[900px] min-w-[300px] max-w-[400px] flex-1 flex-col rounded-2xl bg-zinc-900 p-6 shadow-lg'
                  >
                    <div className='mb-4 text-2xl font-semibold text-white'>
                      <span className='inline-flex items-center gap-2'>
                        {daysEn[weekDayIdx]} {monthNumber}/{dayNumber}
                        {colIdx === 0 && (
                          <span className='rounded bg-purple-400 px-2 py-1 text-xs font-bold text-black'>
                            Today
                          </span>
                        )}
                      </span>
                    </div>
                    <div
                      className='custom-scrollbar relative flex flex-col gap-2 pr-1'
                      style={{ minHeight: 600, overflowY: 'auto' }}
                    >
                      {loadingRuns ? (
                        <div className='flex h-full flex-1 items-center justify-center text-center text-gray-400'>
                          <div className='flex flex-col items-center gap-2'>
                            <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-purple-400'></div>
                            <span>Loading runs...</span>
                          </div>
                        </div>
                      ) : runsToShow.length === 0 ? (
                        <div className='flex h-full flex-1 items-center justify-center text-center text-gray-400'>
                          No runs scheduled
                        </div>
                      ) : (
                        runsToShow.map((run) => (
                          <div
                            key={run.id}
                            className='flex cursor-pointer flex-col rounded-xl bg-zinc-800 p-4 shadow transition hover:bg-zinc-700'
                            style={{
                              background: teamColors[run.team] || undefined,
                            }}
                            onDoubleClick={() =>
                              navigate(`/bookings-na/run/${run.id}`)
                            }
                          >
                            <div className='mb-1 text-lg font-bold text-white'>
                              {formatTime12h(run.time)} -{' '}
                              <span className='text-base'>
                                {run.difficulty}
                                {run.loot ? ` - ${run.loot}` : ''}
                              </span>
                            </div>
                            {typeof run.maxBuyers === 'number' &&
                              typeof run.slotAvailable === 'number' && (
                                <div className='text-xs text-white'>
                                  Spots:{' '}
                                  <span className='font-semibold text-white'>
                                    {run.slotAvailable}
                                  </span>
                                </div>
                              )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })
            })()}
          </div>
        </div>
      </section>
    </div>
  )
}

const teamColors: { [key: string]: string } = {
  Garçom: '#2563EB',
  Confeiteiros: '#EC4899',
  Jackfruit: '#16A34A',
  Insanos: '#1E40AF',
  APAE: '#F87171',
  'Los Renegados': '#F59E0B',
  DTM: '#8B5CF6',
  KFFC: '#047857',
  Greensky: '#BE185D',
  'Guild Azralon BR#1': '#0D9488',
  'Guild Azralon BR#2': '#1D4ED8',
  Rocket: '#B91C1C',
  Padeirinho: '#EA580C',
  Milharal: '#FEF08A',
}

// Função utilitária para converter "HH:mm" para 12h com AM/PM
function formatTime12h(time: string) {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  if (isNaN(h) || isNaN(m)) return time
  const hour = ((h + 11) % 12) + 1
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`
}
