import axios from 'axios'
import Swal from 'sweetalert2'

type GenericRecord = Record<string, unknown>

const isRecord = (value: unknown): value is GenericRecord =>
  typeof value === 'object' && value !== null

const pickFirstString = (...values: unknown[]) =>
  values.find((value): value is string => typeof value === 'string' && value.trim().length > 0)

const getMessageFromResponseData = (data: unknown): string | undefined => {
  if (typeof data === 'string') return data
  if (!isRecord(data)) return undefined

  const direct = pickFirstString(data.message, data.detail, data.error, data.title)
  if (direct) return direct

  const errors = data.errors
  if (Array.isArray(errors) && errors.length > 0) {
    const first = errors[0]
    if (typeof first === 'string') return first
    if (isRecord(first)) {
      return pickFirstString(first.message, first.detail, first.error, first.title)
    }
  }

  return undefined
}

export const getApiErrorMessage = (error: unknown, fallbackMessage = 'Unexpected error'): string => {
  if (axios.isAxiosError(error)) {
    const responseMessage = getMessageFromResponseData(error.response?.data)
    return responseMessage || error.message || fallbackMessage
  }

  if (error instanceof Error && error.message) return error.message

  return fallbackMessage
}

export const handleApiError = async (error: unknown, fallbackMessage = 'Unexpected error') => {
  const message = getApiErrorMessage(error, fallbackMessage)

  await Swal.fire({
    title: 'Error',
    text: message,
    icon: 'error',
    confirmButtonText: 'Close',
  })
}
