
export interface DiscordTokenPayload {
  username: string
  roles: string[] | string
  exp: number
  iat: number
}

export interface AuthUser {
  idDiscord: string
  username: string
  roles: string[]
}
