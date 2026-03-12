import {
  createPaymentDate as createPaymentDateRequest,
  createPayer as createPayerRequest,
  createSale as createSaleRequest,
  deleteSale as deleteSaleRequest,
  getPayers as getPayersRequest,
  getPaymentDates as getPaymentDatesRequest,
  getPaymentManagement as getPaymentManagementRequest,
  getPaymentManagementDates as getPaymentManagementDatesRequest,
  getPaymentSummaryByStatus as getPaymentSummaryByStatusRequest,
  getSales as getSalesRequest,
  updatePayer as updatePayerRequest,
  updatePaymentBinance as updatePaymentBinanceRequest,
  updatePaymentHold as updatePaymentHoldRequest,
  updatePaymentManagementDebit as updatePaymentManagementDebitRequest,
  updateSale as updateSaleRequest,
} from '../../../../services/api/payments'
import { getBalanceTeams as getBalanceTeamsRequest } from '../../../../services/api/teams'
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

export const getPayers = async (): Promise<Payer[]> => getPayersRequest()

export const createPayer = async (data: CreatePayerPayload): Promise<Payer> =>
  createPayerRequest(data)

export const updatePayer = async (data: UpdatePayerPayload): Promise<Payer> =>
  updatePayerRequest(data)

export const getPaymentDates = async (
  params?: { is_date_valid?: boolean },
): Promise<PaymentDate[]> => getPaymentDatesRequest(params)

export const createPaymentDate = async (
  data: CreatePaymentDatePayload,
): Promise<PaymentDate> => createPaymentDateRequest(data)

export const getSales = async (): Promise<Sale[]> => getSalesRequest()

export const createSale = async (data: CreateSalePayload): Promise<Sale> =>
  createSaleRequest(data)

export const updateSale = async (data: UpdateSalePayload): Promise<Sale> =>
  updateSaleRequest(data)

export const deleteSale = async (idPaymentSale: string | number): Promise<void> =>
  deleteSaleRequest(idPaymentSale)

export const getPaymentSummaryByStatus = async (): Promise<PaymentSummaryResponse> =>
  getPaymentSummaryByStatusRequest()

export const getPaymentManagement = async (
  filters?: PaymentManagementFilters,
): Promise<PaymentManagementTeam[]> => getPaymentManagementRequest(filters)

export const getPaymentManagementDates = async (): Promise<PaymentDate[]> =>
  getPaymentManagementDatesRequest()

export const updatePaymentHold = async (
  data: UpdatePaymentHoldPayload,
): Promise<void> => updatePaymentHoldRequest(data)

export const updatePaymentBinance = async (
  data: UpdatePaymentBinancePayload,
): Promise<void> => updatePaymentBinanceRequest(data)

export const updatePaymentManagementDebit = async (
  data: UpdatePaymentManagementDebitPayload,
): Promise<void> => updatePaymentManagementDebitRequest(data)

export const getBalanceTeams = async () => getBalanceTeamsRequest()
