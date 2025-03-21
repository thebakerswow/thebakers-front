import { UserPlus } from '@phosphor-icons/react'
import axios from 'axios'
import { useState, useEffect, useCallback } from 'react'
import { Modal } from './modal'
import { RunData } from '../types/runs-interface'
import { api } from '../services/axiosConfig'
import { ErrorComponent, ErrorDetails } from './error-display'

interface AddBuyerProps {
  run: RunData
  onClose: () => void
  onBuyerAddedReload: () => void
}

interface Advertiser {
  id: string
  id_discord: string
  name: string
  username: string
}

export function AddBuyer({ run, onClose, onBuyerAddedReload }: AddBuyerProps) {
  // Estado para armazenar os dados do formulário
  const [formData, setFormData] = useState({
    nameAndRealm: '',
    playerClass: '',
    buyerPot: '',
    isPaid: false,
    idBuyerAdvertiser: '',
    buyerNote: '',
  })
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<ErrorDetails | null>(null)

  // Função para lidar com mudanças nos inputs do formulário
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value, type, checked } = e.target as HTMLInputElement
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }))
  }

  // Função para formatar o valor do campo "buyerPot"
  const formatBuyerPot = (value: string) => {
    const rawValue = value.replace(/\D/g, '')
    return rawValue ? Number(rawValue).toLocaleString('en-US') : ''
  }

  // Função para lidar com o envio do formulário
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const data = {
      id_run: run.id,
      ...formData,
      buyerPot: Number(formData.buyerPot.replace(/,/g, '')),
    }

    try {
      // Envia os dados do comprador para a API
      await api.post(
        `${import.meta.env.VITE_API_BASE_URL}/buyer` ||
          'http://localhost:8000/v1/buyer',
        data
      )
      setIsSuccess(true)
      await onBuyerAddedReload()
      setTimeout(onClose, 1000) // Fecha o modal após 1 segundo
    } catch (error) {
      // Captura e armazena erros
      setError(
        axios.isAxiosError(error)
          ? {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status,
            }
          : { message: 'Unexpected error', response: error }
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Função para buscar a lista de anunciantes
  const fetchAdvertisers = useCallback(async () => {
    try {
      const response = await api.get(
        `${import.meta.env.VITE_API_BASE_URL}/users/ghost` ||
          'http://localhost:8000/v1/users/ghost'
      )
      setAdvertisers(response.data.info)
    } catch (error) {
      setError(
        axios.isAxiosError(error)
          ? {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status,
            }
          : { message: 'Unexpected error', response: error }
      )
    }
  }, [])

  useEffect(() => {
    fetchAdvertisers() // Busca anunciantes ao carregar o componente
  }, [fetchAdvertisers])

  // Classe reutilizável para estilizar inputs e selects
  const inputClass =
    'rounded-md border p-2 transition focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500'

  return (
    <Modal onClose={onClose}>
      <div className='flex w-full max-w-[95vw] flex-col overflow-y-auto overflow-x-hidden'>
        {error ? (
          // Exibe componente de erro se houver erro
          <ErrorComponent error={error} onClose={() => setError(null)} />
        ) : isSuccess ? (
          // Exibe mensagem de sucesso se o envio for bem-sucedido
          <div className='p-6 text-center'>
            <div className='mb-4 text-4xl text-green-500'>✓</div>
            <h2 className='mb-2 text-2xl font-bold'>
              Buyer added successfully!
            </h2>
            <p className='text-zinc-400'>
              The modal will close automatically in 1 second...
            </p>
          </div>
        ) : (
          // Formulário para adicionar comprador
          <form onSubmit={handleSubmit} className='grid grid-cols-2 gap-4'>
            <input
              type='text'
              id='nameAndRealm'
              required
              value={formData.nameAndRealm}
              onChange={handleInputChange}
              placeholder='Buyer Name-Realm'
              className={inputClass}
            />
            <select
              id='playerClass'
              value={formData.playerClass}
              onChange={handleInputChange}
              className={`${inputClass} ${
                formData.playerClass === '' ? 'text-zinc-400' : 'text-black'
              }`}
            >
              <option value='' disabled hidden>
                Class
              </option>
              {/* Lista de classes disponíveis */}
              {[
                'Warrior',
                'Paladin',
                'Hunter',
                'Rogue',
                'Priest',
                'Shaman',
                'Mage',
                'Warlock',
                'Monk',
                'Druid',
                'Demonhunter',
                'Deathknight',
                'Evoker',
              ].map((cls) => (
                <option key={cls} value={cls} className='text-black'>
                  {cls}
                </option>
              ))}
            </select>
            <input
              type='text'
              id='buyerPot'
              required
              value={formData.buyerPot}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  buyerPot: formatBuyerPot(e.target.value),
                }))
              }
              placeholder='Pot'
              className={inputClass}
            />
            <select
              id='idBuyerAdvertiser'
              value={formData.idBuyerAdvertiser}
              onChange={handleInputChange}
              className={`${inputClass} ${
                formData.idBuyerAdvertiser === ''
                  ? 'text-zinc-400'
                  : 'text-black'
              }`}
            >
              <option value='' disabled hidden>
                Advertiser
              </option>
              {/* Lista de anunciantes */}
              {advertisers.map((advertiser) => (
                <option
                  key={advertiser.id}
                  value={advertiser.id_discord}
                  className='text-black'
                >
                  {advertiser.username}
                </option>
              ))}
            </select>
            <input
              type='text'
              id='buyerNote'
              value={formData.buyerNote}
              onChange={handleInputChange}
              placeholder='Note'
              className={inputClass}
            />
            <div className='flex items-center gap-2'>
              <label htmlFor='isPaid' className='ml-2 text-lg text-zinc-700'>
                Paid Full
              </label>
              <input
                type='checkbox'
                id='isPaid'
                checked={formData.isPaid}
                onChange={handleInputChange}
                className='h-5 w-5 cursor-pointer accent-zinc-500'
              />
            </div>
            <button
              type='submit'
              className={`col-span-2 flex items-center justify-center gap-2 rounded-md bg-red-400 p-2 text-gray-100 hover:bg-red-500 ${
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
                  <UserPlus size={20} /> Add Buyer
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </Modal>
  )
}
