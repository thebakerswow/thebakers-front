import { api } from '../../../../services/axiosConfig'
import type {
  CreateReceiptsDatePayload,
  CreateReceiptsPayerPayload,
  CreateReceiptsSalePayload,
  GetReceiptsDatesParams,
  GetReceiptsManagementDatesParams,
  ReceiptsDate,
  ReceiptsManagementFilters,
  ReceiptsManagementTeam,
  ReceiptsPayer,
  ReceiptsSale,
  UpdateReceiptsBinancePayload,
  UpdateReceiptsManagementDebitPayload,
  UpdateReceiptsPayerPayload,
  UpdateReceiptsSalePayload,
} from '../types/dollarPayments'

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

  return payload as T
}

export type {
  CreateReceiptsDatePayload,
  CreateReceiptsPayerPayload,
  CreateReceiptsSalePayload,
  GetReceiptsDatesParams,
  GetReceiptsManagementDatesParams,
  ReceiptsDate,
  ReceiptsManagementFilters,
  ReceiptsManagementTeam,
  ReceiptsPayer,
  ReceiptsSale,
  UpdateReceiptsBinancePayload,
  UpdateReceiptsManagementDebitPayload,
  UpdateReceiptsPayerPayload,
  UpdateReceiptsSalePayload,
} from '../types/dollarPayments'

export const getReceiptsPayers = async (): Promise<ReceiptsPayer[]> => {
  const response = await api.get<ApiEnvelope<ReceiptsPayer[]> | ReceiptsPayer[]>(
    '/receipts/dolar/payers'
  )
  const data = unwrap(response.data)
  return Array.isArray(data) ? data : []
}

export const createReceiptsPayer = async (
  data: CreateReceiptsPayerPayload,
): Promise<ReceiptsPayer> => {
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

export const updateReceiptsPayer = async (
  data: UpdateReceiptsPayerPayload,
): Promise<ReceiptsPayer> => {
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

export const getReceiptsDates = async (
  params?: GetReceiptsDatesParams,
): Promise<ReceiptsDate[]> => {
  const response = await api.get<ApiEnvelope<ReceiptsDate[]> | ReceiptsDate[]>(
    '/receipts/dolar/date',
    { params }
  )
  const data = unwrap(response.data)
  return Array.isArray(data) ? data : []
}

export const createReceiptsDate = async (
  data: CreateReceiptsDatePayload,
): Promise<ReceiptsDate> => {
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

export const getReceiptsSales = async (): Promise<ReceiptsSale[]> => {
  const response = await api.get<ApiEnvelope<ReceiptsSale[]> | ReceiptsSale[]>(
    '/receipts/dolar'
  )
  const data = unwrap(response.data)
  return Array.isArray(data) ? data : []
}

export const createReceiptsSale = async (
  data: CreateReceiptsSalePayload,
): Promise<ReceiptsSale> => {
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

export const updateReceiptsSale = async (
  data: UpdateReceiptsSalePayload,
): Promise<ReceiptsSale> => {
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

export const deleteReceiptsSale = async (
  id: number,
): Promise<void> => {
  await api.delete('/receipts/dolar', {
    params: {
      id_payment_dolar_sale: id,
    },
  })
}

export const getReceiptsManagement = async (
  filters: ReceiptsManagementFilters,
): Promise<ReceiptsManagementTeam[]> => {
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

export const getReceiptsManagementDates = async (
  params?: GetReceiptsManagementDatesParams,
): Promise<ReceiptsDate[]> => {
  const response = await api.get<ApiEnvelope<ReceiptsDate[]> | ReceiptsDate[]>(
    '/receipts/dolar/management/date',
    { params }
  )
  const data = unwrap(response.data)
  return Array.isArray(data) ? data : []
}

export const updateReceiptsManagementDebit = async (
  data: UpdateReceiptsManagementDebitPayload,
): Promise<void> => {
  await api.put('/receipts/dolar/management/debit', data)
}

export const updateReceiptsBinance = async (
  data: UpdateReceiptsBinancePayload,
): Promise<void> => {
  await api.put('/receipts/dolar/binance', data)
}
