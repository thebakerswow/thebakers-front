import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CaretDown } from '@phosphor-icons/react'
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
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [username, setUsername] = useState<string | null>(null)

  const navigate = useNavigate()
  const { isAuthenticated, loading, userRoles, idDiscord } = useAuth()
  const isRestrictedHome = useMemo(
    () => shouldShowRestrictedHome(userRoles),
    [userRoles]
  )

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
    if (isRestrictedHome) {
      setLoadingRuns(false)
      setWeekRuns({})
      return
    }

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
    void loadServicesAndCategories()
  }, [dates, isRestrictedHome])

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

  useEffect(() => {
    setExpandedCategories((prev) => {
      const nextState = { ...prev }
      let changed = false

      filteredCategories.forEach(({ category }) => {
        const categoryKey = String(category.id)
        if (nextState[categoryKey] === undefined) {
          nextState[categoryKey] = true
          changed = true
        }
      })

      return changed ? nextState : prev
    })
  }, [filteredCategories])

  const toggleCategory = (categoryId: number) => {
    const categoryKey = String(categoryId)
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryKey]: !prev[categoryKey],
    }))
  }

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
      {isRestrictedHome ? (
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
          <div className='mx-auto w-full max-w-[1720px] px-4 sm:px-6 lg:px-12 2xl:px-16'>
            <section className='relative z-10 pb-2 pt-8 text-center sm:pt-10'>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className='inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 backdrop-blur-sm'>
                  <div className='h-2 w-2 animate-pulse rounded-full bg-purple-500' />
                  <span className='text-sm font-medium uppercase tracking-wider text-neutral-400'>
                    The Bakers
                  </span>
                </div>
              </motion.div>
            </section>

            <section className='relative z-10 pb-12 pt-4 sm:pb-16 sm:pt-8'>
              <div className='w-full text-center'>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h1 className='font-space-grotesk text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl'>
                    <span className='text-white'>Boosting</span>{' '}
                    <span className='bg-gradient-to-r from-purple-400 via-violet-500 to-fuchsia-600 bg-clip-text text-transparent'>
                      Guild
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
          </div>

          <CategoryFilters
            categoriesWithServices={categoriesWithServices}
            activeCategory={activeCategory}
            filtersOpen={filtersOpen}
            onSetFiltersOpen={setFiltersOpen}
            onSelectCategory={setActiveCategory}
            onScrollToSchedule={scrollToSchedule}
          />

          <div className='mx-auto w-full max-w-[1720px] px-4 sm:px-6 lg:px-12 2xl:px-16'>
            <Schedule dates={dates} weekRuns={weekRuns} loadingRuns={loadingRuns} />
            <div className='h-20' aria-hidden='true' />

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
                        <button
                          type='button'
                          onClick={() => toggleCategory(category.id)}
                          className='mb-2 flex w-full cursor-pointer items-center gap-3'
                        >
                          <div className='h-px flex-1 bg-gradient-to-r from-purple-500/30 to-transparent' />
                          <h2 className='font-space-grotesk text-2xl font-bold tracking-tight text-white sm:text-3xl'>
                            {category.name}
                          </h2>
                          <CaretDown
                            size={18}
                            className={`text-purple-300 transition-transform duration-200 ${
                              expandedCategories[String(category.id)] ? 'rotate-180' : ''
                            }`}
                          />
                          <div className='h-px flex-1 bg-gradient-to-l from-purple-500/30 to-transparent' />
                        </button>
                        <p className='text-center text-sm text-neutral-500'>
                          {services.length} service{services.length !== 1 ? 's' : ''} available
                        </p>
                      </div>

                      <AnimatePresence initial={false}>
                        {expandedCategories[String(category.id)] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className='overflow-hidden'
                          >
                            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-5'>
                              {services.map((service) => (
                                <ServiceCard key={service.id} service={service} />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </section>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </>
      )}
    </div>
  )
}
