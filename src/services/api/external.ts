import axios from 'axios'

// Instance for external calls (no authentication required)
export const externalApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/v1/external-api`,
  headers: {
    'Content-Type': 'application/json',
    APP_TOKEN: import.meta.env.VITE_APP_TOKEN,
  },
})

// External services API
export const getExternalServices = async () => {
  const response = await externalApi.get('/services')
  return response.data.info
}

// External service categories API
export const getExternalServiceCategories = async () => {
  const response = await externalApi.get('/services-categories')
  return response.data.info
}

// External runs API
export const getExternalRuns = async (date?: string) => {
  const params = date ? { date } : {}
  const response = await externalApi.get('/run', { params })
  return response.data.info
}
