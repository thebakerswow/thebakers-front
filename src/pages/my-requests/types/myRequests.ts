export type TransactionRequest = {
  id: string | number
  idDiscord: string
  idGbank: string | number
  value: number
  status: 'pending' | 'accepted' | 'denied'
  urlImage: string
  createdAt: string
  nameUserRequest: string
  nameGbank: string
  idTeam: string
  balanceTotal: number
  sumDay: number
}

export type StatusFilter = 'all' | 'pending' | 'accepted' | 'denied'

export type RequestCardProps = {
  request: TransactionRequest
  onOpenImage: (request: TransactionRequest) => void
  onEditValue: (request: TransactionRequest) => void
  onDelete: (request: TransactionRequest) => void
}

export type UpdateTransactionRequestValuePayload = {
  id: number | string
  value: number
}
