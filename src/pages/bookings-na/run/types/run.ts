import type {
  RunData as BaseRunData,
  RunHistory as BaseRunHistory,
} from '../../../../types/runs-interface'
import type { BuyerData as BaseBuyerData } from '../../../../types/buyer-interface'

export type RunData = BaseRunData
export type BuyerData = BaseBuyerData
export type RunHistory = BaseRunHistory

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
}

export interface EditBuyerProps {
  buyer: EditBuyerModalBuyer
  onClose: () => void
  onEditSuccess: () => void
  runIdTeam?: string
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
