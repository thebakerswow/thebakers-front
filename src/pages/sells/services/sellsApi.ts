import { api } from '../../../utils/axiosConfig'
import { PaymentsResumeResponse } from '../types/sells'

export const getPaymentsResume = async (): Promise<PaymentsResumeResponse> => {
  const response = await api.get<PaymentsResumeResponse>('/payments/resume')
  return response.data
}
