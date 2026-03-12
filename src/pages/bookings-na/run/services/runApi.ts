import { api } from '../../../../services/axiosConfig'
import {
  checkRunAccess as checkRunAccessService,
} from '../../../../services/api/auth'
import { sendDiscordMessage as sendDiscordMessageService } from '../../../../services/api/discord'
import type {
  FreelancerAttendancePayload,
  FreelancerMutationPayload,
  UpdateRunAttendancePayloadItem,
} from '../types/run'

export const getRun = async (runId: string) => {
  const response = await api.get(`/run/${runId}`)
  return response.data.info
}
export const getRunBuyers = async (runId: string) => {
  const response = await api.get(`/run/${runId}/buyers`)
  return response.data.info
}
export const getRunAttendance = async (runId: string) => {
  const response = await api.get(`/run/${runId}/attendance`)
  return response.data.info
}
export const updateRunAttendance = async (
  runId: string,
  attendanceData: UpdateRunAttendancePayloadItem[]
) => {
  const response = await api.put(`/run/${runId}/attendance`, attendanceData)
  return response.data
}
export const getRunHistory = async (runId: string) => {
  const response = await api.get(`/run/${runId}/history`)
  return response.data.info
}
export const toggleRunLock = async (runId: string, isLocked: boolean) => {
  const response = await api.put(`/run/${runId}/lock`, {
    isLocked: !isLocked,
  })
  return response.data
}
export const updateRun = async (runId: string, runData: unknown) => {
  const response = await api.put('/run', { ...runData, id: runId })
  return response.data
}

export const checkRunAccess = (runId: string) => checkRunAccessService(runId)
export const getChatMessages = async (runId: string) => {
  const response = await api.get(`/chat/${runId}`)
  return response.data.info
}
export const sendDiscordMessage = (idDiscord: string, message: string) =>
  sendDiscordMessageService(idDiscord, message)

export const createBuyer = async (buyerData: unknown) => {
  const response = await api.post('/buyer', buyerData)
  return response.data
}
export const updateBuyer = async (buyerId: string | number, buyerData: unknown) => {
  const response = await api.put('/buyer', { id_buyer: buyerId, ...buyerData })
  return response.data
}
export const deleteBuyer = async (buyerId: string) => {
  const response = await api.delete(`/buyer/${buyerId}`)
  return response.data
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
export const getInviteBuyers = async (runId: string) => {
  const response = await api.get(`/run/${runId}/buyers/invite`)
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
export const getFreelancers = async (runId: string) => {
  const response = await api.get(`/freelancers/${runId}`)
  return response.data.info
}
export const getFreelancerUsers = async (runId: string) => {
  const response = await api.get(`/freelancer/users/${runId}`)
  return response.data.info
}
export const createFreelancer = async (data: FreelancerMutationPayload) => {
  const response = await api.post('/freelancer', data)
  return response.data
}
export const deleteFreelancer = async (id_discord: string, runId: string) => {
  const response = await api.delete(`/freelancer/id_discord/${id_discord}/run/${runId}`)
  return response.data
}
export const updateFreelancerAttendance = async (data: FreelancerAttendancePayload) => {
  const response = await api.put('/freelancer', data)
  return response.data
}
