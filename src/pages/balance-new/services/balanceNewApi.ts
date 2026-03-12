import { api } from '../../../utils/axiosConfig'
import { CreateGBankPayload, CreateTransactionRequestPayload, GetBalanceDailyParams } from '../types/balanceNew'

export const getBalanceDaily = async (params: GetBalanceDailyParams) => {
  const response = await api.get('/balance/daily', { params })
  return response.data.info
}

export const getUserGbanks = async () => {
  const response = await api.get('/transaction/request/gbanks')
  return response.data.info
}

export const createGBank = async (data: CreateGBankPayload) => {
  const response = await api.post('/gbanks', data)
  return response.data
}

export const createTransactionRequest = async (data: CreateTransactionRequestPayload) => {
  const formData = new FormData()
  const payload = {
    idGbank: parseInt(String(data.idGbank), 10),
    value: data.value,
  }

  formData.append('payload', JSON.stringify(payload))

  const response = await fetch(data.image)
  const blob = await response.blob()
  formData.append('image', blob, 'image.png')

  const request = await api.post('/transaction/request', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return request.data
}
