import { useEffect, useState, useRef } from 'react'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import { format, addDays } from 'date-fns'
import { getRuns } from '../../services/api/runs'
import { getServices, getServiceCategories } from '../../services/api/services'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth-context'
import services from '../../assets/services_new.png'
import schedule from '../../assets/schedule_new.png'
import fireImg from '../../assets/fire.png'
import manaforge from '../../assets/manaforge.png'
import { Service, ServiceCategory } from '../../types'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay } from 'swiper/modules'
import { Swiper as SwiperType } from 'swiper'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import 'swiper/css'
import 'swiper/css/pagination'

export function HomePage() {
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [weekRuns, setWeekRuns] = useState<Record<string, any[]>>({})
  const [servicesList, setServicesList] = useState<Service[]>([])
  const [loadingServices, setLoadingServices] = useState(false)
  const [categories, setCategories] = useState<ServiceCategory[]>([])

  // Refs para os Swipers
  const swiperRefs = useRef<{ [key: string]: SwiperType | null }>({})

  // Adiciona state para windowWidth
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1280
  )

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Função para pegar slidesPerView atual baseado nos breakpoints do Swiper
  const getSlidesPerView = () => {
    if (windowWidth >= 1280) return 5
    if (windowWidth >= 1024) return 4
    if (windowWidth >= 768) return 3
    if (windowWidth >= 640) return 2
    return 1
  }

  // Função para verificar se a paginação está ativa baseada no número de slides e breakpoints
  const isPaginationActive = (totalSlides: number) => {
    const slidesPerView = getSlidesPerView()
    return totalSlides > slidesPerView
  }

  // Funções de navegação para as setas
  const handlePrevSlide = (categoryId: string | number) => {
    const swiper = swiperRefs.current[String(categoryId)]
    if (swiper) {
      swiper.slidePrev()
    }
  }

  const handleNextSlide = (categoryId: string | number) => {
    const swiper = swiperRefs.current[String(categoryId)]
    if (swiper) {
      swiper.slideNext()
    }
  }

  // Pegue as roles do .env
  const TEAM_FREELANCER = import.meta.env.VITE_TEAM_FREELANCER
  const navigate = useNavigate()
  const { isAuthenticated, loading, userRoles, idDiscord } = useAuth()
  // Novo: username extraído do token
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    // Tenta extrair username do token salvo
    const token = localStorage.getItem('jwt')
    if (token) {
      try {
        const decoded: any = JSON.parse(atob(token.split('.')[1]))
        if (decoded.username) setUsername(decoded.username)
        else setUsername(null)
      } catch {
        setUsername(null)
      }
    }
  }, [])

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

  // Buscar serviços e categorias para exibir nos cards - apenas para usuários que não são freelancer
  useEffect(() => {
    // Se o usuário é apenas freelancer, não busca serviços
    if (isOnlyFreelancer()) {
      return
    }

    const fetchServicesAndCategories = async () => {
      setLoadingServices(true)
      try {
        const [servicesRes, categoriesRes] = await Promise.all([
          getServices(),
          getServiceCategories(),
        ])
        setServicesList(servicesRes)
        setCategories(Array.isArray(categoriesRes) ? categoriesRes : [])
        setError(null) // Clear any previous errors
      } catch (err: any) {
        setServicesList([]) // Garante array vazio em erro
        setCategories([])
        setError({
          message:
            err?.response?.data?.message ||
            err.message ||
            'Error fetching services or categories',
          response: err?.response?.data,
          status: err?.response?.status,
        })
      } finally {
        setLoadingServices(false)
      }
    }
    fetchServicesAndCategories()
  }, [userRoles])

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

  // Renderize a homepage para todos os usuários
  return (
    <div
      className='home-page relative w-full overflow-auto bg-cover bg-fixed bg-center bg-no-repeat'
      style={{ backgroundImage: `url(${manaforge})` }}
    >
      {error && <ErrorComponent error={error} onClose={() => setError(null)} />}
      {isOnlyFreelancer() ? (
        // Layout simples para freelancers - sem scroll, similar à página admin
        <div className='flex h-full w-full items-center justify-center'>
          <div className='relative mx-auto flex w-full max-w-3xl flex-col items-center justify-center'>
            <div className='absolute inset-0 z-10 rounded-2xl bg-black/60 backdrop-blur-md' />
            <div className='relative z-20 rounded-2xl px-8 py-6'>
              <h1 className='text-center text-3xl font-bold text-white drop-shadow-lg md:text-4xl'>
                Welcome to TheBakers{' '}
                <span className='font-bold text-purple-500'>Hub</span>
                {username
                  ? `, ${username}!`
                  : idDiscord
                    ? `, ${idDiscord}!`
                    : ", [User's Name]!"}
              </h1>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Sessão Hero: Mensagem + Cards + Seta */}
          <section
            id='hero'
            className='flex min-h-screen w-full flex-col items-center justify-center px-4'
          >
            <div className='relative mx-auto mt-12 flex w-full max-w-3xl flex-col items-center justify-center pb-8 pt-16'>
              <div className='absolute inset-0 z-10 rounded-2xl bg-black/60 backdrop-blur-md' />
              <div className='relative z-20 rounded-2xl px-8 py-6'>
                <h1 className='text-center text-3xl font-bold text-white drop-shadow-lg md:text-4xl'>
                  Welcome to TheBakers{' '}
                  <span className='font-extrabold text-purple-500'>Hub</span>
                  {username
                    ? `, ${username}!`
                    : idDiscord
                      ? `, ${idDiscord}!`
                      : ", [User's Name]!"}
                </h1>
                <p className='mt-4 max-w-2xl text-center text-base text-gray-200 md:text-lg'>
                  At The Bakers, we strive to bring you the best experience in
                  managing your schedules and pricing. Explore our offerings and
                  see how we can help you achieve more.
                </p>
              </div>
            </div>
            {/* Seção de serviços - apenas para usuários que não são freelancer */}
            {!isOnlyFreelancer() && (
              <div className='relative z-10 mx-auto max-w-[90%]'>
                <div className='flex w-full flex-col items-center'>
                  <img
                    src={services}
                    alt='Services'
                    className='w-96 drop-shadow-lg'
                    draggable={false}
                  />
                </div>
                {/* Seção Hot Items e Categorias */}
                {loadingServices ? (
                  <div className='col-span-full flex h-40 items-center justify-center'>
                    <span className='text-lg text-white'>
                      Loading services...
                    </span>
                  </div>
                ) : (
                  <>
                    {/* Hot Services */}
                    {categories.length > 0 &&
                      servicesList.some((s) => s.hotItem) && (
                        <div className='mb-8 flex flex-col gap-4'>
                          <div className='flex items-center gap-2'>
                            <span className='mb-2 w-full rounded-lg bg-zinc-800/80 px-4 py-2 text-center text-xl font-bold text-white shadow'>
                              🔥 HOT SERVICES
                            </span>
                          </div>
                          <div className='relative px-8 py-12'>
                            <Swiper
                              modules={[Pagination, Autoplay]}
                              spaceBetween={24}
                              slidesPerView={1}
                              breakpoints={{
                                640: {
                                  slidesPerView: 2,
                                },
                                768: {
                                  slidesPerView: 3,
                                },
                                1024: {
                                  slidesPerView: 4,
                                },
                                1280: {
                                  slidesPerView: 5,
                                },
                              }}
                              pagination={{
                                clickable: true,
                                dynamicBullets: true,
                              }}
                              autoplay={{
                                delay: 5000,
                                disableOnInteraction: false,
                                pauseOnMouseEnter: true,
                              }}
                              speed={800}
                              loop={isPaginationActive(
                                servicesList.filter((s) => s.hotItem).length
                              )}
                              className='w-full'
                              onSwiper={(swiper) => {
                                swiperRefs.current['hot-services'] = swiper
                              }}
                            >
                              {servicesList
                                .filter((s) => s.hotItem)
                                .map((service) => (
                                  <SwiperSlide key={service.id}>
                                    <div
                                      className={`relative flex min-h-[180px] w-full flex-col justify-between overflow-hidden rounded-xl border border-purple-500 bg-zinc-900 p-6 shadow-lg transition-transform hover:z-10 hover:scale-105`}
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
                                      <div className='relative z-10 mt-auto text-lg font-bold text-purple-500'>
                                        {service.price.toLocaleString('en-US')}g
                                      </div>
                                    </div>
                                  </SwiperSlide>
                                ))}
                            </Swiper>

                            {/* Setas de navegação para Hot Services - apenas se houver paginação ativa */}
                            {(() => {
                              const hotServices = servicesList.filter(
                                (s) => s.hotItem
                              )
                              const totalSlides = hotServices.length
                              const hasPagination =
                                isPaginationActive(totalSlides)

                              return hasPagination ? (
                                <>
                                  <div className='absolute left-0 top-1/2 z-30 flex -translate-x-16 -translate-y-1/2'>
                                    <button
                                      onClick={() =>
                                        handlePrevSlide('hot-services')
                                      }
                                      className='flex h-12 w-12 items-center justify-center rounded-full bg-purple-600/80 text-white shadow-lg transition-all hover:scale-110 hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400'
                                      aria-label='Previous slide for Hot Services'
                                    >
                                      <CaretLeft size={24} />
                                    </button>
                                  </div>

                                  <div className='absolute right-0 top-1/2 z-30 flex -translate-y-1/2 translate-x-16'>
                                    <button
                                      onClick={() =>
                                        handleNextSlide('hot-services')
                                      }
                                      className='flex h-12 w-12 items-center justify-center rounded-full bg-purple-600/80 text-white shadow-lg transition-all hover:scale-110 hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400'
                                      aria-label='Next slide for Hot Services'
                                    >
                                      <CaretRight size={24} />
                                    </button>
                                  </div>
                                </>
                              ) : null
                            })()}
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
                            <div
                              key={category.id}
                              className='relative flex flex-col gap-4'
                            >
                              <div className='mb-2 mt-4 rounded-lg bg-zinc-800/80 px-4 py-2 text-center text-xl font-bold text-white shadow'>
                                {category.name}
                              </div>
                              <div className='relative px-8 py-12'>
                                <Swiper
                                  modules={[Pagination, Autoplay]}
                                  spaceBetween={24}
                                  slidesPerView={1}
                                  breakpoints={{
                                    640: {
                                      slidesPerView: 2,
                                    },
                                    768: {
                                      slidesPerView: 3,
                                    },
                                    1024: {
                                      slidesPerView: 4,
                                    },
                                    1280: {
                                      slidesPerView: 5,
                                    },
                                  }}
                                  pagination={{
                                    clickable: true,
                                    dynamicBullets: true,
                                  }}
                                  autoplay={{
                                    delay: 5000 + category.id * 500,
                                    disableOnInteraction: false,
                                    pauseOnMouseEnter: true,
                                  }}
                                  speed={800}
                                  loop={isPaginationActive(
                                    servicesInCategory.length
                                  )}
                                  className='w-full'
                                  onSwiper={(swiper) => {
                                    swiperRefs.current[String(category.id)] =
                                      swiper
                                  }}
                                >
                                  {servicesInCategory.map((service) => (
                                    <SwiperSlide key={service.id}>
                                      <div
                                        className={`relative my-10 flex min-h-[180px] w-full flex-col justify-between rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-lg transition-transform hover:z-10 hover:scale-105 ${service.hotItem ? 'hot-flames' : ''}`}
                                      >
                                        <div className='relative z-10'>
                                          <div className='mb-2 text-lg font-bold text-white'>
                                            {service.name}
                                          </div>
                                          <div className='mb-4 text-sm text-gray-300'>
                                            {service.description}
                                          </div>
                                        </div>
                                        <div className='relative z-10 mt-auto text-lg font-bold text-purple-500'>
                                          {service.price.toLocaleString(
                                            'en-US'
                                          )}
                                          g
                                        </div>
                                      </div>
                                    </SwiperSlide>
                                  ))}
                                </Swiper>

                                {/* Setas de navegação ao lado da seção - apenas se houver paginação ativa */}
                                {(() => {
                                  const totalSlides = servicesInCategory.length
                                  const hasPagination =
                                    isPaginationActive(totalSlides)

                                  return hasPagination ? (
                                    <>
                                      <div className='absolute left-0 top-1/2 z-30 flex -translate-x-16 -translate-y-1/2'>
                                        <button
                                          onClick={() =>
                                            handlePrevSlide(category.id)
                                          }
                                          className='flex h-12 w-12 items-center justify-center rounded-full bg-purple-600/80 text-white shadow-lg transition-all hover:scale-110 hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400'
                                          aria-label={`Previous slide for ${category.name}`}
                                        >
                                          <CaretLeft size={24} />
                                        </button>
                                      </div>

                                      <div className='absolute right-0 top-1/2 z-30 flex -translate-y-1/2 translate-x-16'>
                                        <button
                                          onClick={() =>
                                            handleNextSlide(category.id)
                                          }
                                          className='flex h-12 w-12 items-center justify-center rounded-full bg-purple-600/80 text-white shadow-lg transition-all hover:scale-110 hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400'
                                          aria-label={`Next slide for ${category.name}`}
                                        >
                                          <CaretRight size={24} />
                                        </button>
                                      </div>
                                    </>
                                  ) : null
                                })()}
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
            )}
          </section>
          {/* Segunda sessão: Tabelas dos dias da semana */}
          {!isOnlyFreelancer() && (
            <section
              id='semana-tabelas'
              className='relative z-10 flex min-h-screen w-full flex-col items-center'
            >
              <div className='flex w-full flex-col items-center'>
                <img
                  src={schedule}
                  alt='Schedule'
                  className='w-96 drop-shadow-lg'
                />
              </div>
              <div className='relative z-10 mb-10 w-[96%] rounded-2xl bg-black/30 p-10 backdrop-blur-md'>
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
                      const filteredRuns = (
                        weekRuns[columnDateString] || []
                      ).filter(
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
        </>
      )}
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
