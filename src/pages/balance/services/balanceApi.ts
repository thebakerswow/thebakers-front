import { api } from '../../../services/axiosConfig'
import {
  BalanceColorPayload,
  BalanceQueryParams,
  BalanceTeamOption,
} from '../types/balance'

export async function fetchBalanceTeams(): Promise<BalanceTeamOption[]> {
  const response = await api.get('/teams/balance')
  return response.data.info
}

export async function fetchBalanceData(params: BalanceQueryParams) {
  const response = await api.get('/balance', { params })
  return response.data.info
}

export async function updateBalancePlayerColor(payload: BalanceColorPayload) {
  const response = await api.put('/balance/color', payload)
  return response.data
}
