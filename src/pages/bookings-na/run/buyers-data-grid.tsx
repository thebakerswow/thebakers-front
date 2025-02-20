import { useState, useEffect } from 'react'
import { CheckFat, UserPlus, XCircle } from '@phosphor-icons/react'
import DeathKnight from '../../../assets/class_icons/deathknight.png'
import DemonHunter from '../../../assets/class_icons/demonhunter.png'
import Druid from '../../../assets/class_icons/druid.png'
import Evoker from '../../../assets/class_icons/evoker.png'
import Hunter from '../../../assets/class_icons/hunter.png'
import Mage from '../../../assets/class_icons/mage.png'
import Monk from '../../../assets/class_icons/monk.png'
import Paladin from '../../../assets/class_icons/paladin.png'
import Priest from '../../../assets/class_icons/priest.png'
import Rogue from '../../../assets/class_icons/rogue.png'
import Shaman from '../../../assets/class_icons/shaman.png'
import Warlock from '../../../assets/class_icons/warlock.png'
import Warrior from '../../../assets/class_icons/warrior.png'
import { InviteBuyers } from '../../../components/invite-buyers'
import axios from 'axios'

export interface BuyerData {
  id: string
  status: string
  idBuyerAdvertiser: string
  nameOwnerBuyer: string
  buyerNote: string
  buyerPot: string
  isPaid: boolean
  nameAndRealm: string
  paymentFaction: string
  paymentRealm: string
  playerClass: string
  idRegister: string
}

interface BuyersGridProps {
  data: BuyerData[]
  goldCollector: string
}

const statusPriorities: Record<string, number> = {
  done: 1,
  group: 2,
  waiting: 3,
  backup: 4,
  noshow: 5,
  closed: 6,
}

