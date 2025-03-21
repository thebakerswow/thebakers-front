import { UserPlus } from '@phosphor-icons/react'
import axios from 'axios'
import { useState, useEffect } from 'react'
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
  const [nameAndRealm, setNameAndRealm] = useState('')
  const [playerClass, setPlayerClass] = useState('')
  const [buyerPot, setBuyerPot] = useState('')
  const [isPaid, setIsPaid] = useState<boolean | undefined>(undefined)
  const [idBuyerAdvertiser, setIdBuyerAdvertiser] = useState('')
  const [buyerNote, setBuyerNote] = useState('')
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<ErrorDetails | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const rawValue = e.target.value.replace(/\D/g, '') // Remove tudo que não for número
    if (rawValue) {
      const formattedValue = Number(rawValue).toLocaleString('en-US')
      setBuyerPot(formattedValue)
    } else {
      setBuyerPot('')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const data = {
      id_run: run.id,
      nameAndRealm,
      playerClass,
      buyerPot: Number(buyerPot.replace(/,/g, '')), // Remove a formatação antes de enviar
      isPaid,
      idBuyerAdvertiser,
      buyerNote,
    }
    try {
      await api.post(
        `${import.meta.env.VITE_API_BASE_URL}/buyer` ||
          'http://localhost:8000/v1/buyer',
        data
      )

      setIsSuccess(true)
      await onBuyerAddedReload()

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

  useEffect(() => {
    async function fetchAdvertisers() {
      try {
        const response = await api.get(
          `${import.meta.env.VITE_API_BASE_URL}/users/ghost` ||
            'http://localhost:8000/v1/users/ghost'
        )
        setAdvertisers(response.data.info)
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
      }
    }
    fetchAdvertisers()
  }, [])

  return (
    <Modal onClose={onClose}>
      <div className='flex w-full max-w-[95vw] flex-col overflow-y-auto overflow-x-hidden'>
        {error ? (
          <ErrorComponent error={error} onClose={() => setError(null)} />
        ) : isSuccess ? (
          <div className='p-6 text-center'>
            <div className='mb-4 text-4xl text-green-500'>✓</div>
            <h2 className='mb-2 text-2xl font-bold'>
              Buyer added successfully!
            </h2>
            <p className='text-zinc-400'>
              The modal will close automatically in 3 seconds...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='grid grid-cols-2 gap-4'>
            <input
              type='text'
              id='nameAndRealm'
              required
              value={nameAndRealm}
              onChange={(e) => setNameAndRealm(e.target.value)}
              placeholder='Buyer Name-Realm'
              className='rounded-md border p-2 transition focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500'
            />

            <select
              id='playerClass'
              value={playerClass}
              onChange={(e) => setPlayerClass(e.target.value)}
              className='rounded-md border p-2 transition valid:text-black invalid:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500'
            >
              <option value='' disabled hidden>
                Class
              </option>
              <option className='text-black' value='Warrior'>
                Warrior
              </option>
              <option className='text-black' value='Paladin'>
                Paladin
              </option>
              <option className='text-black' value='Hunter'>
                Hunter
              </option>
              <option className='text-black' value='Rogue'>
                Rogue
              </option>
              <option className='text-black' value='Priest'>
                Priest
              </option>
              <option className='text-black' value='Shaman'>
                Shaman
              </option>
              <option className='text-black' value='Mage'>
                Mage
              </option>
              <option className='text-black' value='Warlock'>
                Warlock
              </option>
              <option className='text-black' value='Monk'>
                Monk
              </option>
              <option className='text-black' value='Druid'>
                Druid
              </option>
              <option className='text-black' value='Demonhunter'>
                Demon Hunter
              </option>
              <option className='text-black' value='Deathknight'>
                Death Knight
              </option>
              <option className='text-black' value='Evoker'>
                Evoker
              </option>
            </select>

            <input
              type='text'
              id='buyerPot'
              required
              value={buyerPot}
              onChange={handleChange}
              placeholder='Pot'
              className='rounded-md border p-2 transition focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500'
            />
            <select
              id='idBuyerAdvertiser'
              value={idBuyerAdvertiser}
              onChange={(e) => setIdBuyerAdvertiser(e.target.value)}
              className='rounded-md border p-2 text-zinc-400 transition focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500'
            >
              <option value='' disabled hidden>
                Advertiser
              </option>
              {advertisers.map((advertiser) => (
                <option
                  className='text-black'
                  key={advertiser.id}
                  value={advertiser.id_discord}
                >
                  {advertiser.username}
                </option>
              ))}
            </select>
            <input
              type='text'
              id='buyerNote'
              value={buyerNote}
              onChange={(e) => setBuyerNote(e.target.value)}
              placeholder='Note'
              className='rounded-md border p-2 transition focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500'
            />
            <div className='flex items-center gap-2'>
              <label htmlFor='isPaid' className='ml-2 text-lg text-zinc-700'>
                Paid Full
              </label>
              <input
                type='checkbox'
                id='isPaid'
                checked={isPaid ?? false}
                onChange={(e) => setIsPaid(e.target.checked)}
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
