import { useState } from 'react'
import { BuyerData } from '../../types/buyer-interface'
import { CheckFat, Pencil, Trash, XCircle } from '@phosphor-icons/react'
import { RiWifiOffLine, RiZzzFill } from 'react-icons/ri'
import DeathKnight from '../../assets/class_icons/deathknight.png'
import DemonHunter from '../../assets/class_icons/demonhunter.png'
import Druid from '../../assets/class_icons/druid.png'
import Evoker from '../../assets/class_icons/evoker.png'
import Hunter from '../../assets/class_icons/hunter.png'
import Mage from '../../assets/class_icons/mage.png'
import Monk from '../../assets/class_icons/monk.png'
import Paladin from '../../assets/class_icons/paladin.png'
import Priest from '../../assets/class_icons/priest.png'
import Rogue from '../../assets/class_icons/rogue.png'
import Shaman from '../../assets/class_icons/shaman.png'
import Warlock from '../../assets/class_icons/warlock.png'
import Warrior from '../../assets/class_icons/warrior.png'
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
  Tooltip,
} from '@mui/material'

import Swal from 'sweetalert2'

interface KeysDataGridProps {
  data: BuyerData[]
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

export function KeysDataGrid({ data }: KeysDataGridProps) {
  // Para simplificação, as funções de edição, delete, paid, AFK, offline são mocks
  const [error, setError] = useState<null | string>(null)
  const [openModal, setOpenModal] = useState(false)
  const [editingBuyer, setEditingBuyer] = useState<BuyerData | null>(null)
  const [modalType, setModalType] = useState<'edit' | 'delete' | null>(null)
  const [cooldown, setCooldown] = useState<{ [key: string]: boolean }>({})
  const [cooldownAFK, setCooldownAFK] = useState<{ [key: string]: boolean }>({})
  const [clickTracker, setClickTracker] = useState<{ [key: string]: boolean }>(
    {}
  )
  const [globalCooldown, setGlobalCooldown] = useState(false)
  const [cooldownPaid, setCooldownPaid] = useState<{ [key: string]: boolean }>(
    {}
  )

  // Funções mock para actions
  const handleOpenModal = (buyer: BuyerData, type: 'edit' | 'delete') => {
    setEditingBuyer(buyer)
    setModalType(type)
    setOpenModal(true)
  }

  const handleTogglePaid = (buyerId: string) => {
    if (cooldownPaid[buyerId]) return
    setCooldownPaid((prev) => ({ ...prev, [buyerId]: true }))
    setTimeout(() => {
      setCooldownPaid((prev) => ({ ...prev, [buyerId]: false }))
    }, 3000)
    Swal.fire({
      title: 'Paid toggled (mock)',
      icon: 'success',
      timer: 1000,
      showConfirmButton: false,
    })
  }

  const handleStatusChange = (buyerId: string, newStatus: string) => {
    Swal.fire({
      title: `Status changed to ${newStatus} (mock)`,
      icon: 'info',
      timer: 1000,
      showConfirmButton: false,
    })
  }

  const handleSendAFKMessage = (buyerId: string) => {
    Swal.fire({
      title: 'AFK notified (mock)',
      icon: 'success',
      timer: 1000,
      showConfirmButton: false,
    })
  }

  const handleSendOfflineMessage = (buyerId: string) => {
    Swal.fire({
      title: 'Offline notified (mock)',
      icon: 'success',
      timer: 1000,
      showConfirmButton: false,
    })
  }

  const renderStatusSelect = (buyer: BuyerData) => (
    <Select
      value={buyer.status || ''}
      onChange={(e) => handleStatusChange(buyer.id, e.target.value)}
      displayEmpty
      sx={{ width: '7rem', height: '2rem', fontSize: '14px' }}
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
    <IconButton
      onClick={() => handleTogglePaid(buyer.id)}
      disabled={globalCooldown || cooldownPaid[buyer.id]}
      sx={{
        backgroundColor: 'white',
        padding: '2px',
        opacity: globalCooldown || cooldownPaid[buyer.id] ? 0.5 : 1,
      }}
    >
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
        return 'bg-gradient-to-r from-yellow-200 to-yellow-300'
      case 'backup':
        return 'bg-gradient-to-r from-purple-300 to-purple-400'
      case 'group':
        return 'bg-gradient-to-r from-blue-300 to-blue-400'
      case 'done':
        return 'bg-gradient-to-r from-green-300 to-green-400'
      case 'noshow':
        return 'bg-gradient-to-r from-red-500 to-red-600'
      case 'closed':
        return 'bg-gradient-to-r from-zinc-400 to-zinc-500'
      case '':
        return 'bg-gradient-to-r from-white to-gray-100'
      default:
        return 'bg-gradient-to-r from-white to-gray-100'
    }
  }

  // Ordenação igual ao buyers-data-grid
  const sortedData = Array.isArray(data)
    ? [...data].sort((a, b) => {
        const priorityA = statusPriorities[a.status || ''] || Infinity
        const priorityB = statusPriorities[b.status || ''] || Infinity
        return priorityA - priorityB
      })
    : []

