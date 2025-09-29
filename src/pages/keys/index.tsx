import { useEffect, useState, useRef } from 'react'
import { KeysDataGrid } from './keys-data-grid'
import { DateFilter } from '../../components/date-filter'
import { format } from 'date-fns'
import {
  UserPlus,
  CaretLeft,
  CaretRight,
  Pencil,
  Plus,
  Trash,
} from '@phosphor-icons/react'
import { AddKeyRun } from '../../components/add-key-run'
import { AddService } from '../../components/add-service'
import { useAuth } from '../../context/auth-context'
import { api } from '../../services/axiosConfig'
import axios from 'axios'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import { RunData } from '../../types/runs-interface'
import { Service, ServiceCategory } from '../../types'
import {
  getServices,
  getServiceCategories,
  deleteService,
} from '../../services/api/services'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay } from 'swiper/modules'
import { Swiper as SwiperType } from 'swiper'
import Button from '@mui/material/Button'
import Swal from 'sweetalert2'
import 'swiper/css'
import 'swiper/css/pagination'
import fireImg from '../../assets/fire.png'

export function KeysPage() {
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [rows, setRows] = useState<RunData[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isAddRunOpen, setIsAddRunOpen] = useState(false)
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [servicesList, setServicesList] = useState<Service[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [, setLoadingServices] = useState(false)
  const { userRoles } = useAuth()

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

  // Verifica se o usuário possui o papel necessário
  const hasRequiredRole = (requiredRoles: string[]) =>
    requiredRoles.some((required) => userRoles.includes(required.toString()))

  // Handle errors from child components
  const handleError = (errorDetails: ErrorDetails) => {
    setError(errorDetails)
  }

  // Clear error when successful operations occur
  const clearError = () => {
    setError(null)
  }

  // Busca os dados das corridas na API
  const fetchRuns = async (isUserRequest: boolean) => {
    if (isUserRequest && selectedDate) setIsLoading(true)

    try {
      if (!selectedDate) {
        setRows([])
        return
      }

      const { data } = await api.get('/run', {
        params: { date: format(selectedDate, 'yyyy-MM-dd') },
      })

      // Filtra apenas as runs do time específico
      const filteredRuns = (data.info || []).filter(
        (run: any) => run.idTeam === import.meta.env.VITE_TEAM_MPLUS
      )

      setRows(
        filteredRuns.map((run: any) => ({
          ...run,
          buyersCount: `${run.maxBuyers - run.slotAvailable}/${run.maxBuyers}`,
        }))
      )
      clearError() // Clear error on successful API call
    } catch (error) {
      const errorDetails = axios.isAxiosError(error)
        ? {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          }
        : { message: 'Unexpected error', response: error }
      console.error('Error:', errorDetails)
      setError(errorDetails)
    } finally {
      if (isUserRequest) setIsLoading(false)
    }
  }

  // Busca os serviços e categorias
  const fetchServicesAndCategories = async () => {
    setLoadingServices(true)
    try {
      const [servicesRes, categoriesRes] = await Promise.all([
        getServices(),
        getServiceCategories(),
      ])
      setServicesList(servicesRes)
      setCategories(Array.isArray(categoriesRes) ? categoriesRes : [])
      clearError()
    } catch (err: any) {
      setServicesList([])
      setCategories([])
      const errorDetails = {
        message:
          err?.response?.data?.message ||
          err.message ||
          'Error fetching services or categories',
        response: err?.response?.data,
        status: err?.response?.status,
      }
      setError(errorDetails)
    } finally {
      setLoadingServices(false)
    }
  }

  const handleEditRunSuccess = () => {
    Swal.fire({
      title: 'Success!',
      text: 'Run edited successfully!',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
    })
  }

  // Handle service operations
  const handleServiceAdded = () => {
    fetchServicesAndCategories()
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
    setIsAddServiceOpen(true)
  }

  const handleAddService = () => {
    setEditingService(null)
    setIsAddServiceOpen(true)
  }

  const handleDeleteService = (service: Service) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This service will be deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      cancelButtonColor: '#888',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result: any) => {
      if (result.isConfirmed) {
        try {
          await deleteService(service.id)
          setServicesList((prev) => prev.filter((s) => s.id !== service.id))
          Swal.fire('Deleted!', 'Service has been deleted.', 'success')
        } catch (error) {
          const errorDetails = axios.isAxiosError(error)
            ? {
                message: error.response?.data?.message || error.message,
                response: error.response?.data,
                status: error.response?.status,
              }
            : { message: 'Unexpected error', response: error }

          handleError(errorDetails)
        }
      }
    })
  }

  // Busca inicial e configuração de polling
  useEffect(() => {
    fetchRuns(true)
    fetchServicesAndCategories()

    const interval = setInterval(() => fetchRuns(false), 20000)
    return () => clearInterval(interval)
  }, [selectedDate])

  // Filtra os serviços da categoria KEYS
  const keysCategory = categories.find((cat) => cat.name === 'KEYS')
  const keysServices = keysCategory
    ? servicesList.filter(
        (service) => service.serviceCategoryId === keysCategory.id
      )
    : []

  return (
    <div className='flex h-screen w-full flex-col items-center overflow-y-auto'>
      {error && <ErrorComponent error={error} onClose={clearError} />}

      <DateFilter onDaySelect={setSelectedDate} />
      <div
        className='mx-auto mt-6 flex w-[90%] flex-col p-4 pb-20'
        style={{
          minHeight: '500px',
          // Ajusta a altura para ocupar o espaço disponível
          paddingBottom: '80px', // Margem inferior adequada
        }}
      >
        {/* Deve possuir o papel de Chefe de Cozinha para adicionar corridas. */}
        {hasRequiredRole([
          import.meta.env.VITE_TEAM_CHEFE,
          import.meta.env.VITE_TEAM_MPLUS,
        ]) && (
          <div className='mb-2 flex gap-2 self-start'>
            <Button
              variant='contained'
              sx={{
                backgroundColor: 'rgb(147, 51, 234)',
                '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
                padding: '10px 20px',
                boxShadow: 3,
                display: 'flex',
                alignItems: 'center',
              }}
              startIcon={<UserPlus size={18} />}
              onClick={() => setIsAddRunOpen(true)}
            >
              Add Run
            </Button>
          </div>
        )}

        <div className='mb-10 flex flex-1 flex-col'>
          <KeysDataGrid
            data={rows}
            isLoading={isLoading}
            onDeleteSuccess={() => fetchRuns(true)}
            onEditSuccess={handleEditRunSuccess}
            onError={handleError}
          />
        </div>

        {/* Seção de Serviços KEYS */}
        {!isLoading && keysServices.length > 0 && (
          <div>
            <div className='mb-4 flex items-center justify-between rounded-lg bg-zinc-800/80 px-4 py-2 text-center text-xl font-bold text-white shadow'>
              <div className='flex-1'></div>
              <div className='flex-1'>KEYS</div>
              <div className='flex flex-1 justify-end'>
                {hasRequiredRole([
                  import.meta.env.VITE_TEAM_CHEFE,
                  import.meta.env.VITE_TEAM_MPLUS,
                ]) && (
                  <button
                    onClick={handleAddService}
                    className='flex h-8 w-8 items-center justify-center rounded-full bg-purple-600/80 text-white shadow-lg transition-all hover:scale-110 hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400'
                    aria-label='Add new KEYS service'
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>
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
                loop={isPaginationActive(keysServices.length)}
                className='w-full'
                onSwiper={(swiper) => {
                  swiperRefs.current['keys'] = swiper
                }}
              >
                {keysServices.map((service) => (
                  <SwiperSlide key={service.id}>
                    <div
                      className={`relative flex min-h-[180px] w-full flex-col justify-between overflow-hidden rounded-xl border p-6 shadow-lg transition-transform hover:z-10 hover:scale-105 ${
                        service.hotItem
                          ? 'border-purple-500 bg-zinc-900'
                          : 'border-zinc-700 bg-zinc-900'
                      }`}
                      style={
                        service.hotItem
                          ? {
                              backgroundImage: `url(${fireImg})`,
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right bottom',
                              backgroundSize: '160px auto',
                            }
                          : {}
                      }
                    >
                      {/* Edit and Delete buttons */}
                      {hasRequiredRole([
                        import.meta.env.VITE_TEAM_CHEFE,
                        import.meta.env.VITE_TEAM_MPLUS,
                      ]) && (
                        <div className='absolute right-2 top-2 z-20 flex gap-1'>
                          <button
                            onClick={() => handleEditService(service)}
                            className='flex h-6 w-6 items-center justify-center rounded-full bg-purple-600/80 text-white shadow-lg transition-all hover:scale-110 hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400'
                            aria-label='Edit service'
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteService(service)}
                            className='flex h-6 w-6 items-center justify-center rounded-full bg-red-600/80 text-white shadow-lg transition-all hover:scale-110 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400'
                            aria-label='Delete service'
                          >
                            <Trash size={12} />
                          </button>
                        </div>
                      )}

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

              {/* Setas de navegação ao lado da seção - apenas se houver paginação ativa */}
              {(() => {
                const totalSlides = keysServices.length
                const hasPagination = isPaginationActive(totalSlides)

                return hasPagination ? (
                  <>
                    <div className='absolute left-0 top-1/2 z-30 flex -translate-x-16 -translate-y-1/2'>
                      <button
                        onClick={() => handlePrevSlide('keys')}
                        className='flex h-12 w-12 items-center justify-center rounded-full bg-purple-600/80 text-white shadow-lg transition-all hover:scale-110 hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400'
                        aria-label='Previous slide for KEYS services'
                      >
                        <CaretLeft size={24} />
                      </button>
                    </div>

                    <div className='absolute right-0 top-1/2 z-30 flex -translate-y-1/2 translate-x-16'>
                      <button
                        onClick={() => handleNextSlide('keys')}
                        className='flex h-12 w-12 items-center justify-center rounded-full bg-purple-600/80 text-white shadow-lg transition-all hover:scale-110 hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400'
                        aria-label='Next slide for KEYS services'
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

        {isAddRunOpen && (
          <AddKeyRun
            onClose={() => setIsAddRunOpen(false)}
            onRunAddedReload={() => fetchRuns(true)}
            onError={handleError}
          />
        )}

        {isAddServiceOpen && (
          <AddService
            open={isAddServiceOpen}
            onClose={() => {
              setIsAddServiceOpen(false)
              setEditingService(null)
            }}
            onServiceAdded={handleServiceAdded}
            onError={handleError}
            editingService={editingService}
            categoryId={keysCategory?.id}
          />
        )}
      </div>
    </div>
  )
}
