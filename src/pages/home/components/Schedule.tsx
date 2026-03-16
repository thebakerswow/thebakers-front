import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import {
  CalendarBlank,
  CaretDown,
  Clock,
  ShieldChevron,
  Sword,
  Users,
} from '@phosphor-icons/react'
import { ScheduleProps } from '../types/home'

export function Schedule({ dates, weekRuns, loadingRuns }: ScheduleProps) {
  const [activeDate, setActiveDate] = useState<string | null>(null)
  const [mobileDateOpen, setMobileDateOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!activeDate && dates.length > 0) setActiveDate(dates[0])
  }, [activeDate, dates])

  const scheduleRuns = useMemo(() => {
    if (!activeDate) return []
    return (weekRuns[activeDate] || []).sort((a, b) => a.time.localeCompare(b.time))
  }, [weekRuns, activeDate])

  return (
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
            <p className='text-sm text-neutral-400'>No runs available for this date.</p>
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
                  <ShieldChevron size={14} className='shrink-0 text-purple-400/60' />
                  <span>
                    Loot: <span className='font-medium text-white/80'>{run.loot || '-'}</span>
                  </span>
                </div>
              </div>

              <div className='border-t border-white/5 pt-3'>
                <div className='flex items-center gap-2'>
                  <Users size={14} className='text-purple-400/60' />
                  <span className='text-sm text-gray-400'>
                    <span
                      className={`font-semibold ${
                        Number(run.slotAvailable) > 0 ? 'text-green-400' : 'text-red-400'
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
