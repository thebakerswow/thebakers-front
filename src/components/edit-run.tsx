import { useState, useEffect, useRef, useMemo } from 'react'
import { Pencil } from '@phosphor-icons/react'
import { Modal } from './modal'
import axios from 'axios'
import { RunData } from '../types/runs-interface'
import { api } from '../services/axiosConfig'
import { ErrorComponent, ErrorDetails } from './error-display'

interface MultiSelectDropdownProps {
  onChange: (selected: string[]) => void
  initialSelected: string[] // Adicione esta linha
}

interface ApiOption {
  id: string
  username: string
  global_name: string
}

const MultiSelectDropdown = ({
  onChange,
  initialSelected,
}: MultiSelectDropdownProps) => {
  const [selected, setSelected] = useState<string[]>(initialSelected)
  const [open, setOpen] = useState(false)
  const [apiOptions, setApiOptions] = useState<ApiOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ErrorDetails | null>(null)

  const dropdownRef = useRef<HTMLDivElement>(null)

  function getSpecificTeamUrl(teamId: string) {
    return `${import.meta.env.VITE_API_BASE_URL}/team/${teamId}`
  }

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // prefeitos
        const teamId = '1148721174088532040'
        const response = await api.get(
          getSpecificTeamUrl(teamId) ||
            'http://localhost:8000/v1/team/1148721174088532040'
        )

        if (response.data.info.members) {
          setApiOptions(response.data.info.members)
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorDetails = {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          }
          setError(errorDetails)
        } else {
          setError({
            message: 'Erro inesperado',
            response: error,
          })
        }
      } finally {
        setLoading(false)
      }
    }

    fetchOptions()
  }, [])

  useEffect(() => {
    setSelected(initialSelected)
  }, [initialSelected])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    onChange(selected)
  }, [selected, onChange])

  useEffect(() => {
    if (JSON.stringify(selected) !== JSON.stringify(initialSelected)) {
      setSelected(initialSelected)
    }
  }, [initialSelected])

  const handleSelect = (value: string) => {
    setSelected((prev) => {
      const newSelection = prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
      return newSelection
    })
  }

  const getDisplayNames = () => {
    return selected
      .map((value) => {
        const parts = value.split(';')
        return parts.length >= 2 ? parts[1] : value
      })
      .join(', ')
  }

  return (
    <div ref={dropdownRef} className='relative'>
      <div
        className={`cursor-pointer rounded-md border bg-white p-2 font-normal ${
          selected.length > 0 ? 'text-black' : 'text-zinc-400'
        }`}
        onClick={() => setOpen(!open)}
      >
        {selected.length > 0 ? getDisplayNames() : 'Raid Leader'}
      </div>
      {open && (
        <div className='absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md bg-white shadow-lg'>
          {loading && (
            <div className='p-2 text-center text-gray-500'>
              Loading options...
            </div>
          )}
          {!loading &&
            !error &&
            apiOptions.map((option) => (
              <div
                key={option.id}
                className='flex cursor-pointer items-center p-2 hover:bg-gray-100'
                onClick={() => handleSelect(`${option.id};${option.username}`)}
              >
                <input
                  type='checkbox'
                  checked={selected.includes(`${option.id};${option.username}`)}
                  readOnly
                  className='mr-2'
                />
                <span className='text-black'>{option.username}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

export interface EditRunProps {
  run: RunData
  onClose: () => void
  onRunEdit: () => void
}

export function EditRun({ onClose, run, onRunEdit }: EditRunProps) {
  const [date, setDate] = useState(run.date)
  const [time, setTime] = useState(run.time)
  const [raid, setRaid] = useState(run.raid)
  const [runType, setRunType] = useState(run.runType)
  const [difficulty, setDifficulty] = useState(run.difficulty)
  const [idTeam, setIdTeam] = useState(run.idTeam)
  const [maxBuyers, setMaxBuyers] = useState(run.maxBuyers)
  const [raidLeader, setRaidLeader] = useState<string[]>(
    run.raidLeaders?.map((rl) => `${rl.idDiscord};${rl.username}`) || []
  )
  const [loot, setLoot] = useState(run.loot)
  const [note, setNote] = useState(run.note)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<ErrorDetails | null>(null)

  const initialSelected = useMemo(
    () => run.raidLeaders?.map((rl) => `${rl.idDiscord};${rl.username}`) || [],
    [run.raidLeaders] // ⬅️ Só recalcula se raidLeaders mudar
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (/^[0-9]*$/.test(newValue)) {
      setMaxBuyers(newValue)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const data = {
      id: run.id,
      date,
      time,
      raid,
      runType,
      difficulty,
      idTeam,
      maxBuyers: maxBuyers.toString(),
      raidLeader: raidLeader.map((value) => {
        const parts = value.split(';')
        return `${parts[0]};${parts[1]}`
      }),
      loot,
      note,
    }

    try {
      await api.put(
        `${import.meta.env.VITE_API_BASE_URL}/run` ||
          'http://localhost:8000/v1/run',
        data
      )

      await onRunEdit()

      setIsSuccess(true)

      setTimeout(() => onClose(), 3000)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorDetails = {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        }
        setError(errorDetails)
      } else {
        setError({
          message: 'Erro inesperado',
          response: error,
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className='flex w-full max-w-[95vw] flex-col overflow-y-auto overflow-x-hidden'>
        {error ? (
          <ErrorComponent error={error} onClose={() => setError(null)} />
        ) : isSuccess ? (
          <div className='p-6 text-center'>
            <div className='mb-4 text-4xl text-green-500'>✓</div>
            <h2 className='mb-2 text-2xl font-bold'>
              Run edited successfully!
            </h2>
            <p className='text-zinc-400'>
              The modal will close automatically in 3 seconds...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='grid grid-cols-2 gap-4'>
            <input
              type='date'
              id='date'
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className='rounded-md border p-2 text-zinc-400 transition valid:text-black focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500'
            />
            <input
              type='time'
              id='time'
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className='rounded-md border p-2 text-zinc-400 transition valid:text-black focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500'
            />
            <input
              type='text'
              id='raid'
              required
              placeholder='Raid'
              value={raid}
              onChange={(e) => setRaid(e.target.value)}
              className='rounded-md border p-2 transition focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500'
            />
            <select
              required
              id='runType'
              value={runType}
              onChange={(e) => setRunType(e.target.value)}
              className='rounded-md border p-2 font-normal transition valid:text-black invalid:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500'
            >
              <option value='' disabled hidden className='text-zinc-400'>
                Run Type
              </option>
              <option value='Full Raid' className='text-black'>
                Full Raid
              </option>
              <option value='AOTC' className='text-black'>
                AOTC
              </option>
              <option value='Legacy' className='text-black'>
                Legacy
              </option>
            </select>
            <select
              id='difficulty'
              required
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className='rounded-md border p-2 font-normal transition valid:text-black invalid:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500'
            >
              <option value='' disabled hidden className='text-zinc-400'>
                Difficulty
              </option>
              <option className='text-black' value='Normal'>
                Normal
              </option>
              <option className='text-black' value='Heroic'>
                Heroic
              </option>
              <option className='text-black' value='Mythic'>
                Mythic
              </option>
            </select>
            <select
              required
              id='team'
              value={idTeam}
              onChange={(e) => setIdTeam(e.target.value)}
              className='rounded-md border p-2 font-normal transition valid:text-black invalid:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500'
            >
              <option value='' disabled hidden className='text-zinc-400'>
                Team
              </option>
              <option className='text-black' value='1119092171157541006'>
                Padeirinho
              </option>
              <option className='text-black' value='1153459315907235971'>
                Garçom
              </option>
              <option className='text-black' value='1224792109241077770'>
                Confeiteiros
              </option>
              <option className='text-black' value='1328892768034226217'>
                Jackfruit
              </option>
              <option className='text-black' value='1328938639949959209'>
                Milharal
              </option>
              <option className='text-black' value='1337818949831626753'>
                APAE
              </option>
            </select>
            <input
              type='text'
              id='maxBuyers'
              required
              placeholder='Max Buyers'
              value={maxBuyers}
              onChange={handleChange}
              className='rounded-md border p-2 transition focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500'
            />
            <MultiSelectDropdown
              initialSelected={initialSelected}
              onChange={(selected) => setRaidLeader(selected)}
            />
            <select
              required
              id='loot'
              value={loot}
              onChange={(e) => setLoot(e.target.value)}
              className='rounded-md border p-2 font-normal transition valid:text-black invalid:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500'
            >
              <option value='' disabled hidden className='text-zinc-400'>
                Loot
              </option>
              <option className='text-black' value='Saved'>
                Saved
              </option>
              <option className='text-black' value='Unsaved'>
                Unsaved
              </option>
            </select>
            <textarea
              placeholder='Note'
              id='note'
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className='col-span-2 rounded-md border p-2 transition focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500'
            />
            <div className='col-span-2 flex items-center justify-center gap-4'>
              <button
                type='submit'
                disabled={isSubmitting}
                className={`flex items-center gap-2 rounded-md bg-red-400 p-2 text-gray-100 hover:bg-red-500 ${
                  isSubmitting ? 'cursor-not-allowed opacity-50' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className='h-5 w-5 animate-spin rounded-full border-b-2 border-white'></div>
                    Editing...
                  </>
                ) : (
                  <>
                    <Pencil size={20} /> Edit Run
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  )
}
