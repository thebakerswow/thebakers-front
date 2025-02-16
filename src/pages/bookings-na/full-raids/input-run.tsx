import { useState, useEffect, useRef } from 'react'
import { UserPlus } from '@phosphor-icons/react'
import { Modal } from '../../../components/modal'

interface MultiSelectDropdownProps {
  onChange: (selected: string[]) => void
}

const MultiSelectDropdown = ({ onChange }: MultiSelectDropdownProps) => {
  const [selected, setSelected] = useState<string[]>([])
  const [open, setOpen] = useState(false)

  const options = [
    { value: 'wellster', label: 'wellster' },
    { value: 'flykzuzuzu__', label: 'flykzuzuzu__' },
    { value: 'glauber', label: 'glauber' },
    { value: 'jaorayol', label: 'jaorayol' },
    { value: 'dinheiros', label: 'dinheiros' },
    { value: 'ngbnewsoficial', label: 'ngbnewsoficial' },
  ]

  const dropdownRef = useRef<HTMLDivElement>(null)

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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Chama onChange sempre que "selected" for atualizado
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

  return (
    <div ref={dropdownRef} className='relative'>
      <div
        className={`p-2 border rounded-md cursor-pointer bg-white font-normal ${
          selected.length > 0 ? 'text-black' : 'text-zinc-400'
        }`}
        onClick={() => setOpen(!open)}
      >
        {selected.length > 0 ? selected.join(', ') : 'Raid Leader'}
      </div>
      {open && (
        <div className='absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md'>
          {options.map((option) => (
            <div
              key={option.value}
              className='p-2 hover:bg-gray-100 cursor-pointer flex items-center'
              onClick={() => handleSelect(option.value)}
            >
              <input
                type='checkbox'
                checked={selected.includes(option.value)}
                readOnly
                className='mr-2'
              />
              <span className='text-black'>{option.label}</span>
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
