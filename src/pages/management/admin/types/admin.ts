import type { ErrorDetails } from '../../../../components/error-display'

export interface BalanceControlTableProps {
  selectedTeam: string
  selectedDate: string
  setSelectedTeam: (team: string) => void
  setSelectedDate: (date: string) => void
  isDolar: boolean
  setIsDolar: (value: boolean) => void
}

export interface ExtendedBalanceControlTableProps extends BalanceControlTableProps {
  onError?: (error: ErrorDetails) => void
}

export interface GBanksTableProps {
  onError?: (error: ErrorDetails) => void
}

export interface VerifyTableProps {
  onError?: (error: ErrorDetails) => void
}

export interface Transaction {
  id: string
  name_impacted: string
  value: string
  made_by: string
  date: string
  type?: 'dollar' | 'gold'
}

export interface VerifyTableData {
  general_balance_gbank: number
  general_balance: number
}

export interface GBank {
  id: string
  name: string
  balance: number
  calculatorValue: string
  idTeam: string
}

export interface GBankApiItem {
  id: string
  name: string
  balance: number
  idTeam: string
  calculatorValue?: string | number | null
}

export interface RunWithoutAttendance {
  idRun: number
  raid: string
  text: string
  date: string
}

export interface DatePickerInputProps {
  value?: string
  onClick?: () => void
  className: string
  placeholder?: string
}

export interface PlayerOption {
  idDiscord: string
  username: string
}

export interface GbankOption {
  id: string
  name: string
}

export interface ExtractLogInfo {
  name_impacted: string
  value: string
  made_by: string
  date: string
}

export interface ExtractLogRow {
  player: string
  action: string
  author: string
  date: string
}

export interface GetBalanceAdminParams {
  id_team?: string | number
  date: string
  is_dolar: boolean
}

export interface CreateTransactionData {
  value: number
  id_discord: string
  is_dolar: boolean
}

export interface UpdateNickData {
  nick: string
  id_discord: string
}

export interface CreateGBankData {
  name: string
  idTeam: string
}

export interface UpdateGBankValueData {
  id: string
  balance: number
}

export interface UpdateGBankData {
  id: string
  name: string
  idTeam: string
}

export interface GetGbankLogsParams {
  initial_date: string
  end_date: string
  impacted: string
}

export interface GetTransactionLogsParams {
  initial_date: string
  end_date: string
  impacted: string
  is_dolar: boolean
}

export interface LatestTransactionsProps {
  isDolar: boolean
}

export interface TransactionWithSource extends Transaction {
  isGbank: boolean
}

export interface LatestTransactionsResponse {
  transactions: Transaction[]
  transactions_gbanks: Transaction[]
}

export interface AdminBalanceUser {
  idDiscord: string
  username: string
  nick?: string
  balance_total: number | string
  gold: number | string
  gold_collect: number | string
  sum_day: number | string
}
