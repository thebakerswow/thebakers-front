import { useState, useCallback, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import {
  format,
  eachDayOfInterval,
  addDays,
  isBefore,
  endOfWeek,
  isSameMonth,
  startOfWeek,
  startOfDay,
} from 'date-fns'

interface DateFilterProps {
  onDaySelect: (day: Date | null) => void
}

function computeWeeksAndDays(date: Date) {
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

  // filterDay representa o dia usado para filtrar os dados da tabela.
  // Ele é atualizado somente quando o usuário seleciona um dia.
  const [filterDay, setFilterDay] = useState<Date | null>(
    initialData.selectedDay
  )
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(currentMonth)
  const [weeks, setWeeks] = useState(initialData.weeks)
  const [days, setDays] = useState(initialData.days)
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(
    initialData.selectedWeekIndex
  )
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  // Apenas na montagem inicial configuramos o filtro para o dia atual.
  useEffect(() => {
    onDaySelect(filterDay)
  }, [])

  // Atualiza os controles (seção de semanas e dias) sem alterar o filtro atual.
  const updateWeeksAndDays = useCallback((date: Date) => {
    const data = computeWeeksAndDays(date)
    setWeeks(data.weeks)
    setDays(data.days)
    setSelectedWeekIndex(data.selectedWeekIndex)
    // NÃO atualizamos filterDay aqui para manter os dados da tabela inalterados.
  }, [])

  const handleMonthChange = useCallback(
    (date: Date | null) => {
      if (date) {
        setSelectedMonth(date)
        updateWeeksAndDays(date)
      }
      setIsCalendarOpen(false)
    },
    [updateWeeksAndDays]
  )

  function handleWeekSelect(weekIndex: number) {
    if (weekIndex < 0 || weekIndex >= weeks.length) return
    const { start, end } = weeks[weekIndex]
    const daysInWeek = eachDayOfInterval({ start, end })
    setDays(daysInWeek)
    setSelectedWeekIndex(weekIndex)
    // NÃO alteramos filterDay aqui; o filtro continua o mesmo.
  }
  function handleDaySelect(day: Date) {
    setFilterDay(day)
    // Aqui removemos a chamada à API e apenas enviamos a data para o componente pai
    onDaySelect(day)
  }

  // No reset, tudo volta ao dia atual, atualizando inclusive o filtro.
  function handleFilterReset() {
    const newMonth = new Date()
    setSelectedMonth(newMonth)
    const data = computeWeeksAndDays(newMonth)
    setWeeks(data.weeks)
    setDays(data.days)
    setSelectedWeekIndex(data.selectedWeekIndex)
    setFilterDay(data.selectedDay)
    onDaySelect(data.selectedDay)
  }

  return (
    <div className='flex flex-col items-center gap-4 text-lg'>
      <div className='flex gap-8'>
        <label className='flex flex-col'>
          <p>Select Month:</p>
          <div className='flex items-center gap-4'>
            <DatePicker
              selected={selectedMonth}
              onChange={handleMonthChange}
              dateFormat='MM/yyyy'
              showMonthYearPicker
              className='w-56 flex-1 rounded-md p-1 pl-2 font-normal text-zinc-900'
              placeholderText='Month'
              open={isCalendarOpen}
              onClickOutside={() => setIsCalendarOpen(false)}
              onSelect={() => setIsCalendarOpen(false)}
              onFocus={() => setIsCalendarOpen(true)}
            />
          </div>
        </label>
        {weeks.length > 0 && (
          <div>
            <label className='mr-2 flex flex-col'>
              Select Week:
              <div className='flex gap-4'>
                <select
                  className='text-md w-56 rounded-md p-1.5 font-normal text-zinc-900'
                  onChange={(e) => handleWeekSelect(Number(e.target.value))}
                  value={selectedWeekIndex}
                >
                  {weeks.map((week, index) => (
                    <option key={index} value={index}>
                      Week {index + 1} ({format(week.start, 'MM/dd')} -{' '}
                      {format(week.end, 'MM/dd')})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleFilterReset}
                  className='rounded-md bg-red-400 p-1 px-2 text-sm font-normal text-gray-100 shadow-lg hover:bg-red-500'
                >
                  Reset
                </button>
              </div>
            </label>
          </div>
        )}
      </div>

      {days.length > 0 && (
        <div>
          <p className='pl-2'>Select Day:</p>
          <div>
            {days.map((day) => (
              <button
                className={`${
                  filterDay &&
                  format(startOfDay(day), 'yyyy-MM-dd') ===
                    format(startOfDay(filterDay), 'yyyy-MM-dd')
                    ? 'border border-gray-100 bg-zinc-500 font-medium text-gray-100'
                    : 'bg-zinc-100 text-zinc-900'
                } m-2 gap-2 rounded-md border-gray-100 p-2 text-sm`}
                key={day.toISOString()}
                onClick={() => handleDaySelect(day)}
              >
                {format(day, 'EEEE, dd MMM')}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
