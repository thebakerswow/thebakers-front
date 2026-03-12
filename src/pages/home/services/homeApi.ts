import { api } from '../../../services/axiosConfig'
import { handleApiError } from '../../../utils/apiErrorHandler'
import { HomeRunItem, HomeServicesData, HomeWeekRuns } from '../types/home'

export async function fetchWeekRuns(dates: string[]): Promise<HomeWeekRuns> {
  const results = await Promise.allSettled(
    dates.map((date) =>
      api
        .get('/run', { params: { date } })
        .then((response) => response.data.info)
        .then((runs) => ({ date, runs: (runs || []) as HomeRunItem[] }))
    )
  )

  const mapped: HomeWeekRuns = {}
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      mapped[result.value.date] = result.value.runs
    }
  })

  const rejectedResults = results.filter(
    (result): result is PromiseRejectedResult => result.status === 'rejected'
  )
  if (rejectedResults.length > 0) {
    const fallbackMessage =
      rejectedResults.length === results.length
        ? 'Error fetching schedule runs'
        : 'Some schedule days could not be loaded'
    await handleApiError(rejectedResults[0].reason, fallbackMessage)
  }

  return mapped
}

export async function fetchHomeServicesAndCategories(): Promise<HomeServicesData> {
  try {
    const [services, categoriesResponse] = await Promise.all([
      api.get('/services').then((response) => response.data.info),
      api.get('/services-categories').then((response) => response.data.info),
    ])

    return {
      services,
      categories: Array.isArray(categoriesResponse) ? categoriesResponse : [],
    }
  } catch (error: unknown) {
    await handleApiError(error, 'Error fetching services or categories')
    return {
      services: [],
      categories: [],
    }
  }
}
