import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { SpecialRunDetails } from './components/SpecialRunsDetails'
import { SpecialRunBuyersGrid } from './components/SpecialRunsBuyersGrid'
import { SpecialRunPageSkeleton } from './components/SpecialRunsPageSkeleton'
import { AddClaimServiceBuyer } from './components/AddClaimServiceBuyer'
import { ClaimServicesHistoryDialog } from './components/ClaimServicesHistoryDialog'
import { EditClaimServiceBuyer } from './components/EditClaimServiceBuyer'
import { LoadingSpinner } from '../../../components/LoadingSpinner'
import type {
  SpecialRunBuyer,
  SpecialRunBuyerStatus,
  SpecialRunDetailsPageProps,
  SpecialRunServiceType,
  StatusOption,
} from './types/specialRuns'
import {
  deleteClaimService,
  getClaimServices,
  toggleClaimService,
  updateClaimServicePaid,
  updateClaimServiceStatus,
} from './services/specialRunsApi'
import { sendDiscordMessage } from '../run/services/runApi'
import { handleApiError } from '../../../utils/apiErrorHandler'
import { shouldHideDollarPotInfo } from '../../../utils/roleUtils'
import Swal from 'sweetalert2'

const statusOrder: Record<SpecialRunBuyerStatus, number> = {
  done: 1,
  group: 2,
  waiting: 3,
  noshow: 4,
}

const statusOptions: StatusOption[] = [
  { value: 'waiting', label: 'Waiting' },
  { value: 'noshow', label: 'No Show' },
  { value: 'group', label: 'Group' },
  { value: 'done', label: 'Done' },
]

function getStatusStyle(status: SpecialRunBuyerStatus): string {
  switch (status) {
    case 'waiting':
      return 'bg-amber-500/35'
    case 'group':
      return 'bg-sky-500/35'
    case 'done':
      return 'bg-emerald-500/35'
    case 'noshow':
      return 'bg-rose-500/35'
    default:
      return 'bg-white/5'
  }
}

const allowedStatuses: SpecialRunBuyerStatus[] = ['waiting', 'group', 'done', 'noshow']

const normalizeType = (runType: string): SpecialRunServiceType => {
  const normalized = runType.trim().toLowerCase()

  if (normalized === 'keys' || normalized === 'key') return 'keys'
  if (normalized === 'leveling') return 'leveling'
  if (normalized === 'delves') return 'delves'
  if (normalized === 'achievements') return 'achievements'
  if (normalized === 'pvp') return 'pvp'

  return 'keys'
}

const formatDateParam = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const toStringOr = (value: unknown, fallback = '-'): string =>
  typeof value === 'string'
    ? value.trim().length > 0
      ? value
      : fallback
    : typeof value === 'number'
      ? String(value)
      : fallback

const toNumberOrZero = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

const toBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return normalized === 'true' || normalized === '1'
  }
  return false
}

const readFirst = (
  source: Record<string, unknown>,
  keys: string[]
): unknown => {
  for (const key of keys) {
    if (key in source) return source[key]
  }
  return undefined
}

