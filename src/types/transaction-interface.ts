export interface Transaction {
  id: string
  name_impacted: string
  value: string
  made_by: string
  date: string
  type?: 'dolar' | 'gold'
}

export interface VerifyTableData {
  general_balance_gbank: number
  general_balance: number
}
