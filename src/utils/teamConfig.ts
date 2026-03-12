export const DEFAULT_TEAM_COLOR =
  'linear-gradient(90deg, rgba(248,113,113,0.72), rgba(185,28,28,0.62))'

export const TRACKED_TEAM_OPTIONS = [
  { id: import.meta.env.VITE_TEAM_MPLUS, label: 'M+' },
  { id: import.meta.env.VITE_TEAM_LEVELING, label: 'Leveling' },
  { id: import.meta.env.VITE_TEAM_GARCOM, label: 'Garçom' },
  { id: import.meta.env.VITE_TEAM_CONFEITEIROS, label: 'Confeiteiros' },
  { id: import.meta.env.VITE_TEAM_JACKFRUIT, label: 'Jackfruit' },
  { id: import.meta.env.VITE_TEAM_INSANOS, label: 'Insanos' },
  { id: import.meta.env.VITE_TEAM_APAE, label: 'APAE' },
  { id: import.meta.env.VITE_TEAM_LOSRENEGADOS, label: 'Los Renegados' },
  { id: import.meta.env.VITE_TEAM_PADEIRINHO, label: 'Padeirinho' },
  { id: import.meta.env.VITE_TEAM_MILHARAL, label: 'Milharal' },
]

export const TRACKED_TEAM_IDS = TRACKED_TEAM_OPTIONS.map((team) => team.id)

export const TEAM_ID_TO_COLOR_MAP: Record<string, string> = {
  [import.meta.env.VITE_TEAM_CHEFE]: 'linear-gradient(90deg, rgba(248,113,113,0.72), rgba(185,28,28,0.62))',
  [import.meta.env.VITE_TEAM_MPLUS]: 'linear-gradient(90deg, rgba(167,139,250,0.72), rgba(124,58,237,0.62))',
  [import.meta.env.VITE_TEAM_LEVELING]: 'linear-gradient(90deg, rgba(34,197,94,0.72), rgba(22,163,74,0.62))',
  [import.meta.env.VITE_TEAM_GARCOM]: 'linear-gradient(90deg, rgba(59,130,246,0.72), rgba(37,99,235,0.62))',
  [import.meta.env.VITE_TEAM_CONFEITEIROS]: 'linear-gradient(90deg, rgba(244,114,182,0.72), rgba(236,72,153,0.62))',
  [import.meta.env.VITE_TEAM_JACKFRUIT]: 'linear-gradient(90deg, rgba(34,197,94,0.72), rgba(22,163,74,0.62))',
  [import.meta.env.VITE_TEAM_INSANOS]: 'linear-gradient(270deg, rgba(59,130,246,0.72), rgba(30,64,175,0.62))',
  [import.meta.env.VITE_TEAM_APAE]: 'linear-gradient(90deg, rgba(252,165,165,0.68), rgba(248,113,113,0.6))',
  [import.meta.env.VITE_TEAM_LOSRENEGADOS]: 'linear-gradient(90deg, rgba(252,211,77,0.72), rgba(245,158,11,0.62))',
  [import.meta.env.VITE_TEAM_DTM]: 'linear-gradient(90deg, rgba(167,139,250,0.72), rgba(139,92,246,0.62))',
  [import.meta.env.VITE_TEAM_KFFC]: 'linear-gradient(90deg, rgba(52,211,153,0.72), rgba(4,120,87,0.62))',
  [import.meta.env.VITE_TEAM_GREENSKY]: 'linear-gradient(90deg, rgba(244,114,182,0.72), rgba(190,24,93,0.62))',
  [import.meta.env.VITE_TEAM_GUILD_AZRALON_1]: 'linear-gradient(270deg, rgba(45,212,191,0.72), rgba(13,148,136,0.62))',
  [import.meta.env.VITE_TEAM_GUILD_AZRALON_2]: 'linear-gradient(270deg, rgba(96,165,250,0.72), rgba(29,78,216,0.62))',
  [import.meta.env.VITE_TEAM_ROCKET]: 'linear-gradient(90deg, rgba(248,113,113,0.72), rgba(185,28,28,0.62))',
  [import.meta.env.VITE_TEAM_BOOTY_REAPER]: 'linear-gradient(90deg, rgba(139,92,246,0.72), rgba(76,29,149,0.62))',
  [import.meta.env.VITE_TEAM_PADEIRINHO]: 'linear-gradient(90deg, rgba(251,146,60,0.72), rgba(234,88,12,0.62))',
  [import.meta.env.VITE_TEAM_MILHARAL]: 'linear-gradient(90deg, rgba(254,243,199,0.62), rgba(254,240,138,0.54))',
  [import.meta.env.VITE_TEAM_BASTARD]: 'linear-gradient(90deg, rgba(245,158,11,0.72), rgba(217,119,6,0.62))',
  [import.meta.env.VITE_TEAM_KIWI]: 'linear-gradient(90deg, rgba(163,230,53,0.72), rgba(132,204,22,0.62))',
}