const mapClaimServiceBuyer = (
  buyerRaw: unknown,
  index: number,
  fallbackType: string
): SpecialRunBuyer => {
  const source =
    buyerRaw && typeof buyerRaw === 'object'
      ? (buyerRaw as Record<string, unknown>)
      : {}

  const id = toStringOr(readFirst(source, ['id', 'id_buyer']), `${fallbackType}-${index + 1}`)
  const rawStatus = toStringOr(readFirst(source, ['status']), 'waiting').toLowerCase()
  const status = allowedStatuses.includes(rawStatus as SpecialRunBuyerStatus)
    ? (rawStatus as SpecialRunBuyerStatus)
    : 'waiting'

  const dolarPot = toNumberOrZero(readFirst(source, ['buyerDolarPot', 'buyer_dolar_pot', 'dolarPot']))
  const goldPot = toNumberOrZero(
    readFirst(source, ['buyerPot', 'buyer_pot', 'goldPot', 'claimServicePot'])
  )
  const claimServiceDolarPot = toNumberOrZero(
    readFirst(source, ['claimServiceDolarPot', 'claim_service_dolar_pot'])
  )
  const runPot = toNumberOrZero(
    readFirst(source, [
      'claimServiceActualPot',
      'claim_service_actual_pot',
      'buyerActualPot',
      'buyer_actual_pot',
      'runPot',
    ])
  )
  const claimedByRaw = readFirst(source, ['claimedBy', 'claimed_by'])

  const claimedBy = toStringOr(claimedByRaw, '')
  const claimed =
    toBoolean(readFirst(source, ['claimed', 'is_claimed'])) ||
    Boolean(claimedBy)

  const resolvedDolarPot = claimServiceDolarPot > 0 ? claimServiceDolarPot : dolarPot
  const resolvedRunPot = runPot
  return {
    id,
    status,
    idOwnerClaimService: toStringOr(
      readFirst(source, ['idOwnerClaimService', 'id_owner_claim_service']),
      ''
    ),
    idClaimServiceAdvertiser: toStringOr(
      readFirst(source, ['idClaimServiceAdvertiser', 'id_claim_service_advertiser']),
      ''
    ),
    nameAndRealm: toStringOr(readFirst(source, ['nameAndRealm', 'name_and_realm'])),
    note: toStringOr(
      readFirst(source, [
        'buyerNote',
        'buyer_note',
        'claimServiceNote',
        'claim_service_note',
      ]),
      ''
    ),
    advertiser: toStringOr(
      readFirst(source, [
        'nameOwnerClaimService',
        'name_owner_claim_service',
        'nameOwnerBuyer',
        'name_owner_buyer',
        'advertiser',
      ])
    ),
    collector: toStringOr(
      readFirst(source, ['nameCollector', 'name_collector', 'collector'])
    ),
    paidFull: toBoolean(readFirst(source, ['isPaid', 'is_paid', 'paidFull'])),
    dolarPot: resolvedDolarPot,
    goldPot,
    runPot: resolvedRunPot,
    playerClass: toStringOr(readFirst(source, ['playerClass', 'player_class'])),
    claimed,
    claimedBy: claimedBy || null,
  }
}

