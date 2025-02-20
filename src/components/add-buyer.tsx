import { UserPlus } from '@phosphor-icons/react'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { Modal } from './modal'
import { RunData } from '../pages/bookings-na/run'

interface AddBuyerProps {
  run: RunData
  onClose: () => void
  onBuyerAddedReload: () => Promise<void>
}

interface Advertiser {
  id: string
  id_discord: string
  name: string
  username: string
}

export function AddBuyer({ run, onClose, onBuyerAddedReload }: AddBuyerProps) {
  const [paymentRealm, setPaymentRealm] = useState('')
  const [paymentFaction, setPaymentFaction] = useState('')
  const [nameAndRealm, setNameAndRealm] = useState('')
  const [playerClass, setPlayerClass] = useState('')
  const [buyerPot, setBuyerPot] = useState('')
  const [isPaid, setIsPaid] = useState<boolean | undefined>(undefined)
  const [idBuyerAdvertiser, setIdBuyerAdvertiser] = useState('')
  const [buyerNote, setBuyerNote] = useState('')
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value
    if (/^[0-9]*$/.test(newValue)) {
      setBuyerPot(newValue)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const data = {
      id_run: run.id,
      paymentRealm,
      paymentFaction,
      nameAndRealm,
      playerClass,
      buyerPot,
      isPaid,
      idBuyerAdvertiser,
      buyerNote,
    }

    try {
      const jwt = sessionStorage.getItem('jwt')
      await axios.post(
        import.meta.env.VITE_POST_BUYER_URL || 'http://localhost:8000/v1/buyer',
        data,
        {
          headers: {
            APP_TOKEN: import.meta.env.VITE_APP_TOKEN,
            Authorization: `Bearer ${jwt}`,
          },
        }
      )

      onBuyerAddedReload()

      setIsSuccess(true)
      await onBuyerAddedReload()
      setTimeout(() => {
        onClose()
      }, 3000)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Erro detalhado:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        })
      } else {
        console.error('Erro inesperado:', error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    async function fetchAdvertisers() {
      try {
        const response = await axios.get(
          import.meta.env.VITE_API_ADVERTISERS_URL ||
            'http://localhost:8000/v1/users/ghost',
          {
            headers: {
              APP_TOKEN: import.meta.env.VITE_APP_TOKEN,
              Authorization: `Bearer ${sessionStorage.getItem('jwt')}`,
            },
          }
        )
        setAdvertisers(response.data.info)
      } catch (error) {
        console.error('Erro ao buscar os advertisers:', error)
      }
    }
    fetchAdvertisers()
  }, [])

  return (
    <Modal onClose={onClose}>
      <div className='w-full max-w-[95vw] overflow-y-auto overflow-x-hidden flex flex-col'>
        {isSuccess ? (
          <div className='p-6 text-center'>
            <div className='text-green-500 text-4xl mb-4'>✓</div>
            <h2 className='text-2xl font-bold mb-2'>
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
              id='paymentRealm'
              required
              value={paymentRealm}
              onChange={(e) => setPaymentRealm(e.target.value)}
              placeholder='Payment Realm'
              className='p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition '
            />

            <select
              id='paymentFaction'
              value={paymentFaction}
              required
              onChange={(e) => setPaymentFaction(e.target.value)}
              className='p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition invalid:text-zinc-400 valid:text-black'
            >
              <option value='' disabled hidden>
                Payment Faction
              </option>
              <option className='text-black' value='Horde'>
                Horde
              </option>
              <option className='text-black' value='Alliance'>
                Alliance
              </option>
            </select>

            <input
              type='text'
              id='nameAndRealm'
              required
              value={nameAndRealm}
              onChange={(e) => setNameAndRealm(e.target.value)}
              placeholder='Buyer Name-Realm'
              className='p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition'
            />

            <select
              id='playerClass'
              value={playerClass}
              required
              onChange={(e) => setPlayerClass(e.target.value)}
              className='p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition invalid:text-zinc-400 valid:text-black'
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
              className='p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition'
            />

            <select
              id='isPaid'
              value={isPaid !== undefined ? String(isPaid) : ''}
              required
              onChange={(e) => setIsPaid(e.target.value === 'true')}
              className='p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition invalid:text-zinc-400 valid:text-black'
            >
              <option value='' disabled hidden>
                Paid Full
              </option>
              <option className='text-black' value='true'>
                Yes
              </option>
              <option className='text-black' value='false'>
                No
              </option>
            </select>

            <select
              id='idBuyerAdvertiser'
              value={idBuyerAdvertiser}
              onChange={(e) => setIdBuyerAdvertiser(e.target.value)}
              className='p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition text-zinc-400'
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
              className='p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition'
            />
            <button
              type='submit'
              className={`flex items-center gap-2 bg-red-400 text-gray-100 hover:bg-red-500 rounded-md p-2 justify-center col-span-2 ${
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
