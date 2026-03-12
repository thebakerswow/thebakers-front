export type BalanceDateRange = {
  start: string
  end: string
}

export interface PlayerBalance {
  id_discord: string
  value: number
}

export interface BalanceResponse {
  info: {
    player_balance: {
      [date: string]: Array<PlayerBalance>
    }
    balance_total: Array<{
      id_discord: string
      username: string
      balance_total: number
      color_balance: string
    }>
  }
  errors: string[]
}

export interface ProcessedPlayer {
  id: string
  username: string
  balance_total: number
  dailyValues: {
    [date: string]: number
  }
}

export interface BalanceDataGridProps {
  selectedTeam: string | null
  dateRange: { start: string; end: string } | undefined
  is_dolar: boolean
}

export type BalanceTeamOption = {
  id_discord: string
  team_name: string
}

export type BalanceTeamFilterProps = {
  selectedTeam: string | null
  onChange: (team: string | null) => void
}

export type WeekRangeFilterProps = {
  onChange: (range: BalanceDateRange) => void
}

export type BalanceQueryParams = {
  id_team?: string | number
  date_start: string
  date_end: string
  is_dolar: boolean
}

export type BalanceColorPayload = {
  id_discord: string
  color: string
}

export type BalanceGridSkeletonProps = {
  rows?: number
  columns?: number
}

export interface ColorSelectorProps {
  onSelectColor: (color: string) => void
}
