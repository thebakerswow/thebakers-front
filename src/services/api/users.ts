import { api } from '../axiosConfig'

export const getPlayers = async () => {
  const response = await api.get('/discord/players')
  return response.data.info
}

export const getFreelancers = async (runId: string) => {
  const response = await api.get(`/freelancers/${runId}`)
  return response.data.info
}

export const getFreelancerUsers = async (runId: string) => {
  const response = await api.get(`/freelancer/users/${runId}`)
  return response.data.info
}

export const getGhostUsers = async () => {
  const response = await api.get('/users/ghost')
  return response.data.info
}

export const getTeamMembers = async (teamId: string) => {
  const response = await api.get(`/team/${teamId}`)
  return response.data.info.members || []
}

export const createFreelancer = async (data: {
  id_discord: string
  id_run: string
}) => {
  const response = await api.post('/freelancer', data)
  return response.data
}

export const deleteFreelancer = async (id_discord: string, runId: string) => {
  const response = await api.delete(
    `/freelancer/id_discord/${id_discord}/run/${runId}`
  )
  return response.data
}

export const updateFreelancerAttendance = async (data: {
  id_discord: string
  id_run: string
  percentage: number
}) => {
  const response = await api.put('/freelancer', data)
  return response.data
}
