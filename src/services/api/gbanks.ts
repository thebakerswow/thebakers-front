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

export const getTransactionRequests = async (params: {
  status?: string
  page?: number
  limit?: number
  id_team?: string
  player_name?: string
  date_min?: string
  date_max?: string
  min_value?: string
  max_value?: string
}) => {
  const queryParams: any = {}
  
  if (params.status && params.status !== 'all') {
    queryParams.status = params.status
  }
  
  if (params.page) {
    queryParams.page = params.page
  }
  
  if (params.limit) {
    queryParams.limit = params.limit
  }
  
  if (params.id_team && params.id_team !== 'all') {
    queryParams.id_team = params.id_team
  }
  
  if (params.player_name && params.player_name.trim() !== '') {
    queryParams.player_name = params.player_name
  }
  
  if (params.date_min && params.date_min.trim() !== '') {
    queryParams.date_min = params.date_min
  }
  
  if (params.date_max && params.date_max.trim() !== '') {
    queryParams.date_max = params.date_max
  }
  
  if (params.min_value && params.min_value.trim() !== '') {
    queryParams.min_value = params.min_value
  } else {
    queryParams.min_value = null
  }
  
  if (params.max_value && params.max_value.trim() !== '') {
    queryParams.max_value = params.max_value
  } else {
    queryParams.max_value = null
  }
  
  const response = await api.get('/transaction/request', {
    params: queryParams
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
