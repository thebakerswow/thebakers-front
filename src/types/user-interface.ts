export interface User {
  id_discord: string
  username: string
  percentage?: number
  global_name?: string
}

export interface FreelancersProps {
  runId: string | undefined
  runIsLocked: boolean
}

export interface ApiOption {
  id: string
  username: string
  global_name: string
}

export interface Advertiser {
  id: string
  name: string
}

export interface RunWithoutAttendance {
  idRun: number
  raid: string
  text: string
  date: string
}
