import { getRunBuyers } from '../../../../services/api/buyers'
import { getTeamMembers } from '../../../../services/api/users'
import {
  createRun,
  deleteRun,
  getRun,
  getRuns,
  toggleRunLock,
} from '../../../../services/api/runs'
import type { RunScreenFlag } from '../../../../constants/run-flags'
import type { BuyerData } from '../../../../types/buyer-interface'
import type { ApiOption, RaidRunCreatePayload, RaidsRunData } from '../types/raids'

export const getRaidsRuns = (date: string): Promise<RaidsRunData[]> => getRuns(date)

export const getRaidsRun = (
  runId: string,
  runScreen?: RunScreenFlag
): Promise<RaidsRunData> => getRun(runId, runScreen)

export const getRaidsRunBuyers = (
  runId: string,
  runScreen?: RunScreenFlag
): Promise<BuyerData[]> => getRunBuyers(runId, runScreen)

export const createRaidRun = (runData: RaidRunCreatePayload): Promise<unknown> =>
  createRun(runData)

export const deleteRaidRun = (runId: string) => deleteRun(runId)

export const toggleRaidRunLock = (runId: string, isLocked: boolean) =>
  toggleRunLock(runId, isLocked)

export const getRaidsTeamMembers = (teamId: string): Promise<ApiOption[]> =>
  getTeamMembers(teamId)