export function SpecialRunDetailsPage({ runType }: SpecialRunDetailsPageProps) {
  const { username, idDiscord, userRoles } = useAuth()
  const serviceType = useMemo(() => normalizeType(runType), [runType])
  const responsibleUserId = idDiscord || username || null
  const isChefeDeCozinha = userRoles.includes(import.meta.env.VITE_TEAM_CHEFE)
  const isAdvertiser = userRoles.includes(import.meta.env.VITE_TEAM_ADVERTISER)
  const isJuniorAdvertiser = userRoles.includes(
    import.meta.env.VITE_TEAM_ADVERTISER_JUNIOR
  )
  const hideDollarPotInfo = shouldHideDollarPotInfo(userRoles)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [buyers, setBuyers] = useState<SpecialRunBuyer[]>([])
  const [isLoadingBuyers, setIsLoadingBuyers] = useState<boolean>(true)
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true)
  const [isAddBuyerOpen, setIsAddBuyerOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [editingBuyer, setEditingBuyer] = useState<SpecialRunBuyer | null>(null)
  const buyersRequestInFlightRef = useRef(false)
  /** If loadBuyers was requested while a fetch was in flight, run one more silent fetch when it ends */
  const buyersRefreshQueuedRef = useRef(false)
  const buyersSnapshotRef = useRef('')
  const isUserActiveRef = useRef(true)
  const paidToggleInFlightRef = useRef<Set<string>>(new Set())
  const [paidTogglePendingByBuyerId, setPaidTogglePendingByBuyerId] = useState<
    Record<string, boolean>
  >({})
  const [paidAwaitingExpectedByBuyerId, setPaidAwaitingExpectedByBuyerId] = useState<
    Record<string, boolean>
  >({})

  const selectedDateParam = useMemo(
    () => formatDateParam(selectedDate),
    [selectedDate]
  )

  const loadBuyers = useCallback(async (showLoading = true) => {
    if (buyersRequestInFlightRef.current) {
      buyersRefreshQueuedRef.current = true
      return
    }

    buyersRequestInFlightRef.current = true
    if (showLoading) {
      setIsLoadingBuyers(true)
    }

    try {
      const response = await getClaimServices({
        date: selectedDateParam,
        type: serviceType,
      })

      const mappedBuyers = response.map((buyer, index) =>
        mapClaimServiceBuyer(buyer, index, serviceType)
      )
      setPaidAwaitingExpectedByBuyerId((prev) => {
        const next = { ...prev }
        for (const b of mappedBuyers) {
          const exp = next[b.id]
          if (exp !== undefined && b.paidFull === exp) {
            delete next[b.id]
          }
        }
        return next
      })
      const nextSnapshot = JSON.stringify(mappedBuyers)
      if (buyersSnapshotRef.current !== nextSnapshot) {
        buyersSnapshotRef.current = nextSnapshot
        setBuyers(mappedBuyers)
      }
    } catch (error) {
      setPaidAwaitingExpectedByBuyerId({})
      setBuyers([])
      await handleApiError(error, 'Failed to fetch special run buyers')
    } finally {
      buyersRequestInFlightRef.current = false
      if (showLoading) {
        setIsLoadingBuyers(false)
      }
      setIsInitialLoad(false)
      if (buyersRefreshQueuedRef.current) {
        buyersRefreshQueuedRef.current = false
        void loadBuyers(false)
      }
    }
  }, [selectedDateParam, serviceType])

  useEffect(() => {
    // Reseta o snapshot para garantir refresh ao trocar data ou tipo.
    buyersSnapshotRef.current = ''
    setPaidAwaitingExpectedByBuyerId({})
    void loadBuyers()

    const resetActivityTimer = () => {
      isUserActiveRef.current = true
      clearTimeout(inactivityTimeout)
      inactivityTimeout = setTimeout(() => {
        isUserActiveRef.current = false
      }, 5000)
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isUserActiveRef.current = false
      } else {
        isUserActiveRef.current = true
        resetActivityTimer()
      }
    }

    let inactivityTimeout: ReturnType<typeof setTimeout>
    let buyersTimer: ReturnType<typeof setTimeout>

    const handleMouseOrKeyActivity = () => {
      resetActivityTimer()
    }

    const scheduleBuyersPoll = () => {
      const buyersDelay = isUserActiveRef.current ? 2000 : 12000
      buyersTimer = setTimeout(() => {
        void loadBuyers(false)
        scheduleBuyersPoll()
      }, buyersDelay)
    }

    window.addEventListener('mousemove', handleMouseOrKeyActivity)
    window.addEventListener('keydown', handleMouseOrKeyActivity)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    resetActivityTimer()
    scheduleBuyersPoll()

    return () => {
      clearTimeout(buyersTimer)
      clearTimeout(inactivityTimeout)
      window.removeEventListener('mousemove', handleMouseOrKeyActivity)
      window.removeEventListener('keydown', handleMouseOrKeyActivity)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [loadBuyers])

  const sortedBuyers = useMemo(
    () => [...buyers].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]),
    [buyers]
  )

  const isBuyerClaimedByCurrentUser = (buyer: SpecialRunBuyer) => {
    const claimedByMatchesId =
      !!idDiscord &&
      buyer.claimedBy === idDiscord
    const claimedByMatchesUsername =
      !!username &&
      buyer.claimedBy?.trim().toLowerCase() === username.trim().toLowerCase()
    return claimedByMatchesId || claimedByMatchesUsername
  }

  const canToggleClaim = (buyer: SpecialRunBuyer) => {
    if (!buyer.claimed) return true
    if (isChefeDeCozinha) return true
    return isBuyerClaimedByCurrentUser(buyer)
  }

  const canEditStatus = (buyer: SpecialRunBuyer) => {
    void buyer
    return true
  }

  const canUseActionButtons = (buyer: SpecialRunBuyer) => {
    if (!buyer.claimed) return false
    return isBuyerClaimedByCurrentUser(buyer)
  }

  const canUseAdvertiserActionButtons = (buyer: SpecialRunBuyer) => {
    if (isChefeDeCozinha) return true
    if (!idDiscord) return false
    return (
      buyer.idOwnerClaimService === idDiscord ||
      buyer.idClaimServiceAdvertiser === idDiscord
    )
  }

  const canEditBuyer = (buyer: SpecialRunBuyer) => {
    if (isChefeDeCozinha) return true

    const isBuyerAdvertiser =
      !!idDiscord &&
        buyer.idOwnerClaimService === idDiscord

    return isBuyerClaimedByCurrentUser(buyer) || isBuyerAdvertiser
  }

  const canSeeDeleteButton =
    isChefeDeCozinha || (isAdvertiser && !isJuniorAdvertiser)
  const canSeeHistoryButton = userRoles.includes(import.meta.env.VITE_TEAM_CHEFE)
  const canDeleteBuyer = (buyer: SpecialRunBuyer) => {
    if (isJuniorAdvertiser) return false
    if (isChefeDeCozinha) return true
    if (isAdvertiser) return canUseAdvertiserActionButtons(buyer)
    return canUseActionButtons(buyer)
  }

  const handleStatusChange = async (buyerId: string, newStatus: SpecialRunBuyerStatus) => {
    if (!responsibleUserId) return
    const buyer = buyers.find((entry) => entry.id === buyerId)
    if (!buyer || !canEditStatus(buyer)) return

    const parsedId = Number(buyerId)
    if (!Number.isFinite(parsedId) || parsedId <= 0) {
      await handleApiError(
        new Error('Invalid claim service id'),
        'Failed to update claim service status'
      )
      return
    }

    try {
      await updateClaimServiceStatus({
        id_claim_service: parsedId,
        status: newStatus,
      })
      setBuyers((prev) =>
        prev.map((buyer) =>
          buyer.id === buyerId
            ? { ...buyer, status: newStatus }
            : buyer
        )
      )
    } catch (error) {
      await handleApiError(error, 'Failed to update claim service status')
    }
  }

  const handleTogglePaid = async (buyerId: string) => {
    if (paidToggleInFlightRef.current.has(buyerId)) return

    const buyer = buyers.find((entry) => entry.id === buyerId)
    if (!buyer || !canEditStatus(buyer)) return
    const nextPaidStatus = !buyer.paidFull

    const parsedId = Number(buyerId)
    if (!Number.isFinite(parsedId) || parsedId <= 0) {
      await handleApiError(
        new Error('Invalid claim service id'),
        'Failed to update claim service paid'
      )
      return
    }

    paidToggleInFlightRef.current.add(buyerId)
    setPaidTogglePendingByBuyerId((prev) => ({ ...prev, [buyerId]: true }))
    try {
      await updateClaimServicePaid({
        id_claim_service: parsedId,
        is_paid: nextPaidStatus,
      })
      setPaidAwaitingExpectedByBuyerId((prev) => ({
        ...prev,
        [buyerId]: nextPaidStatus,
      }))
      void loadBuyers(false)
    } catch (error) {
      await handleApiError(error, 'Failed to update claim service paid')
    } finally {
      paidToggleInFlightRef.current.delete(buyerId)
      setPaidTogglePendingByBuyerId((prev) => {
        const next = { ...prev }
        delete next[buyerId]
        return next
      })
    }
  }

  const handleClaim = async (buyerId: string) => {
    if (!responsibleUserId) return

    const buyer = buyers.find((entry) => entry.id === buyerId)
    const isAlreadyClaimed = buyer?.claimed ?? false
    const actionLabel = isAlreadyClaimed ? 'unclaim' : 'claim'
    const buyerLabel = buyer?.nameAndRealm || 'this buyer'

    const result = await Swal.fire({
      title: 'Confirm Action',
      text: `Do you want to ${actionLabel} ${buyerLabel}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
    })

    if (!result.isConfirmed) return

    try {
      void Swal.fire({
        title: isAlreadyClaimed ? 'Unclaiming buyer...' : 'Claiming buyer...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })
      await toggleClaimService(buyerId)
      await loadBuyers()
      Swal.close()
    } catch (error) {
      Swal.close()
      await handleApiError(error, 'Failed to claim service')
    }
  }

  const handleDeleteBuyer = async (buyer: SpecialRunBuyer) => {
    const result = await Swal.fire({
      title: 'Confirm Deletion',
      text: `Are you sure you want to delete ${buyer.nameAndRealm}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    })

    if (!result.isConfirmed) return

    try {
      void Swal.fire({
        title: 'Deleting buyer...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })
      await deleteClaimService(buyer.id)
      await loadBuyers()
      Swal.close()
      await Swal.fire({
        title: 'Success!',
        text: 'Buyer deleted successfully',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error) {
      Swal.close()
      await handleApiError(error, 'Failed to delete claim service')
    }
  }

  const handleOpenEditBuyer = (buyer: SpecialRunBuyer) => {
    setEditingBuyer(buyer)
  }

  const getClaimServiceRecipientIds = (buyer: SpecialRunBuyer): string[] => {
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
    const NIGHT_MARKET_ID = '1331332769149616279'

    if (buyer.idOwnerClaimService === BABY_JOHNY_ID) {
      return BABY_JOHNY_EMPLOYEES
    }
    if (buyer.idOwnerClaimService === WIDEX_ID) {
      return WIDEX_EMPLOYEES
    }
    if (
      buyer.idOwnerClaimService === NIGHT_MARKET_ID ||
      buyer.idClaimServiceAdvertiser === NIGHT_MARKET_ID
    ) {
      return [
        import.meta.env.VITE_ID_GRASSMAN,
        import.meta.env.VITE_ID_CALMAKARAI,
      ]
    }
    if (buyer.idClaimServiceAdvertiser) {
      return [import.meta.env.VITE_ID_CALMAKARAI]
    }
    return buyer.idOwnerClaimService ? [buyer.idOwnerClaimService] : []
  }

  const sendActionMessage = async (
    buyerId: string,
    messageBuilder: (buyer: SpecialRunBuyer, pageLink: string) => string,
    canSendMessage: (buyer: SpecialRunBuyer) => boolean = canUseActionButtons
  ) => {
    const buyer = buyers.find((entry) => entry.id === buyerId)
    if (!buyer || !canSendMessage(buyer)) return

    const recipientIds = getClaimServiceRecipientIds(buyer)
    if (recipientIds.length === 0) return

    const pageLink = window.location.href

    try {
      await Promise.all(
        recipientIds.map((recipientId) =>
          sendDiscordMessage(recipientId, messageBuilder(buyer, pageLink))
        )
      )
      await Swal.fire({
        title: 'Success!',
        text: 'Advertiser notified',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error) {
      await handleApiError(error, 'Failed to send discord message')
    }
  }

  const handleSendAFKMessage = async (buyerId: string) => {
    await sendActionMessage(
      buyerId,
      (buyer, pageLink) =>
        `AFK Buyer\nNick: ${buyer.nameAndRealm}\nRun: ${pageLink}`
    )
  }

  const handleSendOfflineMessage = async (buyerId: string) => {
    await sendActionMessage(
      buyerId,
      (buyer, pageLink) =>
        `Offline Buyer\nNick: ${buyer.nameAndRealm}\nRun: ${pageLink}`
    )
  }

  const handleSendBuyerCombatMessage = async (buyerId: string) => {
    await sendActionMessage(
      buyerId,
      (buyer, pageLink) =>
        `Buyer in combat and not in our group\nNick: ${buyer.nameAndRealm}\nRun: ${pageLink}`
    )
  }

  const handleSendPriceWarningMessage = async (buyerId: string) => {
    await sendActionMessage(
      buyerId,
      (buyer, pageLink) =>
        `Buyer is below minimum price and will be replaced if the price is not corrected until 15 minutes before the invite\nNick: ${buyer.nameAndRealm}\nRun: ${pageLink}`
    )
  }

  const handleSendBuyerReadyMessage = async (buyerId: string) => {
    await sendActionMessage(
      buyerId,
      (buyer, pageLink) =>
        `Buyer Ready\nNick: ${buyer.nameAndRealm}\nRun: ${pageLink}`,
      canUseAdvertiserActionButtons
    )
  }

  const handleSendBuyerLoggingMessage = async (buyerId: string) => {
    await sendActionMessage(
      buyerId,
      (buyer, pageLink) =>
        `Buyer Logging\nNick: ${buyer.nameAndRealm}\nRun: ${pageLink}`,
      canUseAdvertiserActionButtons
    )
  }

  const handleSendAttentionMessage = async (buyerId: string) => {
    await sendActionMessage(
      buyerId,
      (buyer, pageLink) =>
        `Attention! Check Note\nNick: ${buyer.nameAndRealm}\nRun: ${pageLink}`,
      canUseAdvertiserActionButtons
    )
  }

  return (
    <div className='flex w-full flex-col overflow-auto rounded-xl text-gray-100 shadow-2xl'>
      {isInitialLoad && isLoadingBuyers ? (
        <SpecialRunPageSkeleton />
      ) : (
        <div className='mx-2 p-4 pb-4'>
          <SpecialRunDetails
            selectedDate={selectedDate}
            onPreviousDate={() =>
              setSelectedDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 1))
            }
            onNextDate={() =>
              setSelectedDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1))
            }
            onDateSelect={setSelectedDate}
            onOpenAddBuyer={() => setIsAddBuyerOpen(true)}
            onOpenHistory={() => setIsHistoryOpen(true)}
            canSeeHistoryButton={canSeeHistoryButton}
          />
          {isLoadingBuyers ? (
            <div className='flex min-h-[220px] items-center justify-center p-4'>
              <LoadingSpinner size='lg' label='Loading buyers' />
            </div>
          ) : (
            <SpecialRunBuyersGrid
              buyers={sortedBuyers}
              paidTogglePendingByBuyerId={paidTogglePendingByBuyerId}
              paidAwaitingExpectedByBuyerId={paidAwaitingExpectedByBuyerId}
              hideDollarPotInfo={hideDollarPotInfo}
              statusOptions={statusOptions}
              getStatusStyle={getStatusStyle}
              onStatusChange={handleStatusChange}
              onTogglePaid={handleTogglePaid}
              onClaim={handleClaim}
              onDelete={handleDeleteBuyer}
              onEdit={handleOpenEditBuyer}
              onSendAFKMessage={handleSendAFKMessage}
              onSendOfflineMessage={handleSendOfflineMessage}
              onSendBuyerCombatMessage={handleSendBuyerCombatMessage}
              onSendPriceWarningMessage={handleSendPriceWarningMessage}
              onSendBuyerReadyMessage={handleSendBuyerReadyMessage}
              onSendBuyerLoggingMessage={handleSendBuyerLoggingMessage}
              onSendAttentionMessage={handleSendAttentionMessage}
              canToggleClaim={canToggleClaim}
              canEditStatus={canEditStatus}
              canUseActionButtons={canUseActionButtons}
              canUseAdvertiserActionButtons={canUseAdvertiserActionButtons}
              canEditBuyer={canEditBuyer}
              canSeeDeleteButton={canSeeDeleteButton}
              canDeleteBuyer={canDeleteBuyer}
            />
          )}
        </div>
      )}

      {isAddBuyerOpen && (
        <AddClaimServiceBuyer
          type={serviceType}
          date={selectedDateParam}
          onClose={() => setIsAddBuyerOpen(false)}
          onBuyerAddedReload={loadBuyers}
        />
      )}

      {editingBuyer && (
        <EditClaimServiceBuyer
          buyer={editingBuyer}
          onClose={() => setEditingBuyer(null)}
          onEditSuccess={loadBuyers}
        />
      )}

      <ClaimServicesHistoryDialog
        open={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        date={selectedDateParam}
        type={serviceType}
      />
    </div>
  )
}
