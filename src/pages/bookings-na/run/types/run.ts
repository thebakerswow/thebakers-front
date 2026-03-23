export interface Players {
  idDiscord: string
  username: string
}

export interface SumPot {
  idDiscord: string
  username: string
  sumPot: number
  type: 'gold' | 'dollar'
}

export interface ArmorTokenPriorityStatus {
  cloth: boolean
  leather: boolean
  mail: boolean
  plate: boolean
}

export interface RunData {
  id: string
  name: { String: string; Valid: boolean }
  runIsLocked: boolean
  idTeam: string
  date: string
  time: string
  raid: string
  runType: string
  difficulty: string
  team: string
  backups: number
  actualPot: number
  actualPotDolar: number
  slotAvailable: number
  maxBuyers: string
  raidLeaders: RaidLeader[]
  loot: string
  atp?: ArmorTokenPriorityStatus
  note: string
  sumPot: SumPot[]
  players: Players[]
  buyersCount: string
  quantityBoss: { String: string; Valid: boolean }
  minPriceEnabled: boolean
  minPriceGold: number
  minPriceDollar: number
}

export interface RunHistory {
  id: number
  id_run: number
  id_buyer: { Int64: number; Valid: boolean } | null
  nameAndRealm?: string
  field: string
  old_value: string
  new_value: string
  name_edited_by: string
  created_at: string
}

export interface BuyerData {
  id: string
  status: string
  idBuyerAdvertiser: string
  fieldIsBlocked: boolean
  idOwnerBuyer: string
  nameOwnerBuyer: string
  buyerNote: string
  buyerPot: number
  buyerDolarPot: number
  buyerActualPot: number
  isPaid: boolean
  nameAndRealm: string
  nameCollector: string
  paymentRealm: string
  playerClass: string
  idRegister: string
  isEncrypted: boolean
}

export interface AttendanceInfoItem {
  idDiscord: string
  username: string
  percentage: number
}

export interface AttendanceState {
  info: AttendanceInfoItem[]
}

export interface RaidLeader {
  idCommunication: string
  idDiscord: string
  username: string
}

export interface ChatMessage {
  id?: string | number
  user_name: string
  id_discord: string
  message: string
  created_at: string
}

export interface RunChatProps {
  runId: string
  messages: ChatMessage[]
  loading: boolean
  unreadCount: number
  inputDisabled: boolean
  onSendMessage: (msg: string) => void
  onTagRaidLeader: (message?: ChatMessage) => void
  raidLeaders: RaidLeader[]
  idDiscord: string
  isChatOpen: boolean
  setIsChatOpen: (open: boolean) => void
}

export interface AttendanceProps {
  attendance: AttendanceState
  runId: string | undefined
  markAllAsFull: () => void
  handleAttendanceClick: (playerId: string, value: number) => void
  onAttendanceUpdate: () => void
  runIsLocked: boolean
}

export interface InviteBuyersProps {
  onClose: () => void
  runId: string | undefined
}

export interface AddBuyerProps {
  run: RunData
  onClose: () => void
  onBuyerAddedReload: () => void
}

export interface Advertiser {
  id: string
  id_discord: string
  name: string
  username: string
}

export interface EditBuyerModalBuyer {
  id: string
  nameAndRealm: string
  buyerPot: number
  buyerDolarPot: number
  buyerNote: string
  playerClass: string
}

export interface EditBuyerProps {
  buyer: EditBuyerModalBuyer
  onClose: () => void
  onEditSuccess: () => void
  runIdTeam?: string
  minPriceEnabled?: boolean
  minPriceGold?: number
  minPriceDollar?: number
}

export interface BuyersGridProps {
  data: BuyerData[]
  onBuyerStatusEdit: () => void
  onBuyerNameNoteEdit: () => void
  onDeleteSuccess: () => void
  containerClassName?: string
  slotAvailable?: number
  runIsLocked?: boolean
  runIdTeam?: string
  raidLeaders?: RaidLeader[]
  minPriceEnabled?: boolean
  minPriceGold?: number
  minPriceDollar?: number
}

export interface ApiOption {
  id: string
  username: string
  global_name: string
}

export interface EditRunProps {
  run: RunData
  onClose: () => void
  onRunEdit: () => void
}

export interface RunInfoProps {
  run: RunData
  onBuyerAddedReload: () => void
  onRunEdit: () => void
  attendanceAccessDenied: boolean
  buyers?: BuyerData[]
}

export interface EditHistoryDialogProps {
  open: boolean
  onClose: () => void
  idRun?: number
}

export interface User {
  id_discord: string
  username: string
  percentage?: number
  global_name?: string
}

export interface FreelancersProps {
  runId: string | undefined
  runIsLocked: boolean
}

export interface UpdateRunAttendancePayloadItem {
  idDiscord: string
  percentage: number
}

export interface FreelancerMutationPayload {
  id_discord: string
  id_run: string
}

export interface FreelancerAttendancePayload extends FreelancerMutationPayload {
  percentage: number
}
