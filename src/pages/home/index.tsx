import { useEffect, useState, useRef } from 'react'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import { getServices, getServiceCategories } from '../../services/api/services'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth-context'
import services from '../../assets/services_new.png'
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
                          // Filtrar serviços da categoria, incluindo os hotItem
                          const servicesInCategory = servicesList.filter(
                            (service) =>
                              service.serviceCategoryId === category.id
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
                                      <div className='relative my-10 flex min-h-[180px] w-full flex-col justify-between rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-lg transition-transform hover:z-10 hover:scale-105'>
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
        </>
      )}
    </div>
  )
}
