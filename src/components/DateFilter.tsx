import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import {
  format,
  parse,
  eachDayOfInterval,
  addDays,
  isBefore,
  endOfWeek,
  isSameMonth,
  startOfWeek,
  startOfDay,
} from 'date-fns'
import { CustomSelect } from './CustomSelect'

interface DateFilterProps {
  onDaySelect: (day: Date | null) => void
}

function computeWeeksAndDays(date: Date) {
  // Calcula as semanas e dias de um mês específico, incluindo a semana atual e o dia selecionado.
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const tempWeeks = []
  let currentStartOfWeek = startOfWeek(firstDayOfMonth, { weekStartsOn: 0 })

  if (!isSameMonth(currentStartOfWeek, firstDayOfMonth)) {
    currentStartOfWeek = firstDayOfMonth
  }

  while (currentStartOfWeek <= lastDayOfMonth) {
    const currentEndOfWeek = endOfWeek(currentStartOfWeek, { weekStartsOn: 0 })
    tempWeeks.push({
      start: currentStartOfWeek,
      end: isBefore(currentEndOfWeek, lastDayOfMonth)
        ? currentEndOfWeek
        : lastDayOfMonth,
    })
    currentStartOfWeek = addDays(currentEndOfWeek, 1)
  }
  
  // Adiciona uma semana adicional se o último dia do mês não completar a semana
  if (tempWeeks.length > 0) {
    const lastWeek = tempWeeks[tempWeeks.length - 1]
    const lastWeekEnd = endOfWeek(lastWeek.start, { weekStartsOn: 0 })
    
    // Se o último dia do mês não é o final da semana, adiciona uma semana extra
    if (lastDayOfMonth > lastWeekEnd) {
      const nextWeekStart = addDays(lastWeekEnd, 1)
      const nextWeekEnd = endOfWeek(nextWeekStart, { weekStartsOn: 0 })
      
      // Inclui apenas os dias que pertencem ao mês atual
      const daysInNextWeek = []
      let currentDay = nextWeekStart
      while (currentDay <= nextWeekEnd && currentDay.getMonth() === month) {
        daysInNextWeek.push(currentDay)
        currentDay = addDays(currentDay, 1)
      }
      
      if (daysInNextWeek.length > 0) {
        tempWeeks.push({
          start: nextWeekStart,
          end: daysInNextWeek[daysInNextWeek.length - 1],
        })
      }
    }
  }

  const today = startOfDay(new Date())
  let targetWeekIndex = 0
  if (
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  ) {
    const todayWeekIndex = tempWeeks.findIndex(
      (week) => today >= startOfDay(week.start) && today <= startOfDay(week.end)
    )
    if (todayWeekIndex !== -1) {
      targetWeekIndex = todayWeekIndex
    }
  }

  const targetWeek = tempWeeks[targetWeekIndex]
  const daysInWeek = eachDayOfInterval({
    start: targetWeek.start,
    end: targetWeek.end,
  })

  let computedDay = null
  if (
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  ) {
    const todayFormatted = format(today, 'yyyy-MM-dd')
    const todayInDays = daysInWeek.find(
      (day) => format(startOfDay(day), 'yyyy-MM-dd') === todayFormatted
    )
    if (todayInDays) {
      computedDay = today
    }
  }

  return {
    weeks: tempWeeks,
    selectedWeekIndex: targetWeekIndex,
    days: daysInWeek,
    selectedDay: computedDay,
  }
}

