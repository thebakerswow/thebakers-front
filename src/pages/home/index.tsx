import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import { Modal as MuiModal, Box } from '@mui/material'
import { format, startOfWeek, addDays } from 'date-fns'
import { api } from '../../services/axiosConfig'
import { useNavigate } from 'react-router-dom'
import services from '../../assets/services.png'
import schedule from '../../assets/schedule.png'
import fireImg from '../../assets/fire.png'
import gally from '../../assets/gally.png'

// Tipos para os serviços
interface Service {
  id: number
  name: string
  description: string
  price: number
  serviceCategoryId: number
  hotItem?: boolean
}

interface Category {
  id: number
  name: string
}

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
  const [servicesList, setServicesList] = useState<Service[]>([])
  const [loadingServices, setLoadingServices] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  // Pegue as roles do .env
  const TEAM_ADVERTISER = import.meta.env.VITE_TEAM_ADVERTISER
  const TEAM_CHEFE = import.meta.env.VITE_TEAM_CHEFE
  const navigate = useNavigate()

  // Mova a função para cima, antes dos efeitos
  const hasRequiredRole = (requiredRoles: string[]): boolean => {
    return requiredRoles.some((required) =>
      userRoles.some((userRole) => userRole.toString() === required.toString())
    )
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

  // Buscar serviços e categorias para exibir nos cards
  useEffect(() => {
    if (!hasRequiredRole([TEAM_ADVERTISER, TEAM_CHEFE])) return
    const fetchServicesAndCategories = async () => {
      setLoadingServices(true)
      try {
        const [servicesRes, categoriesRes] = await Promise.all([
          api.get('/services'),
          api.get('/services-categories'),
        ])
        setServicesList(servicesRes.data.info)
        setCategories(
          Array.isArray(categoriesRes.data.info) ? categoriesRes.data.info : []
        )
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
  }, [TEAM_ADVERTISER, TEAM_CHEFE, userRoles])

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
      <div
        className='min-h-max w-full bg-cover bg-fixed bg-center bg-no-repeat'
        style={{ backgroundImage: `url(${gally})` }}
      >
        {/* Sessão Hero: Mensagem + Cards + Seta */}
        <section
          id='hero'
          className='flex min-h-screen w-full flex-col items-center justify-center px-4'
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
                managing your schedules and pricing. Explore our offerings and
                see how we can help you achieve more.
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
                {categories.length > 0 &&
                  servicesList.some((s) => s.hotItem) && (
                    <div className='mb-8 flex flex-col gap-4'>
                      <div className='flex items-center gap-2'>
                        <span className='mb-2 mt-4 w-full rounded-lg bg-zinc-800/80 px-4 py-2 text-center text-xl font-bold text-yellow-300 shadow'>
                          🔥 HOT SERVICES
                        </span>
                      </div>
                      <div className='flex flex-wrap justify-center gap-6'>
                        {servicesList
                          .filter((s) => s.hotItem)
                          .map((service) => (
                            <div
                              key={service.id}
                              className={`relative flex min-h-[180px] min-w-[350px] flex-col justify-between overflow-hidden rounded-xl border border-yellow-500 bg-zinc-900 p-6 shadow-lg transition-transform hover:scale-105`}
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
                          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4'>
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
                const runsSorted = (weekRuns[idx] || [])
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
                return (
                  <div
                    key={dia}
                    className='flex h-[900px] min-w-[300px] max-w-md flex-1 flex-col rounded-2xl bg-zinc-900 p-6 shadow-lg'
                  >
                    <div className='mb-4 text-2xl font-semibold text-white'>
                      {daysEn[idx]}
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
              })}
            </div>
          </div>
        </section>
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
