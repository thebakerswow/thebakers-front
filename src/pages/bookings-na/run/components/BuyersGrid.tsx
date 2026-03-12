import { useState, type Dispatch, type SetStateAction } from 'react'
import { useParams } from 'react-router-dom'
import { CheckFat, Pencil, Trash, X } from '@phosphor-icons/react'
import {
  RiWifiOffLine,
  RiZzzFill,
  RiUserHeartLine,
  RiLoginCircleLine,
  RiAlertLine,
  RiSwordLine,
  RiArrowDownLine,
} from 'react-icons/ri'
import {
  updateBuyerPaid,
  updateBuyerStatus,
  deleteBuyer,
  getRun,
  getRunBuyers,
  sendDiscordMessage,
} from '../services/runApi'
import { EditBuyer } from './EditBuyer'
import Swal from 'sweetalert2'
import { useAuth } from '../../../../context/AuthContext'
import CryptoJS from 'crypto-js'
import { CustomSelect } from '../../../../components/CustomSelect'
import type { BuyerData, BuyersGridProps, RaidLeader } from '../types/run'
import { handleApiError } from '../../../../utils/apiErrorHandler'

const statusOptions = [
  { value: 'waiting', label: 'Waiting' },
  { value: 'noshow', label: 'No Show' },
  { value: 'cancelled', label: 'Cancelled' },
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
  cancelled: 6,
}

type BuyerCooldownMap = Record<string, boolean>
type BuyerCooldownSetter = Dispatch<SetStateAction<BuyerCooldownMap>>

