import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import {
  CalendarBlank,
  CaretDown,
  Clock,
  Fire,
  ShieldChevron,
  Sword,
  Users,
} from '@phosphor-icons/react'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import { getServices, getServiceCategories } from '../../services/api/services'
import { getRuns } from '../../services/api/runs'
import { useAuth } from '../../context/auth-context'
import { shouldShowRestrictedHome } from '../../utils/role-utils'
import { Service, ServiceCategory } from '../../types'
import { getWeekDatesEST } from '../../utils/timezone-utils'

type RunItem = {
  id: string | number
  idTeam?: string
  team?: string
  name?: string
  difficulty?: string
  raid?: string
  time: string
  loot?: string
  slotAvailable?: number
}

export function HomePage() {
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [servicesList, setServicesList] = useState<Service[]>([])
  const [loadingServices, setLoadingServices] = useState(false)
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [weekRuns, setWeekRuns] = useState<Record<string, RunItem[]>>({})
  const [loadingRuns, setLoadingRuns] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [activeDate, setActiveDate] = useState<string | null>(null)
  const [mobileDateOpen, setMobileDateOpen] = useState(false)
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
    if (!activeDate && dates.length > 0) setActiveDate(dates[0])
  }, [activeDate, dates])

  useEffect(() => {
    const fetchWeekRuns = async () => {
      setLoadingRuns(true)
      try {
        const results = await Promise.allSettled(
          dates.map((date) =>
            getRuns(date).then((runs) => ({ date, runs: (runs || []) as RunItem[] }))
          )
        )
        const mapped: Record<string, RunItem[]> = {}
        results.forEach((result) => {
          if (result.status === 'fulfilled') mapped[result.value.date] = result.value.runs
        })
        setWeekRuns(mapped)
      } finally {
        setLoadingRuns(false)
      }
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
        setError(null)
      } catch (err: any) {
        setServicesList([])
        setCategories([])
        setError({
          message:
            err?.response?.data?.message ||
            err?.message ||
            'Error fetching services or categories',
          response: err?.response?.data,
          status: err?.response?.status,
        })
      } finally {
        setLoadingServices(false)
      }
    }

    void fetchWeekRuns()
    if (!shouldShowRestrictedHome(userRoles)) void fetchServicesAndCategories()
  }, [userRoles, dates])

  const categoriesWithServices = useMemo(() => {
    const grouped = categories
      .map((category) => ({
        category,
        services: servicesList.filter(
          (service) => service.serviceCategoryId === category.id
        ),
      }))
      .filter((item) => item.services.length > 0)

    const knownCategoryIds = new Set(grouped.map((item) => item.category.id))
    const orphanServices = servicesList.filter(
      (service) => !knownCategoryIds.has(service.serviceCategoryId)
    )

    if (orphanServices.length) {
      grouped.push({
        category: { id: -1, name: 'Other' } as ServiceCategory,
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

  const scheduleRuns = useMemo(() => {
    if (!activeDate) return []
    return (weekRuns[activeDate] || [])
      .filter(
        (run) =>
          run.idTeam !== import.meta.env.VITE_TEAM_MPLUS &&
          run.idTeam !== import.meta.env.VITE_TEAM_LEVELING &&
          run.idTeam !== import.meta.env.VITE_TEAM_PVP
      )
      .sort((a, b) => a.time.localeCompare(b.time))
  }, [weekRuns, activeDate])

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <p className='text-lg text-white'>Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className='relative flex min-h-screen w-full flex-col bg-[#050505] text-white'>
      {error && <ErrorComponent error={error} onClose={() => setError(null)} />}

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

          <motion.section
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className='sticky top-0 z-20 border-y border-white/5 bg-black/60 py-4 backdrop-blur-xl'
          >
            <div className='mx-auto w-full max-w-[1720px] px-4 sm:px-6 lg:px-12 2xl:px-16'>
              <div className='flex items-center gap-3 md:hidden'>
                <button
                  onClick={() => setFiltersOpen((prev) => !prev)}
                  className='flex cursor-pointer items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium uppercase tracking-wide text-gray-300 transition-all duration-300'
                >
                  {activeCategory
                    ? categoriesWithServices.find(
                        (c) => String(c.category.id) === activeCategory
                      )?.category.name || 'Filter'
                    : 'All Categories'}
                  <CaretDown
                    size={16}
                    className={`transition-transform duration-300 ${filtersOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <button
                  onClick={() =>
                    document.getElementById('schedule-section')?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    })
                  }
                  className='ml-auto inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium uppercase tracking-wide text-gray-400 transition-all duration-300 hover:border-white/20 hover:text-white'
                >
                  <CalendarBlank size={14} />
                  Schedule
                </button>
              </div>

              <AnimatePresence>
                {filtersOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className='overflow-hidden md:hidden'
                  >
                    <div className='flex flex-wrap gap-2 pt-3'>
                      <button
                        onClick={() => {
                          setActiveCategory(null)
                          setFiltersOpen(false)
                        }}
                        className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium uppercase tracking-wide transition-all duration-300 ${
                          !activeCategory
                            ? 'border border-purple-500/30 bg-purple-500/20 text-purple-300'
                            : 'border border-white/10 text-gray-400'
                        }`}
                      >
                        All
                      </button>
                      {categoriesWithServices.map(({ category }) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            setActiveCategory(String(category.id))
                            setFiltersOpen(false)
                          }}
                          className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium uppercase tracking-wide transition-all duration-300 ${
                            activeCategory === String(category.id)
                              ? 'border border-purple-500/30 bg-purple-500/20 text-purple-300'
                              : 'border border-white/10 text-gray-400'
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className='hidden flex-wrap items-center gap-3 md:flex'>
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`cursor-pointer rounded-full px-5 py-2 text-sm font-medium uppercase tracking-wide transition-all duration-300 ${
                    !activeCategory
                      ? 'border border-purple-500/30 bg-purple-500/20 text-purple-300'
                      : 'border border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  All
                </button>
                {categoriesWithServices.map(({ category }) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(String(category.id))}
                    className={`cursor-pointer rounded-full px-5 py-2 text-sm font-medium uppercase tracking-wide transition-all duration-300 ${
                      activeCategory === String(category.id)
                        ? 'border border-purple-500/30 bg-purple-500/20 text-purple-300'
                        : 'border border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
                <div className='h-5 w-px shrink-0 bg-white/10' />
                <button
                  onClick={() =>
                    document.getElementById('schedule-section')?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    })
                  }
                  className='inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 px-5 py-2 text-sm font-medium uppercase tracking-wide text-gray-400 transition-all duration-300 hover:border-white/20 hover:text-white'
                >
                  <CalendarBlank size={14} />
                  Schedule
                </button>
              </div>
            </div>
          </motion.section>

          <div className='mx-auto w-full max-w-[1720px] px-4 sm:px-6 lg:px-12 2xl:px-16'>
            {loadingServices ? (
              <div className='py-12 text-center text-gray-400'>Loading services...</div>
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
                          <div
                            key={service.id}
                            className='group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition-all duration-300 hover:scale-[1.02] hover:border-purple-500/20'
                          >
                            <div className='absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
                            <div className='flex h-full flex-col p-5 sm:p-6'>
                              <div className='mb-2 flex items-start gap-2'>
                                <h3 className='line-clamp-1 flex-1 text-lg font-bold text-white transition-colors duration-300 group-hover:text-purple-100'>
                                  {service.name}
                                </h3>
                                {service.hotItem && (
                                  <span className='inline-flex shrink-0 items-center gap-1 rounded-full border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-orange-400'>
                                    <Fire size={12} />
                                    Hot
                                  </span>
                                )}
                              </div>

                              <p className='line-clamp-3 mb-4 flex-1 text-sm leading-relaxed text-gray-400'>
                                {service.description?.replace(/<[^>]*>/g, '') ||
                                  'No description available.'}
                              </p>

                              <div className='border-t border-white/5 pt-3'>
                                <span className='text-[10px] uppercase tracking-wider text-gray-500'>
                                  Price
                                </span>
                                <p className='text-xl font-bold text-amber-400'>
                                  {service.price.toLocaleString('en-US')}{' '}
                                  <span className='text-xs font-medium text-amber-500/70'>
                                    gold
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          <section
            id='schedule-section'
            className='relative z-10 mx-auto w-full max-w-[1720px] px-4 pb-16 pt-16 sm:px-6 lg:px-12 2xl:px-16'
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className='mb-8'
            >
              <div className='mb-2 flex items-center gap-3'>
                <div className='h-px flex-1 bg-gradient-to-r from-purple-500/30 to-transparent' />
                <h2 className='font-space-grotesk inline-flex items-center gap-3 text-2xl font-bold tracking-tight text-white sm:text-3xl'>
                  <CalendarBlank size={28} className='text-purple-400' />
                  Weekly Schedule
                </h2>
                <div className='h-px flex-1 bg-gradient-to-l from-purple-500/30 to-transparent' />
              </div>
              <p className='text-center text-sm text-neutral-500'>
                Upcoming runs for the next 7 days (EST)
              </p>
            </motion.div>

            <div className='mb-4 mt-4'>
              <div className='relative sm:hidden'>
                <button
                  onClick={() => setMobileDateOpen((prev) => !prev)}
                  className='inline-flex w-full cursor-pointer items-center gap-2 rounded-lg border border-purple-500/20 bg-purple-500/5 px-3 py-2 text-xs transition-colors'
                >
                  <CalendarBlank size={16} className='text-purple-400' />
                  <span className='font-semibold uppercase tracking-wide text-purple-300'>
                    {formatDateLabel(activeDate, dates[0], dates[1])}
                  </span>
                  <span className='text-neutral-500'>&mdash; {activeDate}</span>
                  <CaretDown
                    size={16}
                    className={`ml-auto text-purple-300 transition-transform ${mobileDateOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {mobileDateOpen && (
                  <div className='absolute z-30 mt-2 w-full rounded-lg border border-white/10 bg-[#0f0818] p-2 shadow-xl'>
                    <div className='flex flex-col gap-2'>
                      {dates.map((date) => {
                        const isActive = date === activeDate
                        return (
                          <button
                            key={date}
                            onClick={() => {
                              setActiveDate(date)
                              setMobileDateOpen(false)
                            }}
                            className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                              isActive
                                ? 'border-purple-500/20 bg-purple-500/10'
                                : 'border-white/10 bg-white/[0.04] hover:border-white/20'
                            }`}
                          >
                            <CalendarBlank
                              size={16}
                              className={isActive ? 'text-purple-400' : 'text-gray-500'}
                            />
                            <span
                              className={`whitespace-nowrap font-semibold uppercase tracking-wide ${
                                isActive ? 'text-purple-300' : 'text-gray-300'
                              }`}
                            >
                              {formatDateLabel(date, dates[0], dates[1])}
                            </span>
                            <span className='whitespace-nowrap text-xs text-neutral-500'>
                              &mdash; {date}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className='hidden sm:block'>
                <div className='grid grid-cols-7 gap-2'>
                  {dates.slice(0, 7).map((date) => {
                    const isActive = date === activeDate
                    return (
                      <button
                        key={date}
                        onClick={() => setActiveDate(date)}
                        className={`inline-flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg border px-2 py-2 text-xs transition-colors ${
                          isActive
                            ? 'border-purple-500/20 bg-purple-500/5'
                            : 'border-white/10 bg-white/[0.04] hover:border-white/20'
                        }`}
                      >
                        <CalendarBlank
                          size={14}
                          className={isActive ? 'text-purple-400' : 'text-gray-500'}
                        />
                        <span
                          className={`whitespace-nowrap font-semibold uppercase tracking-wide ${
                            isActive ? 'text-purple-300' : 'text-gray-300'
                          }`}
                        >
                          {formatDateLabel(date, dates[0], dates[1])}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className='mt-2 flex items-center gap-3'>
                <div className='h-px flex-1 bg-white/5' />
                <span className='whitespace-nowrap text-xs text-neutral-600'>
                  {loadingRuns
                    ? 'Loading...'
                    : `${scheduleRuns.length} run${scheduleRuns.length !== 1 ? 's' : ''}`}
                </span>
              </div>
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {loadingRuns &&
                Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={`schedule-skeleton-${idx}`}
                    className='animate-pulse rounded-xl border border-white/10 bg-white/[0.04] p-5'
                  >
                    <div className='mb-3 flex items-center justify-between'>
                      <div className='h-5 w-32 rounded bg-white/10' />
                      <div className='h-5 w-14 rounded-full bg-white/10' />
                    </div>
                    <div className='mb-4 h-4 w-24 rounded bg-white/10' />
                    <div className='mb-4 space-y-2'>
                      <div className='h-4 w-28 rounded bg-white/10' />
                      <div className='h-4 w-36 rounded bg-white/10' />
                    </div>
                    <div className='border-t border-white/5 pt-3'>
                      <div className='h-4 w-24 rounded bg-white/10' />
                    </div>
                  </div>
                ))}

              {!loadingRuns && scheduleRuns.length === 0 && (
                <div className='col-span-full rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center'>
                  <p className='text-sm text-neutral-400'>
                    No runs available for this date.
                  </p>
                </div>
              )}

              {!loadingRuns &&
                scheduleRuns.map((run, index) => (
                  <div
                    key={`${run.id}-${index}`}
                    className='group rounded-xl border border-white/10 bg-white/[0.04] p-5 transition-all duration-300 hover:border-purple-500/15'
                    onDoubleClick={() => navigate(`/bookings-na/run/${run.id}`)}
                  >
                    <div className='mb-1 flex items-start justify-between'>
                      <h4 className='line-clamp-1 min-w-0 flex-1 text-base font-bold text-white'>
                        {run.team || run.name || 'Run'}
                      </h4>
                      <span className='ml-2 shrink-0 rounded-full border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-purple-300'>
                        {run.difficulty || 'Run'}
                      </span>
                    </div>

                    <div className='mb-3 flex items-center gap-1.5'>
                      <Sword size={14} className='shrink-0 text-purple-400/60' />
                      <span className='text-xs text-gray-500'>{run.raid || 'Raid'}</span>
                    </div>

                    <div className='mb-3 space-y-2'>
                      <div className='flex items-center gap-2 text-sm text-gray-400'>
                        <Clock size={14} className='shrink-0 text-purple-400/60' />
                        <span>{formatTime12h(run.time)} EST</span>
                      </div>
                      <div className='flex items-center gap-2 text-sm text-gray-400'>
                        <ShieldChevron
                          size={14}
                          className='shrink-0 text-purple-400/60'
                        />
                        <span>
                          Loot:{' '}
                          <span className='font-medium text-white/80'>
                            {run.loot || '-'}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className='border-t border-white/5 pt-3'>
                      <div className='flex items-center gap-2'>
                        <Users size={14} className='text-purple-400/60' />
                        <span className='text-sm text-gray-400'>
                          <span
                            className={`font-semibold ${
                              Number(run.slotAvailable) > 0
                                ? 'text-green-400'
                                : 'text-red-400'
                            }`}
                          >
                            {Number(run.slotAvailable) || 0}
                          </span>{' '}
                          slot{Number(run.slotAvailable) === 1 ? '' : 's'} available
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

function formatDateLabel(
  date: string | null,
  todayDate?: string,
  tomorrowDate?: string
) {
  if (!date) return 'Select Date'
  if (todayDate && date === todayDate) return 'Today'
  if (tomorrowDate && date === tomorrowDate) return 'Tomorrow'

  try {
    return format(parseISO(date), 'EEE, MMM d')
  } catch {
    return date
  }
}

function formatTime12h(time: string) {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return time
  const hour = ((h + 11) % 12) + 1
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`
}
