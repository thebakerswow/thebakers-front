import { api } from '../axiosConfig'

export const login = async (data: { code: string }) => {
  const response = await api.post('/auth/login', data)
  return response.data
}

export const loginDiscord = async () => {
  const response = await api.post('/login/discord')
  return response.data
}

export const loginWithCredentials = async (credentials: {
  id_discord: string
  password: string
}) => {
  const response = await api.post('/login', credentials)
  return response.data
}

export const register = async (data: {
  username: string
  password: string
}) => {
  const response = await api.post('/auth/register', data)
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
