import { getBalance, updateBalanceColor } from '../../../services/api/balance'
import { getBalanceTeams } from '../../../services/api/teams'
import {
  BalanceColorPayload,
  BalanceQueryParams,
  BalanceTeamOption,
} from '../types/balance'

export async function fetchBalanceTeams(): Promise<BalanceTeamOption[]> {
  return getBalanceTeams()
}

export async function fetchBalanceData(params: BalanceQueryParams) {
  return getBalance(params)
}

export async function updateBalancePlayerColor(payload: BalanceColorPayload) {
  return updateBalanceColor(payload)
}
