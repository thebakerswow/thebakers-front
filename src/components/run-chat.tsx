import { useState, useRef, FormEvent, useEffect } from 'react'
import {
  ChatTeardropText,
  PaperPlaneRight,
  WarningCircle,
  X,
} from '@phosphor-icons/react'
import {
  Button,
  TextField,
  IconButton,
  CircularProgress,
  Badge,
} from '@mui/material'

interface ChatMessage {
  id?: string | number
  user_name: string
  id_discord: string
  message: string
  created_at: string
}

interface RunChatProps {
  runId: string
  messages: ChatMessage[]
  loading: boolean
  unreadCount: number
  inputDisabled: boolean
  onSendMessage: (msg: string) => void
  selectedMessageId: string | number | null
  setSelectedMessageId: (id: string | number | null) => void
  onTagRaidLeader: () => void
  raidLeaders: {
    idCommunication: string
    idDiscord: string
    username: string
  }[]
  idDiscord: string
  isChatOpen: boolean
  setIsChatOpen: (open: boolean) => void
}

export function RunChat({
  messages,
  loading,
  unreadCount,
  inputDisabled,
  onSendMessage,
  selectedMessageId,
  setSelectedMessageId,
  onTagRaidLeader,

  idDiscord,
  isChatOpen,
  setIsChatOpen,
}: RunChatProps) {
  const open = isChatOpen
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<null | HTMLDivElement>(null)

  // Scroll para o final ao abrir ou ao receber mensagens
  useEffect(() => {
    if (messages.length && open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open])

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onSendMessage(input)
      setInput('')
    }
  }

  return (
    <div className='fixed bottom-6 right-12 z-[1000]'>
      {!open ? (
        <Badge
          color='error'
          invisible={unreadCount === 0}
          badgeContent={unreadCount > 0 ? unreadCount : undefined}
          overlap='circular'
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Button
            onClick={() => setIsChatOpen(true)}
            variant='contained'
            sx={{
              minWidth: 0,
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: 'rgb(239, 68, 68)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              '&:hover': { backgroundColor: 'rgb(248, 113, 113)' },
              p: 0,
            }}
            aria-label='Abrir chat da run'
          >
            <ChatTeardropText size={28} color='#fff' />
          </Button>
        </Badge>
      ) : (
        <div className='flex h-[500px] w-[400px] flex-col overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl'>
          <div className='flex items-center justify-between bg-red-500 px-4 py-3 text-white'>
            <span className='font-semibold'>Run Chat</span>
            <IconButton
              onClick={() => setIsChatOpen(false)}
              size='small'
              sx={{
                color: '#fff',
                background: 'none',
                '&:hover': { background: 'rgba(255,255,255,0.08)' },
              }}
              aria-label='Fechar chat'
            >
              <X size={22} />
            </IconButton>
          </div>
          <div
            className='custom-scrollbar flex flex-1 flex-col gap-3 overflow-y-auto p-4'
            style={{ background: 'none' }}
          >
            {loading ? (
              <div className='flex h-full items-center justify-center'>
                <CircularProgress color='error' />
              </div>
            ) : (
              <>
                {messages.map((msg, index) => {
                  const isOwnMessage =
                    String(msg.id_discord) === String(idDiscord)
                  const messageKey = msg.id || `${msg.id_discord}-${index}`
                  const isSelected = selectedMessageId === messageKey
                  return (
                    <div
                      key={messageKey}
                      className={`flex items-center gap-1 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                    >
                      <div
                        className={`max-w-[75%] cursor-pointer overflow-hidden whitespace-pre-wrap break-words rounded-lg px-3 py-2 ${
                          isOwnMessage
                            ? isSelected
                              ? 'border-2 border-yellow-400 bg-red-700 text-white'
                              : 'bg-red-500 text-white'
                            : 'bg-zinc-700 text-gray-200'
                        }`}
                        onClick={() => {
                          if (isOwnMessage) {
                            setSelectedMessageId(
                              selectedMessageId === messageKey
                                ? null
                                : messageKey
                            )
                          }
                        }}
                        title={
                          isOwnMessage ? 'Click to select this message' : ''
                        }
                      >
                        {!isOwnMessage && (
                          <div className='text-xs font-bold text-red-400'>
                            {msg.user_name || 'Usuário desconhecido'}
                          </div>
                        )}
                        <p className='text-sm'>{msg.message}</p>
                      </div>
                      {/* Ícone de Tag Raid Leader */}
                      {isOwnMessage && (
                        <div
                          className={`flex items-center gap-1 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                        >
                          <span
                            className='mr-1 cursor-pointer'
                            title='Tag Raid Leader'
                            onClick={() => {
                              setSelectedMessageId(
                                selectedMessageId === messageKey
                                  ? null
                                  : messageKey
                              )
                            }}
                          >
                            <WarningCircle
                              size={20}
                              color='#fbbf24'
                              weight={isSelected ? 'fill' : 'regular'}
                            />
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          {/* Botão para enviar mensagem selecionada ao raid leader */}
          {selectedMessageId && (
            <div className='flex items-center justify-end gap-2 border-t border-zinc-700 bg-zinc-900 px-4 py-2'>
              <Button
                variant='contained'
                color='warning'
                onClick={onTagRaidLeader}
                sx={{
                  backgroundColor: 'rgb(251, 191, 36)',
                  color: '#000',
                  fontWeight: 600,
                  borderRadius: 2,
                  '&:hover': { backgroundColor: 'rgb(253, 224, 71)' },
                }}
              >
                Tag Raid Leader
              </Button>
            </div>
          )}
          <form
            className='flex gap-2 border-t border-zinc-700 bg-zinc-900 px-2 py-2'
            onSubmit={handleSendMessage}
          >
            <TextField
              placeholder='Type your message...'
              size='small'
              fullWidth
              value={input}
              onChange={(e) => setInput(e.target.value)}
              inputProps={{ autoComplete: 'off' }}
              sx={{
                input: {
                  color: '#fff',
                  background: '#18181b',
                  borderRadius: 1,
                },
                fieldset: { border: 'none' },
                background: '#18181b',
                borderRadius: 1,
              }}
              InputProps={{
                style: {
                  color: '#fff',
                  background: '#18181b',
                  borderRadius: 8,
                },
              }}
              disabled={inputDisabled}
            />
            <Button
              type='submit'
              variant='contained'
              disabled={!input.trim() || inputDisabled}
              sx={{
                backgroundColor: 'rgb(239, 68, 68)',
                borderRadius: 2,
                fontWeight: 600,
                px: 2,
                minWidth: 0,
                '&:hover': { backgroundColor: 'rgb(248, 113, 113)' },
                '&.Mui-disabled': {
                  backgroundColor: 'rgba(239, 68, 68, 0.5)',
                  cursor: 'not-allowed',
                },
              }}
            >
              <PaperPlaneRight size={20} />
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
