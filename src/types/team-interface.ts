export const teamOrder = [
  'Padeirinho',
  'Garçom',
  'Confeiteiros',
  'Jackfruit',
  'Milharal',
  'APAE',
  'Advertiser',
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
  Padeirinho: 'bg-yellow-400',
  Garçom: 'bg-green-600',
  Confeiteiros: 'bg-pink-400',
  Jackfruit: 'bg-green-300',
  Milharal: 'bg-yellow-200',
  APAE: 'bg-red-400',
  Advertiser: 'bg-gray-300',
}
