export type BalanceDateRange = {
  start: string
  end: string
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
