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
  payment_date: string
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
export const getPaymentDates = async (): Promise<PaymentDate[]> => {
  const response = await api.get<PaymentDatesResponse>('/payments/date')
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

// DELETE /payments/date - Remove uma payment date existente
export const deletePaymentDate = async (idPaymentDate: string | number): Promise<void> => {
  await api.delete('/payments/date', {
    params: {
      id_payment_date: idPaymentDate
    }
  })
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
  dollar_amount: number
}

export interface PaymentSummaryByDate {
  date: string
  total_payments: number
  total_gold: number
  total_dollar: number
  status_breakdown: StatusBreakdown[]
}

export interface PaymentSummaryTotals {
  total_payments: number
  total_gold: number
  total_dollar: number
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

