import { api } from '../axiosConfig'

export const sendDiscordMessage = async (
  recipientId: string,
  message: string
) => {
  const response = await api.post('/discord/send_message', {
    id_discord_recipient: recipientId,
    message,
  })
  return response.data
}
