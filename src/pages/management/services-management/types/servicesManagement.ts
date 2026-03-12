export interface Service {
  id: number
  name: string
  description: string
  price: number
  serviceCategoryId: number
  category?: { id: number; name: string }
  hotItem: boolean
}

export interface ServiceCategory {
  id: number
  name: string
}

export interface ServiceForm {
  name: string
  description: string
  price: string
  serviceCategoryId: string
  hotItem: boolean
}

export interface CategoryForm {
  name: string
}
