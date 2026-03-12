type BalanceControlSortKey = 'username' | 'balance_total'
type BalanceControlSortDirection = 'asc' | 'desc'

export type BalanceControlSortConfig = {
  key: BalanceControlSortKey
  direction: BalanceControlSortDirection
}

export type BalanceControlTableNewProps = {
  selectedTeam: string
  selectedDate: string
  setSelectedTeam: (value: string) => void
  setSelectedDate: (value: string) => void
  isDolar: boolean
  setIsDolar: (value: boolean) => void
  allowedTeams: string[]
  hideTeamSelector?: boolean
  onInitialLoadComplete?: () => void
}

export type DatePickerInputProps = {
  value?: string
  onClick?: () => void
  className: string
  placeholder?: string
}

export type BalanceDailyUser = {
  idDiscord: string
  username: string
  gold: number | string
  gold_collect: number | string
  sum_day: number | string
  balance_total: number | string
}

export type GBankListNewProps = {
  selectedTeam?: string | null
  onInitialLoadComplete?: () => void
}

export type GBank = {
  id: string
  name: string
  balance: number
  calculatorValue: string
  idTeam: string
}

export type GBankGroup = {
  color: string
  label: string
  items: GBank[]
}

export type GetBalanceDailyParams = {
  id_team?: string | number
  date: string
  is_dolar: boolean
}

export type CreateGBankPayload = {
  name: string
  idTeam: string
}

export type CreateTransactionRequestPayload = {
  idGbank: string
  value: number
  image: string
}
