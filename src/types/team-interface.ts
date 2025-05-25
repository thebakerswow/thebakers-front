export const teamOrder = [
  'Garçom',
  'Padeirinho',
  'Confeiteiros',
  'Jackfruit',
  'APAE',
  'Jackfruit',
  'Sapoculeano',
  'KFFC',
  'DTM',
  'Greensky',
  'Guild Azralon BR#1',
  'Guild Azralon BR#2',
  'Advertiser',
  'Milharal',
  'Raio',
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
  KFFC: 'bg-green-700',
  Sapoculeano: 'bg-blue-600',
  'Guild Azralon BR#1': 'bg-blue-600',
  'Guild Azralon BR#2': 'bg-blue-600',
  DTM: 'bg-gray-500',
  Greensky: 'bg-pray-500',
  Advertiser: 'bg-gray-300',
}
