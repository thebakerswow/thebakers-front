import { api } from '../axiosConfig'

export const getServices = async () => {
  const response = await api.get('/services')
  return response.data.info
}

export const createService = async (data: {
  name: string
  description: string
  price: number
  serviceCategoryId: number
  hotItem: boolean
}) => {
  const response = await api.post('/services', data)
  return response.data
}

export const updateService = async (data: {
  id: number
  name: string
  description: string
  price: number
  serviceCategoryId: number
  hotItem: boolean
}) => {
  const response = await api.put('/services', data)
  return response.data
}

export const deleteService = async (serviceId: number) => {
  const response = await api.delete(`/services/${serviceId}`)
  return response.data
}

export const getServiceCategories = async () => {
  const response = await api.get('/services-categories')
  return response.data.info
}

export const createServiceCategory = async (data: { name: string }) => {
  const response = await api.post('/services-categories', data)
  return response.data
}

export const updateServiceCategory = async (data: {
  id: number
  name: string
}) => {
  const response = await api.put('/services-categories', data)
  return response.data
}

export const deleteServiceCategory = async (categoryId: number) => {
  const response = await api.delete(`/services-categories/${categoryId}`)
  return response.data
}
