import { api } from '../../../../utils/axiosConfig'
import type { GetTransactionRequestsParams } from '../types/requests'

export const getTransactionRequests = async (params: GetTransactionRequestsParams) => {
  const queryParams: Record<string, string | number | null> = {}

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
    params: queryParams,
  })

  return response.data.info
}

export const updateTransactionRequest = async (data: {
  id: string
  status: 'accepted' | 'denied'
}) => {
  const response = await api.put('/transaction/request', {
    id: parseInt(data.id, 10),
    status: data.status,
  })

  return response.data
}

export const updateTransactionRequestValue = async (data: {
  id: number | string
  value: number
}) => {
  const response = await api.put('/transaction/request/value', {
    id: typeof data.id === 'string' ? parseInt(data.id, 10) : data.id,
    value: data.value,
  })

  return response.data
}
