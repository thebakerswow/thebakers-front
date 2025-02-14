import { useEffect, useRef, useState } from 'react'
import { teamData } from '../../../assets/team-data'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { format } from 'date-fns'

export function Attendance() {
  const [selectedTeam, setSelectedTeam] = useState('team1')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [tables, setTables] = useState<{ [date: string]: TableData }>({})
  const [calendarVisible, setCalendarVisible] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null) // Referência ao calendário
  const inputRef = useRef<HTMLInputElement>(null)

  type TableData = {
    selectValues: { [team: string]: { [key: string]: string } }
    freelancers: { [team: string]: string[] }
  }

  const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTeam(e.target.value)
  }

  const handleSelectChange = (
    rowIndex: number,
    cellIndex: number,
    value: string,
    isFreelancer: boolean = false
  ) => {
    if (!selectedDate) return

    const formattedDate = format(selectedDate, 'MM/dd/yyyy')
    setTables((prev) => {
      const currentTable = prev[formattedDate] || {
        selectValues: { team1: {}, team2: {}, team3: {} },
        freelancers: {
          team1: new Array(5).fill('Freelancer'),
          team2: new Array(5).fill('Freelancer'),
          team3: new Array(5).fill('Freelancer'),
        },
      }

      const updatedSelectValues = { ...currentTable.selectValues }
      const updatedTeamValues = { ...updatedSelectValues[selectedTeam] }

      const key = isFreelancer
        ? `freelancer-${rowIndex}-${cellIndex}`
        : `${rowIndex}-${cellIndex}`

      updatedTeamValues[key] = value

      updatedSelectValues[selectedTeam] = updatedTeamValues

      return {
        ...prev,
        [formattedDate]: {
          ...currentTable,
          selectValues: updatedSelectValues,
        },
      }
    })
  }

  const handleDateClick = (date: Date) => {
    const formattedDate = format(date, 'MM/dd/yyyy')
    setSelectedDate(date)

    if (!tables[formattedDate]) {
      setTables((prev) => ({
        ...prev,
        [formattedDate]: {
          selectValues: {
            team1: {},
            team2: {},
            team3: {},
          },
          freelancers: {
            team1: new Array(5).fill('Freelancer'),
            team2: new Array(5).fill('Freelancer'),
            team3: new Array(5).fill('Freelancer'),
          },
        },
      }))
    }
    setCalendarVisible(false) // Fecha o calendário ao selecionar uma data
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setCalendarVisible(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  const handleFreelancerNameChange = (
    team: string,
    index: number,
    value: string
  ) => {
    if (!selectedDate) return

    const formattedDate = format(selectedDate, 'MM/dd/yyyy')
    setTables((prev) => {
      const currentTable = prev[formattedDate] || {
        selectValues: { team1: {}, team2: {}, team3: {} },
        freelancers: {
          team1: new Array(5).fill('Freelancer'),
          team2: new Array(5).fill('Freelancer'),
          team3: new Array(5).fill('Freelancer'),
        },
      }

      const updatedFreelancers = { ...currentTable.freelancers }
      updatedFreelancers[team][index] = value

      return {
        ...prev,
        [formattedDate]: {
          ...currentTable,
          freelancers: updatedFreelancers,
        },
      }
    })
  }

  const today = new Date()
  const formattedToday = format(today, 'MM/dd/yyyy')

  if (!tables[formattedToday]) {
    setTables((prev) => ({
      ...prev,
      [formattedToday]: {
        selectValues: { team1: {}, team2: {}, team3: {} },
        freelancers: {
          team1: new Array(5).fill('Freelancer'),
          team2: new Array(5).fill('Freelancer'),
          team3: new Array(5).fill('Freelancer'),
        },
      },
    }))
    setSelectedDate(today)
  }

  const filteredTeamData = teamData.filter(
    (row) => row.team === selectedTeam.replace('team', '')
  )

  const percentages = ['0%', '25%', '50%', '75%', '100%']
  const columnHeaders = [
    'R1',
    'R2',
    'R3',
    'A1',
    'A2',
    'A3',
    'R4',
    'R5',
    'R6',
    'A4',
    'A5',
    'A6',
    'R7',
    'R8',
    'R9',
    'A7',
    'A8',
    'A9',
  ]

  const getColumnClass = (index: number) => {
    if (index >= 0 && index <= 5) {
      return index % 2 === 0 ? 'bg-red-400' : 'bg-red-300'
    }
    if (index >= 6 && index <= 11) {
      return index % 2 === 0 ? 'bg-blue-400' : 'bg-blue-300'
    }
    if (index >= 12) {
      return index % 2 === 0 ? 'bg-green-400' : 'bg-green-300'
    }
  }

  return (
    <div className='bg-zinc-700 text-gray-100 absolute inset-0 flex flex-col rounded-xl shadow-2xl m-8 overflow-y-auto scrollbar-thin'>
      <div className='m-4 flex gap-2 items-center'>
        <select
          className='rounded-md text-zinc-700 pl-2 p-0.5'
          name='select'
          onChange={handleTeamChange}
          value={selectedTeam}
        >
          <option value='team1'>Team 1</option>
          <option value='team2'>Team 2</option>
          <option value='team3'>Team 3</option>
        </select>

        <div className='relative'>
          <input
            ref={inputRef} // Referência para o input
            type='text'
            value={selectedDate ? format(selectedDate, 'MM/dd/yyyy') : ''}
            onClick={() => setCalendarVisible(!calendarVisible)} // Alterna o estado do calendário
            className='rounded-md text-zinc-700 pl-2 p-0.5'
            placeholder='MM/DD/YYYY'
            readOnly
          />

          {calendarVisible && (
            <div
              ref={calendarRef} // Referência para o calendário
              className='absolute p-2 z-10 bg-zinc-800 text-white border border-zinc-500 rounded-md'
            >
              <DayPicker
                selected={selectedDate}
                onDayClick={handleDateClick}
                modifiers={{
                  selected: (date) =>
                    date.getTime() === selectedDate?.getTime(),
                }}
                className='text-white'
              />
            </div>
          )}
        </div>
      </div>

      {selectedDate && (
        <table className='min-w-full border-collapse'>
          <thead className='table-header-group'>
            <tr className='text-md bg-zinc-400 text-gray-700'>
              <th className='p-2 border border-r-black' colSpan={19}>
                {`Team ${selectedTeam.replace('team', '')} - ${format(
                  selectedDate,
                  'MM/dd/yyyy'
                )}`}
              </th>
            </tr>
            <tr className='text-md bg-zinc-300 text-gray-800'>
              <th className='p-2 border'>Player</th>
              {columnHeaders.map((header, index) => (
                <th
                  key={`header-${index}`}
                  className={`p-2 border ${getColumnClass(index)}`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='table-row-group text-sm font-medium text-zinc-900 bg-zinc-200'>
            {filteredTeamData.map((row, rowIndex) => (
              <tr
                className={`text-center ${
                  rowIndex % 2 === 0 ? 'bg-white' : 'bg-zinc-200'
                }`}
                key={`row-${rowIndex}`}
              >
                <td className='p-2 border'>{row.player}</td>
                {columnHeaders.map((_, cellIndex) => (
                  <td
                    key={`cell-${rowIndex}-${cellIndex}`}
                    className={`p-2 border ${getColumnClass(cellIndex)}`}
                  >
                    <select
                      className='rounded-md text-zinc-700 bg-transparent'
                      value={
                        tables[format(selectedDate!, 'MM/dd/yyyy')]
                          ?.selectValues[selectedTeam]?.[
                          `${rowIndex}-${cellIndex}`
                        ] || ''
                      }
                      onChange={(e) =>
                        handleSelectChange(rowIndex, cellIndex, e.target.value)
                      }
                    >
                      <option value='' disabled />
                      {percentages.map((percent, percentIndex) => (
                        <option key={percentIndex} value={percent}>
                          {percent}
                        </option>
                      ))}
                    </select>
                  </td>
                ))}
              </tr>
            ))}
            {tables[format(selectedDate!, 'MM/dd/yyyy')]?.freelancers[
              selectedTeam
            ].map((freelancer, index) => (
              <tr
                key={`freelancer-${selectedTeam}-${index}`}
                className={`text-center ${
                  index % 2 === 0 ? 'bg-white' : 'bg-zinc-200'
                }`}
              >
                <td className='p-2 border bg-purple-300'>
                  <input
                    type='text'
                    value={freelancer}
                    onChange={(e) =>
                      handleFreelancerNameChange(
                        selectedTeam,
                        index,
                        e.target.value
                      )
                    }
                    placeholder='Freelancer'
                    className='text-center rounded-md bg-transparent p-1'
                  />
                </td>
                {columnHeaders.map((_, cellIndex) => (
                  <td
                    key={`freelancer-cell-${selectedTeam}-${index}-${cellIndex}`}
                    className={`p-2 border ${getColumnClass(cellIndex)}`}
                  >
                    <select
                      className='rounded-md text-zinc-700 bg-transparent'
                      value={
                        tables[format(selectedDate!, 'MM/dd/yyyy')]
                          ?.selectValues[selectedTeam]?.[
                          `freelancer-${index}-${cellIndex}`
                        ] || ''
                      }
                      onChange={(e) =>
                        handleSelectChange(
                          index,
                          cellIndex,
                          e.target.value,
                          true
                        )
                      }
                    >
                      <option value='' disabled />
                      {percentages.map((percent, percentIndex) => (
                        <option key={percentIndex} value={percent}>
                          {percent}
                        </option>
                      ))}
                    </select>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
