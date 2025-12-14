import { api } from '../axiosConfig'

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

export interface ReceiptsSummaryStatusBreakdown {
  status: string
  receipts_dolars_count: number
  gold_amount: number
  m_total_value: number
  payments_count?: number
}

export interface ReceiptsSummaryByDate {
  date: string
  total_receipts_dolars: number
  total_gold: number
  m_total_value: number
  average_dolar_per_gold: number
  gold_in_stock: number
  total_sold_date: number
  status_breakdown: ReceiptsSummaryStatusBreakdown[]
}

export interface ReceiptsSummaryTotals {
  total_receipts_dolars: number
  total_gold: number
  m_total_value: number
  by_status: ReceiptsSummaryStatusBreakdown[]
}

export interface ReceiptsSummaryResponse {
  summary: ReceiptsSummaryByDate[]
  totals: ReceiptsSummaryTotals
}

export interface ReceiptsManagementPlayer {
  id_discord: string
  username: string
  balance_total: number
  balance_dolar_paid: number // Valor em gold que o jogador deve pagar (distribuído proporcionalmente)
  receipts_dolar_date: string // Nome da data de pagamento
  id_binance: string
  // Campos opcionais mantidos para compatibilidade
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

interface ApiEnvelope<T> {
  info?: T
  data?: T
  success?: boolean
  errors?: unknown
}

const unwrap = <T>(payload: ApiEnvelope<T> | T | undefined): T | undefined => {
  if (payload === undefined || payload === null) {
    return undefined
  }

  if (Array.isArray(payload)) {
    return payload as T
  }

  const maybeEnvelope = payload as ApiEnvelope<T>

  if (maybeEnvelope.info !== undefined) {
    return maybeEnvelope.info as T
  }

  if (maybeEnvelope.data !== undefined) {
    return maybeEnvelope.data as T
  }

  if (maybeEnvelope.data !== undefined) {
    return maybeEnvelope.data as T
  }

  return payload as T
}

export const getReceiptsPayers = async (): Promise<ReceiptsPayer[]> => {
  const response = await api.get<ApiEnvelope<ReceiptsPayer[]> | ReceiptsPayer[]>(
    '/receipts/dolar/payers'
  )

  const data = unwrap(response.data)
  return Array.isArray(data) ? data : []
}

export const createReceiptsPayer = async (data: { name: string }): Promise<ReceiptsPayer> => {
  const response = await api.post<ApiEnvelope<ReceiptsPayer> | ReceiptsPayer>(
    '/receipts/dolar/payers',
    data
  )

  const result = unwrap(response.data)

  if (!result) {
    throw new Error('Invalid response when creating receipts payer')
  }

  if (Array.isArray(result)) {
    return result[0]
  }

  return result
}

export const updateReceiptsPayer = async (data: { id: number; name: string }): Promise<ReceiptsPayer> => {
  const response = await api.put<ApiEnvelope<ReceiptsPayer> | ReceiptsPayer>(
    '/receipts/dolar/payers',
    data
  )

  const result = unwrap(response.data)

  if (!result) {
    throw new Error('Invalid response when updating receipts payer')
  }

  if (Array.isArray(result)) {
    return result[0]
  }

  return result
}

export const deleteReceiptsPayer = async (id: number): Promise<void> => {
  await api.delete('/receipts/dolar/payers', {
    params: {
      id_receipts_dolar_payer: id,
    },
  })
}

export const getReceiptsDates = async (params?: { is_date_valid?: boolean }): Promise<ReceiptsDate[]> => {
  const response = await api.get<ApiEnvelope<ReceiptsDate[]> | ReceiptsDate[]>(
    '/receipts/dolar/date',
    { params }
  )

  const data = unwrap(response.data)
  return Array.isArray(data) ? data : []
}

export const createReceiptsDate = async (data: { name: string }): Promise<ReceiptsDate> => {
  const response = await api.post<ApiEnvelope<ReceiptsDate> | ReceiptsDate>(
    '/receipts/dolar/date',
    data
  )

  const result = unwrap(response.data)

  if (!result) {
    throw new Error('Invalid response when creating receipts date')
  }

  if (Array.isArray(result)) {
    return result[0]
  }

  return result
}

export const updateReceiptsDate = async (data: { id: number; name: string }): Promise<ReceiptsDate> => {
  const response = await api.put<ApiEnvelope<ReceiptsDate> | ReceiptsDate>(
    '/receipts/dolar/date',
    data
  )

  const result = unwrap(response.data)

  if (!result) {
    throw new Error('Invalid response when updating receipts date')
  }

  if (Array.isArray(result)) {
    return result[0]
  }

  return result
}

export const deleteReceiptsDate = async (id: number): Promise<void> => {
  await api.delete('/receipts/dolar/date', {
    params: {
      id_receipts_dolar_date: id,
    },
  })
}

export const getReceiptsSales = async (): Promise<ReceiptsSale[]> => {
  const response = await api.get<ApiEnvelope<ReceiptsSale[]> | ReceiptsSale[]>(
    '/receipts/dolar'
  )

  const data = unwrap(response.data)
  return Array.isArray(data) ? data : []
}

export const createReceiptsSale = async (data: {
  id_payer: number
  status: string
  id_receipts_dolar_date: number
  gold_value?: number
  dolar_amount: number
  note?: string
}): Promise<ReceiptsSale> => {
  const response = await api.post<ApiEnvelope<ReceiptsSale> | ReceiptsSale>(
    '/receipts/dolar',
    data
  )

  const result = unwrap(response.data)

  if (!result) {
    throw new Error('Invalid response when creating receipts sale')
  }

  if (Array.isArray(result)) {
    return result[0]
  }

  return result
}

export const updateReceiptsSale = async (data: {
  id: number
  id_payer?: number
  status?: string
  id_receipts_dolar_date?: number
  gold_value?: number
  dolar_amount?: number
  note?: string
  receipts_dolar_date?: string
  created_at?: string
}): Promise<ReceiptsSale> => {
  const response = await api.put<ApiEnvelope<ReceiptsSale> | ReceiptsSale>(
    '/receipts/dolar',
    data
  )

  const result = unwrap(response.data)

  if (!result) {
    throw new Error('Invalid response when updating receipts sale')
  }

  if (Array.isArray(result)) {
    return result[0]
  }

  return result
}

export const deleteReceiptsSale = async (id: number): Promise<void> => {
  await api.delete('/receipts/dolar', {
    params: {
      id_payment_dolar_sale: id,
    },
  })
}

export const updateReceiptsStatus = async (data: {
  id_receipts_dolar: number
  status: string
}): Promise<void> => {
  await api.put('/receipts/status', data)
}

export const updateReceiptsSalePayer = async (data: {
  id_receipts_dolar: number
  id_payer: number
}): Promise<void> => {
  await api.put('/receipts/payer', data)
}

export const updateReceiptsSaleDate = async (data: {
  id_receipts_dolar: number
  id_receipts_dolar_date: number
}): Promise<void> => {
  await api.put('/receipts/date', data)
}

export const getReceiptsSummary = async (): Promise<ReceiptsSummaryResponse> => {
  const response = await api.get<ApiEnvelope<ReceiptsSummaryResponse> | ReceiptsSummaryResponse>(
    '/receipts/dolar/summary/status'
  )

  const result = unwrap(response.data)

  if (!result || Array.isArray(result)) {
    return {
      summary: [],
      totals: {
        total_receipts_dolars: 0,
        total_gold: 0,
        m_total_value: 0,
        by_status: [],
      },
    }
  }

  return result
}

export const getReceiptsManagement = async (filters: {
  id_payment_dolar_date: number // Obrigatório
  id_team?: string // Opcional
}): Promise<ReceiptsManagementTeam[]> => {
  const response = await api.get<
    ApiEnvelope<{ teams: ReceiptsManagementTeam[] }> | { teams: ReceiptsManagementTeam[] }
  >('/receipts/dolar/management', {
    params: {
      id_payment_dolar_date: filters.id_payment_dolar_date,
      id_team: filters.id_team,
    },
  })

  const data = unwrap(response.data)

  if (!data) {
    return []
  }

  if (Array.isArray(data)) {
    return data as ReceiptsManagementTeam[]
  }

  const withTeams = data as { teams?: ReceiptsManagementTeam[] }

  if (Array.isArray(withTeams.teams)) {
    return withTeams.teams
  }

  return []
}

export const getReceiptsManagementDates = async (params?: {
  status?: string
}): Promise<ReceiptsDate[]> => {
  const response = await api.get<ApiEnvelope<ReceiptsDate[]> | ReceiptsDate[]>(
    '/receipts/dolar/management/date',
    {
      params,
    }
  )

  const data = unwrap(response.data)
  return Array.isArray(data) ? data : []
}

export const updateReceiptsManagementDebit = async (data: {
  id_receipts_dolar_date: number
}): Promise<void> => {
  await api.put('/receipts/dolar/management/debit', data)
}

export const updateReceiptsBinance = async (data: {
  id_discord: string
  id_binance: string
}): Promise<void> => {
  await api.put('/receipts/dolar/binance', data)
}


