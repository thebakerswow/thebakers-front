import { api } from '../../../../services/axiosConfig'
import { RUN_FLAG_QUERY_PARAM } from '../../../../constants/run-flags'
import type { RunScreenFlag } from '../../../../constants/run-flags'
import type { BuyerData } from '../../run/types/run'
import type { ApiOption, RaidRunCreatePayload, RaidsRunData } from '../types/raids'

export const getRaidsRuns = async (date: string): Promise<RaidsRunData[]> => {
  const response = await api.get('/run', { params: { date } })
  return response.data.info
}

export const getRaidsRun = (
  runId: string,
  runScreen?: RunScreenFlag
): Promise<RaidsRunData> => {
  const params = runScreen ? { [RUN_FLAG_QUERY_PARAM]: runScreen } : undefined
  return api.get(`/run/${runId}`, { params }).then((response) => response.data.info)
}

export const getRaidsRunBuyers = (
  runId: string,
  runScreen?: RunScreenFlag
): Promise<BuyerData[]> => {
  const params = runScreen ? { [RUN_FLAG_QUERY_PARAM]: runScreen } : undefined
  return api.get(`/run/${runId}/buyers`, { params }).then((response) => response.data.info)
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

export const getRaidsTeamMembers = async (teamId: string): Promise<ApiOption[]> => {
  const response = await api.get(`/team/${teamId}`)
  return response.data.info.members || []
}
