export interface ChatMessage {
  id?: string | number
  user_name: string
  id_discord: string
  message: string
  created_at: string
}

export interface RunChatProps {
  runId: string
  messages: ChatMessage[]
  loading: boolean
  unreadCount: number
  inputDisabled: boolean
  onSendMessage: (msg: string) => void
  onTagRaidLeader: (message?: ChatMessage) => void
  raidLeaders: {
    idCommunication: string
    idDiscord: string
    username: string
  }[]
  idDiscord: string
  isChatOpen: boolean
  setIsChatOpen: (open: boolean) => void
}
