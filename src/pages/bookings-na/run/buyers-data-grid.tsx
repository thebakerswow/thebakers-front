import { useState } from 'react'
import { CheckFat, DotsThreeVertical, XCircle } from '@phosphor-icons/react'
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
import axios from 'axios'
import { BuyerData } from '../../../types/buyer-interface'
import { api } from '../../../services/axiosConfig'
import { ErrorComponent, ErrorDetails } from '../../../components/error-display'
import { Modal } from '../../../components/modal'
import { DeleteBuyer } from '../../../components/delete-buyer'
import { EditBuyer } from '../../../components/edit-buyer'

interface BuyersGridProps {
  data: BuyerData[]
  onBuyerStatusEdit: () => void
  onBuyerNameNoteEdit: () => void
  onDeleteSuccess: () => void
}

// const statusPriorities: Record<string, number> = {
//   done: 1,
//   group: 2,
//   waiting: 3,
//   backup: 4,
//   noshow: 5,
//   closed: 6,
// }

export function BuyersDataGrid({
  data,
  onBuyerStatusEdit,
  onBuyerNameNoteEdit,
  onDeleteSuccess,
}: BuyersGridProps) {
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [openActionsDropdown, setOpenActionsDropdown] = useState(null)
  const [openModal, setOpenModal] = useState(false)
  const [editingBuyer, setEditingBuyer] = useState<{
    id: string
    nameAndRealm: string
    buyerPot: number
    buyerNote: string
  } | null>(null)
  const [modalType, setModalType] = useState<'edit' | 'delete' | null>(null)

  const toggleActionsDropdown = (buyerId: any) => {
    setOpenActionsDropdown(openActionsDropdown === buyerId ? null : buyerId)
  }

  const handleOpenModal = (buyer: BuyerData, type: 'edit' | 'delete') => {
    setEditingBuyer({
      id: buyer.id,
      nameAndRealm: buyer.nameAndRealm,
      buyerPot: buyer.buyerPot,
      buyerNote: buyer.buyerNote,
    })
    setModalType(type)
    setOpenModal(true)
    setOpenActionsDropdown(null)
  }

  const handleTogglePaid = async (buyerId: string) => {
    const payload = {
      id_buyer: buyerId,
      is_paid: !data.find((buyer) => buyer.id === buyerId)?.isPaid, // Altere para usar data direto
    }

    try {
      await api.put(
        `${import.meta.env.VITE_API_BASE_URL}/buyer/paid` ||
          'http://localhost:8000/v1/buyer/paid',
        payload
      )

      await onBuyerStatusEdit()
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

  const handleStatusChange = async (buyerId: string, newStatus: string) => {
    const payload = {
      id_buyer: buyerId,
      status: newStatus,
    }

    try {
      await api.put(
        `${import.meta.env.VITE_API_BASE_URL}/buyer/status` ||
          'http://localhost:8000/v1/buyer/status',
        payload
      )

      onBuyerStatusEdit()
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

  if (error) {
    return (
      <Modal onClose={() => setError(null)}>
        <ErrorComponent error={error} onClose={() => setError(null)} />
      </Modal>
    )
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
      <table className='min-w-full border-collapse'>
        <thead className='table-header-group'>
          <tr className='text-md bg-zinc-400 text-gray-700'>
            <th className='p-2 border'>Slot</th>
            <th className='p-2 border w-[100px]'>Status</th>
            <th className='p-2 border'>Name-Realm</th>
            <th className='p-2 border'>Faction</th>
            <th className='p-2 border'>Class</th>
            <th className='p-2 border'>Advertiser</th>
            <th className='p-2 border'>Collector</th>
            <th className='p-2 border'>Paid Full</th>
            <th className='p-2 border'>Total Pot</th>
            <th className='p-2 border'>Run Pot</th>
            <th className='p-2 border'>Note</th>
            <th className='p-2 border' />
          </tr>
        </thead>
        <tbody className='table-row-group text-sm font-medium text-zinc-900 bg-zinc-200'>
          {data?.map((buyer, index) => (
            <tr
              key={buyer.id}
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
              <td className='p-2 text-center'>{buyer.nameCollector}</td>
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
              <td className='p-2 text-center'>
                {Number(buyer.buyerPot).toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </td>
              <td className='p-2 text-center'>
                {Number(buyer.buyerActualPot).toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </td>

              <td className='p-2 text-center'>{buyer.buyerNote}</td>
              <td className='text-center'>
                {buyer.nameAndRealm !== '****' && (
                  <button onClick={() => toggleActionsDropdown(buyer.id)}>
                    <DotsThreeVertical size={18} />
                  </button>
                )}
                {openActionsDropdown === buyer.id && (
                  <div className='absolute right-16 w-32 bg-white border rounded shadow-md'>
                    <button
                      onClick={() => handleOpenModal(buyer, 'edit')}
                      className='block w-full px-4 py-2 text-left hover:bg-gray-100'
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleOpenModal(buyer, 'delete')}
                      className='block w-full px-4 py-2 text-left hover:bg-gray-100'
                    >
                      Delete
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {openModal && editingBuyer && (
        <Modal onClose={() => setOpenModal(false)}>
          {modalType === 'edit' ? (
            <EditBuyer
              buyer={{
                id: editingBuyer.id,
                nameAndRealm: editingBuyer.nameAndRealm,
                buyerPot: editingBuyer.buyerPot,
                buyerNote: editingBuyer.buyerNote,
              }}
              onClose={() => setOpenModal(false)}
              onEditSuccess={onBuyerNameNoteEdit}
            />
          ) : (
            <DeleteBuyer
              buyer={{
                id: editingBuyer.id,
                nameAndRealm: editingBuyer.nameAndRealm,
              }}
              onClose={() => setOpenModal(false)}
              onDeleteSuccess={onDeleteSuccess}
            />
          )}
        </Modal>
      )}
    </div>
  )
}
