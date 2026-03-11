import { forwardRef, useState, useEffect, useMemo } from 'react'
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
import { CustomSelect } from '../../../components/custom-select'

interface WeekRangeFilterProps {
  onChange: (range: { start: string; end: string }) => void
}

const MonthPickerInput = forwardRef<
  HTMLButtonElement,
  { value?: string; onClick?: () => void }
>(({ value, onClick }, ref) => (
  <button
    ref={ref}
    type='button'
    onClick={onClick}
    className='balance-filter-control h-10 min-w-[220px] rounded-md border border-purple-300/20 bg-[linear-gradient(180deg,rgba(23,23,27,0.92)_0%,rgba(14,14,18,0.92)_100%)] px-3 pr-9 text-left text-sm text-white/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.22)] outline-none transition focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/35'
  >
    {value || 'Select Month'}
  </button>
))

MonthPickerInput.displayName = 'MonthPickerInput'

export function WeekRangeFilter({ onChange }: WeekRangeFilterProps) {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
  const [selectedWeek, setSelectedWeek] = useState<number>(0) // Inicializa com 0 para garantir que sempre tenha um valor
  const [weeksInMonth, setWeeksInMonth] = useState<Date[][]>([])

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

    // Sempre configura uma semana válida
    if (weeks.length > 0) {
      if (currentWeekIndex !== -1) {
        setSelectedWeek(currentWeekIndex)
      } else {
        // Se não encontrou a semana atual, seleciona a primeira semana
        setSelectedWeek(0)
      }
    }
  }, [selectedMonth])

  useEffect(() => {
    if (weeksInMonth.length > 0 && selectedWeek >= 0 && selectedWeek < weeksInMonth.length) {
      const [start, end] = weeksInMonth[selectedWeek]
      const startDate = format(start, 'yyyy-MM-dd')
      const endDate = format(end, 'yyyy-MM-dd')

      onChange({
        start: startDate,
        end: endDate,
      })
    }
  }, [selectedWeek, weeksInMonth])

  // Função corrigida com tipagem adequada
  const handleMonthChange = (date: Date | null) => {
    if (date) {
      setSelectedMonth(date)
      setSelectedWeek(0) // Reset to 0 when changing month
    }
  }

  const resetToCurrentWeek = () => {
    const currentDate = new Date()
    setSelectedMonth(currentDate)

    const currentWeekIndex = weeksInMonth.findIndex((week) => {
      const weekStartOfThisWeek = startOfWeek(currentDate, { weekStartsOn: 0 })
      return (
        getWeek(week[0], { weekStartsOn: 0 }) ===
        getWeek(weekStartOfThisWeek, { weekStartsOn: 0 })
      )
    })

    if (currentWeekIndex !== -1) {
      setSelectedWeek(currentWeekIndex)
    } else if (weeksInMonth.length > 0) {
      setSelectedWeek(0)
    }
  }

  const weekOptions = useMemo(
    () =>
      weeksInMonth.map((week, index) => ({
        value: String(index),
        label: `Week ${index + 1} (${format(week[0], 'dd/MM')} - ${format(week[1], 'dd/MM')})`,
      })),
    [weeksInMonth]
  )

  return (
    <div className='flex flex-wrap items-end gap-4 text-white'>
      <div className='flex flex-col'>
        <label className='mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400'>
          Month
        </label>
        <div className='relative z-40'>
          <DatePicker
            selected={selectedMonth}
            onChange={handleMonthChange}
            dateFormat='MM/yyyy'
            showMonthYearPicker
            placeholderText='Select Month'
            popperClassName='z-[120] balance-datepicker-popper'
            calendarClassName='balance-datepicker'
            customInput={<MonthPickerInput />}
          />
          <span className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-purple-300/85'>
            ▼
          </span>
        </div>
      </div>

      <div className='flex flex-col'>
        <label className='mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400'>
          Week
        </label>
        <CustomSelect
          value={String(selectedWeek)}
          onChange={(value) => setSelectedWeek(Number(value))}
          options={weekOptions}
          placeholder='No weeks available'
          minWidthClassName='min-w-[260px]'
        />
      </div>

      <div className='flex flex-col'>
        <label className='invisible mb-1 text-sm text-white'>Reset</label>
        <button
          onClick={resetToCurrentWeek}
          className='inline-flex h-10 min-w-[100px] items-center justify-center rounded-md border border-purple-400/40 bg-purple-500/20 px-4 text-sm text-purple-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.22)] transition hover:border-purple-300/55 hover:bg-purple-500/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/45'
        >
          Reset
        </button>
      </div>
    </div>
  )
}
