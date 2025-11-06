import { api } from '../axiosConfig'

export interface Payer {
  id: string | number
  name: string
}

export interface PaymentDate {
  id: string | number
  name: string
}

export interface PayersResponse {
  info: Payer[]
}

export interface PaymentDatesResponse {
  info: PaymentDate[]
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

export interface SalesResponse {
  info: Sale[]
  errors: any[]
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

export interface UpdateSaleResponse {
  success: boolean
  info: Sale
  message?: string
}

export interface CreatePayerPayload {
  name: string
}

export interface CreatePayerResponse {
  success: boolean
  info: Payer
  message?: string
}

export interface UpdatePayerPayload {
  id: string | number
  name: string
}

export interface UpdatePayerResponse {
  success: boolean
  info: Payer
  message?: string
}

export interface CreatePaymentDatePayload {
  name: string
}

export interface CreatePaymentDateResponse {
  success: boolean
  info: PaymentDate
  message?: string
}

export interface UpdatePaymentDatePayload {
  id: string | number
  name: string
}

export interface UpdatePaymentDateResponse {
  success: boolean
  info: PaymentDate
  message?: string
}

export interface CreateSalePayload {
  id_payer: number
  id_payment_date: number
  gold_value: number
  dolar_value: number
  note: string
}

export interface CreateSaleResponse {
  success: boolean
  info: Sale
  message?: string
}

// GET /payments/payers - Busca lista de payers disponíveis
export const getPayers = async (): Promise<Payer[]> => {
  const response = await api.get<PayersResponse>('/payments/payers')
  return response.data.info
}

// POST /payments/payers - Cria um novo payer
export const createPayer = async (data: CreatePayerPayload): Promise<Payer> => {
  const response = await api.post<CreatePayerResponse>('/payments/payers', data)
  return response.data.info
}

// PUT /payments/payers - Atualiza um payer existente
export const updatePayer = async (data: UpdatePayerPayload): Promise<Payer> => {
  const response = await api.put<UpdatePayerResponse>('/payments/payers', data)
  return response.data.info
}

// DELETE /payments/payers - Remove um payer existente
export const deletePayer = async (idPaymentPayer: string | number): Promise<void> => {
  await api.delete('/payments/payers', {
    params: {
      id_payment_payer: idPaymentPayer
    }
  })
}

// GET /payments/date - Busca lista de payment dates disponíveis
export const getPaymentDates = async (params?: { is_date_valid?: boolean }): Promise<PaymentDate[]> => {
  const response = await api.get<PaymentDatesResponse>('/payments/date', { params })
  return response.data.info
}

// POST /payments/date - Cria uma nova payment date
export const createPaymentDate = async (data: CreatePaymentDatePayload): Promise<PaymentDate> => {
  const response = await api.post<CreatePaymentDateResponse>('/payments/date', data)
  return response.data.info
}

// PUT /payments/date - Atualiza uma payment date existente
export const updatePaymentDate = async (data: UpdatePaymentDatePayload): Promise<PaymentDate> => {
  const response = await api.put<UpdatePaymentDateResponse>('/payments/date', data)
  return response.data.info
}

// GET /payments/sales - Busca lista de sales
export const getSales = async (): Promise<Sale[]> => {
  const response = await api.get<SalesResponse>('/payments/sales')
  return response.data.info
}

// POST /payments/sales - Cria uma nova sale
export const createSale = async (data: CreateSalePayload): Promise<Sale> => {
  const response = await api.post<CreateSaleResponse>('/payments/sales', data)
  return response.data.info
}

// PUT /payments/sales - Atualiza uma sale existente
export const updateSale = async (data: UpdateSalePayload): Promise<Sale> => {
  const response = await api.put<UpdateSaleResponse>('/payments/sales', data)
  return response.data.info
}

// DELETE /payments/sales - Remove uma sale existente
export const deleteSale = async (idPaymentSale: string | number): Promise<void> => {
  await api.delete('/payments/sales', {
    params: {
      id_payment_sale: idPaymentSale
    }
  })
}

// PUT /payments/sales/status - Atualiza o status de uma sale para completed
export const updateSaleStatus = async (saleId: number): Promise<Sale> => {
  const response = await api.put<UpdateSaleResponse>(`/payments/sales/status`, {
    id_payment_sale: saleId,
    status: "completed"
  })
  return response.data.info
}

// Interfaces para Summary
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
  gold_in_stock: number
  gold_missing_date: number
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
  errors: any[]
}

// GET /payments/summary/status - Busca o summary por status
export const getPaymentSummaryByStatus = async (): Promise<PaymentSummaryResponse> => {
  const response = await api.get<PaymentSummaryResponse>(`/payments/summary/status`)
  return response.data
}

// Interfaces para Payment Management
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

export interface PaymentManagementResponse {
  info: {
    teams: PaymentManagementTeam[]
  }
  errors?: any[]
}

export interface PaymentManagementFilters {
  id_team?: string
  id_payment_date?: number
}

// GET /payments/management - Busca dados de management de pagamentos
export const getPaymentManagement = async (filters?: PaymentManagementFilters): Promise<PaymentManagementTeam[]> => {
  const params: Record<string, string | number> = {}
  
  if (filters?.id_team) {
    params.id_team = filters.id_team
  }
  
  if (filters?.id_payment_date !== undefined) {
    params.id_payment_date = filters.id_payment_date
  }
  
  const response = await api.get<PaymentManagementResponse>('/payments/management', {
    params
  })
  
  return response.data.info.teams
}

// GET /payments/management/date - Busca lista de payment dates disponíveis para management
export const getPaymentManagementDates = async (): Promise<PaymentDate[]> => {
  const response = await api.get<PaymentDatesResponse>('/payments/management/date')
  return response.data.info
}

// Interfaces para Update Payment Hold
export interface UpdatePaymentHoldPayload {
  id_discord: string
  id_payment_date: number
  hold: boolean
}

export interface UpdatePaymentHoldResponse {
  success: boolean
  message?: string
}

// PUT /payments/hold - Atualiza o campo hold de um pagamento
export const updatePaymentHold = async (data: UpdatePaymentHoldPayload): Promise<void> => {
  await api.put<UpdatePaymentHoldResponse>('/payments/hold', data)
}

// Interfaces para Update Payment Binance
export interface UpdatePaymentBinancePayload {
  id_discord: string
  id_binance: string
}

export interface UpdatePaymentBinanceResponse {
  success: boolean
  message?: string
}

// PUT /payments/binance - Atualiza o campo id_binance de um pagamento
export const updatePaymentBinance = async (data: UpdatePaymentBinancePayload): Promise<void> => {
  await api.put<UpdatePaymentBinanceResponse>('/payments/binance', data)
}

// Interfaces para Update Payment Management Debit
export interface UpdatePaymentManagementDebitPayload {
  id_payment_date: number
}

export interface UpdatePaymentManagementDebitResponse {
  success: boolean
  message?: string
}

// PUT /payments/management/debit - Debita gold da data de pagamento selecionada
export const updatePaymentManagementDebit = async (data: UpdatePaymentManagementDebitPayload): Promise<void> => {
  await api.put<UpdatePaymentManagementDebitResponse>('/payments/management/debit', data)
}

