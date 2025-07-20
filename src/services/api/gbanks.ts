import { api } from '../axiosConfig'

export const getGbanks = async () => {
  const response = await api.get('/gbanks')
  return response.data.info
}

export const getGbankExtract = async (params: {
  initial_date: string
  end_date: string
  impacted: string
  is_dolar: boolean
}) => {
  const response = await api.get('/transaction/info', { params })
  return response.data.info
}

export const getGbankLogs = async (params: {
  initial_date: string
  end_date: string
  impacted: string
}) => {
  const response = await api.get('/gbanks/logs', { params })
  return response.data.info
}

export const getLatestTransactions = async () => {
  const response = await api.get('/transaction/latest')
  return response.data.info
}

export const getGbanksGeneral = async () => {
  const response = await api.get('/gbanks/general')
  return response.data.info
}

export const createGBank = async (data: { name: string; color: string }) => {
  const response = await api.post('/gbanks', data)
  return response.data
}

export const updateGBankValue = async (data: {
  id: string
  balance: number
}) => {
  const response = await api.put('/gbanks/value', data)
  return response.data
}

export const updateGBank = async (data: {
  id: string
  name: string
  color: string
}) => {
  const response = await api.put('/gbanks', data)
  return response.data
}

export const deleteGBank = async (gbankId: string) => {
  const response = await api.delete(`/gbanks/${gbankId}`)
  return response.data
}
