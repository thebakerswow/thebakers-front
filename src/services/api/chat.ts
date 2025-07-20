import { api } from '../axiosConfig'

export const getChatMessages = async (runId: string) => {
  const response = await api.get(`/chat/${runId}`)
  return response.data.info
}
