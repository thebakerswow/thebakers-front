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
import { Button } from '@mui/material'

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
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

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

  const handleMonthChange = useCallback(
    (date: Date | null) => {
      // Atualiza o mês selecionado e recalcula as semanas e dias.
      if (date) {
        setSelectedMonth(date)
        updateWeeksAndDays(date)
      }
      setIsCalendarOpen(false)
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
          <p className='font-normal'>Select Month:</p>
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
            <label className='mr-2 flex flex-col font-normal'>
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
                <Button
                  onClick={handleFilterReset}
                  variant='contained'
                  style={{
                    color: 'black',
                    backgroundColor: 'oklch(0.704 0.191 22.216)',
                  }} // Lighter red
                  size='small'
                  className='shadow-lg'
                >
                  Reset
                </Button>
              </div>
            </label>
          </div>
        )}
      </div>

      {days.length > 0 && (
        <div>
          <p className='pl-2 font-normal'>Select Day:</p>
          <div className='flex gap-2'>
            {days.map((day) => (
              <Button
                className={`${
                  filterDay &&
                  format(startOfDay(day), 'yyyy-MM-dd') ===
                    format(startOfDay(filterDay), 'yyyy-MM-dd')
                    ? 'border font-medium'
                    : ''
                } m-2 gap-2 rounded-md`}
                key={day.toISOString()}
                onClick={() => handleDaySelect(day)}
                variant='outlined'
                style={{
                  color: 'black',
                  backgroundColor:
                    filterDay &&
                    format(startOfDay(day), 'yyyy-MM-dd') ===
                      format(startOfDay(filterDay), 'yyyy-MM-dd')
                      ? 'pink' // Slightly darker background for selected
                      : 'white',
                  borderColor:
                    filterDay &&
                    format(startOfDay(day), 'yyyy-MM-dd') ===
                      format(startOfDay(filterDay), 'yyyy-MM-dd')
                      ? 'pink' // Darker border for selected
                      : 'gray',
                }}
              >
                {format(day, 'EEEE, dd MMM')}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
