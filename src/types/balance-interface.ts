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
  onError: (
    error: { message: string; response?: any; status?: number } | null
  ) => void
}

export interface BalanceControlTableProps {
  selectedTeam: string
  selectedDate: string
  setSelectedTeam: (team: string) => void
  setSelectedDate: (date: string) => void
  isDolar: boolean
  setIsDolar: (value: boolean) => void
}

export interface WeekRangeFilterProps {
  onDateRangeChange: (startDate: string, endDate: string) => void
}
