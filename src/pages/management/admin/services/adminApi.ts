import { api } from '../../../../services/axiosConfig'
import {
  createTransaction as createTransactionService,
  getBalanceAdmin as getBalanceAdminService,
  getTransactionLogs as getTransactionLogsService,
  updateNick as updateNickService,
} from '../../../../services/api/balance'
import {
  createGBank as createGBankService,
  deleteGBank as deleteGBankService,
  getGbankLogs as getGbankLogsService,
  getGbanks as getGbanksService,
  getGbanksGeneral as getGbanksGeneralService,
  getLatestTransactions as getLatestTransactionsService,
  updateGBank as updateGBankService,
  updateGBankValue as updateGBankValueService,
} from '../../../../services/api/gbanks'
import { getPlayers as getPlayersService } from '../../../../services/api/users'
import { checkAdminAccess as checkAdminAccessService } from '../../../../services/api/auth'
import type {
  CreateGBankData,
  CreateTransactionData,
  GetBalanceAdminParams,
  GetGbankLogsParams,
  GetTransactionLogsParams,
  UpdateGBankData,
  UpdateGBankValueData,
  UpdateNickData,
} from '../types/admin'

export const checkAdminAccess = () => checkAdminAccessService()

export const getBalanceAdmin = (params: GetBalanceAdminParams) =>
  getBalanceAdminService(params)

export const createTransaction = (data: CreateTransactionData) =>
  createTransactionService(data)

export const updateNick = (data: UpdateNickData) => updateNickService(data)

export const getGbanks = () => getGbanksService()

export const createGBank = (data: CreateGBankData) => createGBankService(data)

export const updateGBankValue = (data: UpdateGBankValueData) =>
  updateGBankValueService(data)

export const updateGBank = (data: UpdateGBankData) =>
  updateGBankService(data)

export const deleteGBank = (gbankId: string) => deleteGBankService(gbankId)

export const getGbanksGeneral = () => getGbanksGeneralService()

export const getGbankLogs = (params: GetGbankLogsParams) =>
  getGbankLogsService(params)

export const getLatestTransactions = () => getLatestTransactionsService()

export const getPlayers = () => getPlayersService()

export const getTransactionLogs = (params: GetTransactionLogsParams) =>
  getTransactionLogsService(params)

export const getRunsWithoutAttendanceInfo = async () => {
  const response = await api.get('/run-attendance/info')
  return response.data.info
}
