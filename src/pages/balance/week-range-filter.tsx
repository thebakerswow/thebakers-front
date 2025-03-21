import { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachWeekOfInterval,
  endOfWeek,
  isSameMonth,
  getWeek,
  startOfWeek,
} from 'date-fns'

interface WeekRangeFilterProps {
  onChange: (range: { start: string; end: string }) => void
}

export function WeekRangeFilter({ onChange }: WeekRangeFilterProps) {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
  const [selectedWeek, setSelectedWeek] = useState<number>(0)
  const [weeksInMonth, setWeeksInMonth] = useState<Date[][]>([])
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  useEffect(() => {
    const monthStart = startOfMonth(selectedMonth)
    const monthEnd = endOfMonth(selectedMonth)

    const weekStarts = eachWeekOfInterval(
      { start: monthStart, end: monthEnd },
      { weekStartsOn: 0 }
    )

    const weeks = weekStarts.map((weekStart) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 })
      return [
        isSameMonth(weekStart, monthStart) ? weekStart : monthStart,
        isSameMonth(weekEnd, monthStart) ? weekEnd : monthEnd,
      ]
    })

    setWeeksInMonth(weeks)

    // Calcula a semana atual dentro do mês selecionado
    const currentWeekIndex = weekStarts.findIndex((weekStart) => {
      const weekStartOfThisWeek = startOfWeek(new Date(), { weekStartsOn: 0 })
      return (
        getWeek(weekStart, { weekStartsOn: 0 }) ===
        getWeek(weekStartOfThisWeek, { weekStartsOn: 0 })
      )
    })

    // Se encontrou uma semana atual, configura
    if (currentWeekIndex !== -1) {
      setSelectedWeek(currentWeekIndex)
    }
  }, [selectedMonth])

  useEffect(() => {
    if (weeksInMonth.length > 0 && selectedWeek >= 0) {
      const [start, end] = weeksInMonth[selectedWeek]
      const startDate = format(start, 'yyyy-MM-dd')
      const endDate = format(end, 'yyyy-MM-dd')

      onChange({
        start: startDate,
        end: endDate,
      })
    }
  }, [selectedWeek, weeksInMonth, onChange])

  // Função corrigida com tipagem adequada
  const handleMonthChange = (date: Date | null) => {
    if (date) {
      setSelectedMonth(date)
      setIsCalendarOpen(false)
    }
  }

  return (
    <div className='mt-4 flex items-center gap-10 text-black'>
      <div className='flex flex-col'>
        <label className='mb-1 text-sm text-white'>Month</label>
        <div className='relative'>
          <DatePicker
            selected={selectedMonth}
            onChange={handleMonthChange}
            dateFormat='MM/yyyy'
            showMonthYearPicker
            className='rounded-md border border-gray-300 py-1 pl-4 pr-8 font-normal text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black'
            placeholderText='Select Month'
            open={isCalendarOpen}
            onClickOutside={() => setIsCalendarOpen(false)}
            onSelect={() => setIsCalendarOpen(false)}
            onFocus={() => setIsCalendarOpen(true)}
          />
        </div>
      </div>

      <div className='flex flex-col'>
        <label className='mb-1 text-sm text-white'>Week</label>
        <div className='relative'>
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(Number(e.target.value))}
            className='appearance-none rounded-md border border-gray-300 bg-white py-1 pl-4 pr-8 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black'
          >
            {weeksInMonth.map((week, index) => (
              <option key={index} value={index}>
                Week {index + 1} ({format(week[0], 'dd/MM')} -{' '}
                {format(week[1], 'dd/MM')})
              </option>
            ))}
          </select>
          <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2'>
            <svg
              className='h-4 w-4 text-gray-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 9l-7 7-7-7'
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
