import { Players, RaidLeader } from './player-interface'

export interface SumPot {
  idDiscord: string
  username: string
  sumPot: number
  type: 'gold' | 'dolar'
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
  note: string
  sumPot: SumPot[]
  players: Players[]
  buyersCount: string
  quantityBoss: { String: string; Valid: boolean } // ajustado para aceitar objeto do backend
}

export interface RunHistory {
  id: number
  id_run: number
  id_buyer: { Int64: number; Valid: boolean } | null
  field: string
  old_value: string
  new_value: string
  name_edited_by: string
  created_at: string
}
