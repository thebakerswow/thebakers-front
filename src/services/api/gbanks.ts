import { api } from '../axiosConfig'

export const getGbanks = async () => {
  const response = await api.get('/gbanks')
  return response.data.info
}

export const getUserGbanks = async () => {
  const response = await api.get('/transaction/request/gbanks')
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

export const createGBank = async (data: { name: string; idTeam: string }) => {
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
  idTeam: string
}) => {
  const response = await api.put('/gbanks', data)
  return response.data
}

export const deleteGBank = async (gbankId: string) => {
  const response = await api.delete(`/gbanks/${gbankId}`)
  return response.data
}

export const createTransactionRequest = async (data: {
  idGbank: string
  value: number
  image: string
}) => {
  const formData = new FormData()
  
  // Criar o payload JSON
  const payload = {
    idGbank: parseInt(String(data.idGbank)),
    value: data.value
  }
  
  // Adicionar o payload como string
  formData.append('payload', JSON.stringify(payload))
  
  // Converter a imagem base64 para blob e adicionar ao formData
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

export const getTransactionRequests = async (status?: string) => {
  const params: any = {}
  if (status && status !== 'all') {
    params.status = status
  }
  
  const response = await api.get('/transaction/request', {
    params
  })
  
  return response.data.info
}

export const updateTransactionRequest = async (data: {
  id: string
  status: 'accepted' | 'denied'
}) => {
  const response = await api.put('/transaction/request', {
    id: parseInt(data.id),
    status: data.status
  })
  return response.data
}

export const updateTransactionRequestValue = async (data: {
  id: number | string
  value: number
}) => {
  const response = await api.put('/transaction/request/value', {
    id: typeof data.id === 'string' ? parseInt(data.id) : data.id,
    value: data.value,
  })
  return response.data
}

export const getUserTransactionRequests = async () => {
  const response = await api.get('/transaction/request/user')
  return response.data.info
}

export const deleteTransactionRequest = async (requestId: string | number) => {
  const response = await api.delete(`/transaction/request/${requestId}`)
  return response.data
}
