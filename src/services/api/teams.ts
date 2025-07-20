import { api } from '../axiosConfig'

export const getBalanceTeams = async () => {
  const response = await api.get('/teams/balance')
  return response.data.info
}

export const getTeams = async () => {
  const response = await api.get('/teams')
  return response.data.info
}
