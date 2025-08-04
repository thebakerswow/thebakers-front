export const teamOrder = [
  'Chefe de cozinha',
  'M+',
  'Leveling',
  'Garçom',
  'Confeiteiros',
  'Jackfruit',
  'Insanos',
  'APAE',
  'Los Renegados',
  'DTM',
  'KFFC',
  'Greensky',
  'Guild Azralon BR#1',
  'Guild Azralon BR#2',
  'Rocket',
  'Fuck Bear',
  'Padeirinho',
  'Milharal',
  'Advertiser',
  'Freelancer',
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
  'Chefe de cozinha': 'bg-red-600',
  'M+': 'bg-purple-600',
  Leveling: 'bg-green-600',
  Garçom: 'bg-blue-600',
  Confeiteiros: 'bg-pink-500',
  Jackfruit: 'bg-green-500',
  Insanos: 'bg-blue-700',
  APAE: 'bg-red-400',
  'Los Renegados': 'bg-yellow-500',
  DTM: 'bg-purple-500',
  KFFC: 'bg-green-700',
  Greensky: 'bg-pink-600',
  'Guild Azralon BR#1': 'bg-teal-600',
  'Guild Azralon BR#2': 'bg-blue-600',
  Rocket: 'bg-red-700',
  'Fuck Bear': 'bg-purple-700',
  Padeirinho: 'bg-orange-600',
  Milharal: 'bg-yellow-300',
  Advertiser: 'bg-gray-400',
  Freelancer: 'bg-green-400',
}
