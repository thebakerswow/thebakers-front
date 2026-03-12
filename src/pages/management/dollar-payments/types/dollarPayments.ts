export interface ReceiptsPayer {
  id: number
  name: string
}

export interface ReceiptsDate {
  id: number
  name: string
}

export interface ReceiptsSale {
  id: number
  id_payer: number
  status: string
  id_receipts_dolar_date: number
  gold_value: number
  dolar_amount?: number
  m_value?: number
  receipts_dolar_date?: string
  note: string
  created_at: string
}

export interface ReceiptsManagementPlayer {
  id_discord: string
  username: string
  balance_total: number
  balance_dolar_paid: number
  receipts_dolar_date: string
  id_binance: string
  balance_sold?: number
  m_in_dolar_sold?: number
  average_dolar_per_gold?: number
  hold?: boolean
}

export interface ReceiptsManagementTeam {
  id: string
  name: string
  players: ReceiptsManagementPlayer[]
}

export interface CreateReceiptsPayerPayload {
  name: string
}

export interface UpdateReceiptsPayerPayload {
  id: number
  name: string
}

export interface GetReceiptsDatesParams {
  is_date_valid?: boolean
}

export interface CreateReceiptsDatePayload {
  name: string
}

export interface CreateReceiptsSalePayload {
  id_payer: number
  status: string
  id_receipts_dolar_date: number
  gold_value?: number
  dolar_amount: number
  note?: string
}

export interface UpdateReceiptsSalePayload {
  id: number
  id_payer?: number
  status?: string
  id_receipts_dolar_date?: number
  gold_value?: number
  dolar_amount?: number
  note?: string
  receipts_dolar_date?: string
  created_at?: string
}

export interface ReceiptsManagementFilters {
  id_payment_dolar_date: number
  id_team?: string
}

export interface GetReceiptsManagementDatesParams {
  status?: string
}

export interface UpdateReceiptsManagementDebitPayload {
  id_receipts_dolar_date: number
  id_discord?: string
  hold?: boolean
}

export interface UpdateReceiptsBinancePayload {
  id_discord: string
  id_binance: string
}
