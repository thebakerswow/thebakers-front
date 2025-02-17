import { useState, useEffect, useRef } from 'react'
import { UserPlus } from '@phosphor-icons/react'
import { Modal } from '../../../components/modal'
import axios from 'axios'

interface MultiSelectDropdownProps {
  onChange: (selected: string[]) => void
}

interface ApiOption {
  username: string
  global_name: string
}

const MultiSelectDropdown = ({ onChange }: MultiSelectDropdownProps) => {
  const [selected, setSelected] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [apiOptions, setApiOptions] = useState<ApiOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const dropdownRef = useRef<HTMLDivElement>(null)

  function getSpecificTeamUrl(teamId: string) {
    return `${import.meta.env.VITE_GET_SPECIFIC_TEAM_URL}${teamId}`
  }

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const teamId = '1148721174088532040'
        const response = await axios.get(
          getSpecificTeamUrl(teamId) ||
            'http://localhost:8000/v1/team/1148721174088532040',
          {
            headers: {
              APP_TOKEN: import.meta.env.VITE_APP_TOKEN,
            },
          }
        )

        if (response.data.info.members) {
          setApiOptions(response.data.info.members)
        }
      } catch (err) {
        console.error('Erro ao buscar usuários:', err)
        setError('Falha ao carregar opções')
      } finally {
        setLoading(false)
      }
    }

    fetchOptions()
  }, [])

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

  const handleSelect = (value: string) => {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    )
  }

  // Função para obter os nomes de exibição
  const getDisplayNames = () => {
    return selected
      .map((username) => {
        const user = apiOptions.find((u) => u.username === username)
        return user?.global_name || username
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
                onClick={() => handleSelect(option.username)}
              >
                <input
                  type='checkbox'
                  checked={selected.includes(option.username)}
                  readOnly
                  className='mr-2'
                />
                <span className='text-black'>{option.global_name}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

export interface InputRunProps {
  onClose: () => void
}

export function InputRun({ onClose }: InputRunProps) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [raid, setRaid] = useState('')
  const [runType, setRunType] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [team, setTeam] = useState('')
  const [maxBuyers, setMaxBuyers] = useState('')
  const [raidLeader, setRaidLeader] = useState<string[]>([])
  const [goldCollector, setGoldCollector] = useState('')
  const [loot, setLoot] = useState('')
  const [note, setNote] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = {
      date,
      time,
      raid,
      runType,
      difficulty,
      team,
      maxBuyers,
      raidLeader,
      goldCollector,
      loot,
      note,
    }
    console.log(formData)
  }

  return (
    <Modal onClose={onClose}>
      <div className='w-full max-w-[95vw] overflow-y-auto overflow-x-hidden flex flex-col'>
        <form onSubmit={handleSubmit} className='grid grid-cols-2 gap-4'>
          <input
            type='date'
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className='p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition text-zinc-400 valid:text-black'
          />
          <input
            type='time'
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className='p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition text-zinc-400 valid:text-black'
          />
          <input
            type='text'
            required
            placeholder='Raid'
            value={raid}
            onChange={(e) => setRaid(e.target.value)}
            className='p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition'
          />
          <select
            required
            value={runType}
            onChange={(e) => setRunType(e.target.value)}
            className='p-2 font-normal border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition invalid:text-zinc-400 valid:text-black'
          >
            <option value='' disabled hidden className='text-zinc-400'>
              Run Type
            </option>
            <option value='fullraid' className='text-black'>
              Full Raid
            </option>
            <option value='aotc' className='text-black'>
              AOTC
            </option>
            <option value='legacy' className='text-black'>
              Legacy
            </option>
          </select>
          <select
            required
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className='p-2 font-normal border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition invalid:text-zinc-400 valid:text-black'
          >
            <option value='' disabled hidden className='text-zinc-400'>
              Difficulty
            </option>
            <option className='text-black' value='normal'>
              Normal
            </option>
            <option className='text-black' value='heroic'>
              Heroic
            </option>
            <option className='text-black' value='mythic'>
              Mythic
            </option>
          </select>
          <select
            required
            value={team}
            onChange={(e) => setTeam(e.target.value)}
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
            required
            placeholder='Max Buyers'
            value={maxBuyers}
            onChange={(e) => setMaxBuyers(e.target.value)}
            className='p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition'
          />
          <MultiSelectDropdown
            onChange={(selected) => setRaidLeader(selected)}
          />
          <input
            type='text'
            required
            placeholder='Gold Collector'
            value={goldCollector}
            onChange={(e) => setGoldCollector(e.target.value)}
            className='p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition'
          />
          <select
            required
            value={loot}
            onChange={(e) => setLoot(e.target.value)}
            className='p-2 font-normal border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition invalid:text-zinc-400 valid:text-black'
          >
            <option value='' disabled hidden className='text-zinc-400'>
              Loot
            </option>
            <option className='text-black' value='saved'>
              Saved
            </option>
            <option className='text-black' value='unsaved'>
              Unsaved
            </option>
          </select>
          <input
            type='text'
            placeholder='Note'
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className='p-2 col-span-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition'
          />
          <div className='col-span-2 flex justify-center'>
            <button
              type='submit'
              className='flex items-center gap-2 bg-red-400 text-gray-100 hover:bg-red-500 rounded-md p-2'
            >
              <UserPlus size={20} /> Add Run
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
