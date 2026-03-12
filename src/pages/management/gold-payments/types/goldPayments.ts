export interface Payer {
  id: string | number
  name: string
}

export interface PaymentDate {
  id: string | number
  name: string
}

export interface Sale {
  id: number
  id_payer: number
  id_status: number
  id_payment_date: number
  gold_value: number
  dolar_value: number
  m_value: number
  payment_date: string
  note: string
  status: string
  created_at: string
}

export interface UpdateSalePayload {
  id: number
  id_payer?: number
  id_payment_date?: number
  status?: string
  gold_value?: number
  dolar_value?: number
  m_value?: number
  note?: string
}

export interface CreatePayerPayload {
  name: string
}

export interface UpdatePayerPayload {
  id: string | number
  name: string
}

export interface CreatePaymentDatePayload {
  name: string
}

export interface CreateSalePayload {
  id_payer: number
  id_payment_date: number
  gold_value: number
  dolar_value: number
  note: string
}

export interface StatusBreakdown {
  status: string
  payments_count: number
  gold_amount: number
  m_total_value: number
}

export interface PaymentSummaryByDate {
  date: string
  total_payments: number
  total_gold: number
  m_total_value: number
  average_dolar_per_gold: number
  gold_total_geral: number
  gold_in_stock: number
  total_sold_date: number
  status_breakdown: StatusBreakdown[]
}

export interface PaymentSummaryTotals {
  total_payments: number
  total_gold: number
  m_total_value: number
  by_status: StatusBreakdown[]
}

export interface PaymentSummaryResponse {
  info: {
    summary: PaymentSummaryByDate[]
    totals: PaymentSummaryTotals
  }
  errors: unknown[]
}

export interface PaymentManagementPlayer {
  id_discord: string
  username: string
  balance_total: number
  balance_sold: number
  m_in_dolar_sold: number
  payment_date: string
  average_dolar_per_gold: number
  hold: boolean
  id_binance: string
}

export interface PaymentManagementTeam {
  id: string
  name: string
  players: PaymentManagementPlayer[]
}

export interface PaymentManagementFilters {
  id_team?: string
  id_payment_date?: number
}

export interface UpdatePaymentHoldPayload {
  id_discord: string
  id_payment_date: number
  hold: boolean
}

export interface UpdatePaymentBinancePayload {
  id_discord: string
  id_binance: string
}

export interface UpdatePaymentManagementDebitPayload {
  id_payment_date: number
}
