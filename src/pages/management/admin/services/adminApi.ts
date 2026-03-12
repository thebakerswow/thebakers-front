import { api } from '../../../../utils/axiosConfig'
import { checkAdminAccess as checkAdminAccessService } from '../../../auth/services/authApi'
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

export const getBalanceAdmin = async (params: GetBalanceAdminParams) => {
  const response = await api.get('/admin', { params })
  return response.data.info
}

export const createTransaction = async (data: CreateTransactionData) => {
  const response = await api.post('/transaction', data)
  return response.data
}

export const updateNick = async (data: UpdateNickData) => {
  const response = await api.put('/nick', data)
  return response.data
}

export const getGbanks = async () => {
  const response = await api.get('/gbanks')
  return response.data.info
}

export const createGBank = async (data: CreateGBankData) => {
  const response = await api.post('/gbanks', data)
  return response.data
}

export const updateGBankValue = async (data: UpdateGBankValueData) => {
  const response = await api.put('/gbanks/value', data)
  return response.data
}

export const updateGBank = async (data: UpdateGBankData) => {
  const response = await api.put('/gbanks', data)
  return response.data
}

export const deleteGBank = async (gbankId: string) => {
  const response = await api.delete(`/gbanks/${gbankId}`)
  return response.data
}

export const getGbanksGeneral = async () => {
  const response = await api.get('/gbanks/general')
  return response.data.info
}

export const getGbankLogs = async (params: GetGbankLogsParams) => {
  const response = await api.get('/gbanks/logs', { params })
  return response.data.info
}

export const getLatestTransactions = async () => {
  const response = await api.get('/transaction/latest')
  return response.data.info
}

export const getPlayers = async () => {
  const response = await api.get('/discord/players')
  return response.data.info
}

export const getTransactionLogs = async (params: GetTransactionLogsParams) => {
  const response = await api.get('/transaction/info', { params })
  return response.data.info
}

export const getRunsWithoutAttendanceInfo = async () => {
  const response = await api.get('/run-attendance/info')
  return response.data.info
}
