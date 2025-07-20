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
import { Select, MenuItem, Button } from '@mui/material'

interface WeekRangeFilterProps {
  onChange: (range: { start: string; end: string }) => void
}

export function WeekRangeFilter({ onChange }: WeekRangeFilterProps) {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
  const [selectedWeek, setSelectedWeek] = useState<number>(-1) // Inicializa com -1 para indicar "não selecionado"
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
    } else if (weeks.length > 0) {
      // Se não encontrou a semana atual, seleciona a primeira semana
      setSelectedWeek(0)
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
      setSelectedWeek(-1) // Reset to -1 when changing month
      setIsCalendarOpen(false)
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

  return (
    <div className='flex items-center gap-10 text-black'>
      <div className='flex flex-col'>
        <label className='mb-1 text-sm text-white'>Month</label>
        <div className='relative'>
          <DatePicker
            selected={selectedMonth}
            onChange={handleMonthChange}
            dateFormat='MM/yyyy'
            showMonthYearPicker
            className='rounded-sm border border-gray-300 py-1 pl-4 pr-8 font-normal text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black'
            placeholderText='Select Month'
            open={isCalendarOpen}
            onClickOutside={() => setIsCalendarOpen(false)}
            onSelect={() => setIsCalendarOpen(false)}
            onFocus={() => setIsCalendarOpen(true)}
            popperClassName='z-50' // Added this line
          />
        </div>
      </div>

      <div className='flex flex-col'>
        <label className='mb-1 text-sm text-white'>Week</label>
        <div className='relative'>
          <Select
            value={selectedWeek >= 0 ? selectedWeek : ''}
            onChange={(e) => setSelectedWeek(Number(e.target.value))}
            displayEmpty
            className='bg-white text-zinc-900'
            style={{ minWidth: 200, height: 36 }} // Reduced height
            sx={{
              backgroundColor: 'white',
              height: '40px', // Define uma altura menor para o Select
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                border: 'none', // Remove a borda ao focar
              },
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none', // Remove a borda padrão
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                border: 'none', // Remove a borda ao passar o mouse
              },
              boxShadow: 'none', // Remove qualquer sombra
            }}
            MenuProps={{
              PaperProps: {
                style: {
                  boxShadow: 'none', // Remove sombra do menu dropdown
                },
              },
            }}
          >
            {weeksInMonth.length === 0 && (
              <MenuItem value='' disabled>
                No weeks available
              </MenuItem>
            )}
            {weeksInMonth.map((week, index) => (
              <MenuItem key={index} value={index}>
                Week {index + 1} ({format(week[0], 'dd/MM')} -{' '}
                {format(week[1], 'dd/MM')})
              </MenuItem>
            ))}
          </Select>
        </div>
      </div>

      <div className='flex flex-col'>
        <label className='invisible mb-1 text-sm text-white'>Reset</label>
        <Button
          onClick={resetToCurrentWeek}
          variant='contained'
          sx={{
            backgroundColor: 'rgb(239, 68, 68)',
            '&:hover': { backgroundColor: 'rgb(248, 113, 113)' },
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  )
}
