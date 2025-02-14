// DateFilter.tsx
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
} from 'date-fns'

interface DateFilterProps {
  onDaySelect: (day: Date | null) => void
}

export function DateFilter({ onDaySelect }: DateFilterProps) {
  const currentMonth = new Date()
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(currentMonth)
  const [weeks, setWeeks] = useState<{ start: Date; end: Date }[]>([])
  const [days, setDays] = useState<Date[]>([])
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(0)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const setWeeksAndDays = useCallback(
    (date: Date) => {
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
        const currentEndOfWeek = endOfWeek(currentStartOfWeek)

        tempWeeks.push({
          start: currentStartOfWeek,
          end: isBefore(currentEndOfWeek, lastDayOfMonth)
            ? currentEndOfWeek
            : lastDayOfMonth,
        })
        currentStartOfWeek = addDays(currentEndOfWeek, 1)
      }
      setWeeks(tempWeeks)

      // Encontrar a semana que contém a data atual
      const today = new Date()
      let targetWeekIndex = 0
      if (
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      ) {
        const todayWeekIndex = tempWeeks.findIndex(
          (week) => today >= week.start && today <= week.end
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
      setDays(daysInWeek)
      setSelectedWeekIndex(targetWeekIndex)

      // Selecionar o dia atual se estiver no mês
      if (
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      ) {
        const todayFormatted = format(today, 'yyyy-MM-dd')
        const todayInDays = daysInWeek.find(
          (day) => format(day, 'yyyy-MM-dd') === todayFormatted
        )
        if (todayInDays) {
          setSelectedDay(today)
          onDaySelect(today)
        } else {
          setSelectedDay(null)
          onDaySelect(null)
        }
      } else {
        setSelectedDay(null)
        onDaySelect(null)
      }
    },
    [onDaySelect]
  )

  useEffect(() => {
    if (selectedMonth && weeks.length === 0) {
      setWeeksAndDays(selectedMonth)
    }
  }, [selectedMonth, weeks, setWeeksAndDays])

  const handleMonthChange = useCallback(
    (date: Date | null) => {
      if (date) {
        setSelectedMonth(date)
        setWeeksAndDays(date)
      }
      setIsCalendarOpen(false)
    },
    [setWeeksAndDays]
  )

  function handleWeekSelect(weekIndex: number) {
    if (weekIndex < 0 || weekIndex >= weeks.length) return
    const { start, end } = weeks[weekIndex]
    const daysInWeek = eachDayOfInterval({ start, end })
    setDays(daysInWeek)
    setSelectedDay(null)
    onDaySelect(null)
    setSelectedWeekIndex(weekIndex)
  }

  function handleDaySelect(day: Date) {
    setSelectedDay(day)
    onDaySelect(day)
  }

  function handleFilterReset() {
    const newMonth = new Date()
    setSelectedMonth(newMonth)
    setWeeksAndDays(newMonth)
  }

  return (
    <div className='flex flex-col text-lg pt-6 items-center gap-4'>
      <label className=' flex flex-col pl-16'>
        <p>Select Month:</p>
        <div className='flex items-center gap-4'>
          <DatePicker
            selected={selectedMonth}
            onChange={handleMonthChange}
            dateFormat='MM/yyyy'
            showMonthYearPicker
            className='text-zinc-900 pl-2 font-normal p-1 rounded-md flex-1 w-56'
            placeholderText='Month'
            open={isCalendarOpen}
            onClickOutside={() => setIsCalendarOpen(false)}
            onSelect={() => setIsCalendarOpen(false)}
            onFocus={() => setIsCalendarOpen(true)}
          />
          <button
            onClick={handleFilterReset}
            className='bg-red-400 text-gray-100 hover:bg-red-500 shadow-lg rounded-md p-1 text-sm font-normal px-2'
          >
            Reset
          </button>
        </div>
      </label>

      {weeks.length > 0 && (
        <div>
          <label className='flex flex-col mr-2'>
            Select Week:
            <select
              className='text-zinc-900 p-1.5 font-normal w-56 text-md rounded-md'
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
          </label>
        </div>
      )}

      {days.length > 0 && (
        <div className=''>
          <p className='pl-2'>Select Day:</p>
          <div>
            {days.map((day) => (
              <button
                className={`${
                  selectedDay &&
                  format(day, 'yyyy-MM-dd') ===
                    format(selectedDay, 'yyyy-MM-dd')
                    ? 'bg-zinc-500 text-gray-100 font-medium border border-gray-100'
                    : 'bg-zinc-100 text-zinc-900'
                } gap-2 border-gray-100 m-2 p-2 rounded-md text-sm`}
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
