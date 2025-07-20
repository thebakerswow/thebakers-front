import { api } from '../axiosConfig'

export const getRuns = async (date?: string) => {
  const params = date ? { date } : {}
  const response = await api.get('/run', { params })
  return response.data.info
}

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

export const createRun = async (runData: any) => {
  const response = await api.post('/run', runData)
  return response.data
}

export const updateRun = async (runId: string, runData: any) => {
  const response = await api.put(`/run/${runId}`, runData)
  return response.data
}

export const deleteRun = async (runId: string) => {
  const response = await api.delete(`/run/${runId}`)
  return response.data
}

export const updateRunAttendance = async (
  runId: string,
  attendanceData: any
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
