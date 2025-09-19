import { api } from '../axiosConfig'

export const login = async (data: { code: string }) => {
  const response = await api.post('/auth/login', data)
  return response.data
}

export const loginDiscord = async () => {
  const response = await api.post('/login/discord')
  return response.data
}


export const checkRunAccess = async (runId: string) => {
  const response = await api.get(`/access/run/${runId}`)
  return response.data.info
}

export const checkAdminAccess = async () => {
  const response = await api.get('/access/admin')
  return response.data.info
}