export function BuyersDataGrid({
  data,
  onBuyerStatusEdit,
  onBuyerNameNoteEdit,
  onDeleteSuccess,
  containerClassName,
  slotAvailable = 0,
  runIsLocked, // Destructure runIsLocked
  runIdTeam, // Nova prop
  raidLeaders, // Added raid leaders prop
}: BuyersGridProps) {
  const { userRoles, idDiscord } = useAuth()
  const isOnlyAdvertiserRole =
    userRoles.includes(import.meta.env.VITE_TEAM_ADVERTISER) &&
    userRoles.length === 1

  // Function to check if current user is the advertiser of a buyer
  const isBuyerAdvertiser = (buyer: BuyerData): boolean => {
    return idDiscord === buyer.idOwnerBuyer
  }

  // Function to decrypt idCommunication
  const decryptIdCommunication = (encryptedId: string): string => {
    try {
      const secretKey = import.meta.env.VITE_DECRYPTION_KEY

      if (!secretKey) {
        console.error('VITE_DECRYPTION_KEY não está definida')
        return ''
      }

      // Implementação compatível com Go AES-128-CFB
      try {
        // 1. Criar hash MD5 da chave (igual ao Go)
        const keyHash = CryptoJS.MD5(secretKey)

        // 2. Usar os primeiros 16 bytes como IV (igual ao Go)
        const iv = CryptoJS.lib.WordArray.create(keyHash.words.slice(0, 4))

        // 3. Decriptar usando AES-128-CFB
        const decrypted = CryptoJS.AES.decrypt(encryptedId, keyHash, {
          mode: CryptoJS.mode.CFB,
          padding: CryptoJS.pad.NoPadding,
          iv: iv,
        })

        const result = decrypted.toString(CryptoJS.enc.Utf8)

        if (result) {
          return result
        }
      } catch (error) {
        console.error('Error in AES-128-CFB decryption:', error)
      }

      return ''
    } catch (error) {
      console.error('Error decrypting idCommunication:', error)
      return ''
    }
  }

  // Function to get Discord ID from raid leader
  const getRaidLeaderDiscordId = (raidLeader: RaidLeader): string => {
    if (raidLeader.idDiscord === 'Encrypted') {
      const decryptedId = decryptIdCommunication(raidLeader.idCommunication)
      if (!decryptedId) {
        console.error(
          'Falha ao decriptar ID do raid leader:',
          raidLeader.username
        )
      }
      return decryptedId
    }
    return raidLeader.idDiscord
  }

  // Function to check if current user is a raid leader
  const isRaidLeader = (): boolean => {
    if (!raidLeaders || !idDiscord) return false
    return raidLeaders.some((leader) => {
      const leaderDiscordId = getRaidLeaderDiscordId(leader)
      return leaderDiscordId === idDiscord
    })
  }

  // Function to check if current user is chefe de cozinha
  const isChefeDeCozinha = (): boolean => {
    return userRoles.includes(import.meta.env.VITE_TEAM_CHEFE)
  }

  // Function to check if user can see raid leader buttons
  const canSeeRaidLeaderButtons = (): boolean => {
    return isRaidLeader() || isChefeDeCozinha()
  }

  // Function to check if user can see advertiser buttons
  const canSeeAdvertiserButtons = (buyer: BuyerData): boolean => {
    return isBuyerAdvertiser(buyer) || isChefeDeCozinha()
  }

  // Function to get recipient IDs for buyer notifications
  // Handles special cases like baby johny, widex and advertisers
  const getBuyerRecipientIds = (buyer: BuyerData): string[] => {
    const BABY_JOHNY_ID = '466344718507442177'
    const BABY_JOHNY_EMPLOYEES = [
      '1144320612966338751',
      '1129084739597377767',
    ]

    const WIDEX_ID = '1043889212891594762'
    const WIDEX_EMPLOYEES = [
      '210470259226968066',
      '420200946405212160',
    ]

    if (buyer.idOwnerBuyer === BABY_JOHNY_ID) {
      return BABY_JOHNY_EMPLOYEES
    } else if (buyer.idOwnerBuyer === WIDEX_ID) {
      return WIDEX_EMPLOYEES
    } else if (buyer.idBuyerAdvertiser) {
      return [import.meta.env.VITE_ID_CALMAKARAI]
    } else {
      return [buyer.idOwnerBuyer]
    }
  }

  const { id: runId } = useParams<{ id: string }>() // Correctly retrieve 'id' as 'runId'
  const [openModal, setOpenModal] = useState(false)
  const [editingBuyer, setEditingBuyer] = useState<{
    id: string
    nameAndRealm: string
    buyerPot: number
    buyerDolarPot: number
    buyerNote: string
  } | null>(null)
  const [cooldown, setCooldown] = useState<BuyerCooldownMap>({})
  const [cooldownAFK, setCooldownAFK] = useState<BuyerCooldownMap>({}) // Separate cooldown for Bed button
  const [cooldownBuyerReady, setCooldownBuyerReady] = useState<BuyerCooldownMap>({}) // Cooldown for Buyer Ready button
  const [cooldownBuyerLogging, setCooldownBuyerLogging] = useState<BuyerCooldownMap>({}) // Cooldown for Buyer Logging button
  const [cooldownAttention, setCooldownAttention] = useState<BuyerCooldownMap>({}) // Cooldown for Attention button
  const [cooldownBuyerCombat, setCooldownBuyerCombat] = useState<BuyerCooldownMap>({}) // Cooldown for Buyer in Combat button
  const [cooldownPriceWarning, setCooldownPriceWarning] = useState<BuyerCooldownMap>({}) // Cooldown for Price Warning button
  const [clickTracker, setClickTracker] = useState<BuyerCooldownMap>({}) // Track button clicks
  const [globalCooldown, setGlobalCooldown] = useState(false) // Global cooldown for all buyers
  const [cooldownPaid, setCooldownPaid] = useState<BuyerCooldownMap>({}) // Cooldown for Paid Full button

  const handleOpenModal = (buyer: BuyerData) => {
    setEditingBuyer({
      id: buyer.id,
      nameAndRealm: buyer.nameAndRealm,
      buyerPot: buyer.buyerPot,
      buyerDolarPot: buyer.buyerDolarPot,
      buyerNote: buyer.buyerNote,
    })
    setOpenModal(true)
  }

  const handleApiCall = async (
    apiFunction: () => Promise<any>,
    callback: () => void
  ) => {
    try {
      await apiFunction()
      callback()
    } catch (error) {
      await handleApiError(error, 'Failed to update buyer')
    }
  }

  const handleTogglePaid = (buyerId: string) => {
    if (cooldownPaid[buyerId]) return // Prevent spam
    const buyer = data.find((b) => b.id === buyerId)
    if (!buyer) return
    setCooldownPaid((prev) => ({ ...prev, [buyerId]: true }))
    handleApiCall(
      () => updateBuyerPaid(buyerId, !buyer.isPaid),
      onBuyerStatusEdit
    )
    setTimeout(() => {
      setCooldownPaid((prev) => ({ ...prev, [buyerId]: false }))
    }, 3000) // 3 seconds cooldown
  }

  const handleStatusChange = async (buyerId: string, newStatus: string) => {
    const currentBuyer = data.find((buyer) => buyer.id === buyerId)

    if (!currentBuyer) {
      return
    }

    try {
      await updateBuyerStatus(buyerId, newStatus)

      let availableSlotsAfterChange = Number(slotAvailable) || 0
      let backupQueue = data.filter(
        (buyer) => buyer.status === 'backup' && buyer.id !== buyerId
      )

      // Busca estado real da run e da fila após a mudança
      if (runId) {
        const [latestRun, latestBuyers] = await Promise.all([
          getRun(runId),
          getRunBuyers(runId),
        ])
        availableSlotsAfterChange = Number(latestRun?.slotAvailable) || 0
        backupQueue = Array.isArray(latestBuyers)
          ? latestBuyers.filter((buyer) => buyer.status === 'backup')
          : []
      }

      if (availableSlotsAfterChange > 0) {
        const buyersToPromote = backupQueue.slice(0, availableSlotsAfterChange)

        for (const backupBuyer of buyersToPromote) {
          await updateBuyerStatus(backupBuyer.id, 'waiting')
        }
      }

      onBuyerStatusEdit()
    } catch (error) {
      await handleApiError(error, 'Failed to change buyer status')
    }
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

  const showActionCooldownWarning = () => {
    Swal.fire({
      title: 'Action Not Allowed',
      text: 'Please wait 3 seconds before clicking again.',
      icon: 'warning',
      timer: 1500,
      showConfirmButton: false,
    })
  }

  const setBuyerCooldown = (
    setCooldownState: BuyerCooldownSetter,
    buyerId: string,
    durationMs: number
  ) => {
    setCooldownState((prev) => ({ ...prev, [buyerId]: true }))
    setTimeout(() => {
      setCooldownState((prev) => ({ ...prev, [buyerId]: false }))
    }, durationMs)
  }

  const startClickCooldown = (buyerId: string) => {
    if (clickTracker[buyerId]) {
      showActionCooldownWarning()
      return false
    }

    setBuyerCooldown(setClickTracker, buyerId, 3000)
    return true
  }

  const getRaidLeaderRecipientIds = (): string[] => {
    if (!raidLeaders) return []
    return raidLeaders
      .map((leader) => getRaidLeaderDiscordId(leader))
      .filter((id): id is string => Boolean(id))
  }

  const sendBuyerNotification = async ({
    buyerId,
    actionCooldownMap,
    setActionCooldownState,
    recipientIds,
    messageBuilder,
    successText,
    apiErrorMessage,
  }: {
    buyerId: string
    actionCooldownMap: BuyerCooldownMap
    setActionCooldownState: BuyerCooldownSetter
    recipientIds: string[]
    messageBuilder: (buyer: BuyerData, runLink: string) => string
    successText: string
    apiErrorMessage: string
  }) => {
    if (actionCooldownMap[buyerId]) return

    const buyer = data.find((entry) => entry.id === buyerId)
    if (!buyer || !runId || recipientIds.length === 0) return

    const runLink = `${window.location.origin}/bookings-na/run/${runId}`

    for (const recipientId of recipientIds) {
      try {
        await sendDiscordMessage(recipientId, messageBuilder(buyer, runLink))
      } catch (error) {
        await handleApiError(error, apiErrorMessage)
      }
    }

    Swal.fire({
      title: 'Success!',
      text: successText,
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
    })

    setBuyerCooldown(setActionCooldownState, buyerId, 15000)
  }

  const runNotificationAction = (action: () => Promise<void>) => {
    handleGlobalAction(() => {
      void action()
    })
  }

  const handleSendAFKMessage = (buyerId: string) => {
    runNotificationAction(async () => {
      if (!startClickCooldown(buyerId)) return
      const buyer = data.find((entry) => entry.id === buyerId)
      if (!buyer) return

      await sendBuyerNotification({
        buyerId,
        actionCooldownMap: cooldownAFK,
        setActionCooldownState: setCooldownAFK,
        recipientIds: getBuyerRecipientIds(buyer),
        messageBuilder: (selectedBuyer, runLink) =>
          `AFK Buyer\nNick: ${selectedBuyer.nameAndRealm}\nRun: ${runLink}`,
        successText: 'Advertiser notified',
        apiErrorMessage: 'Failed to notify advertiser',
      })
    })
  }

  const handleSendOfflineMessage = (buyerId: string) => {
    runNotificationAction(async () => {
      if (!startClickCooldown(buyerId)) return
      const buyer = data.find((entry) => entry.id === buyerId)
      if (!buyer) return

      await sendBuyerNotification({
        buyerId,
        actionCooldownMap: cooldown,
        setActionCooldownState: setCooldown,
        recipientIds: getBuyerRecipientIds(buyer),
        messageBuilder: (selectedBuyer, runLink) =>
          `Offline Buyer\nNick: ${selectedBuyer.nameAndRealm}\nRun: ${runLink}`,
        successText: 'Advertiser notified',
        apiErrorMessage: 'Failed to notify advertiser',
      })
    })
  }

  const handleSendBuyerReadyMessage = (buyerId: string) => {
    runNotificationAction(async () => {
      if (!startClickCooldown(buyerId)) return

      await sendBuyerNotification({
        buyerId,
        actionCooldownMap: cooldownBuyerReady,
        setActionCooldownState: setCooldownBuyerReady,
        recipientIds: getRaidLeaderRecipientIds(),
        messageBuilder: (selectedBuyer, runLink) =>
          `Buyer Ready\nNick: ${selectedBuyer.nameAndRealm}\nRun: ${runLink}`,
        successText: 'Raid leaders notified',
        apiErrorMessage: 'Failed to notify raid leaders',
      })
    })
  }

  const handleSendBuyerLoggingMessage = (buyerId: string) => {
    runNotificationAction(async () => {
      if (!startClickCooldown(buyerId)) return

      await sendBuyerNotification({
        buyerId,
        actionCooldownMap: cooldownBuyerLogging,
        setActionCooldownState: setCooldownBuyerLogging,
        recipientIds: getRaidLeaderRecipientIds(),
        messageBuilder: (selectedBuyer, runLink) =>
          `Buyer Logging\nNick: ${selectedBuyer.nameAndRealm}\nRun: ${runLink}`,
        successText: 'Raid leaders notified',
        apiErrorMessage: 'Failed to notify raid leaders',
      })
    })
  }

  const handleSendAttentionMessage = (buyerId: string) => {
    runNotificationAction(async () => {
      if (!startClickCooldown(buyerId)) return

      await sendBuyerNotification({
        buyerId,
        actionCooldownMap: cooldownAttention,
        setActionCooldownState: setCooldownAttention,
        recipientIds: getRaidLeaderRecipientIds(),
        messageBuilder: (selectedBuyer, runLink) =>
          `Attention! Check Note\nNick: ${selectedBuyer.nameAndRealm}\nRun: ${runLink}`,
        successText: 'Raid leaders notified',
        apiErrorMessage: 'Failed to notify raid leaders',
      })
    })
  }

  const handleSendBuyerCombatMessage = (buyerId: string) => {
    runNotificationAction(async () => {
      if (!startClickCooldown(buyerId)) return
      const buyer = data.find((entry) => entry.id === buyerId)
      if (!buyer) return

      await sendBuyerNotification({
        buyerId,
        actionCooldownMap: cooldownBuyerCombat,
        setActionCooldownState: setCooldownBuyerCombat,
        recipientIds: getBuyerRecipientIds(buyer),
        messageBuilder: (selectedBuyer, runLink) =>
          `Buyer in combat and not in our group\nNick: ${selectedBuyer.nameAndRealm}\nRun: ${runLink}`,
        successText: 'Advertiser notified',
        apiErrorMessage: 'Failed to notify advertiser',
      })
    })
  }

  const handleSendPriceWarningMessage = (buyerId: string) => {
    runNotificationAction(async () => {
      if (!startClickCooldown(buyerId)) return
      const buyer = data.find((entry) => entry.id === buyerId)
      if (!buyer) return

      await sendBuyerNotification({
        buyerId,
        actionCooldownMap: cooldownPriceWarning,
        setActionCooldownState: setCooldownPriceWarning,
        recipientIds: getBuyerRecipientIds(buyer),
        messageBuilder: (selectedBuyer, runLink) =>
          `Buyer is below minimum price and will be replaced if the price is not corrected until 15 minutes before the invite\nNick: ${selectedBuyer.nameAndRealm}\nRun: ${runLink}`,
        successText: 'Advertiser notified',
        apiErrorMessage: 'Failed to notify advertiser',
      })
    })
  }

  const handleDeleteBuyer = async (buyer: BuyerData) => {
    if (runIsLocked) return

    const result = await Swal.fire({
      title: 'Confirm Deletion',
      text: `Are you sure you want to delete ${buyer.nameAndRealm}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    })

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: 'Deleting buyer...',
          text: `Removing ${buyer.nameAndRealm}`,
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading()
          },
        })

        await deleteBuyer(buyer.id)
        Swal.close()
        Swal.fire({
          title: 'Success!',
          text: 'Buyer deleted successfully',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        })
        onDeleteSuccess()
      } catch (error) {
        Swal.close()
        await handleApiError(error, 'Failed to delete buyer')
      }
    }
  }


  const renderStatusSelect = (buyer: BuyerData) => (
    <CustomSelect
      value={buyer.status || ''}
      onChange={(value) =>
        !runIsLocked && buyer.nameAndRealm !== 'Encrypted' && handleStatusChange(buyer.id, value)
      }
      options={statusOptions.map((option) => ({
        value: option.value,
        label: option.label,
      }))}
      disabled={runIsLocked || buyer.nameAndRealm === 'Encrypted'}
      minWidthClassName='min-w-[120px]'
      triggerClassName='![background-image:none] !bg-white/10 !backdrop-blur-sm !shadow-none !border-white/25 !text-center text-white'
      renderInPortal
    />
  )

  const renderPaidIcon = (buyer: BuyerData) => (
    <button
      type='button'
      onClick={() =>
        !runIsLocked &&
        !globalCooldown &&
        !cooldownPaid[buyer.id] &&
        handleTogglePaid(buyer.id)
      }
      disabled={runIsLocked || globalCooldown || cooldownPaid[buyer.id]}
      className='rounded-md border border-white/25 bg-white/10 p-1 backdrop-blur-sm disabled:cursor-not-allowed disabled:opacity-50'
    >
      {buyer.isPaid ? (
        <CheckFat className='text-green-500' size={22} weight='fill' />
      ) : (
        <X className='text-red-600' size={22} weight='bold' />
      )}
    </button>
  )

  // Função para ordenar os dados com base na prioridade do status
  const sortedData = Array.isArray(data)
    ? [...data].sort((a, b) => {
        const priorityA = statusPriorities[a.status || ''] || Infinity
        const priorityB = statusPriorities[b.status || ''] || Infinity
        return priorityA - priorityB
      })
    : []

  function getBuyerRowStyle(status: string): { background: string } {
    switch (status) {
      case 'waiting':
        return {
          background:
            'linear-gradient(90deg, rgba(252,211,77,0.68), rgba(245,158,11,0.58))',
        }
      case 'backup':
        return {
          background:
            'linear-gradient(90deg, rgba(167,139,250,0.68), rgba(139,92,246,0.58))',
        }
      case 'group':
        return {
          background:
            'linear-gradient(90deg, rgba(96,165,250,0.68), rgba(29,78,216,0.58))',
        }
      case 'done':
        return {
          background:
            'linear-gradient(90deg, rgba(34,197,94,0.68), rgba(22,163,74,0.58))',
        }
      case 'noshow':
        return {
          background:
            'linear-gradient(90deg, rgba(248,113,113,0.7), rgba(185,28,28,0.58))',
        }
      case 'cancelled':
        return {
          background:
            'linear-gradient(90deg, rgba(161,161,170,0.62), rgba(82,82,91,0.54))',
        }
      default:
        return {
          background: 'linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))',
        }
    }
  }

  return (
    <div
      className={`overflow-x-auto rounded-xl border border-white/10 bg-black/30 ${containerClassName ?? ''}`}
    >
      <table className='w-full min-w-[1500px] text-sm'>
        <thead>
          <tr className='border-b border-white/10 bg-white/[0.03] text-neutral-300'>
            <th className='px-2 py-3 text-center font-semibold'>Slot</th>
            <th className='px-2 py-3 text-center font-semibold'>Status</th>
            <th className='px-2 py-3 text-center font-semibold'>Name-Realm</th>
            <th className='px-2 py-3 text-center font-semibold'>Note</th>
            <th className='px-2 py-3 text-center font-semibold'>Advertiser</th>
            <th className='px-2 py-3 text-center font-semibold'>Collector</th>
            <th className='px-2 py-3 text-center font-semibold'>Paid Full</th>
            <th className='px-2 py-3 text-center font-semibold'>Dollar Pot</th>
            <th className='px-2 py-3 text-center font-semibold'>Gold Pot</th>
            <th className='px-2 py-3 text-center font-semibold'>Run Pot</th>
            <th className='px-2 py-3 text-center font-semibold'>Class</th>
            <th className='px-2 py-3 text-center font-semibold'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={12} className='p-6 text-center text-neutral-400'>
                No Buyers
              </td>
            </tr>
          ) : (
            sortedData.map((buyer, index) => (
              <tr
                key={buyer.id}
                className='border-b border-white/5'
                style={getBuyerRowStyle(buyer.status)}
              >
                <td className='px-2 py-2 text-center'>
                  {index + 1}
                </td>
                <td className='px-2 py-2 text-center'>
                  {buyer.fieldIsBlocked === true ? (
                    <i>Encrypted</i>
                  ) : (
                    renderStatusSelect(buyer)
                  )}
                </td>
                <td className='px-2 py-2 text-center'>
                  {buyer.nameAndRealm === 'Encrypted' ? (
                    <i>Encrypted</i>
                  ) : (
                    buyer.nameAndRealm
                  )}
                </td>
                <td className='px-2 py-2 text-center'>
                  {buyer.buyerNote === 'Encrypted' ? (
                    <i>Encrypted</i>
                  ) : (
                    buyer.buyerNote
                  )}
                </td>
                <td className='px-2 py-2 text-center'>
                  {buyer.nameOwnerBuyer === 'Encrypted' ? (
                    <i>Encrypted</i>
                  ) : (
                    buyer.nameOwnerBuyer
                  )}
                </td>
                <td className='px-2 py-2 text-center'>
                  {buyer.nameCollector == null ||
                  buyer.nameCollector === 'Encrypted' ? (
                    <i>Encrypted</i>
                  ) : (
                    buyer.nameCollector
                  )}
                </td>
                <td className='px-2 py-2 text-center'>
                  {buyer.isEncrypted === true ? (
                    <i>Encrypted</i>
                  ) : (
                    renderPaidIcon({
                      ...buyer,
                      isPaid: buyer.isPaid == null ? false : buyer.isPaid,
                    })
                  )}
                </td>
                <td className='px-2 py-2 text-center'>
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
                </td>
                <td className='px-2 py-2 text-center'>
                  {buyer.buyerPot == null ? (
                    <i>Encrypted</i>
                  ) : buyer.buyerPot > 0 ? (
                    Math.round(Number(buyer.buyerPot)).toLocaleString('en-US')
                  ) : (
                    '-'
                  )}
                </td>
                <td className='px-2 py-2 text-center'>
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
                </td>
                <td className='px-2 py-2 text-center'>
                  {buyer.playerClass === 'Encrypted' ? (
                    <i>Encrypted</i>
                  ) : (
                    buyer.playerClass || null
                  )}
                </td>
                <td className='px-2 py-2 text-center'>
                  {buyer.nameAndRealm === 'Encrypted' ? null : (
                    <div className='mx-auto grid max-w-[136px] grid-cols-2 justify-items-center gap-1 min-[1750px]:max-w-[196px] min-[1750px]:grid-cols-3 min-[2300px]:flex min-[2300px]:max-w-none min-[2300px]:justify-center'>
                      {canSeeRaidLeaderButtons() && (
                        <>
                          <button
                            type='button'
                            title='AFK'
                              onClick={() =>
                                !runIsLocked && handleSendAFKMessage(buyer.id)
                              }
                              disabled={
                                runIsLocked ||
                                cooldownAFK[buyer.id] ||
                                globalCooldown
                              }
                              className='rounded-md p-1 disabled:opacity-50'
                            >
                              <RiZzzFill size={18} />
                          </button>
                          <button
                            type='button'
                            title='Offline'
                              onClick={() =>
                                !runIsLocked &&
                                handleSendOfflineMessage(buyer.id)
                              }
                              disabled={
                                runIsLocked ||
                                cooldown[buyer.id] ||
                                globalCooldown
                              }
                              className='rounded-md p-1 disabled:opacity-50'
                            >
                              <RiWifiOffLine size={18} />
                          </button>
                          <button
                            type='button'
                            title='Buyer in combat'
                              onClick={() =>
                                !runIsLocked &&
                                handleSendBuyerCombatMessage(buyer.id)
                              }
                              disabled={
                                runIsLocked ||
                                cooldownBuyerCombat[buyer.id] ||
                                globalCooldown
                              }
                              className='rounded-md p-1 disabled:opacity-50'
                            >
                              <RiSwordLine size={18} />
                          </button>
                          <button
                            type='button'
                            title='Price below minimum'
                              onClick={() =>
                                !runIsLocked &&
                                handleSendPriceWarningMessage(buyer.id)
                              }
                              disabled={
                                runIsLocked ||
                                cooldownPriceWarning[buyer.id] ||
                                globalCooldown
                              }
                              className='rounded-md p-1 disabled:opacity-50'
                            >
                              <RiArrowDownLine size={18} />
                          </button>
                        </>
                      )}
                      {canSeeAdvertiserButtons(buyer) && (
                        <>
                          <button
                            type='button'
                            title='Buyer Ready'
                              onClick={() =>
                                !runIsLocked &&
                                handleSendBuyerReadyMessage(buyer.id)
                              }
                              disabled={
                                runIsLocked ||
                                cooldownBuyerReady[buyer.id] ||
                                globalCooldown
                              }
                              className='rounded-md p-1 disabled:opacity-50'
                            >
                              <RiUserHeartLine size={18} />
                          </button>
                          <button
                            type='button'
                            title='Buyer Logging'
                              onClick={() =>
                                !runIsLocked &&
                                handleSendBuyerLoggingMessage(buyer.id)
                              }
                              disabled={
                                runIsLocked ||
                                cooldownBuyerLogging[buyer.id] ||
                                globalCooldown
                              }
                              className='rounded-md p-1 disabled:opacity-50'
                            >
                              <RiLoginCircleLine size={18} />
                          </button>
                          <button
                            type='button'
                            title='Attention! Check Note'
                              onClick={() =>
                                !runIsLocked &&
                                handleSendAttentionMessage(buyer.id)
                              }
                              disabled={
                                runIsLocked ||
                                cooldownAttention[buyer.id] ||
                                globalCooldown
                              }
                              className='rounded-md p-1 disabled:opacity-50'
                            >
                              <RiAlertLine size={18} />
                          </button>
                        </>
                      )}
                      <button
                        type='button'
                        title='Edit'
                          onClick={() => !runIsLocked && handleOpenModal(buyer)}
                          disabled={runIsLocked}
                          className='rounded-md p-1 disabled:opacity-50'
                        >
                          <Pencil size={18} />
                      </button>
                      {!isOnlyAdvertiserRole && (
                        <button
                          type='button'
                          title='Delete'
                            onClick={() =>
                              !runIsLocked && handleDeleteBuyer(buyer)
                            }
                            disabled={runIsLocked}
                            className='rounded-md p-1 disabled:opacity-50'
                          >
                            <Trash size={18} />
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {openModal && editingBuyer && (
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
          runIdTeam={runIdTeam}
        />
      )}
    </div>
  )
}
