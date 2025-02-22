import { RaidLeader } from "./player-interface"

export interface RunsDataProps {
  data: Array<{
    id: string
    idTeam: string
    date: string
    time: string
    raid: string
    runType: string
    difficulty: string
    team: string
    maxBuyers: string
    raidLeaders: RaidLeader[]
    note: string
    loot: string
  }>
  isLoading: boolean
}
