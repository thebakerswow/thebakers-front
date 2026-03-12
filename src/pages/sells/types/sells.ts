export type SellsStatusFilter = 'pending' | 'completed'

export type SalesByDate = {
  date: string
  paymentDate: string
  goldSold: number
  avgM: number
  goldInDollar: number
  shopDolar: number
  total: number
  type: 'gold' | 'dolar' | 'mixed'
  balanceGold: number | null
  balanceDolar: number | null
}

export type PaymentResumeItem = {
  payment_date: string
  gold_sold: number
  avg_m: number
  gold_in_dolar: number
  dolar_sold: number
  total: number
  type: 'gold' | 'dolar' | 'mixed'
  balance_total?: number | null
}

export type ExtendedPaymentResumeItem = PaymentResumeItem & {
  balance_total_gold?: number | null
  balance_total_dolar?: number | null
}

export type PaymentsResumeResponse = {
  info: {
    completed: Record<string, PaymentResumeItem>
    pending_gold: Record<string, PaymentResumeItem>
    pending_dolar: Record<string, PaymentResumeItem>
  }
  errors: any[]
}

export type SellsTableProps = {
  salesByDate: SalesByDate[]
  statusFilter: SellsStatusFilter
}
