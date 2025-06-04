import { Players, RaidLeader } from './player-interface'

export interface SumPot {
  idDiscord: string
  username: string
  sumPot: number
}

export interface RunData {
  id: string
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
