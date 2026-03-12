import { Service, ServiceCategory } from '../../../types'

export type HomeRunItem = {
  id: string | number
  idTeam?: string
  team?: string
  name?: string
  difficulty?: string
  raid?: string
  time: string
  loot?: string
  slotAvailable?: number
}

export type HomeServicesData = {
  services: Service[]
  categories: ServiceCategory[]
}

export type HomeWeekRuns = Record<string, HomeRunItem[]>

export type HomeCategoryWithServices = {
  category: ServiceCategory
  services: Service[]
}

export type ScheduleProps = {
  dates: string[]
  weekRuns: HomeWeekRuns
  loadingRuns: boolean
}

export type ServiceCardProps = {
  service: Service
}

export type CategoryFiltersProps = {
  categoriesWithServices: HomeCategoryWithServices[]
  activeCategory: string | null
  filtersOpen: boolean
  onSetFiltersOpen: (open: boolean) => void
  onSelectCategory: (categoryId: string | null) => void
  onScrollToSchedule: () => void
}

export type ServicesSkeletonProps = {
  sections?: number
  cardsPerSection?: number
}
