import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'
import { shouldShowRestrictedHome } from '../../utils/roleUtils'
import { CategoryFilters } from './components/CategoryFilters'
import { ServiceCard } from './components/ServiceCard'
import { ServicesSkeleton } from './components/ServicesSkeleton'
import { getWeekDatesEST } from '../../utils/timezoneUtils'
import { Schedule } from './components/Schedule'
import { fetchHomeServicesAndCategories, fetchWeekRuns } from './services/homeApi'
import {
  HomeCategoryWithServices,
  HomeWeekRuns,
  HomeServicesData,
} from './types/home'

export function HomePage() {
  const [servicesList, setServicesList] = useState<HomeServicesData['services']>([])
  const [loadingServices, setLoadingServices] = useState(false)
  const [categories, setCategories] = useState<HomeServicesData['categories']>([])
  const [weekRuns, setWeekRuns] = useState<HomeWeekRuns>({})
  const [loadingRuns, setLoadingRuns] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [username, setUsername] = useState<string | null>(null)

  const navigate = useNavigate()
  const { isAuthenticated, loading, userRoles, idDiscord } = useAuth()

  const dates = useMemo(() => getWeekDatesEST(), [])

  useEffect(() => {
    const token = localStorage.getItem('jwt')
    if (!token) return
    try {
      const decoded: any = JSON.parse(atob(token.split('.')[1]))
      setUsername(decoded.username || null)
    } catch {
      setUsername(null)
    }
  }, [])

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate('/login')
  }, [isAuthenticated, loading, navigate])

  useEffect(() => {
    const loadWeekRuns = async () => {
      setLoadingRuns(true)
      try {
        const mapped = await fetchWeekRuns(dates)
        setWeekRuns(mapped)
      } finally {
        setLoadingRuns(false)
      }
    }

    const loadServicesAndCategories = async () => {
      setLoadingServices(true)
      try {
        const response = await fetchHomeServicesAndCategories()
        setServicesList(response.services)
        setCategories(response.categories)
      } finally {
        setLoadingServices(false)
      }
    }

    void loadWeekRuns()
    if (!shouldShowRestrictedHome(userRoles)) void loadServicesAndCategories()
  }, [userRoles, dates])

  const categoriesWithServices = useMemo(() => {
    const servicesByCategoryId = new Map<number, HomeServicesData['services']>()
    servicesList.forEach((service) => {
      const list = servicesByCategoryId.get(service.serviceCategoryId)
      if (list) {
        list.push(service)
      } else {
        servicesByCategoryId.set(service.serviceCategoryId, [service])
      }
    })

    const grouped: HomeCategoryWithServices[] = categories
      .map((category) => ({
        category,
        services: servicesByCategoryId.get(category.id) || [],
      }))
      .filter((item) => item.services.length > 0)

    const knownCategoryIds = new Set(categories.map((category) => category.id))
    const orphanServices = servicesList.filter(
      (service) => !knownCategoryIds.has(service.serviceCategoryId)
    )

    if (orphanServices.length) {
      grouped.push({
        category: { id: -1, name: 'Other' },
        services: orphanServices,
      })
    }

    return grouped
  }, [categories, servicesList])

  const filteredCategories = useMemo(() => {
    if (!activeCategory) return categoriesWithServices
    return categoriesWithServices.filter(
      (entry) => String(entry.category.id) === activeCategory
    )
  }, [activeCategory, categoriesWithServices])

  const scrollToSchedule = () => {
    document.getElementById('schedule-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center gap-3 text-white'>
        <LoadingSpinner size='lg' label='Loading home page' />
        <p className='text-lg'>Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className='relative flex min-h-screen w-full flex-col bg-transparent text-white'>
      {shouldShowRestrictedHome(userRoles) ? (
        <div className='relative z-10 mx-auto flex min-h-screen w-full max-w-[1720px] items-center justify-center px-4 sm:px-6 lg:px-12 2xl:px-16'>
          <div className='w-full max-w-3xl rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur-sm'>
            <h1 className='text-3xl font-bold text-white md:text-4xl'>
              Welcome back{username ? `, ${username}` : idDiscord ? `, ${idDiscord}` : ''}.
            </h1>
            <p className='mt-4 text-neutral-400'>
              Your account has restricted access mode enabled.
            </p>
          </div>
        </div>
      ) : (
        <>
          <section className='relative z-10 pb-12 pt-16 sm:pb-16 sm:pt-20'>
            <div className='mx-auto w-full max-w-[1720px] px-4 text-center sm:px-6 lg:px-12 2xl:px-16'>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className='mb-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 backdrop-blur-sm'>
                  <div className='h-2 w-2 animate-pulse rounded-full bg-purple-500' />
                  <span className='text-sm font-medium uppercase tracking-wider text-neutral-400'>
                    The Bakers
                  </span>
                </div>
                <h1 className='font-space-grotesk text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl'>
                  <span className='text-white'>Premium</span>{' '}
                  <span className='bg-gradient-to-r from-purple-400 via-violet-500 to-fuchsia-600 bg-clip-text text-transparent'>
                    Catalog
                  </span>
                </h1>
                <p className='mx-auto mt-4 max-w-xl text-lg leading-relaxed text-neutral-400'>
                  Explore our full collection of products and services. Everything
                  you need, organized by category.
                </p>
                <div className='mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent' />
              </motion.div>
            </div>
          </section>

          <CategoryFilters
            categoriesWithServices={categoriesWithServices}
            activeCategory={activeCategory}
            filtersOpen={filtersOpen}
            onSetFiltersOpen={setFiltersOpen}
            onSelectCategory={setActiveCategory}
            onScrollToSchedule={scrollToSchedule}
          />

          <div className='mx-auto w-full max-w-[1720px] px-4 sm:px-6 lg:px-12 2xl:px-16'>
            {loadingServices ? (
              <ServicesSkeleton />
            ) : (
              <AnimatePresence mode='wait'>
                <motion.div
                  key={activeCategory ?? 'all'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {filteredCategories.map(({ category, services }) => (
                    <section key={category.id} className='pt-12 first:pt-8'>
                      <div className='mb-8'>
                        <div className='mb-2 flex items-center gap-3'>
                          <div className='h-px flex-1 bg-gradient-to-r from-purple-500/30 to-transparent' />
                          <h2 className='font-space-grotesk text-2xl font-bold tracking-tight text-white sm:text-3xl'>
                            {category.name}
                          </h2>
                          <div className='h-px flex-1 bg-gradient-to-l from-purple-500/30 to-transparent' />
                        </div>
                        <p className='text-center text-sm text-neutral-500'>
                          {services.length} service{services.length !== 1 ? 's' : ''} available
                        </p>
                      </div>

                      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-5'>
                        {services.map((service) => (
                          <ServiceCard key={service.id} service={service} />
                        ))}
                      </div>
                    </section>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          <Schedule dates={dates} weekRuns={weekRuns} loadingRuns={loadingRuns} />
        </>
      )}
    </div>
  )
}
