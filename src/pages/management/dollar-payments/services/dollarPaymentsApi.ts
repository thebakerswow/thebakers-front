import {
  createReceiptsDate as createReceiptsDateRequest,
  createReceiptsPayer as createReceiptsPayerRequest,
  createReceiptsSale as createReceiptsSaleRequest,
  deleteReceiptsSale as deleteReceiptsSaleRequest,
  getReceiptsDates as getReceiptsDatesRequest,
  getReceiptsManagement as getReceiptsManagementRequest,
  getReceiptsManagementDates as getReceiptsManagementDatesRequest,
  getReceiptsPayers as getReceiptsPayersRequest,
  getReceiptsSales as getReceiptsSalesRequest,
  updateReceiptsBinance as updateReceiptsBinanceRequest,
  updateReceiptsManagementDebit as updateReceiptsManagementDebitRequest,
  updateReceiptsPayer as updateReceiptsPayerRequest,
  updateReceiptsSale as updateReceiptsSaleRequest,
} from '../../../../services/api/receipts'
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

export const getReceiptsPayers = async (): Promise<ReceiptsPayer[]> =>
  getReceiptsPayersRequest()

export const createReceiptsPayer = async (
  data: CreateReceiptsPayerPayload,
): Promise<ReceiptsPayer> => createReceiptsPayerRequest(data)

export const updateReceiptsPayer = async (
  data: UpdateReceiptsPayerPayload,
): Promise<ReceiptsPayer> => updateReceiptsPayerRequest(data)

export const getReceiptsDates = async (
  params?: GetReceiptsDatesParams,
): Promise<ReceiptsDate[]> => getReceiptsDatesRequest(params)

export const createReceiptsDate = async (
  data: CreateReceiptsDatePayload,
): Promise<ReceiptsDate> => createReceiptsDateRequest(data)

export const getReceiptsSales = async (): Promise<ReceiptsSale[]> =>
  getReceiptsSalesRequest()

export const createReceiptsSale = async (
  data: CreateReceiptsSalePayload,
): Promise<ReceiptsSale> => createReceiptsSaleRequest(data)

export const updateReceiptsSale = async (
  data: UpdateReceiptsSalePayload,
): Promise<ReceiptsSale> => updateReceiptsSaleRequest(data)

export const deleteReceiptsSale = async (
  id: number,
): Promise<void> => deleteReceiptsSaleRequest(id)

export const getReceiptsManagement = async (
  filters: ReceiptsManagementFilters,
): Promise<ReceiptsManagementTeam[]> => getReceiptsManagementRequest(filters)

export const getReceiptsManagementDates = async (
  params?: GetReceiptsManagementDatesParams,
): Promise<ReceiptsDate[]> => getReceiptsManagementDatesRequest(params)

export const updateReceiptsManagementDebit = async (
  data: UpdateReceiptsManagementDebitPayload,
): Promise<void> => updateReceiptsManagementDebitRequest(data)

export const updateReceiptsBinance = async (
  data: UpdateReceiptsBinancePayload,
): Promise<void> => updateReceiptsBinanceRequest(data)