  return (
    <TableContainer
      component={Paper}
      sx={{ borderRadius: '6px', overflow: 'hidden' }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                textAlign: 'center',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE',
              }}
            >
              Slot
            </TableCell>
            <TableCell
              sx={{
                textAlign: 'center',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE',
              }}
            >
              Status
            </TableCell>
            <TableCell
              sx={{
                textAlign: 'center',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE',
              }}
            >
              Name-Realm
            </TableCell>
            <TableCell
              sx={{
                textAlign: 'center',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE',
              }}
            >
              Note
            </TableCell>
            <TableCell
              sx={{
                textAlign: 'center',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE',
              }}
            >
              Advertiser
            </TableCell>
            <TableCell
              sx={{
                textAlign: 'center',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE',
              }}
            >
              Collector
            </TableCell>
            <TableCell
              sx={{
                textAlign: 'center',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE',
              }}
            >
              Paid Full
            </TableCell>
            <TableCell
              sx={{
                textAlign: 'center',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE',
              }}
            >
              Dolar Pot
            </TableCell>
            <TableCell
              sx={{
                textAlign: 'center',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE',
              }}
            >
              Gold Pot
            </TableCell>
            <TableCell
              sx={{
                textAlign: 'center',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE',
              }}
            >
              Buyer Pot
            </TableCell>
            <TableCell
              sx={{
                textAlign: 'center',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE',
              }}
            >
              Class
            </TableCell>
            <TableCell
              sx={{
                textAlign: 'center',
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
            <TableRow>
              <TableCell colSpan={11} align='center'>
                No Buyers
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((buyer, idx) => (
              <TableRow key={buyer.id} className={getBuyerColor(buyer.status)}>
                <TableCell align='center'>{idx + 1}</TableCell>
                <TableCell align='center'>
                  {buyer.fieldIsBlocked === true ? (
                    <i>Encrypted</i>
                  ) : (
                    renderStatusSelect(buyer)
                  )}
                </TableCell>
                <TableCell align='center'>
                  {buyer.nameAndRealm === 'Encrypted' ? (
                    <i>Encrypted</i>
                  ) : (
                    buyer.nameAndRealm
                  )}
                </TableCell>
                <TableCell align='center'>
                  {buyer.buyerNote === 'Encrypted' ? (
                    <i>Encrypted</i>
                  ) : (
                    buyer.buyerNote
                  )}
                </TableCell>
                <TableCell align='center'>
                  {buyer.nameOwnerBuyer === 'Encrypted' ? (
                    <i>Encrypted</i>
                  ) : (
                    buyer.nameOwnerBuyer
                  )}
                </TableCell>
                <TableCell align='center'>
                  {buyer.nameCollector == null ||
                  buyer.nameCollector === 'Encrypted' ? (
                    <i>Encrypted</i>
                  ) : (
                    buyer.nameCollector
                  )}
                </TableCell>
                <TableCell align='center'>
                  {buyer.isEncrypted === true ? (
                    <i>Encrypted</i>
                  ) : (
                    renderPaidIcon({
                      ...buyer,
                      isPaid: buyer.isPaid == null ? false : buyer.isPaid,
                    })
                  )}
                </TableCell>
                <TableCell align='center'>
                  {buyer.buyerDolarPot == null ? (
                    buyer.buyerPot == null ? (
                      <i>Encrypted</i>
                    ) : (
                      '-'
                    )
                  ) : buyer.buyerDolarPot > 0 ? (
                    Number(buyer.buyerDolarPot).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell align='center'>
                  {buyer.buyerPot == null ? (
                    <i>Encrypted</i>
                  ) : buyer.buyerPot > 0 ? (
                    Math.round(Number(buyer.buyerPot)).toLocaleString('en-US')
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell align='center'>
                  {buyer.buyerActualPot == null ? (
                    <i>Encrypted</i>
                  ) : buyer.buyerActualPot > 0 ? (
                    Math.round(Number(buyer.buyerActualPot)).toLocaleString(
                      'en-US'
                    )
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell align='center'>
                  <div className='flex items-center justify-center gap-2'>
                    {buyer.playerClass === 'Encrypted' ? (
                      <i>Encrypted</i>
                    ) : (
                      <>
                        {buyer.playerClass}
                        {renderClassImage(buyer.playerClass)}
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell align='center'>
                  {buyer.nameAndRealm === 'Encrypted' ? null : (
                    <div className='flex justify-center gap-1'>
                      <Tooltip title='Edit'>
                        <IconButton
                          onClick={() => handleOpenModal(buyer, 'edit')}
                        >
                          <Pencil size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='AFK'>
                        <IconButton
                          onClick={() => handleSendAFKMessage(buyer.id)}
                        >
                          <RiZzzFill size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Offline'>
                        <IconButton
                          onClick={() => handleSendOfflineMessage(buyer.id)}
                        >
                          <RiWifiOffLine size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Delete'>
                        <IconButton
                          onClick={() => handleOpenModal(buyer, 'delete')}
                        >
                          <Trash size={18} />
                        </IconButton>
                      </Tooltip>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
