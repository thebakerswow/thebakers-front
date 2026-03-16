import { api } from '../../../../utils/axiosConfig'
import { getApiErrorMessage } from '../../../../utils/apiErrorHandler'
import type {
  ClaimServiceHistoryEntry,
  CreateClaimServicePayload,
  GetClaimServicesParams,
  SpecialRunServiceType,
  UpdateClaimServicePayload,
  UpdateClaimServiceStatusPayload,
} from '../types/specialRuns'

const throwSpecialRunsApiError = (
  error: unknown,
  fallbackMessage: string
): never => {
  throw new Error(getApiErrorMessage(error, fallbackMessage))
}

export const getClaimServices = async ({
  date,
  type,
}: GetClaimServicesParams): Promise<unknown[]> => {
  try {
    const response = await api.get('/claim-services', {
      params: { date, type },
    })

    return Array.isArray(response.data?.info) ? response.data.info : []
  } catch (error) {
    return throwSpecialRunsApiError(error, 'Failed to fetch claim services')
  }
}

export const createClaimService = async (
  payload: CreateClaimServicePayload
) => {
  try {
    const response = await api.post('/claim-services', payload)
    return response.data
  } catch (error) {
    return throwSpecialRunsApiError(error, 'Failed to create claim service')
  }
}

export const toggleClaimService = async (claimServiceId: string | number) => {
  try {
    const response = await api.put(`/claim-services/claim/${claimServiceId}`)
    return response.data
  } catch (error) {
    return throwSpecialRunsApiError(error, 'Failed to claim service')
  }
}

export const updateClaimServiceStatus = async (
  payload: UpdateClaimServiceStatusPayload
) => {
  try {
    const response = await api.put('/claim-services/status', payload)
    return response.data
  } catch (error) {
    return throwSpecialRunsApiError(error, 'Failed to update claim service status')
  }
}

export const updateClaimService = async (
  payload: UpdateClaimServicePayload
) => {
  try {
    const response = await api.put('/claim-services', payload)
    return response.data
  } catch (error) {
    return throwSpecialRunsApiError(error, 'Failed to update claim service')
  }
}

export const deleteClaimService = async (claimServiceId: string | number) => {
  try {
    const normalizedId = String(claimServiceId).trim()
    if (!normalizedId) {
      throw new Error('Missing claim service id')
    }

    const response = await api.delete('/claim-services', {
      // Keep both key styles for backend compatibility.
      params: { id: normalizedId, id_claim_service: normalizedId },
    })
    return response.data
  } catch (error) {
    return throwSpecialRunsApiError(error, 'Failed to delete claim service')
  }
}

export const getClaimServicesHistory = async (
  date: string,
  type: SpecialRunServiceType
): Promise<ClaimServiceHistoryEntry[]> => {
  try {
    const response = await api.get('/claim-services-history', {
      params: { date, type },
    })
    return Array.isArray(response.data?.info) ? response.data.info : []
  } catch (error) {
    return throwSpecialRunsApiError(
      error,
      'Failed to fetch claim service history'
    )
  }
}
