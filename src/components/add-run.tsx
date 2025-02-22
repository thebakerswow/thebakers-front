import { useState, useEffect, useRef, useCallback } from 'react'
import { UserPlus } from '@phosphor-icons/react'
import { Modal } from './modal'
import axios from 'axios'
import { api } from '../services/axiosConfig'
import { ErrorComponent, ErrorDetails } from './error-display'

interface MultiSelectDropdownProps {
  onChange: (selected: string[]) => void
}

interface ApiOption {
  id: string
  username: string
  global_name: string
}

const MultiSelectDropdown = ({ onChange }: MultiSelectDropdownProps) => {
  const [selected, setSelected] = useState<string[]>([])
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
          console.error('Erro detalhado:', errorDetails)
          setError(errorDetails)
        } else {
          const genericError = {
            message: 'Erro inesperado',
            response: error,
          }
          console.error('Erro genérico:', error)
          setError(genericError)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchOptions()
  }, [])

  if (error) {
    return <ErrorComponent error={error} />
  }

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

  const handleSelect = useCallback((value: string) => {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    )
  }, [])

  // Função para obter os nomes de exibição
  const getDisplayNames = () => {
    return selected
      .map((value) => {
        // Divide o valor armazenado em user_id e username
        const [id, username] = value.split(';')
        // Encontra o usuário correspondente
        const user = apiOptions.find(
          (u) => u.id === id && u.username === username
        )
        return user?.global_name || value // Exibe o global_name ou o valor como fallback
      })
      .join(', ')
  }

  return (
    <div ref={dropdownRef} className='relative'>
      <div
        className={`p-2 border rounded-md cursor-pointer bg-white font-normal ${
          selected.length > 0 ? 'text-black' : 'text-zinc-400'
        }`}
        onClick={() => setOpen(!open)}
      >
        {selected.length > 0 ? getDisplayNames() : 'Raid Leader'}
      </div>

      {open && (
        <div className='absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-y-auto'>
          {loading && (
            <div className='p-2 text-gray-500 text-center'>
              Loading options...
            </div>
          )}

          {error && <div className='p-2 text-red-500 text-center'>{error}</div>}

          {!loading &&
            !error &&
            apiOptions.map((option) => (
              <div
                key={option.username}
                className='p-2 hover:bg-gray-100 cursor-pointer flex items-center'
                onClick={() => handleSelect(`${option.id};${option.username}`)}
              >
                <input
                  type='checkbox'
                  checked={selected.includes(`${option.id};${option.username}`)}
                  readOnly
                  className='mr-2'
                />
                <span className='text-balck font-normal'>
                  {option.global_name}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

export interface AddRunProps {
  onClose: () => void
  onRunAddedReload: () => void
}

export function AddRun({ onClose, onRunAddedReload }: AddRunProps) {
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [raid, setRaid] = useState('')
  const [runType, setRunType] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [idTeam, setIdTeam] = useState('')
  const [maxBuyers, setMaxBuyers] = useState('')
  const [raidLeader, setRaidLeader] = useState<string[]>([])
  const [loot, setLoot] = useState('')
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

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
      date,
      time,
      raid,
      runType,
      difficulty,
      idTeam,
      maxBuyers,
      raidLeader,
      loot,
      note,
    }

    try {
      await api.post(
        `${import.meta.env.VITE_API_BASE_URL}/run` ||
          'http://localhost:8000/v1/run',
        data
      )

      onRunAddedReload()

      setIsSuccess(true)

      setTimeout(() => {
        onClose()
      }, 3000)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorDetails = {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        }
        console.error('Erro detalhado:', errorDetails)
        setError(errorDetails)
      } else {
        const genericError = {
          message: 'Erro inesperado',
          response: error,
        }
        console.error('Erro genérico:', error)
        setError(genericError)
      }
    } finally {
      setIsSubmitting(false) // Desativa o loading em qualquer caso
    }
  }

  if (error) {
    return <ErrorComponent error={error} />
  }

  return (
    <Modal onClose={onClose}>
      <div className='w-full max-w-[95vw] overflow-y-auto overflow-x-hidden flex flex-col'>
        {isSuccess ? (
          <div className='p-6 text-center'>
            <div className='text-green-500 text-4xl mb-4'>✓</div>
            <h2 className='text-2xl font-bold mb-2'>
              Run created successfully!
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
              className='p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition text-zinc-400 valid:text-black'
            />
            <input
              type='time'
              id='time'
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className='p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition text-zinc-400 valid:text-black'
            />
            <input
              type='text'
              id='raid'
              required
              placeholder='Raid'
              value={raid}
              onChange={(e) => setRaid(e.target.value)}
              className='p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition'
            />
            <select
              id='runType'
              required
              value={runType}
              onChange={(e) => setRunType(e.target.value)}
              className='p-2 font-normal border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition invalid:text-zinc-400 valid:text-black'
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
              className='p-2 font-normal border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition invalid:text-zinc-400 valid:text-black'
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
              id='team'
              required
              value={idTeam}
              onChange={(e) => setIdTeam(e.target.value)}
              className='p-2 font-normal border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition invalid:text-zinc-400 valid:text-black'
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
              className='p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition'
            />
            <MultiSelectDropdown
              onChange={(selected) => setRaidLeader(selected)}
            />
            <select
              required
              id='loot'
              value={loot}
              onChange={(e) => setLoot(e.target.value)}
              className='p-2 font-normal border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition invalid:text-zinc-400 valid:text-black'
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
              className='p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition col-span-2'
            />
            <div className='flex items-center justify-center gap-4 col-span-2'>
              <button
                type='submit'
                disabled={isSubmitting}
                className={`flex items-center gap-2 bg-red-400 text-gray-100 hover:bg-red-500 rounded-md p-2 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus size={20} /> Add Run
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
