import { useEffect, useRef, useState } from 'react'
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
import { createSpecialRun } from '../../services/api/runs'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay } from 'swiper/modules'
import { Swiper as SwiperType } from 'swiper'
import Button from '@mui/material/Button'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'
import 'swiper/css'
import 'swiper/css/pagination'
import fireImg from '../../assets/fire.png'
import { RUN_FLAG_QUERY_PARAM, RunScreenFlag } from '../../constants/run-flags'
import { SharedRunsDataGrid } from './shared-runs-data-grid'

interface SpecialRunsPageProps {
  runScreen: RunScreenFlag
  teamId: string
  manageTeamRole: string
  detailsRoutePrefix: string
  AddRunComponent: React.ComponentType<{
    onClose: () => void
    onRunAddedReload: () => void
    onError?: (error: ErrorDetails) => void
  }>
  servicesCategoryName?: string
  servicesTitle?: string
}

export function SpecialRunsPage({
  runScreen,
  teamId,
  manageTeamRole,
  detailsRoutePrefix,
  AddRunComponent,
  servicesCategoryName,
  servicesTitle,
}: SpecialRunsPageProps) {
  const navigate = useNavigate()
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [rows, setRows] = useState<RunData[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [isAddRunOpen, setIsAddRunOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [servicesList, setServicesList] = useState<Service[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [, setLoadingServices] = useState(false)
  const { userRoles } = useAuth()
  const swiperRefs = useRef<{ [key: string]: SwiperType | null }>({})
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1280
  )

  const hasRequiredRole = (requiredRoles: string[]) =>
    requiredRoles.some((required) => userRoles.includes(required.toString()))

  const clearError = () => setError(null)
  const handleError = (errorDetails: ErrorDetails) => setError(errorDetails)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const fetchRuns = async (isUserRequest: boolean) => {
    if (isUserRequest && selectedDate) setIsLoading(true)
    try {
      if (!selectedDate) {
        setRows([])
        return
      }
      const { data } = await api.get('/run', {
        params: {
          date: format(selectedDate, 'yyyy-MM-dd'),
          [RUN_FLAG_QUERY_PARAM]: runScreen,
        },
      })
      const filteredRuns = (data.info || []).filter((run: any) => run.idTeam === teamId)
      let mappedRuns = filteredRuns.map((run: any) => ({
        ...run,
        buyersCount: `${run.maxBuyers - run.slotAvailable}/${run.maxBuyers}`,
      }))

      // Para telas especiais, cria automaticamente uma run padrão caso não exista no dia.
      if (isUserRequest && selectedDate && mappedRuns.length === 0) {
        const runTypeByScreen: Record<string, string> = {
          keys: 'Keys',
          leveling: 'Leveling',
          pvp: 'PVP',
        }

        await createSpecialRun(
          format(selectedDate, 'yyyy-MM-dd'),
          runTypeByScreen[runScreen] || ''
        )

        const refreshed = await api.get('/run', {
          params: {
            date: format(selectedDate, 'yyyy-MM-dd'),
            [RUN_FLAG_QUERY_PARAM]: runScreen,
          },
        })

        mappedRuns = ((refreshed.data.info || []) as any[])
          .filter((run) => run.idTeam === teamId)
          .map((run) => ({
            ...run,
            buyersCount: `${run.maxBuyers - run.slotAvailable}/${run.maxBuyers}`,
          }))
      }

      setRows(mappedRuns)
      if (isUserRequest && mappedRuns.length > 0) {
        navigate(`${detailsRoutePrefix}/${mappedRuns[0].id}`)
      }
      clearError()
    } catch (error) {
      const errorDetails = axios.isAxiosError(error)
        ? {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          }
        : { message: 'Unexpected error', response: error }
      setError(errorDetails)
    } finally {
      if (isUserRequest) setIsLoading(false)
    }
  }

  const fetchServicesAndCategories = async () => {
    if (!servicesCategoryName) return
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
      setError({
        message: err?.response?.data?.message || err.message || 'Error fetching services or categories',
        response: err?.response?.data,
        status: err?.response?.status,
      })
    } finally {
      setLoadingServices(false)
    }
  }

  useEffect(() => {
    fetchRuns(true)
    if (servicesCategoryName) fetchServicesAndCategories()
    const interval = setInterval(() => fetchRuns(false), 20000)
    return () => clearInterval(interval)
  }, [selectedDate, runScreen, teamId, servicesCategoryName])

  const category = servicesCategoryName
    ? categories.find((cat) => cat.name === servicesCategoryName)
    : undefined
  const services = category
    ? servicesList.filter((service) => service.serviceCategoryId === category.id)
    : []

  const getSlidesPerView = () => {
    if (windowWidth >= 1280) return 5
    if (windowWidth >= 1024) return 4
    if (windowWidth >= 768) return 3
    if (windowWidth >= 640) return 2
    return 1
  }

  const hasPagination = services.length > getSlidesPerView()

  return (
    <div className='flex h-screen w-full flex-col items-center overflow-y-auto'>
      {error && <ErrorComponent error={error} onClose={clearError} />}
      <DateFilter onDaySelect={setSelectedDate} />
      <div className='mx-auto mt-6 flex w-[90%] flex-col p-4 pb-20' style={{ minHeight: '500px' }}>
        {hasRequiredRole([import.meta.env.VITE_TEAM_CHEFE, manageTeamRole]) && (
          <div className='mb-2 flex gap-2 self-start'>
            <Button
              variant='contained'
              sx={{
                backgroundColor: 'rgb(147, 51, 234)',
                '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
                padding: '10px 20px',
                boxShadow: 3,
              }}
              startIcon={<UserPlus size={18} />}
              onClick={() => setIsAddRunOpen(true)}
            >
              Add Run
            </Button>
          </div>
        )}

        <div className='mb-10 flex flex-1 flex-col'>
          <SharedRunsDataGrid
            data={rows}
            isLoading={isLoading}
            onDeleteSuccess={() => fetchRuns(true)}
            onError={handleError}
            runScreen={runScreen}
            detailsRoutePrefix={detailsRoutePrefix}
            manageTeamRole={manageTeamRole}
          />
        </div>

        {!isLoading && servicesCategoryName && services.length > 0 && (
          <div>
            <div className='mb-4 flex items-center justify-between rounded-lg bg-zinc-800/80 px-4 py-2 text-center text-xl font-bold text-white shadow'>
              <div className='flex-1'></div>
              <div className='flex-1'>{servicesTitle || servicesCategoryName}</div>
              <div className='flex flex-1 justify-end'>
                {hasRequiredRole([import.meta.env.VITE_TEAM_CHEFE, manageTeamRole]) && (
                  <button
                    onClick={() => { setEditingService(null); setIsAddServiceOpen(true) }}
                    className='flex h-8 w-8 items-center justify-center rounded-full bg-purple-600/80 text-white shadow-lg transition-all hover:scale-110 hover:bg-purple-500'
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
                breakpoints={{ 640: { slidesPerView: 2 }, 768: { slidesPerView: 3 }, 1024: { slidesPerView: 4 }, 1280: { slidesPerView: 5 } }}
                pagination={{ clickable: true, dynamicBullets: true }}
                autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
                speed={800}
                loop={hasPagination}
                className='w-full'
                onSwiper={(swiper) => { swiperRefs.current['services'] = swiper }}
              >
                {services.map((service) => (
                  <SwiperSlide key={service.id}>
                    <div className={`relative flex min-h-[180px] w-full flex-col justify-between overflow-hidden rounded-xl border p-6 shadow-lg ${service.hotItem ? 'border-purple-500 bg-zinc-900' : 'border-zinc-700 bg-zinc-900'}`} style={service.hotItem ? { backgroundImage: `url(${fireImg})`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right bottom', backgroundSize: '160px auto' } : {}}>
                      {hasRequiredRole([import.meta.env.VITE_TEAM_CHEFE, manageTeamRole]) && (
                        <div className='absolute right-2 top-2 z-20 flex gap-1'>
                          <button onClick={() => { setEditingService(service); setIsAddServiceOpen(true) }} className='flex h-6 w-6 items-center justify-center rounded-full bg-purple-600/80 text-white'><Pencil size={12} /></button>
                          <button onClick={async () => {
                            const result = await Swal.fire({ title: 'Are you sure?', text: 'This service will be deleted!', icon: 'warning', showCancelButton: true })
                            if (!result.isConfirmed) return
                            await deleteService(service.id)
                            setServicesList((prev) => prev.filter((s) => s.id !== service.id))
                          }} className='flex h-6 w-6 items-center justify-center rounded-full bg-red-600/80 text-white'><Trash size={12} /></button>
                        </div>
                      )}
                      <div className='relative z-10'>
                        <div className='mb-2 text-lg font-bold text-white'>{service.name}</div>
                        <div className='mb-4 text-sm text-gray-300'>{service.description}</div>
                      </div>
                      <div className='relative z-10 mt-auto text-lg font-bold text-purple-500'>
                        {service.price.toLocaleString('en-US')}g
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              {hasPagination && (
                <>
                  <div className='absolute left-0 top-1/2 z-30 flex -translate-x-16 -translate-y-1/2'>
                    <button onClick={() => swiperRefs.current['services']?.slidePrev()} className='flex h-12 w-12 items-center justify-center rounded-full bg-purple-600/80 text-white'><CaretLeft size={24} /></button>
                  </div>
                  <div className='absolute right-0 top-1/2 z-30 flex -translate-y-1/2 translate-x-16'>
                    <button onClick={() => swiperRefs.current['services']?.slideNext()} className='flex h-12 w-12 items-center justify-center rounded-full bg-purple-600/80 text-white'><CaretRight size={24} /></button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {isAddRunOpen && (
          <AddRunComponent
            onClose={() => setIsAddRunOpen(false)}
            onRunAddedReload={() => fetchRuns(true)}
            onError={handleError}
          />
        )}

        {isAddServiceOpen && servicesCategoryName && (
          <AddService
            open={isAddServiceOpen}
            onClose={() => {
              setIsAddServiceOpen(false)
              setEditingService(null)
            }}
            onServiceAdded={fetchServicesAndCategories}
            onError={handleError}
            editingService={editingService}
            categoryId={category?.id}
          />
        )}
      </div>
    </div>
  )
}
