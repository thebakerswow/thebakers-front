export type MockBuyerStatus = 'waiting' | 'group' | 'done' | 'noshow'

export interface MockBuyer {
  id: string
  status: MockBuyerStatus
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
  claimedById: string | null
}

export interface MockSumPot {
  idDiscord: string
  username: string
  sumPot: number
  type: 'gold' | 'dolar'
}

export interface MockRunInfo {
  raid: string
  difficulty: string
  time: string
  loot: string
  maxBuyers: number
  slotAvailable: number
  backups: number
  raidLeaders: string[]
  actualPot: number
  actualPotDolar: number
  sumPot: MockSumPot[]
}