export function BuyersDataGrid({ data, goldCollector }: BuyersGridProps) {
  const [sortedData, setSortedData] = useState<BuyerData[]>(data)
  const [isInviteBuyersOpen, setIsInviteBuyersOpen] = useState(false)

  const handleTogglePaid = async (buyerId: string) => {
    const currentBuyer = sortedData.find((buyer) => buyer.id === buyerId)
    if (!currentBuyer) return

    const newPaidStatus = !currentBuyer.isPaid // Captura o novo status

    const data = {
      id_buyer: buyerId,
      is_paid: newPaidStatus,
    }

    try {
      const jwt = sessionStorage.getItem('jwt')

      await axios.put('http://localhost:8000/v1/buyer/paid', data, {
        headers: {
          APP_TOKEN: import.meta.env.VITE_APP_TOKEN,
          Authorization: `Bearer ${jwt}`,
        },
      })

      // Atualiza o estado local
      setSortedData((prevData) => {
        const updatedData = prevData.map((buyer) =>
          buyer.id === buyerId ? { ...buyer, isPaid: newPaidStatus } : buyer
        )

        // Reaplica a ordenação
        return updatedData.sort((a, b) => {
          const priorityA = statusPriorities[a.status] || 99
          const priorityB = statusPriorities[b.status] || 99

          if (priorityA !== priorityB) return priorityA - priorityB
          if (a.isPaid !== b.isPaid) return a.isPaid ? -1 : 1
          return a.nameAndRealm.localeCompare(b.nameAndRealm)
        })
      })
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
    }
  }

  const handleStatusChange = async (buyerId: string, newStatus: string) => {
    const currentBuyer = sortedData.find((buyer) => buyer.id === buyerId)
    if (!currentBuyer) return

    const data = {
      id_buyer: buyerId,
      status: newStatus,
    }

    console.log('Dados enviados para atualização de status:', data)

    try {
      const jwt = sessionStorage.getItem('jwt')

      await axios.put('http://localhost:8000/v1/buyer/status', data, {
        headers: {
          APP_TOKEN: import.meta.env.VITE_APP_TOKEN,
          Authorization: `Bearer ${jwt}`,
        },
      })

      // Atualiza o status e reordena os dados
      setSortedData((prevData) => {
        const updatedData = prevData.map((buyer) =>
          buyer.id === buyerId ? { ...buyer, status: newStatus } : buyer
        )

        return updatedData.sort((a, b) => {
          const priorityA = statusPriorities[a.status] || 99
          const priorityB = statusPriorities[b.status] || 99

          if (priorityA !== priorityB) return priorityA - priorityB
          if (a.isPaid !== b.isPaid) return a.isPaid ? -1 : 1
          return a.nameAndRealm.localeCompare(b.nameAndRealm)
        })
      })
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
    }
  }

  function handleOpenInviteBuyersModal() {
    setIsInviteBuyersOpen(true)
  }

  function handleCloseInviteBuyersModal() {
    setIsInviteBuyersOpen(false)
  }

  useEffect(() => {
    const orderData = [...data].sort((a, b) => {
      const priorityA = statusPriorities[a.status] || 99
      const priorityB = statusPriorities[b.status] || 99

      if (priorityA !== priorityB) return priorityA - priorityB
      if (a.isPaid !== b.isPaid) return a.isPaid ? -1 : 1
      return 0 // Mantém a ordem original sem ordenar por nome
    })

    setSortedData(orderData)
  }, [data])

  const countStatus = (status: string) => {
    return sortedData.filter((item) => item.status === status).length
  }

  const waitingCount = countStatus('waiting')
  const groupCount = countStatus('group')

  function getClassImage(className: string): string {
    switch (className) {
      case 'Warrior':
        return Warrior
      case 'Paladin':
        return Paladin
      case 'Hunter':
        return Hunter
      case 'Rogue':
        return Rogue
      case 'Priest':
        return Priest
      case 'Shaman':
        return Shaman
      case 'Mage':
        return Mage
      case 'Warlock':
        return Warlock
      case 'Monk':
        return Monk
      case 'Druid':
        return Druid
      case 'Demon Hunter':
        return DemonHunter
      case 'Death Knight':
        return DeathKnight
      case 'Evoker':
        return Evoker
      default:
        return ''
    }
  }

  function getBuyerColor(status: string): string {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-200'
      case 'backup':
        return 'bg-purple-300'
      case 'group':
        return 'bg-blue-300'
      case 'done':
        return 'bg-green-300'
      case 'noshow':
        return 'bg-red-500'
      case 'closed':
        return 'bg-zinc-400'
      case '':
        return 'bg-white'
      default:
        return 'bg-white'
    }
  }

  return (
    <div>
      <div className='flex items-center gap-2'>
        <button
          onClick={handleOpenInviteBuyersModal}
          className='flex items-center gap-2 bg-red-400 text-gray-100 hover:bg-red-500 rounded-md p-2 mb-2'
        >
          <UserPlus size={18} />
          Invite Buyers
        </button>
        <div className='gap-2 flex p-2 mb-2 rounded-md bg-zinc-200 text-gray-700'>
          <span className=''>Waiting: {waitingCount}</span>
          <span className=''>Group: {groupCount}</span>
        </div>
      </div>

      <table className='min-w-full border-collapse'>
        <thead className='table-header-group'>
          <tr className='text-md bg-zinc-400 text-gray-700'>
            <th className='p-2 border'>Slot</th>
            <th className='p-2 border w-[100px]'>Status</th>
            <th className='p-2 border'>Name-Realm</th>
            <th className='p-2 border'>Payment Realm</th>
            <th className='p-2 border'>Faction</th>
            <th className='p-2 border'>Class</th>
            <th className='p-2 border'>Advertiser</th>
            <th className='p-2 border'>Collector</th>
            <th className='p-2 border'>Paid Full</th>
            <th className='p-2 border'>Pot</th>
            <th className='p-2 border'>Note</th>
          </tr>
        </thead>
        <tbody className='table-row-group text-sm font-medium text-zinc-900 bg-zinc-200'>
          {sortedData.map((buyer, index) => (
            <tr
              key={index}
              className={`border border-gray-300 ${getBuyerColor(buyer.status)}`}
            >
              <td className='p-2 text-center'>{index + 1}</td>
              <td className='p-2'>
                <form>
                  <select
                    id='status'
                    className='bg-zinc-100 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition'
                    value={buyer.status || ''}
                    onChange={(e) =>
                      handleStatusChange(buyer.id, e.target.value)
                    }
                  >
                    <option value='' disabled hidden>
                      ----------
                    </option>
                    <option value='waiting'>Waiting</option>
                    <option value='noshow'>No Show</option>
                    <option value='closed'>Closed</option>
                    <option value='backup'>Backup</option>
                    <option value='group'>Group</option>
                    <option value='done'>Done</option>
                  </select>
                </form>
              </td>
              <td className='p-2 text-center'>
                {buyer.nameAndRealm === '****'
                  ? 'Encrypted'
                  : buyer.nameAndRealm}
              </td>
              <td className='p-2 text-center'>{buyer.paymentRealm}</td>
              <td className='p-2 text-center'>{buyer.paymentFaction}</td>
              <td className='p-2 flex gap-2 justify-center'>
                {buyer.playerClass}
                {getClassImage(buyer.playerClass) ? (
                  <img
                    src={getClassImage(buyer.playerClass)}
                    alt={buyer.playerClass}
                    className='w-6 h-6'
                  />
                ) : (
                  <div className='w-6 h-6 bg-gray-300 flex justify-center items-center rounded'>
                    ?
                  </div>
                )}
              </td>
              <td className='p-2 text-center'>{buyer.nameOwnerBuyer}</td>
              <td className='p-2 text-center'>
                {/* Verificação condicional para exibir o goldCollector */}
                {(buyer.status === 'group' || buyer.status === 'done') &&
                buyer.isPaid === true
                  ? goldCollector
                  : '-'}
              </td>
              <td className='p-2 w-20 text-center'>
                <div className='flex justify-center items-center'>
                  <button onClick={() => handleTogglePaid(buyer.id)}>
                    {buyer.isPaid ? (
                      <CheckFat
                        className='text-green-500 border bg-white rounded-xl cursor-pointer'
                        size={22}
                        weight='fill'
                      />
                    ) : (
                      <XCircle
                        className='text-red-600 border bg-white rounded-xl cursor-pointer'
                        size={22}
                        weight='fill'
                      />
                    )}
                  </button>
                </div>
              </td>
              <td className='p-2 text-center'>{buyer.buyerPot}</td>
              <td className='p-2 text-center'>{buyer.buyerNote}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {isInviteBuyersOpen && (
        <InviteBuyers onClose={handleCloseInviteBuyersModal} />
      )}
    </div>
  )
}
