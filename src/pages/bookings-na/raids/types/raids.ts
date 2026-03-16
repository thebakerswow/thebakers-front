import type { RunData } from '../../run/types/run'

export type RaidsRunData = RunData

export interface ApiOption {
  id: string
  username: string
  global_name: string
}

export interface RaidRunCreatePayload {
  name: { String: string; Valid: boolean } | string
  date: string
  time: string
  raid: string
  runType: string
  difficulty: string
  idTeam: string
  maxBuyers: string
  raidLeader: string[]
  loot: string
  note: string
  quantityBoss: { String: string; Valid: boolean } | string
}

export interface AddRunProps {
  onClose: () => void
  onRunAddedReload: () => void
}

export interface AddMultipleRunsProps {
  isOpen: boolean
  selectedDate: Date | null
  onClose: () => void
  onRunsAdded: () => Promise<void> | void
}

export interface RunsDataGridProps {
  data: RaidsRunData[]
  isLoading: boolean
  onDeleteSuccess: () => void
}

export interface BuyersPreviewProps {
  runId: string
  onClose: () => void
}
