import {
  checkRunAccess as checkRunAccessService,
} from '../../../../services/api/auth'
import { getChatMessages as getChatMessagesService } from '../../../../services/api/chat'
import { sendDiscordMessage as sendDiscordMessageService } from '../../../../services/api/discord'
import {
  createBuyer as createBuyerService,
  deleteBuyer as deleteBuyerService,
  getInviteBuyers as getInviteBuyersService,
  updateBuyer as updateBuyerService,
  updateBuyerPaid as updateBuyerPaidService,
  updateBuyerStatus as updateBuyerStatusService,
} from '../../../../services/api/buyers'
import {
  getGhostUsers as getGhostUsersService,
  getTeamMembers as getTeamMembersService,
  getFreelancers as getFreelancersService,
  getFreelancerUsers as getFreelancerUsersService,
  createFreelancer as createFreelancerService,
  deleteFreelancer as deleteFreelancerService,
  updateFreelancerAttendance as updateFreelancerAttendanceService,
} from '../../../../services/api/users'
import {
  getRun as getRunService,
  getRunAttendance as getRunAttendanceService,
  getRunBuyers as getRunBuyersService,
  getRunHistory as getRunHistoryService,
  toggleRunLock as toggleRunLockService,
  updateRun as updateRunService,
  updateRunAttendance as updateRunAttendanceService,
} from '../../../../services/api/runs'
import type {
  FreelancerAttendancePayload,
  FreelancerMutationPayload,
  UpdateRunAttendancePayloadItem,
} from '../types/run'

export const getRun = (runId: string) => getRunService(runId)
export const getRunBuyers = (runId: string) => getRunBuyersService(runId)
export const getRunAttendance = (runId: string) => getRunAttendanceService(runId)
export const updateRunAttendance = (
  runId: string,
  attendanceData: UpdateRunAttendancePayloadItem[]
) => updateRunAttendanceService(runId, attendanceData)
export const getRunHistory = (runId: string) => getRunHistoryService(runId)
export const toggleRunLock = (runId: string, isLocked: boolean) =>
  toggleRunLockService(runId, isLocked)
export const updateRun = (runId: string, runData: unknown) =>
  updateRunService(runId, runData)

export const checkRunAccess = (runId: string) => checkRunAccessService(runId)
export const getChatMessages = (runId: string) => getChatMessagesService(runId)
export const sendDiscordMessage = (idDiscord: string, message: string) =>
  sendDiscordMessageService(idDiscord, message)

export const createBuyer = (buyerData: unknown) => createBuyerService(buyerData)
export const updateBuyer = (buyerId: string | number, buyerData: unknown) =>
  updateBuyerService(buyerId, buyerData)
export const deleteBuyer = (buyerId: string) => deleteBuyerService(buyerId)
export const updateBuyerPaid = (buyerId: string, isPaid: boolean) =>
  updateBuyerPaidService(buyerId, isPaid)
export const updateBuyerStatus = (buyerId: string, status: string) =>
  updateBuyerStatusService(buyerId, status)
export const getInviteBuyers = (runId: string) => getInviteBuyersService(runId)

export const getGhostUsers = () => getGhostUsersService()
export const getTeamMembers = (teamId: string) => getTeamMembersService(teamId)
export const getFreelancers = (runId: string) => getFreelancersService(runId)
export const getFreelancerUsers = (runId: string) =>
  getFreelancerUsersService(runId)
export const createFreelancer = (data: FreelancerMutationPayload) =>
  createFreelancerService(data)
export const deleteFreelancer = (id_discord: string, runId: string) =>
  deleteFreelancerService(id_discord, runId)
export const updateFreelancerAttendance = (data: FreelancerAttendancePayload) =>
  updateFreelancerAttendanceService(data)
