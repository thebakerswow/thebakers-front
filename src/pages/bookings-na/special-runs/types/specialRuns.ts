export type SpecialRunBuyerStatus = 'waiting' | 'group' | 'done' | 'noshow'

export type SpecialRunServiceType =
  | 'keys'
  | 'leveling'
  | 'delves'
  | 'achievements'

export interface SpecialRunBuyer {
  id: string
  status: SpecialRunBuyerStatus
  idOwnerClaimService: string
  idClaimServiceAdvertiser: string
  nameAndRealm: string
  note: string
  advertiser: string
  collector: string
  paidFull: boolean
  dolarPot: number
  goldPot: number
  runPot: number
  playerClass: string
  claimed: boolean
  claimedBy: string | null
}

export interface GetClaimServicesParams {
  date: string
  type: SpecialRunServiceType
}

export interface CreateClaimServicePayload {
  type: string
  date: string
  claimServicePot?: number
  claimServiceDolarPot?: number
  isPaid?: boolean
  claimServiceNote?: string
  nameAndRealm?: string
  playerClass?: string
  idClaimServiceAdvertiser?: string
}

export interface UpdateClaimServiceStatusPayload {
  id_claim_service: number
  status: SpecialRunBuyerStatus
}

export interface UpdateClaimServicePayload {
  id: number
  claimServicePot?: number
  claimServiceDolarPot?: number
  claimServiceNote?: string
  nameAndRealm?: string
}

export interface SpecialRunDetailsPageProps {
  runType: string
}

export interface SpecialRunDetailsProps {
  selectedDateLabel: string
  onPreviousDate: () => void
  onNextDate: () => void
  onOpenAddBuyer: () => void
  onOpenHistory: () => void
  canSeeHistoryButton: boolean
}

export interface StatusOption {
  value: SpecialRunBuyerStatus
  label: string
}

export interface SpecialRunBuyersGridProps {
  buyers: SpecialRunBuyer[]
  statusOptions: StatusOption[]
  getStatusStyle: (status: SpecialRunBuyerStatus) => string
  onStatusChange: (buyerId: string, newStatus: SpecialRunBuyerStatus) => void
  onClaim: (buyerId: string) => void
  onDelete: (buyer: SpecialRunBuyer) => void
  onEdit: (buyer: SpecialRunBuyer) => void
  onSendAFKMessage: (buyerId: string) => void
  onSendOfflineMessage: (buyerId: string) => void
  onSendBuyerCombatMessage: (buyerId: string) => void
  onSendPriceWarningMessage: (buyerId: string) => void
  onSendBuyerReadyMessage: (buyerId: string) => void
  onSendBuyerLoggingMessage: (buyerId: string) => void
  onSendAttentionMessage: (buyerId: string) => void
  canToggleClaim: (buyer: SpecialRunBuyer) => boolean
  canEditStatus: (buyer: SpecialRunBuyer) => boolean
  canUseActionButtons: (buyer: SpecialRunBuyer) => boolean
  canUseAdvertiserActionButtons: (buyer: SpecialRunBuyer) => boolean
  canEditBuyer: (buyer: SpecialRunBuyer) => boolean
  canSeeDeleteButton: boolean
  canDeleteBuyer: (buyer: SpecialRunBuyer) => boolean
}

export interface AddClaimServiceBuyerProps {
  type: SpecialRunServiceType
  date: string
  onClose: () => void
  onBuyerAddedReload: () => Promise<void> | void
}

export interface EditClaimServiceBuyerProps {
  buyer: SpecialRunBuyer
  onClose: () => void
  onEditSuccess: () => Promise<void> | void
}

export interface ClaimServicesHistoryDialogProps {
  open: boolean
  onClose: () => void
  date: string
  type: SpecialRunServiceType
}

export interface ClaimServiceHistoryEntry {
  id?: number
  id_claim_service?: number
  date?: string
  type?: string
  field?: string
  old_value?: string
  new_value?: string
  name_edited_by?: string
  created_at?: string
  nameAndRealm?: string
  name_and_realm?: string
}