export const PRIORITY_ORDER = [
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
  'Booty Reaper',
  'Padeirinho',
  'Milharal',
  'Bastard Munchen',
  'Kiwi',
]

export const COLOR_OPTIONS = [
  { value: 'linear-gradient(90deg, rgba(248,113,113,0.72), rgba(185,28,28,0.62))', label: 'Chefe de cozinha' },
  { value: 'linear-gradient(90deg, rgba(167,139,250,0.72), rgba(124,58,237,0.62))', label: 'M+' },
  { value: 'linear-gradient(90deg, rgba(34,197,94,0.72), rgba(22,163,74,0.62))', label: 'Leveling' },
  { value: 'linear-gradient(90deg, rgba(59,130,246,0.72), rgba(37,99,235,0.62))', label: 'Garçom' },
  { value: 'linear-gradient(90deg, rgba(244,114,182,0.72), rgba(236,72,153,0.62))', label: 'Confeiteiros' },
  { value: 'linear-gradient(90deg, rgba(34,197,94,0.72), rgba(22,163,74,0.62))', label: 'Jackfruit' },
  { value: 'linear-gradient(270deg, rgba(59,130,246,0.72), rgba(30,64,175,0.62))', label: 'Insanos' },
  { value: 'linear-gradient(90deg, rgba(252,165,165,0.68), rgba(248,113,113,0.6))', label: 'APAE' },
  { value: 'linear-gradient(90deg, rgba(252,211,77,0.72), rgba(245,158,11,0.62))', label: 'Los Renegados' },
  { value: 'linear-gradient(90deg, rgba(167,139,250,0.72), rgba(139,92,246,0.62))', label: 'DTM' },
  { value: 'linear-gradient(90deg, rgba(52,211,153,0.72), rgba(4,120,87,0.62))', label: 'KFFC' },
  { value: 'linear-gradient(90deg, rgba(244,114,182,0.72), rgba(190,24,93,0.62))', label: 'Greensky' },
  { value: 'linear-gradient(270deg, rgba(45,212,191,0.72), rgba(13,148,136,0.62))', label: 'Guild Azralon BR#1' },
  { value: 'linear-gradient(270deg, rgba(96,165,250,0.72), rgba(29,78,216,0.62))', label: 'Guild Azralon BR#2' },
  { value: 'linear-gradient(90deg, rgba(248,113,113,0.72), rgba(185,28,28,0.62))', label: 'Rocket' },
  { value: 'linear-gradient(90deg, rgba(139,92,246,0.72), rgba(76,29,149,0.62))', label: 'Booty Reaper' },
  { value: 'linear-gradient(90deg, rgba(251,146,60,0.72), rgba(234,88,12,0.62))', label: 'Padeirinho' },
  { value: 'linear-gradient(90deg, rgba(254,243,199,0.62), rgba(254,240,138,0.54))', label: 'Milharal' },
  { value: '#9CA3AF', label: 'Advertiser' },
  { value: '#86EFAC', label: 'Freelancer' },
  { value: 'linear-gradient(90deg, rgba(245,158,11,0.72), rgba(217,119,6,0.62))', label: 'Bastard Munchen' },
  { value: 'linear-gradient(90deg, rgba(163,230,53,0.72), rgba(132,204,22,0.62))', label: 'Kiwi' },
]

export const compareByPriority = (aLabel: string, bLabel: string) => {
  const aIndex = PRIORITY_ORDER.indexOf(aLabel)
  const bIndex = PRIORITY_ORDER.indexOf(bLabel)
  if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
  if (aIndex !== -1 && bIndex === -1) return -1
  if (aIndex === -1 && bIndex !== -1) return 1
  return aLabel.localeCompare(bLabel)
}
