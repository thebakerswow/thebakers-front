export const teamOrder = [
  'Garçom',
  'Confeiteiros',
  'Raio',
  'APAE',
  'Milharal',
  'Jackfruit',
  'DTM',
  'Advertiser',
  'Padeirinho',
] as const

export type TeamOrder = (typeof teamOrder)[number]

export interface TeamMember {
  global_name: string
  username: string
}

export interface Team {
  name: TeamOrder
  members: TeamMember[]
}

export const teamColors: Record<TeamOrder, string> = {
  Padeirinho: 'bg-yellow-600',
  Garçom: 'bg-green-600',
  Confeiteiros: 'bg-pink-400',
  Jackfruit: 'bg-green-300',
  Milharal: 'bg-yellow-200',
  Raio: 'bg-yellow-400',
  APAE: 'bg-red-400',
  DTM: 'bg-purple-400',
  Advertiser: 'bg-gray-300',
}
