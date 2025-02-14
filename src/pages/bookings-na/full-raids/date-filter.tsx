import { useState, useCallback } from 'react'
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
import { Button } from '../../../components/button'

interface DateFilterProps {
  onDaySelect: (day: Date | null) => void
  onReset: () => void
}

export function DateFilter({ onDaySelect, onReset }: DateFilterProps) {
  const currentMonth = new Date()
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(currentMonth)
  const [weeks, setWeeks] = useState<{ start: Date; end: Date }[]>([])
  const [days, setDays] = useState<Date[]>([])
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(0) // Adicionado para controle da semana selecionada
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  // Função para definir semanas e dias com base no mês selecionado
  const setWeeksAndDays = useCallback(
    (date: Date) => {
      const year = date.getFullYear()
      const month = date.getMonth()
      const firstDayOfMonth = new Date(year, month, 1)
      const lastDayOfMonth = new Date(year, month + 1, 0)
      const tempWeeks = []
      let currentStartOfWeek = startOfWeek(firstDayOfMonth, {
        weekStartsOn: 0,
      })

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

      // Exibe todos os dias da primeira semana
      const firstWeekDays = eachDayOfInterval({
        start: tempWeeks[0].start,
        end: tempWeeks[0].end,
      })
      setDays(firstWeekDays)
      setSelectedDay(null)
      onDaySelect(null)

      // Configura a semana selecionada para a primeira semana
      setSelectedWeekIndex(0)
    },
    [onDaySelect]
  )

  // Configuração inicial da data e semanas
  if (selectedMonth && weeks.length === 0) {
    setWeeksAndDays(selectedMonth)
  }

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
    if (weekIndex < 0 || weekIndex >= weeks.length) {
      return
    }
    const { start, end } = weeks[weekIndex]
    const daysInWeek = eachDayOfInterval({ start, end })
    setDays(daysInWeek)
    setSelectedDay(null)
    onDaySelect(null)

    // Atualiza o índice da semana selecionada
    setSelectedWeekIndex(weekIndex)
  }

  function handleDaySelect(day: Date) {
    setSelectedDay(day)
    onDaySelect(day)
  }

  function handleFilterReset() {
    const newMonth = new Date()
    setSelectedMonth(newMonth)

    // Atualiza as semanas e dias para o novo mês
    setWeeksAndDays(newMonth)

    // Reseta o dia selecionado e chama a função de reset
    setSelectedDay(null)
    setSelectedWeekIndex(0) // Define a seleção da semana para a primeira semana
    onReset()
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
          <Button onClick={handleFilterReset} variant='submit' size='reset'>
            Reset
          </Button>
        </div>
      </label>

      {weeks.length > 0 && (
        <div>
          <label className='flex flex-col mr-2'>
            Select Week:
            <select
              className='text-zinc-900 p-1.5 font-normal w-56 text-md rounded-md'
              onChange={(e) => handleWeekSelect(Number(e.target.value))}
              value={selectedWeekIndex} // Atualiza o valor selecionado
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
