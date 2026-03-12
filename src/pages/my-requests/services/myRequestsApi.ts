import { api } from '../../../utils/axiosConfig'
import { TransactionRequest, UpdateTransactionRequestValuePayload } from '../types/myRequests'

export const getUserTransactionRequests = async (): Promise<TransactionRequest[]> => {
  const response = await api.get('/transaction/request/user')
  return response.data.info
}

export const updateTransactionRequestValue = async (data: UpdateTransactionRequestValuePayload) => {
  const response = await api.put('/transaction/request/value', {
    id: typeof data.id === 'string' ? parseInt(data.id, 10) : data.id,
    value: data.value,
  })

  return response.data
}

export const deleteTransactionRequest = async (requestId: string | number) => {
  const response = await api.delete(`/transaction/request/${requestId}`)
  return response.data
}
