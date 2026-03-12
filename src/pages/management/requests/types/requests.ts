import type { KeyboardEvent } from 'react'

export type RequestStatus = 'pending' | 'accepted' | 'denied'
export type RequestsStatusFilter = 'all' | RequestStatus

export interface TransactionRequest {
  id: string | number
  idDiscord: string
  idGbank: string | number
  value: number
  status: RequestStatus
  urlImage: string
  createdAt: string
  nameUserRequest: string
  nameGbank: string
  idTeam: string
  balanceTotal: number
  sumDay: number
}

export interface TransactionRequestResponse {
  transactions: TransactionRequest[]
  totalPages: number
}

export interface TeamOption {
  value: string
  label: string
}

export interface GetTransactionRequestsParams {
  status?: RequestsStatusFilter
  page?: number
  limit?: number
  id_team?: string
  player_name?: string
  date_min?: string
  date_max?: string
  min_value?: string
  max_value?: string
}

export interface RequestsFilterProps {
  statusFilter: RequestsStatusFilter
  onStatusFilterChange: (status: RequestsStatusFilter) => void
  teamFilter: string
  onTeamFilterChange: (value: string) => void
  teamOptions: TeamOption[]
  playerFilterInput: string
  onPlayerFilterInputChange: (value: string) => void
  onPlayerFilterKeyPress: (event: KeyboardEvent<HTMLInputElement>) => void
  dateMinFilter: string
  onDateMinFilterChange: (value: string) => void
  dateMaxFilter: string
  onDateMaxFilterChange: (value: string) => void
  minValueFilterInput: string
  onMinValueFilterInputChange: (value: string) => void
  onMinValueFilterKeyPress: (event: KeyboardEvent<HTMLInputElement>) => void
  maxValueFilterInput: string
  onMaxValueFilterInputChange: (value: string) => void
  onMaxValueFilterKeyPress: (event: KeyboardEvent<HTMLInputElement>) => void
  onClearFilters: () => void
}

export interface RequestCardProps {
  request: TransactionRequest
  isProcessing: boolean
  showActions?: boolean
  onOpenImage: (request: TransactionRequest) => void
  onEditValue: (request: TransactionRequest) => void
  onStatusUpdate: (requestId: string, status: Exclude<RequestStatus, 'pending'>) => void
  formatDateFromAPI: (apiDateString: string) => { date: string; time: string }
  formatValueForDisplay: (value: number) => string
}