export function DateFilter({ onDaySelect }: DateFilterProps) {
  const currentMonth = new Date()
  const initialData = computeWeeksAndDays(currentMonth)

  const [filterDay, setFilterDay] = useState<Date | null>(
    initialData.selectedDay
  )
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(currentMonth)
  const [weeks, setWeeks] = useState(initialData.weeks)
  const [days, setDays] = useState(initialData.days)
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(
    initialData.selectedWeekIndex
  )
  const [monthInputValue, setMonthInputValue] = useState(
    format(currentMonth, 'MM/yyyy')
  )
  const monthPickerRef = useRef<DatePicker | null>(null)
  const weekOptions = useMemo(
    () =>
      weeks.map((week, index) => ({
        value: String(index),
        label: `Week ${index + 1} (${format(week.start, 'MM/dd')} - ${format(week.end, 'MM/dd')})`,
      })),
    [weeks]
  )

  useEffect(() => {
    // Configura o dia inicial do filtro ao montar o componente.
    onDaySelect(filterDay)
  }, [])

  const updateWeeksAndDays = useCallback((date: Date) => {
    // Atualiza as semanas e dias com base no mês selecionado.
    const data = computeWeeksAndDays(date)
    setWeeks(data.weeks)
    setDays(data.days)
    setSelectedWeekIndex(data.selectedWeekIndex)
  }, [])

  const normalizeMonthInput = useCallback((rawValue: string) => {
    const value = rawValue.trim()
    if (!value) return null

    const monthYearMatch = value.match(/^(\d{1,2})[/-](\d{4})$/)
    if (monthYearMatch) {
      const [, monthRaw, year] = monthYearMatch
      const month = Number(monthRaw)
      if (month < 1 || month > 12) return null
      const normalizedMonth = String(month).padStart(2, '0')
      const isoDate = `${year}-${normalizedMonth}-01`
      const parsed = parse(isoDate, 'yyyy-MM-dd', new Date())
      if (Number.isNaN(parsed.getTime())) return null
      return format(parsed, 'MM/yyyy')
    }

    const yearMonthMatch = value.match(/^(\d{4})[/-](\d{1,2})$/)
    if (yearMonthMatch) {
      const [, year, monthRaw] = yearMonthMatch
      const month = Number(monthRaw)
      if (month < 1 || month > 12) return null
      const normalizedMonth = String(month).padStart(2, '0')
      const isoDate = `${year}-${normalizedMonth}-01`
      const parsed = parse(isoDate, 'yyyy-MM-dd', new Date())
      if (Number.isNaN(parsed.getTime())) return null
      return format(parsed, 'MM/yyyy')
    }

    return null
  }, [])

  const applyManualMonth = useCallback(() => {
    const normalizedMonth = normalizeMonthInput(monthInputValue)
    if (!normalizedMonth) return

    const parsed = parse(normalizedMonth, 'MM/yyyy', new Date())
    if (Number.isNaN(parsed.getTime())) return

    setSelectedMonth(parsed)
    updateWeeksAndDays(parsed)
    setMonthInputValue(normalizedMonth)
  }, [monthInputValue, normalizeMonthInput, updateWeeksAndDays])

  const handleMonthChange = useCallback(
    (date: Date | null) => {
      // Atualiza o mês selecionado e recalcula as semanas e dias.
      if (date) {
        setSelectedMonth(date)
        updateWeeksAndDays(date)
        setMonthInputValue(format(date, 'MM/yyyy'))
      }
    },
    [updateWeeksAndDays]
  )

  function handleWeekSelect(weekIndex: number) {
    // Atualiza os dias exibidos com base na semana selecionada.
    if (weekIndex < 0 || weekIndex >= weeks.length) return
    const { start, end } = weeks[weekIndex]
    const daysInWeek = eachDayOfInterval({ start, end })
    setDays(daysInWeek)
    setSelectedWeekIndex(weekIndex)
  }

  function handleDaySelect(day: Date) {
    // Atualiza o dia selecionado e notifica o componente pai.
    setFilterDay(day)
    onDaySelect(day)
  }

  function handleFilterReset() {
    // Reseta o filtro para o dia atual e recalcula os dados.
    const newMonth = new Date()
    setSelectedMonth(newMonth)
    setMonthInputValue(format(newMonth, 'MM/yyyy'))
    const data = computeWeeksAndDays(newMonth)
    setWeeks(data.weeks)
    setDays(data.days)
    setSelectedWeekIndex(data.selectedWeekIndex)
    setFilterDay(data.selectedDay)
    onDaySelect(data.selectedDay)
  }

  return (
    <div className='mt-10 flex w-[90%] max-w-5xl flex-col gap-4'>
      <div className='flex w-full flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-6'>
        <div className='flex w-full flex-col sm:w-auto'>
          <label className='mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400'>
            Select Month
          </label>
          <div className='relative w-full sm:w-auto'>
            <DatePicker
              ref={monthPickerRef}
              selected={selectedMonth}
              onChange={handleMonthChange}
              onChangeRaw={(event) => {
                const input = event?.target as HTMLInputElement | null
                if (!input) return
                setMonthInputValue(input.value)
              }}
              onBlur={applyManualMonth}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  applyManualMonth()
                }
              }}
              dateFormat='MM/yyyy'
              showMonthYearPicker
              placeholderText='Month'
              popperClassName='z-[99999] balance-datepicker-popper'
              calendarClassName='balance-datepicker'
              wrapperClassName='w-full sm:w-auto'
              className='balance-filter-control h-10 w-full min-w-0 rounded-md border border-purple-300/20 bg-[linear-gradient(180deg,rgba(23,23,27,0.92)_0%,rgba(14,14,18,0.92)_100%)] px-3 pr-9 text-left text-sm text-white/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.22)] outline-none transition focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/35 sm:min-w-[220px]'
              value={monthInputValue}
            />
            <button
              type='button'
              onClick={() => monthPickerRef.current?.setOpen(true)}
              aria-label='Open month picker'
              className='absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-xs text-purple-300/85 transition hover:bg-white/10 hover:text-purple-200'
            >
              ▼
            </button>
          </div>
        </div>
        {weeks.length > 0 && (
          <div className='flex w-full flex-col sm:w-auto'>
            <label className='mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400'>
              Select Week
            </label>
            <div className='flex w-full flex-col gap-3 sm:w-auto sm:flex-row'>
              <CustomSelect
                value={String(selectedWeekIndex)}
                onChange={(value) => handleWeekSelect(Number(value))}
                options={weekOptions}
                minWidthClassName='w-full min-w-0 sm:min-w-[260px]'
                renderInPortal
              />
              <button
                onClick={handleFilterReset}
                className='inline-flex h-10 w-full min-w-[100px] items-center justify-center rounded-md border border-purple-400/40 bg-purple-500/20 px-4 text-sm text-purple-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.22)] transition hover:border-purple-300/55 hover:bg-purple-500/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/45 sm:w-auto'
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {days.length > 0 && (
        <div className='w-full'>
          <label className='mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-400'>
            Select Day
          </label>
          <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {days.map((day) => (
              <button
                className={`h-10 w-full rounded-md px-3 text-xs transition sm:px-4 sm:text-sm ${
                  filterDay &&
                  format(startOfDay(day), 'yyyy-MM-dd') ===
                    format(startOfDay(filterDay), 'yyyy-MM-dd')
                    ? 'border border-purple-400/40 bg-purple-500/20 text-purple-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.22)]'
                    : 'border border-purple-300/20 bg-[linear-gradient(180deg,rgba(23,23,27,0.92)_0%,rgba(14,14,18,0.92)_100%)] text-white/90 hover:border-purple-300/45'
                }`}
                key={day.toISOString()}
                onClick={() => handleDaySelect(day)}
              >
                {format(day, 'EEE, dd MMM')}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
