import { useState, useEffect, useRef, useCallback } from 'react'
import { UserPlus } from '@phosphor-icons/react'
import { Modal } from './modal'
import axios from 'axios'
import { api } from '../services/axiosConfig'
import { ErrorComponent, ErrorDetails } from './error-display'

interface MultiSelectDropdownProps {
  onChange: (selected: string[]) => void
  onError: (error: ErrorDetails) => void
}

interface ApiOption {
  id: string
  username: string
  global_name: string
}

const fetchApiOptions = async (
  teamId: string,
  onError: (error: ErrorDetails) => void
) => {
  try {
    const response = await api.get(
      `${import.meta.env.VITE_API_BASE_URL}/team/${teamId}`
    )
    return response.data.info.members || []
  } catch (error) {
    const errorDetails = axios.isAxiosError(error)
      ? {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        }
      : { message: 'Erro inesperado', response: error }
    onError(errorDetails)
    return []
  }
}

const MultiSelectDropdown = ({
  onChange,
  onError,
}: MultiSelectDropdownProps) => {
  const [selected, setSelected] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [apiOptions, setApiOptions] = useState<ApiOption[]>([])
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Busca as opções da API ao montar o componente do time Prefeito
  useEffect(() => {
    const teamId = '1148721174088532040'
    fetchApiOptions(teamId, onError)
      .then(setApiOptions)
      .finally(() => setLoading(false))
  }, [onError])

  // Fecha o dropdown ao clicar fora dele
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

  // Notifica o componente pai sempre que a seleção mudar
  useEffect(() => onChange(selected), [selected, onChange])

  // Alterna a seleção de um item
  const handleSelect = useCallback(
    (value: string) =>
      setSelected((prev) =>
        prev.includes(value)
          ? prev.filter((item) => item !== value)
          : [...prev, value]
      ),
    []
  )

  // Obtém os nomes de exibição dos itens selecionados
  const getDisplayNames = () =>
    selected
      .map((value) => {
        const [id, username] = value.split(';')
        return (
          apiOptions.find((u) => u.id === id && u.username === username)
            ?.global_name || value
        )
      })
      .join(', ')

  return (
    <div ref={dropdownRef} className='relative'>
      {/* Exibe o dropdown com os itens selecionados */}
      <div
        className={`cursor-pointer rounded-md border bg-white p-2 font-normal ${selected.length > 0 ? 'text-black' : 'text-zinc-400'}`}
        onClick={() => setOpen(!open)}
      >
        {selected.length > 0 ? getDisplayNames() : 'Raid Leader'}
      </div>
      {open && (
        <div className='absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md bg-white shadow-lg'>
          {loading ? (
            <div className='p-2 text-center text-gray-500'>
              Loading options...
            </div>
          ) : (
            apiOptions.map((option) => (
              <div
                key={option.username}
                className='flex cursor-pointer items-center p-2 hover:bg-gray-100'
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
            ))
          )}
        </div>
      )}
    </div>
  )
}

export interface AddRunProps {
  onClose: () => void
  onRunAddedReload: () => void
}

// Defina uma classe utilitária para estilos comuns
const commonInputStyles =
  'rounded-md border p-2 transition focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500'

export function AddRun({ onClose, onRunAddedReload }: AddRunProps) {
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    raid: '',
    runType: '',
    difficulty: '',
    idTeam: '',
    maxBuyers: '',
    raidLeader: [] as string[],
    loot: '',
    note: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Atualiza os valores do formulário
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]:
        id === 'maxBuyers' && !/^[0-9]*$/.test(value) ? prev.maxBuyers : value,
    }))
  }

  // Envia os dados do formulário para a API
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.post(`${import.meta.env.VITE_API_BASE_URL}/run`, formData)
      await onRunAddedReload()
      setIsSuccess(true)
      setTimeout(onClose, 3000)
    } catch (error) {
      setError(
        axios.isAxiosError(error)
          ? {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status,
            }
          : { message: 'Erro inesperado', response: error }
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className='flex w-full max-w-[95vw] flex-col overflow-y-auto overflow-x-hidden'>
        {error ? (
          // Exibe o componente de erro caso ocorra algum problema
          <ErrorComponent error={error} onClose={() => setError(null)} />
        ) : isSuccess ? (
          // Exibe mensagem de sucesso após a criação da run
          <div className='p-6 text-center'>
            <div className='mb-4 text-4xl text-green-500'>✓</div>
            <h2 className='mb-2 text-2xl font-bold'>
              Run created successfully!
            </h2>
            <p className='text-zinc-400'>
              The modal will close automatically in 3 seconds...
            </p>
          </div>
        ) : (
          // Formulário para criar uma nova run
          <form onSubmit={handleSubmit} className='grid grid-cols-2 gap-4'>
            {/* Inputs e selects para os dados da run */}
            <input
              type='date'
              id='date'
              required
              value={formData.date}
              onChange={handleChange}
              className={`${commonInputStyles} text-zinc-400 valid:text-black`}
            />
            <input
              type='time'
              id='time'
              required
              value={formData.time}
              onChange={handleChange}
              className={`${commonInputStyles} text-zinc-400 valid:text-black`}
            />
            <input
              type='text'
              id='raid'
              required
              placeholder='Raid'
              value={formData.raid}
              onChange={handleChange}
              className={commonInputStyles}
            />
            <select
              id='runType'
              required
              value={formData.runType}
              onChange={handleChange}
              className={`${commonInputStyles} font-normal valid:text-black invalid:text-zinc-400`}
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
              value={formData.difficulty}
              onChange={handleChange}
              className={`${commonInputStyles} font-normal valid:text-black invalid:text-zinc-400`}
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
              id='idTeam'
              required
              value={formData.idTeam}
              onChange={handleChange}
              className={`${commonInputStyles} font-normal valid:text-black invalid:text-zinc-400`}
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
              <option className='text-black' value='1346914505392783372'>
                Raio
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
              value={formData.maxBuyers}
              onChange={handleChange}
              className={commonInputStyles}
            />
            <MultiSelectDropdown
              onChange={(selected) =>
                setFormData((prev) => ({ ...prev, raidLeader: selected }))
              }
              onError={setError}
            />
            <select
              required
              id='loot'
              value={formData.loot}
              onChange={handleChange}
              className={`${commonInputStyles} font-normal valid:text-black invalid:text-zinc-400`}
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
              value={formData.note}
              onChange={handleChange}
              className={`col-span-2 ${commonInputStyles}`}
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
