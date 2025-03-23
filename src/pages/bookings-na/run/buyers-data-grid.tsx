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
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material'

interface BuyersGridProps {
  data: BuyerData[]
  onBuyerStatusEdit: () => void
  onBuyerNameNoteEdit: () => void
  onDeleteSuccess: () => void
}

const statusOptions = [
  { value: 'waiting', label: 'Waiting' },
  { value: 'noshow', label: 'No Show' },
  { value: 'closed', label: 'Closed' },
  { value: 'backup', label: 'Backup' },
  { value: 'group', label: 'Group' },
  { value: 'done', label: 'Done' },
]

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

  const handleApiCall = async (
    url: string,
    payload: object,
    callback: () => void
  ) => {
    try {
      await api.put(url, payload)
      callback()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError({
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        })
      } else {
        setError({ message: 'Unexpected error', response: error })
      }
    }
  }

  const handleTogglePaid = (buyerId: string) => {
    const buyer = data.find((b) => b.id === buyerId)
    if (!buyer) return
    const payload = { id_buyer: buyerId, is_paid: !buyer.isPaid }
    handleApiCall(
      `${import.meta.env.VITE_API_BASE_URL}/buyer/paid` ||
        'http://localhost:8000/v1/buyer/paid',
      payload,
      onBuyerStatusEdit
    )
  }

  const handleStatusChange = (buyerId: string, newStatus: string) => {
    const payload = { id_buyer: buyerId, status: newStatus }
    handleApiCall(
      `${import.meta.env.VITE_API_BASE_URL}/buyer/status` ||
        'http://localhost:8000/v1/buyer/status',
      payload,
      onBuyerStatusEdit
    )
  }

  const renderStatusSelect = (buyer: BuyerData) => (
    <Select
      value={buyer.status || ''}
      onChange={(e) => handleStatusChange(buyer.id, e.target.value)}
      displayEmpty
      sx={{
        width: '7rem',
        height: '2rem', // Reduced height
        fontSize: '14px', // Adjust font size for better alignment
      }}
    >
      <MenuItem value='' disabled>
        ----------
      </MenuItem>
      {statusOptions.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  )

  const renderPaidIcon = (buyer: BuyerData) => (
    <IconButton onClick={() => handleTogglePaid(buyer.id)}>
      {buyer.isPaid ? (
        <CheckFat className='text-green-500' size={22} weight='fill' />
      ) : (
        <XCircle className='text-red-600' size={22} weight='fill' />
      )}
    </IconButton>
  )

  const renderClassImage = (className: string) => {
    const image = getClassImage(className)
    return image ? (
      <img src={image} alt={className} className='h-6 w-6' />
    ) : (
      <div className='flex h-6 w-6 items-center justify-center rounded bg-gray-300'>
        ?
      </div>
    )
  }

  // Função para ordenar os dados com base na prioridade do status
  const sortedData = Array.isArray(data)
    ? [...data].sort((a, b) => {
        const priorityA = statusPriorities[a.status || ''] || Infinity
        const priorityB = statusPriorities[b.status || ''] || Infinity
        return priorityA - priorityB
      })
    : []

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
    <TableContainer component={Paper} sx={{ overflow: 'visible' }}>
      {' '}
      {/* Removed scroll */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{ textAlign: 'center' }}
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE', // Added background color
              }}
            >
              Slot
            </TableCell>
            <TableCell
              sx={{ textAlign: 'center' }}
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE',
              }}
            >
              Status
            </TableCell>
            <TableCell
              sx={{ textAlign: 'center' }}
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE',
              }}
            >
              Name-Realm
            </TableCell>
            <TableCell
              sx={{ textAlign: 'center' }}
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE',
              }}
            >
              Note
            </TableCell>
            <TableCell
              sx={{ textAlign: 'center' }}
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE',
              }}
            >
              Advertiser
            </TableCell>
            <TableCell
              sx={{ textAlign: 'center' }}
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE',
              }}
            >
              Collector
            </TableCell>
            <TableCell
              sx={{ textAlign: 'center' }}
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE',
              }}
            >
              Paid Full
            </TableCell>
            <TableCell
              sx={{ textAlign: 'center' }}
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE',
              }}
            >
              Total Pot
            </TableCell>
            <TableCell
              sx={{ textAlign: 'center' }}
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE',
              }}
            >
              Run Pot
            </TableCell>
            <TableCell
              sx={{ textAlign: 'center' }}
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE',
              }}
            >
              Class
            </TableCell>
            <TableCell
              sx={{ textAlign: 'center' }}
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE',
              }}
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow sx={{ height: '32px' }}>
              {' '}
              {/* Increased height */}
              <TableCell
                colSpan={11}
                align='center'
                sx={{ padding: '4px', textAlign: 'center' }} // Adjusted padding
              >
                No Buyers
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((buyer, index) => (
              <TableRow
                key={buyer.id}
                className={getBuyerColor(buyer.status)}
                sx={{ height: '32px' }} // Increased height
              >
                <TableCell sx={{ padding: '4px', textAlign: 'center' }}>
                  {index + 1}
                </TableCell>
                <TableCell sx={{ padding: '4px', textAlign: 'center' }}>
                  {renderStatusSelect(buyer)}
                </TableCell>
                <TableCell sx={{ padding: '4px', textAlign: 'center' }}>
                  {buyer.nameAndRealm === '****'
                    ? 'Encrypted'
                    : buyer.nameAndRealm}
                </TableCell>
                <TableCell sx={{ padding: '4px', textAlign: 'center' }}>
                  {buyer.buyerNote}
                </TableCell>
                <TableCell sx={{ padding: '4px', textAlign: 'center' }}>
                  {buyer.nameOwnerBuyer}
                </TableCell>
                <TableCell sx={{ padding: '4px', textAlign: 'center' }}>
                  {buyer.nameCollector}
                </TableCell>
                <TableCell sx={{ padding: '4px', textAlign: 'center' }}>
                  {renderPaidIcon(buyer)}
                </TableCell>
                <TableCell sx={{ padding: '4px', textAlign: 'center' }}>
                  {Math.round(Number(buyer.buyerPot)).toLocaleString('en-US')}
                </TableCell>
                <TableCell sx={{ padding: '4px', textAlign: 'center' }}>
                  {Math.round(Number(buyer.buyerActualPot)).toLocaleString(
                    'en-US'
                  )}
                </TableCell>
                <TableCell sx={{ padding: '4px', textAlign: 'center' }}>
                  <div className='flex items-center justify-center gap-2'>
                    {buyer.playerClass}
                    {renderClassImage(buyer.playerClass)}
                  </div>
                </TableCell>
                <TableCell sx={{ padding: '4px', textAlign: 'center' }}>
                  {buyer.nameAndRealm !== '****' && (
                    <div className='flex justify-center gap-2'>
                      <IconButton
                        onClick={() => handleOpenModal(buyer, 'edit')}
                      >
                        <Pencil size={18} />
                      </IconButton>
                      <IconButton
                        onClick={() => handleOpenModal(buyer, 'delete')}
                      >
                        <Trash size={18} />
                      </IconButton>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
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
    </TableContainer>
  )
}
