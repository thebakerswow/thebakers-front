import { api } from '../axiosConfig'

export const getBalance = async (params: {
  id_team?: string | number
  date_start: string
  date_end: string
  is_dolar: boolean
}) => {
  const response = await api.get('/balance', { params })
  return response.data.info
}

export const getBalanceAdmin = async (params: {
  id_team?: string | number
  date: string
  is_dolar: boolean
}) => {
  const response = await api.get('/admin', { params })
  return response.data.info
}

export const getTransactionLogs = async (params: {
  initial_date: string
  end_date: string
  impacted: string
  is_dolar: boolean
}) => {
  const response = await api.get('/transaction/info', { params })
  return response.data.info
}

export const createTransaction = async (data: {
  value: number
  id_discord: string
  is_dolar: boolean
}) => {
  const response = await api.post('/transaction', data)
  return response.data
}

export const updateNick = async (data: {
  nick: string
  id_discord: string
}) => {
  const response = await api.put('/nick', data)
  return response.data
}

export const updateBalanceColor = async (data: {
  id_discord: string
  color: string
}) => {
  const response = await api.put('/balance/color', data)
  return response.data
}
