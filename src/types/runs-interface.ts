import { Players, RaidLeader } from './player-interface'

export interface SumPot {
  idDiscord: string
  username: string
  sumPot: number
}

export interface RunData {
  id: string
  idTeam: string
  date: string
  time: string
  raid: string
  runType: string
  difficulty: string
  team: string
  backups: number
  actualPot: number
  slotAvailable: number
  maxBuyers: string
  raidLeaders: RaidLeader[]
  loot: string
  note: string
  sumPot: SumPot[]
  players: Players[]
}
