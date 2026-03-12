import { getRuns } from '../../../services/api/runs'
import { getServiceCategories, getServices } from '../../../services/api/services'
import { handleApiError } from '../../../utils/apiErrorHandler'
import { HomeRunItem, HomeServicesData, HomeWeekRuns } from '../types/home'

export async function fetchWeekRuns(dates: string[]): Promise<HomeWeekRuns> {
  const results = await Promise.allSettled(
    dates.map((date) =>
      getRuns(date).then((runs) => ({ date, runs: (runs || []) as HomeRunItem[] }))
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
      getServices(),
      getServiceCategories(),
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
