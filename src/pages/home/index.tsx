import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import { Modal as MuiModal, Box } from '@mui/material'
import { format, addDays } from 'date-fns'
import { getRuns } from '../../services/api/runs'
import { getServices, getServiceCategories } from '../../services/api/services'
import { useNavigate } from 'react-router-dom'
import services from '../../assets/services.png'
import schedule from '../../assets/schedule.png'
import fireImg from '../../assets/fire.png'
import gally from '../../assets/gally.png'

import { Service, ServiceCategory } from '../../types'

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
  const [weekRuns, setWeekRuns] = useState<Record<string, any[]>>({})
  const [servicesList, setServicesList] = useState<Service[]>([])
  const [loadingServices, setLoadingServices] = useState(false)
  const [categories, setCategories] = useState<ServiceCategory[]>([])

  // Pegue as roles do .env
  const TEAM_FREELANCER = import.meta.env.VITE_TEAM_FREELANCER
  const navigate = useNavigate()

  // Função utilitária para verificar se o usuário tem apenas o cargo freelancer (usando env)
  const isOnlyFreelancer = () => {
    return userRoles.length === 1 && userRoles[0] === TEAM_FREELANCER
  }

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
      }
    }

    fetchWeekRuns()
  }, [])

  // Buscar serviços e categorias para exibir nos cards
  useEffect(() => {
    const fetchServicesAndCategories = async () => {
      setLoadingServices(true)
      try {
        const [servicesRes, categoriesRes] = await Promise.all([
          getServices(),
          getServiceCategories(),
        ])
        setServicesList(servicesRes)
        setCategories(Array.isArray(categoriesRes) ? categoriesRes : [])
      } catch (err: any) {
        setServicesList([]) // Garante array vazio em erro
        setCategories([])
        setError({
          message:
            err?.response?.data?.message ||
            err.message ||
            'Erro ao buscar serviços ou categorias',
          response: err?.response?.data,
          status: err?.response?.status,
        })
      } finally {
        setLoadingServices(false)
      }
    }
    fetchServicesAndCategories()
  }, [userRoles])

  if (error) {
    return (
      <MuiModal open={!!error} onClose={() => setError(null)}>
        <Box className='absolute left-1/2 top-1/2 w-96 -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-gray-400 p-4 shadow-lg'>
          <ErrorComponent error={error} onClose={() => setError(null)} />
        </Box>
      </MuiModal>
    )
  }

  // Renderize a homepage para todos os usuários
  return (
    <div
      className='min-h-max w-full bg-cover bg-fixed bg-center bg-no-repeat'
      style={{ backgroundImage: `url(${gally})` }}
    >
      {/* Sessão Hero: Mensagem + Cards + Seta */}
      <section
        id='hero'
        className='mb-10 flex min-h-screen w-full flex-col items-center justify-center px-4'
      >
        <div className='relative mx-auto mt-8 flex w-full max-w-3xl flex-col items-center justify-center pb-8 pt-16'>
          <div className='absolute inset-0 z-0 rounded-2xl bg-black/60 backdrop-blur-md' />
          <div className='relative z-10 rounded-2xl px-8 py-6'>
            <h1 className='text-center text-3xl font-bold text-white drop-shadow-lg md:text-4xl'>
              Welcome to TheBakers{' '}
              <span className='font-bold text-red-700'>Hub</span>
              {username ? `, ${username}!` : ", [User's Name]!"}
            </h1>
            <p className='mt-4 max-w-2xl text-center text-base text-gray-200 md:text-lg'>
              At The Bakers, we strive to bring you the best experience in
              managing your schedules and pricing. Explore our offerings and see
              how we can help you achieve more.
            </p>
          </div>
        </div>
        <div className='mx-auto mt-8 max-w-[80%]'>
          <div className='flex w-full flex-col items-center'>
            <img
              src={services}
              alt='Services'
              className='w-80 drop-shadow-lg'
              draggable={false}
            />
            <h2 className='relative mb-10 text-center text-3xl font-extrabold tracking-tight text-white drop-shadow-lg md:text-5xl'>
              <span className='absolute left-1/2 top-full block h-1 w-24 -translate-x-1/2 rounded bg-gradient-to-r from-red-600 via-red-400 to-yellow-400 opacity-80'></span>
            </h2>
          </div>
          {/* Seção Hot Items e Categorias */}
          {loadingServices ? (
            <div className='col-span-full flex h-40 items-center justify-center'>
              <span className='text-lg text-white'>Loading services...</span>
            </div>
          ) : (
            <>
              {/* Hot Services */}
              {categories.length > 0 && servicesList.some((s) => s.hotItem) && (
                <div className='mb-8 flex flex-col gap-4'>
                  <div className='flex items-center gap-2'>
                    <span className='mb-2 mt-4 w-full rounded-lg bg-zinc-800/80 px-4 py-2 text-center text-xl font-bold text-yellow-300 shadow'>
                      🔥 HOT SERVICES
                    </span>
                  </div>
                  <div className='flex w-full justify-center'>
                    <div className='grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-5'>
                      {servicesList
                        .filter((s) => s.hotItem)
                        .map((service) => (
                          <div
                            key={service.id}
                            className={`relative flex min-h-[180px] w-full flex-col justify-between overflow-hidden rounded-xl border border-yellow-500 bg-zinc-900 p-6 shadow-lg transition-transform hover:scale-105`}
                            style={{
                              backgroundImage: `url(${fireImg})`,
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right bottom',
                              backgroundSize: '160px auto',
                            }}
                          >
                            <div className='relative z-10'>
                              <div className='mb-2 text-lg font-bold text-white'>
                                {service.name}
                              </div>
                              <div className='mb-4 text-sm text-gray-300'>
                                {service.description}
                              </div>
                            </div>
                            <div className='relative z-10 mt-auto text-lg font-bold text-red-500'>
                              {service.price.toLocaleString('en-US')}g
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
              {/* Agrupamento dos cards por categoria */}
              <div className='mx-auto flex flex-col gap-8'>
                {!servicesList || servicesList.length === 0 ? (
                  <div className='col-span-full flex h-40 items-center justify-center'>
                    <span className='text-lg text-white'>
                      No services found.
                    </span>
                  </div>
                ) : categories.length > 0 ? (
                  categories.map((category) => {
                    // Filtrar serviços da categoria, excluindo os hotItem
                    const servicesInCategory = servicesList.filter(
                      (service) =>
                        service.serviceCategoryId === category.id &&
                        !service.hotItem
                    )
                    if (servicesInCategory.length === 0) return null
                    return (
                      <div key={category.id} className='flex flex-col gap-4'>
                        <div className='mb-2 mt-4 rounded-lg bg-zinc-800/80 px-4 py-2 text-center text-xl font-bold text-yellow-300 shadow'>
                          {category.name}
                        </div>
                        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-5'>
                          {servicesInCategory.map((service) => (
                            <div
                              key={service.id}
                              className={`relative flex min-h-[180px] max-w-[350px] flex-col justify-between overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-lg transition-transform hover:scale-105 ${service.hotItem ? 'hot-flames' : ''}`}
                            >
                              <div className='relative z-10'>
                                <div className='mb-2 text-lg font-bold text-white'>
                                  {service.name}
                                </div>
                                <div className='mb-4 text-sm text-gray-300'>
                                  {service.description}
                                </div>
                              </div>
                              <div className='relative z-10 mt-auto text-lg font-bold text-red-500'>
                                {service.price.toLocaleString('en-US')}g
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className='col-span-full flex h-40 items-center justify-center'>
                    <span className='text-lg text-white'>
                      No categories found.
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
      {/* Segunda sessão: Tabelas dos dias da semana */}
      {!isOnlyFreelancer() && (
        <section
          id='semana-tabelas'
          className='mt-20 flex min-h-screen w-full flex-col items-center'
        >
          <div className='flex w-full flex-col items-center'>
            <img
              src={schedule}
              alt='Schedule'
              className='w-80 drop-shadow-lg'
            />
          </div>
          <div className='relative w-[96%] rounded-2xl bg-black/30 p-10 backdrop-blur-md'>
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
                  const runsSorted = (weekRuns[columnDateString] || [])
                    .slice()
                    .sort((a, b) => {
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
                      className='flex h-[900px] min-w-[300px] max-w-md flex-1 flex-col rounded-2xl bg-zinc-900 p-6 shadow-lg'
                    >
                      <div className='mb-4 text-2xl font-semibold text-white'>
                        <span className='inline-flex items-center gap-2'>
                          {daysEn[weekDayIdx]} {monthNumber}/{dayNumber}
                          {colIdx === 0 && (
                            <span className='rounded bg-yellow-400 px-2 py-1 text-xs font-bold text-black'>
                              Today
                            </span>
                          )}
                        </span>
                      </div>
                      <div
                        className='custom-scrollbar relative flex flex-col gap-2 pr-1'
                        style={{ minHeight: 600, overflowY: 'auto' }}
                      >
                        {runsToShow.length === 0 && (
                          <div className='flex h-full flex-1 items-center justify-center text-center text-gray-400'>
                            No runs scheduled
                          </div>
                        )}
                        {runsToShow.map((run) => (
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
                                <div className='text-xs text-gray-700'>
                                  Spots:{' '}
                                  <span className='font-semibold text-white'>
                                    {run.slotAvailable}
                                  </span>
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

const teamColors: { [key: string]: string } = {
  Padeirinho: '#ca8a04',
  Garçom: '#2563EB',
  Confeiteiros: '#f472b6',
  Jackfruit: '#16a34a',
  Milharal: '#fef08a',
  Raio: '#facc15',
  APAE: '#ef4444',
  DTM: '#9CA3AF',
  KFFC: '#34D399',
  Sapoculeano: '#7DD3FC',
  Greensky: '#fde68a',
  Rocket: '#a78bfa',
  'Guild Azralon BR#1': '#16a34a',
  'Guild Azralon BR#2': '#16a34a',
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
