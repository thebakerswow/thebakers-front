import { api } from '../../../../utils/axiosConfig'
import type { BuyerData } from '../../run/types/run'
import type { ApiOption, RaidRunCreatePayload, RaidsRunData } from '../types/raids'

export const getRaidsRuns = async (date: string): Promise<RaidsRunData[]> => {
  const response = await api.get('/run', { params: { date } })
  return response.data.info
}

export const getRaidsRun = (runId: string): Promise<RaidsRunData> => {
  return api.get(`/run/${runId}`).then((response) => response.data.info)
}

export const getRaidsRunBuyers = (runId: string): Promise<BuyerData[]> => {
  return api.get(`/run/${runId}/buyers`).then((response) => response.data.info)
}

export const createRaidRun = (runData: RaidRunCreatePayload): Promise<unknown> => {
  return api.post('/run', runData).then((response) => response.data)
}

export const deleteRaidRun = (runId: string) => {
  return api.delete(`/run/${runId}`).then((response) => response.data)
}

export const toggleRaidRunLock = (runId: string, isLocked: boolean) => {
  return api
    .put(`/run/${runId}/lock`, {
      isLocked: !isLocked,
    })
    .then((response) => response.data)
}

export const toggleRaidRunMinPrice = (runId: string) => {
  return api.put(`/run/${runId}/min-price/toggle`).then((response) => response.data)
}

export const getRaidsTeamMembers = async (teamId: string): Promise<ApiOption[]> => {
  const response = await api.get(`/team/${teamId}`)
  return response.data.info.members || []
}
