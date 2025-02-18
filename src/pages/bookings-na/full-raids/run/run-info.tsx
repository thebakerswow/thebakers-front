import { useEffect, useState } from 'react'
import { Megaphone, Pencil, UserPlus } from '@phosphor-icons/react'
import amirdrassilCover from '../../../../assets/amirdrassil.png'
import { Modal } from '../../../../components/modal'
import { RunData } from './run-details'
import axios from 'axios'

interface RunInfoProps {
  run: RunData
}

interface Advertiser {
  id: string
  id_discord: string
  name: string
  username: string
}

export function RunInfo({ run }: RunInfoProps) {
  const [isAddBuyerOpen, setIsAddBuyerOpen] = useState(false)
  const [paymentRealm, setPaymentRealm] = useState('')
  const [paymentFaction, setPaymentFaction] = useState('')
  const [nameAndRealm, setNameAndRealm] = useState('')
  const [playerClass, setPlayerClass] = useState('')
  const [buyerPot, setBuyerPot] = useState('')
  const [isPaid, setIsPaid] = useState<boolean | undefined>(undefined)
  const [idBuyerAdvertiser, setIdBuyerAdvertiser] = useState('')
  const [buyerNote, setBuyerNote] = useState('')
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([])

  function handleOpenAddBuyer() {
    setIsAddBuyerOpen(true)
  }

  function handleCloseAddBuyer() {
    setIsAddBuyerOpen(false)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value
    if (/^[0-9]*$/.test(newValue)) {
      setBuyerPot(newValue)
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = {
      paymentRealm,
      paymentFaction,
      nameAndRealm,
      playerClass,
      buyerPot,
      isPaid,
      idBuyerAdvertiser,
      buyerNote,
    }
    console.log('Dados do formulário:', data)
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
        console.log(response.data.info)
        setAdvertisers(response.data.info)
      } catch (error) {
        console.error('Erro ao buscar os advertisers:', error)
      }
    }
    fetchAdvertisers()
  }, [])

  return (
    <div className='flex m-4 gap-4 rounded-md'>
      <img
        className='w-[400px] rounded-md'
        src={amirdrassilCover}
        alt='Run Cover'
      />
      <div className='grid grid-cols-4 flex-1 text-center bg-gray-300 rounded-md text-zinc-900'>
        <div className='col-span-3'>
          <h1 className='font-semibold text-lg'>
            {run.raid} {run.difficulty} @ {run.time}
          </h1>
          <div className='grid grid-cols-3 gap-4 mt-4 text-start ml-24'>
            <p>
              <span className='font-bold text-base'>Raid Id: </span>
              {run.id}
            </p>
            <p className='text-yellow-500 font-semibold'>
              <span className='font-bold text-base text-zinc-900'>
                Loot Type:{' '}
              </span>
              {run.loot}
            </p>
            <p className='text-red-500 font-semibold'>
              <span className='font-bold text-base text-zinc-900'>
                Max Buyers:{' '}
              </span>
              {run.maxBuyers}
            </p>
            <p>
              <span className='font-bold text-base'>Slots Available: </span>
            </p>
            <p>
              <span className='font-bold text-base'>Backups: </span>
            </p>
            <p>
              <span className='font-bold text-base'>Leader: </span>{' '}
              {run.raidLeaders && run.raidLeaders.length > 0 ? (
                run.raidLeaders
                  .map((raidLeader) => raidLeader.username)
                  .join(', ')
              ) : (
                <span>-</span>
              )}
            </p>
            <p>
              <span className='font-bold text-base'>Gold Collector: </span>
              {run.goldCollector}
            </p>
            <p>
              <span className='font-bold text-base'>Potential Pot: </span>
            </p>
            <p>
              <span className='font-bold text-base'>Actual Pot: </span>{' '}
            </p>
          </div>
        </div>
        <div className='flex flex-col gap-2 m-4 justify-center items-center'>
          <button
            className='flex items-center gap-2 bg-red-400 text-gray-100 hover:bg-red-500 rounded-md p-2 w-full justify-center'
            onClick={handleOpenAddBuyer}
          >
            <UserPlus size={18} />
            Add Buyer
          </button>
          <button className='flex items-center gap-2 bg-red-400 text-gray-100 hover:bg-red-500 rounded-md p-2 w-full justify-center'>
            <Pencil size={18} />
            Edit Raid
          </button>
          <button className='flex items-center gap-2 bg-red-400 text-gray-100 hover:bg-red-500 rounded-md p-2 w-full justify-center'>
            <Megaphone size={18} />
            Announcement
          </button>
        </div>
      </div>

      {isAddBuyerOpen && (
        <Modal onClose={handleCloseAddBuyer}>
          <div className='w-full max-w-[95vw] overflow-y-auto overflow-x-hidden flex flex-col'>
            <form onSubmit={handleSubmit} className='grid grid-cols-2 gap-4'>
              <input
                type='text'
                value={paymentRealm}
                onChange={(e) => setPaymentRealm(e.target.value)}
                placeholder='Payment Realm'
                className='p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition'
              />

              <select
                value={paymentFaction}
                onChange={(e) => setPaymentFaction(e.target.value)}
                className='p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition'
              >
                <option value='' disabled hidden>
                  Payment Faction
                </option>
                <option value='Horde'>Horde</option>
                <option value='Alliance'>Alliance</option>
              </select>

              <input
                type='text'
                value={nameAndRealm}
                onChange={(e) => setNameAndRealm(e.target.value)}
                placeholder='Buyer Name-Realm'
                className='p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition'
              />

              <select
                value={playerClass}
                onChange={(e) => setPlayerClass(e.target.value)}
                className='p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition'
              >
                <option value='' disabled hidden>
                  Class
                </option>
                <option value='Warrior'>Warrior</option>
                <option value='Paladin'>Paladin</option>
                <option value='Hunter'>Hunter</option>
                <option value='Rogue'>Rogue</option>
                <option value='Priest'>Priest</option>
                <option value='Shaman'>Shaman</option>
                <option value='Mage'>Mage</option>
                <option value='Warlock'>Warlock</option>
                <option value='Monk'>Monk</option>
                <option value='Druid'>Druid</option>
                <option value='Demonhunter'>Demon Hunter</option>
                <option value='Deathknight'>Death Knight</option>
                <option value='Evoker'>Evoker</option>
              </select>

              <input
                type='text'
                value={buyerPot}
                onChange={handleChange}
                placeholder='Pot'
                className='p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition'
              />

              <select
                value={isPaid !== undefined ? String(isPaid) : ''}
                onChange={(e) => setIsPaid(e.target.value === 'true')}
                className='p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition'
              >
                <option value='' disabled hidden>
                  Paid Full
                </option>
                <option value='true'>Yes</option>
                <option value='false'>No</option>
              </select>

              <select
                value={idBuyerAdvertiser}
                onChange={(e) => setIdBuyerAdvertiser(e.target.value)}
                className='p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition'
              >
                <option value='' disabled hidden>
                  Advertiser
                </option>
                {advertisers.map((advertiser) => (
                  <option key={advertiser.id} value={advertiser.id}>
                    {advertiser.username}
                  </option>
                ))}
              </select>

              <input
                type='text'
                value={buyerNote}
                onChange={(e) => setBuyerNote(e.target.value)}
                placeholder='Note'
                className='p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition'
              />
              <button
                type='submit'
                className='flex items-center gap-2 bg-red-400 text-gray-100 hover:bg-red-500 rounded-md p-2 justify-center col-span-2'
              >
                <UserPlus size={20} /> Add Buyer
              </button>
            </form>
          </div>
        </Modal>
      )}
    </div>
  )
}
