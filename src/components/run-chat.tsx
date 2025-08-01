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
import Swal from 'sweetalert2'
import { ChatMessage, RunChatProps } from '../types'

export function RunChat({
  messages,
  loading,
  unreadCount,
  inputDisabled,
  onSendMessage,
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

  const handleTagRaidLeader = async (message: ChatMessage) => {
    const result = await Swal.fire({
      title: 'Confirm Tag',
      text: 'Are you sure you want to tag the raid leader?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'rgb(168, 85, 247)',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Confirm!',
      cancelButtonText: 'Cancel',
    })

    if (result.isConfirmed) {
      onTagRaidLeader(message)
    }
  }

  // Determinar o status da conexão
  const getConnectionStatus = () => {
    if (inputDisabled) {
      return { text: 'Disconnected', color: 'text-red-400' }
    }
    return { text: 'Connected', color: 'text-green-400' }
  }

  const connectionStatus = getConnectionStatus()

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
              backgroundColor: 'rgb(147, 51, 234)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
              p: 0,
            }}
            aria-label='Open run chat'
          >
            <ChatTeardropText size={28} color='#fff' />
          </Button>
        </Badge>
      ) : (
        <div className='flex h-[500px] w-[400px] flex-col overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl'>
          <div className='flex items-center justify-between bg-purple-500 px-4 py-3 text-white'>
            <div className='flex items-center gap-2'>
              <span className='font-semibold'>Run Chat</span>
              <span className={`text-xs ${connectionStatus.color}`}>
                {connectionStatus.text}
              </span>
            </div>
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
                <CircularProgress sx={{ color: '#8b5cf6' }} />
              </div>
            ) : (
              <>
                {messages.length === 0 ? (
                  <div className='flex h-full items-center justify-center text-gray-400'>
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isOwnMessage =
                      String(msg.id_discord) === String(idDiscord)
                    const messageKey = msg.id || `${msg.id_discord}-${index}`
                    return (
                      <div
                        key={messageKey}
                        className={`flex items-center gap-1 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                      >
                        <div
                          className={`max-w-[75%] cursor-pointer overflow-hidden whitespace-pre-wrap break-words rounded-lg px-3 py-2 ${
                            isOwnMessage
                              ? 'bg-purple-500 text-white'
                              : 'bg-zinc-700 text-gray-200'
                          }`}
                          title={
                            isOwnMessage ? 'Click to select this message' : ''
                          }
                        >
                          {!isOwnMessage && (
                            <div className='text-xs font-bold text-purple-400'>
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
                              onClick={() => handleTagRaidLeader(msg)}
                            >
                              <WarningCircle
                                size={20}
                                color='#fbbf24'
                                weight='regular'
                              />
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          {/* Removendo o botão que aparecia embaixo */}
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
                backgroundColor: 'rgb(147, 51, 234)',
                borderRadius: 2,
                fontWeight: 600,
                px: 2,
                minWidth: 0,
                '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
                '&.Mui-disabled': {
                  backgroundColor: 'rgba(147, 51, 234, 0.5)',
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
