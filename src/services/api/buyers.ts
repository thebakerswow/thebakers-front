import { api } from '../axiosConfig'
import { RUN_FLAG_QUERY_PARAM, RunScreenFlag } from '../../constants/run-flags'

export const createBuyer = async (buyerData: any) => {
  const response = await api.post('/buyer', buyerData)
  return response.data
}

export const updateBuyer = async (buyerId: string | number, buyerData: any) => {
  const response = await api.put('/buyer', { id_buyer: buyerId, ...buyerData })
  return response.data
}

export const deleteBuyer = async (buyerId: string) => {
  const response = await api.delete(`/buyer/${buyerId}`)
  return response.data
}

export const getBuyers = async (runId: string) => {
  const response = await api.get(`/buyer/${runId}`)
  return response.data.info
}

export const getRunBuyers = async (runId: string, runScreen?: RunScreenFlag) => {
  const params = runScreen ? { [RUN_FLAG_QUERY_PARAM]: runScreen } : undefined
  const response = await api.get(`/run/${runId}/buyers`, { params })
  return response.data.info
}

export const getInviteBuyers = async (runId: string) => {
  const response = await api.get(`/run/${runId}/buyers/invite`)
  return response.data.info
}

export const updateBuyerPaid = async (buyerId: string, isPaid: boolean) => {
  const response = await api.put('/buyer/paid', {
    id_buyer: buyerId,
    is_paid: isPaid,
  })
  return response.data
}

export const updateBuyerStatus = async (buyerId: string, status: string) => {
  const response = await api.put('/buyer/status', { id_buyer: buyerId, status })
  return response.data
}
