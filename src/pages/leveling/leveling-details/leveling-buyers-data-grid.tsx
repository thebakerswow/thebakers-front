import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckFat, Pencil, Trash, XCircle } from '@phosphor-icons/react'
import { RiWifiOffLine, RiZzzFill } from 'react-icons/ri'
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
  Dialog,
  DialogContent,
  Tooltip,
} from '@mui/material'
import { Modal as MuiModal, Box } from '@mui/material'
import Swal from 'sweetalert2'

interface BuyersGridProps {
  data: BuyerData[]
  onBuyerStatusEdit: () => void
  onBuyerNameNoteEdit: () => void
  onDeleteSuccess: () => void
  runIsLocked?: boolean // Added runIsLocked prop
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

export function LevelingBuyersDataGrid({
  data,
  onBuyerStatusEdit,
  onBuyerNameNoteEdit,
  onDeleteSuccess,
  runIsLocked, // Destructure runIsLocked
}: BuyersGridProps) {
  const { id: runId } = useParams<{ id: string }>() // Correctly retrieve 'id' as 'runId'
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [openModal, setOpenModal] = useState(false)
  const [editingBuyer, setEditingBuyer] = useState<{
    id: string
    nameAndRealm: string
    buyerPot: number
    buyerDolarPot: number
    buyerNote: string
  } | null>(null)
  const [modalType, setModalType] = useState<'edit' | 'delete' | null>(null)
  const [cooldown, setCooldown] = useState<{ [key: string]: boolean }>({})
  const [cooldownAFK, setCooldownAFK] = useState<{ [key: string]: boolean }>({}) // Separate cooldown for Bed button
  const [clickTracker, setClickTracker] = useState<{ [key: string]: boolean }>(
    {}
  ) // Track button clicks
  const [globalCooldown, setGlobalCooldown] = useState(false) // Global cooldown for all buyers
  const [cooldownPaid, setCooldownPaid] = useState<{ [key: string]: boolean }>(
    {}
  ) // Cooldown for Paid Full button

  const handleOpenModal = (buyer: BuyerData, type: 'edit' | 'delete') => {
    setEditingBuyer({
      id: buyer.id,
      nameAndRealm: buyer.nameAndRealm,
      buyerPot: buyer.buyerPot,
      buyerDolarPot: buyer.buyerDolarPot,
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
    if (cooldownPaid[buyerId]) return // Prevent spam
    const buyer = data.find((b) => b.id === buyerId)
    if (!buyer) return
    const payload = { id_buyer: buyerId, is_paid: !buyer.isPaid }
    setCooldownPaid((prev) => ({ ...prev, [buyerId]: true }))
    handleApiCall('/buyer/paid', payload, onBuyerStatusEdit)
    setTimeout(() => {
      setCooldownPaid((prev) => ({ ...prev, [buyerId]: false }))
    }, 3000) // 3 seconds cooldown
  }

  const handleStatusChange = (buyerId: string, newStatus: string) => {
    const payload = { id_buyer: buyerId, status: newStatus }
    handleApiCall('/buyer/status', payload, onBuyerStatusEdit)
  }

  const handleGlobalAction = (action: () => void) => {
    if (globalCooldown) {
      Swal.fire({
        title: 'Action Not Allowed',
        text: 'Please wait before performing another action.',
        icon: 'warning',
        timer: 1500,
        showConfirmButton: false,
      })
      return
    }

    setGlobalCooldown(true)
    action()

    setTimeout(() => {
      setGlobalCooldown(false)
    }, 5000) // 3-second global cooldown
  }

  const handleSendAFKMessage = async (buyerId: string) => {
    handleGlobalAction(async () => {
      if (clickTracker[buyerId]) {
        Swal.fire({
          title: 'Action Not Allowed',
          text: 'Please wait 3 seconds before clicking again.',
          icon: 'warning',
          timer: 1500,
          showConfirmButton: false,
        })
        return
      }
      setClickTracker((prev) => ({ ...prev, [buyerId]: true }))
      setTimeout(() => {
        setClickTracker((prev) => ({ ...prev, [buyerId]: false }))
      }, 3000) // Reset click tracker after 3 seconds

      if (cooldownAFK[buyerId]) return // Prevent action if cooldown is active
      const buyer = data.find((b) => b.id === buyerId)
      if (!buyer || !runId) return // Ensure buyer and runId exist
      const runLink = `${window.location.origin}/bookings-na/run/${runId}`
      // 1144320612966338751: funcionário do baby johny
      // 1129084739597377767: funcionário do baby johny
      // 466344718507442177: baby johny
      let recipientIds: string[] = []
      if (buyer.idBuyerAdvertiser === '466344718507442177') {
        // baby johny
        recipientIds = ['1144320612966338751', '1129084739597377767'] // funcionários do baby johny
      } else if (buyer.idBuyerAdvertiser) {
        recipientIds = [import.meta.env.VITE_ID_CALMAKARAI]
      } else {
        recipientIds = [buyer.idOwnerBuyer]
      }
      // Envia mensagem para todos os destinatários
      for (const recipientId of recipientIds) {
        const payload = {
          id_discord_recipient: recipientId,
          message: `AFK Buyer\nNick: ${buyer.nameAndRealm}\nRun: ${runLink}`,
        }
        try {
          await api.post('/discord/send_message', payload)
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
      Swal.fire({
        title: 'Success!',
        text: 'Advertiser notified',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      })
      setCooldownAFK((prev) => ({ ...prev, [buyerId]: true }))
      setTimeout(() => {
        setCooldownAFK((prev) => ({ ...prev, [buyerId]: false }))
      }, 15000)
    })
  }

  const handleSendOfflineMessage = async (buyerId: string) => {
    handleGlobalAction(async () => {
      if (clickTracker[buyerId]) {
        Swal.fire({
          title: 'Action Not Allowed',
          text: 'Please wait 3 seconds before clicking again.',
          icon: 'warning',
          timer: 1500,
          showConfirmButton: false,
        })
        return
      }
      setClickTracker((prev) => ({ ...prev, [buyerId]: true }))
      setTimeout(() => {
        setClickTracker((prev) => ({ ...prev, [buyerId]: false }))
      }, 3000) // Reset click tracker after 3 seconds

      if (cooldown[buyerId]) return // Prevent action if cooldown is active
      const buyer = data.find((b) => b.id === buyerId)
      if (!buyer || !runId) return // Ensure buyer and runId exist
      const runLink = `${window.location.origin}/bookings-na/run/${runId}`
      // 1144320612966338751: funcionário do baby johny
      // 1129084739597377767: funcionário do baby johny
      // 466344718507442177: baby johny
      let recipientIds: string[] = []
      if (buyer.idBuyerAdvertiser === '466344718507442177') {
        // baby johny
        recipientIds = ['1144320612966338751', '1129084739597377767'] // funcionários do baby johny
      } else if (buyer.idBuyerAdvertiser) {
        recipientIds = [import.meta.env.VITE_ID_CALMAKARAI]
      } else {
        recipientIds = [buyer.idOwnerBuyer]
      }
      // Envia mensagem para todos os destinatários
      for (const recipientId of recipientIds) {
        const payload = {
          id_discord_recipient: recipientId,
          message: `Offline Buyer\nNick: ${buyer.nameAndRealm}\nRun: ${runLink}`,
        }
        try {
          await api.post('/discord/send_message', payload)
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
      Swal.fire({
        title: 'Success!',
        text: 'Advertiser notified',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      })
      setCooldown((prev) => ({ ...prev, [buyerId]: true }))
      setTimeout(() => {
        setCooldown((prev) => ({ ...prev, [buyerId]: false }))
      }, 15000)
    })
  }

  const renderStatusSelect = (buyer: BuyerData) => (
    <Select
      value={buyer.status || ''}
      onChange={(e) =>
        !runIsLocked &&
        buyer.nameAndRealm !== 'Encrypted' &&
        handleStatusChange(buyer.id, e.target.value)
      }
      displayEmpty
      disabled={runIsLocked || buyer.nameAndRealm === 'Encrypted'} // Disable select when run is locked or Encrypted
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
    <IconButton
      onClick={() =>
        !runIsLocked &&
        !globalCooldown &&
        !cooldownPaid[buyer.id] &&
        handleTogglePaid(buyer.id)
      }
      disabled={runIsLocked || globalCooldown || cooldownPaid[buyer.id]} // Disable toggle when run is locked, global cooldown, or individual cooldown
      sx={{
        backgroundColor: 'white',
        padding: '2px',
        '&:hover': {
          backgroundColor:
            runIsLocked || globalCooldown || cooldownPaid[buyer.id]
              ? 'white'
              : '#f0f0f0',
        },
        opacity:
          runIsLocked || globalCooldown || cooldownPaid[buyer.id] ? 0.5 : 1,
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
      <MuiModal open={!!error} onClose={() => setError(null)}>
        <Box className='absolute left-1/2 top-1/2 w-96 -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-gray-400 p-4 shadow-lg'>
          <ErrorComponent error={error} onClose={() => setError(null)} />
        </Box>
      </MuiModal>
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

  return (
    <TableContainer
      component={Paper}
      sx={{
        overflow: 'hidden', // Ensures content stays within rounded corners
        borderRadius: '6px', // Matches the style of runs-data-grid
      }}
    >
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
              Dolar Pot
            </TableCell>
            <TableCell
              sx={{ textAlign: 'center' }}
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ECEBEE',
              }}
            >
              Gold Pot
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
            <TableRow sx={{ height: '32px', minHeight: '32px' }}>
              {/* Increased height */}
              <TableCell
                colSpan={11}
                align='center'
                sx={{ padding: '20px', textAlign: 'center' }} // Adjusted padding
              >
                No Buyers
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((buyer, index) => (
              <TableRow
                key={buyer.id}
                className={getBuyerColor(buyer.status)}
                sx={{ height: '40px' }} // Set minimum height
              >
                <TableCell sx={{ padding: '4px', textAlign: 'center' }}>
                  {index + 1}
                </TableCell>
                <TableCell sx={{ padding: '4px', textAlign: 'center' }}>
                  {buyer.fieldIsBlocked === true ? (
                    <i>Encrypted</i>
                  ) : (
                    renderStatusSelect(buyer)
                  )}
                </TableCell>
                <TableCell sx={{ padding: '4px', textAlign: 'center' }}>
                  {buyer.nameAndRealm === 'Encrypted' ? (
                    <i>Encrypted</i>
                  ) : (
                    buyer.nameAndRealm
                  )}
                </TableCell>
                <TableCell sx={{ padding: '4px', textAlign: 'center' }}>
                  {buyer.buyerNote === 'Encrypted' ? (
                    <i>Encrypted</i>
                  ) : (
                    buyer.buyerNote
                  )}
                </TableCell>
                <TableCell sx={{ padding: '4px', textAlign: 'center' }}>
                  {buyer.nameOwnerBuyer === 'Encrypted' ? (
                    <i>Encrypted</i>
                  ) : (
                    buyer.nameOwnerBuyer
                  )}
                </TableCell>
                <TableCell sx={{ padding: '4px', textAlign: 'center' }}>
                  {buyer.nameCollector == null ||
                  buyer.nameCollector === 'Encrypted' ? (
                    <i>Encrypted</i>
                  ) : (
                    buyer.nameCollector
                  )}
                </TableCell>
                <TableCell sx={{ padding: '4px', textAlign: 'center' }}>
                  {/* Paid Full */}
                  {buyer.isEncrypted === true ? (
                    <i>Encrypted</i>
                  ) : (
                    renderPaidIcon({
                      ...buyer,
                      isPaid: buyer.isPaid == null ? false : buyer.isPaid,
                    })
                  )}
                </TableCell>
                <TableCell sx={{ padding: '4px', textAlign: 'center' }}>
                  {/* Dolar Pot */}
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
                <TableCell sx={{ padding: '4px', textAlign: 'center' }}>
                  {/* Gold Pot (antes era Total Pot) */}
                  {buyer.buyerPot == null ? (
                    <i>Encrypted</i>
                  ) : buyer.buyerPot > 0 ? (
                    Math.round(Number(buyer.buyerPot)).toLocaleString('en-US')
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell sx={{ padding: '4px', textAlign: 'center' }}>
                  {buyer.buyerActualPot == null ? (
                    <i>Encrypted</i>
                  ) : buyer.buyerDolarPot && buyer.buyerDolarPot > 0 ? (
                    Number(buyer.buyerActualPot).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  ) : (
                    Math.round(Number(buyer.buyerActualPot)).toLocaleString(
                      'en-US'
                    )
                  )}
                </TableCell>
                <TableCell sx={{ padding: '4px', textAlign: 'center' }}>
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
                <TableCell sx={{ padding: '4px', textAlign: 'center' }}>
                  {buyer.nameAndRealm === 'Encrypted' ? null : (
                    <div className='flex justify-center gap-1'>
                      <Tooltip title='Edit'>
                        <IconButton
                          onClick={() =>
                            !runIsLocked && handleOpenModal(buyer, 'edit')
                          }
                          disabled={runIsLocked}
                        >
                          <Pencil size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='AFK'>
                        <IconButton
                          onClick={() =>
                            !runIsLocked && handleSendAFKMessage(buyer.id)
                          }
                          disabled={
                            runIsLocked ||
                            cooldownAFK[buyer.id] ||
                            globalCooldown
                          }
                          sx={{
                            opacity:
                              cooldownAFK[buyer.id] ||
                              runIsLocked ||
                              globalCooldown
                                ? 0.5
                                : 1,
                          }}
                        >
                          <RiZzzFill size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Offline'>
                        <IconButton
                          onClick={() =>
                            !runIsLocked && handleSendOfflineMessage(buyer.id)
                          }
                          disabled={
                            runIsLocked || cooldown[buyer.id] || globalCooldown
                          }
                          sx={{
                            opacity:
                              cooldown[buyer.id] ||
                              runIsLocked ||
                              globalCooldown
                                ? 0.5
                                : 1,
                          }}
                        >
                          <RiWifiOffLine size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Delete'>
                        <IconButton
                          onClick={() =>
                            !runIsLocked && handleOpenModal(buyer, 'delete')
                          }
                          disabled={runIsLocked}
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
      {openModal &&
        editingBuyer &&
        (modalType === 'edit' ? (
          <Dialog
            open={openModal}
            onClose={() => setOpenModal(false)}
            fullWidth
            maxWidth='sm'
          >
            <DialogContent>
              <EditBuyer
                buyer={{
                  id: editingBuyer.id,
                  nameAndRealm: editingBuyer.nameAndRealm,
                  buyerPot: editingBuyer.buyerPot,
                  buyerDolarPot: editingBuyer.buyerDolarPot,
                  buyerNote: editingBuyer.buyerNote,
                }}
                onClose={() => setOpenModal(false)}
                onEditSuccess={onBuyerNameNoteEdit}
              />
            </DialogContent>
          </Dialog>
        ) : (
          <MuiModal open={openModal} onClose={() => setOpenModal(false)}>
            <Box className='absolute left-1/2 top-1/2 w-96 -translate-x-1/2 -translate-y-1/2 transform shadow-lg'>
              <DeleteBuyer
                buyer={{
                  id: editingBuyer.id,
                  nameAndRealm: editingBuyer.nameAndRealm,
                }}
                onClose={() => setOpenModal(false)}
                onDeleteSuccess={onDeleteSuccess}
              />
            </Box>
          </MuiModal>
        ))}
    </TableContainer>
  )
}
