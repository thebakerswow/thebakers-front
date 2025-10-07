export interface Payment {
  id: string | number
  note: string
  buyer: string
  valueGold: number
  dollar: number
  mValue: number
  date: string
  status: 'pending' | 'paid' | 'cancelled'
  idTeam?: string
}

export interface PaymentResponse {
  payments: Payment[]
  totalPages: number
}

export interface PaymentFilters {
  status?: 'all' | 'pending' | 'paid' | 'cancelled'
  page?: number
  limit?: number
  id_team?: string
  buyer_name?: string
  date_min?: string
  date_max?: string
  min_value?: string
  max_value?: string
}

