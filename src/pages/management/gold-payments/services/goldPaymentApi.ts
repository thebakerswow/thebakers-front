import { api } from '../../../../utils/axiosConfig'
import type {
  CreatePaymentDatePayload,
  CreatePayerPayload,
  CreateSalePayload,
  PaymentDate,
  PaymentManagementFilters,
  PaymentManagementTeam,
  PaymentSummaryResponse,
  Payer,
  Sale,
  UpdatePaymentBinancePayload,
  UpdatePaymentHoldPayload,
  UpdatePaymentManagementDebitPayload,
  UpdatePayerPayload,
  UpdateSalePayload,
} from '../types/goldPayments'

export type {
  CreatePaymentDatePayload,
  CreatePayerPayload,
  CreateSalePayload,
  PaymentDate,
  PaymentManagementFilters,
  PaymentManagementTeam,
  PaymentSummaryResponse,
  Payer,
  Sale,
  UpdatePaymentBinancePayload,
  UpdatePaymentHoldPayload,
  UpdatePaymentManagementDebitPayload,
  UpdatePayerPayload,
  UpdateSalePayload,
} from '../types/goldPayments'

export const getPayers = async (): Promise<Payer[]> => {
  const response = await api.get('/payments/payers')
  return response.data.info
}

export const createPayer = async (data: CreatePayerPayload): Promise<Payer> =>
  (await api.post('/payments/payers', data)).data.info

export const updatePayer = async (data: UpdatePayerPayload): Promise<Payer> =>
  (await api.put('/payments/payers', data)).data.info

export const getPaymentDates = async (
  params?: { is_date_valid?: boolean },
): Promise<PaymentDate[]> => {
  const response = await api.get('/payments/date', { params })
  return response.data.info
}

export const createPaymentDate = async (
  data: CreatePaymentDatePayload,
): Promise<PaymentDate> => (await api.post('/payments/date', data)).data.info

export const getSales = async (): Promise<Sale[]> => {
  const response = await api.get('/payments/sales')
  return response.data.info
}

export const createSale = async (data: CreateSalePayload): Promise<Sale> =>
  (await api.post('/payments/sales', data)).data.info

export const updateSale = async (data: UpdateSalePayload): Promise<Sale> =>
  (await api.put('/payments/sales', data)).data.info

export const deleteSale = async (idPaymentSale: string | number): Promise<void> => {
  await api.delete('/payments/sales', {
    params: {
      id_payment_sale: idPaymentSale,
    },
  })
}

export const getPaymentSummaryByStatus = async (): Promise<PaymentSummaryResponse> =>
  (await api.get('/payments/summary/status')).data

export const getPaymentManagement = async (
  filters?: PaymentManagementFilters,
): Promise<PaymentManagementTeam[]> => {
  const params: Record<string, string | number> = {}

  if (filters?.id_team) {
    params.id_team = filters.id_team
  }

  if (filters?.id_payment_date !== undefined) {
    params.id_payment_date = filters.id_payment_date
  }

  const response = await api.get('/payments/management', { params })
  return response.data.info.teams
}

export const getPaymentManagementDates = async (): Promise<PaymentDate[]> =>
  (await api.get('/payments/management/date')).data.info

export const updatePaymentHold = async (
  data: UpdatePaymentHoldPayload,
): Promise<void> => {
  await api.put('/payments/hold', data)
}

export const updatePaymentBinance = async (
  data: UpdatePaymentBinancePayload,
): Promise<void> => {
  await api.put('/payments/binance', data)
}

export const updatePaymentManagementDebit = async (
  data: UpdatePaymentManagementDebitPayload,
): Promise<void> => {
  await api.put('/payments/management/debit', data)
}

export const getBalanceTeams = async () => {
  const response = await api.get('/teams/balance')
  return response.data.info
}
