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

export interface BuyerData {
  id: string
  status: string
  idBuyerAdvertiser: string
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

  useEffect(() => {
    const orderData = [...data].sort((a, b) => {
      const priorityA = statusPriorities[a.status] || 99
      const priorityB = statusPriorities[b.status] || 99
      return priorityA - priorityB
    })
    setSortedData(orderData)
  }, [data])

  const countStatus = (status: string) => {
    return sortedData.filter((item) => item.status === status).length
  }

  const waitingCount = countStatus('waiting')
  const groupCount = countStatus('group')

  const handleStatusChange = (index: number, newStatus: string) => {
    const updatedData = [...sortedData]
    updatedData[index].status = newStatus || ''
    const orderData = updatedData.sort((a, b) => {
      const priorityA = statusPriorities[a.status] || 99
      const priorityB = statusPriorities[b.status] || 99
      return priorityA - priorityB
    })
    setSortedData(orderData)
  }

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
        <button className='flex items-center gap-2 bg-red-400 text-gray-100 hover:bg-red-500 rounded-md p-2 mb-2'>
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
            <th className='p-2 border'>Collected By</th>
            <th className='p-2 border'>Paid Full</th>
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
                    onChange={(e) => handleStatusChange(index, e.target.value)}
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
              <td className='p-2 text-center'>{buyer.idBuyerAdvertiser}</td>
              <td className='p-2 text-center'>
                {/* Verificação condicional para exibir o goldCollector */}
                {buyer.status === 'group' || buyer.status === 'done'
                  ? goldCollector
                  : '-'}
              </td>
              <td className='p-2 w-20 text-center'>
                <div className='flex justify-center items-center'>
                  {buyer.isPaid === true ? (
                    <CheckFat
                      className='text-green-500 border bg-white rounded-xl'
                      size={22}
                      weight='fill'
                    />
                  ) : (
                    <XCircle
                      className='text-red-600 border bg-white rounded-xl'
                      size={22}
                      weight='fill'
                    />
                  )}
                </div>
              </td>
              <td className='p-2 text-center'>{buyer.buyerNote}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
