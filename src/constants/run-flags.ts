export const RUN_FLAG_QUERY_PARAM = 'runScreen'

export const RUN_SCREEN_FLAGS = {
  TRADITIONAL: 'traditional',
  KEYS: 'keys',
  LEVELING: 'leveling',
  PVP: 'pvp',
} as const

export type RunScreenFlag =
  (typeof RUN_SCREEN_FLAGS)[keyof typeof RUN_SCREEN_FLAGS]
