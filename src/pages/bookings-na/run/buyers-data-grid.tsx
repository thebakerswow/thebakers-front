import { useState } from 'react'
import { CheckFat, Pencil, Trash, XCircle } from '@phosphor-icons/react'
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

const statusPriorities: Record<string, number> = {
  done: 1,
  group: 2,
  waiting: 3,
  backup: 4,
  noshow: 5,
  closed: 6,
}

export function BuyersDataGrid({
  data,
  onBuyerStatusEdit,
  onBuyerNameNoteEdit,
  onDeleteSuccess,
}: BuyersGridProps) {
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [openModal, setOpenModal] = useState(false)
  const [editingBuyer, setEditingBuyer] = useState<{
    id: string
    nameAndRealm: string
    buyerPot: number
    buyerNote: string
  } | null>(null)
  const [modalType, setModalType] = useState<'edit' | 'delete' | null>(null)

  const handleOpenModal = (buyer: BuyerData, type: 'edit' | 'delete') => {
    setEditingBuyer({
      id: buyer.id,
      nameAndRealm: buyer.nameAndRealm,
      buyerPot: buyer.buyerPot,
      buyerNote: buyer.buyerNote,
    })
    setModalType(type)
    setOpenModal(true)
  }

  // Função para ordenar os dados com base na prioridade do status
  const sortedData = Array.isArray(data)
    ? [...data].sort((a, b) => {
        const priorityA = statusPriorities[a.status || ''] || Infinity
        const priorityB = statusPriorities[b.status || ''] || Infinity
        return priorityA - priorityB
      })
    : []

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
            <th className='border p-2'>Slot</th>
            <th className='w-[100px] border p-2'>Status</th>
            <th className='border p-2'>Name-Realm</th>
            <th className='border p-2'>Note</th>
            <th className='border p-2'>Advertiser</th>
            <th className='border p-2'>Collector</th>
            <th className='border p-2'>Paid Full</th>
            <th className='border p-2'>Total Pot</th>
            <th className='border p-2'>Run Pot</th>
            <th className='border p-2'>Class</th>
            <th className='border p-2' />
          </tr>
        </thead>
        <tbody className='table-row-group bg-zinc-200 text-sm font-medium text-zinc-900'>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={12} className='p-4 text-center text-gray-500'>
                No Buyers
              </td>
            </tr>
          ) : (
            sortedData?.map((buyer, index) => (
              <tr
                key={buyer.id}
                className={`border border-gray-300 ${getBuyerColor(buyer.status)}`}
              >
                <td className='p-2 text-center'>{index + 1}</td>
                <td className='p-2'>
                  <form>
                    <select
                      id='status'
                      className='bg-zinc-100 transition focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500'
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
                <td className='p-2 text-center'>{buyer.buyerNote}</td>

                <td className='p-2 text-center'>{buyer.nameOwnerBuyer}</td>
                <td className='p-2 text-center'>{buyer.nameCollector}</td>
                <td className='w-20 p-2 text-center'>
                  <div className='flex items-center justify-center'>
                    <button onClick={() => handleTogglePaid(buyer.id)}>
                      {buyer.isPaid ? (
                        <CheckFat
                          className='cursor-pointer rounded-xl border bg-white text-green-500'
                          size={22}
                          weight='fill'
                        />
                      ) : (
                        <XCircle
                          className='cursor-pointer rounded-xl border bg-white text-red-600'
                          size={22}
                          weight='fill'
                        />
                      )}
                    </button>
                  </div>
                </td>
                <td className='p-2 text-center'>
                  {Math.round(Number(buyer.buyerPot)).toLocaleString('en-US')}
                </td>
                <td className='p-2 text-center'>
                  {Math.round(Number(buyer.buyerActualPot)).toLocaleString(
                    'en-US'
                  )}
                </td>

                <td className='flex justify-center gap-2 p-2'>
                  {buyer.playerClass}
                  {getClassImage(buyer.playerClass) ? (
                    <img
                      src={getClassImage(buyer.playerClass)}
                      alt={buyer.playerClass}
                      className='h-6 w-6'
                    />
                  ) : (
                    <div className='flex h-6 w-6 items-center justify-center rounded bg-gray-300'>
                      ?
                    </div>
                  )}
                </td>
                <td className='w-16 text-center'>
                  {buyer.nameAndRealm !== '****' && (
                    <div className='flex justify-center gap-2'>
                      <button onClick={() => handleOpenModal(buyer, 'edit')}>
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => handleOpenModal(buyer, 'delete')}>
                        <Trash size={18} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
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
