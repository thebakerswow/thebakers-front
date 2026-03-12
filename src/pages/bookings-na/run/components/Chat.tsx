import { useState, useRef, FormEvent, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  ChatTeardropText,
  CircleNotch,
  PaperPlaneRight,
  WarningCircle,
  X,
} from '@phosphor-icons/react'
import Swal from 'sweetalert2'
import type { ChatMessage, RunChatProps } from '../types/run'

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

  const chatNode = (
    <div className='fixed bottom-4 right-4 z-[2200] sm:bottom-6 sm:right-6'>
      {!open ? (
        <div className='relative'>
          <button
            onClick={() => setIsChatOpen(true)}
            className='flex h-16 w-16 items-center justify-center rounded-full border border-purple-300/30 bg-purple-600 shadow-[0_12px_32px_rgba(0,0,0,0.35)] transition hover:bg-purple-500'
            aria-label='Open run chat'
          >
            <ChatTeardropText size={28} color='#fff' />
          </button>
          {unreadCount > 0 && (
            <span className='absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white'>
              {unreadCount}
            </span>
          )}
        </div>
      ) : (
        <div className='flex h-[65vh] min-h-[380px] w-[calc(100vw-2rem)] max-h-[560px] max-w-[430px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl'>
          <div className='flex items-center justify-between border-b border-white/10 bg-[linear-gradient(180deg,rgba(147,51,234,0.95)_0%,rgba(126,34,206,0.95)_100%)] px-4 py-3 text-white'>
            <div className='flex items-center gap-2'>
              <span className='font-semibold'>Run Chat</span>
              <span className={`text-xs font-medium ${connectionStatus.color}`}>
                {connectionStatus.text}
              </span>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className='rounded-md p-1 text-white transition hover:bg-white/10'
              aria-label='Fechar chat'
            >
              <X size={22} />
            </button>
          </div>
          <div className='custom-scrollbar flex flex-1 flex-col gap-3 overflow-y-auto bg-black/20 p-4'>
            {loading ? (
              <div className='flex h-full items-center justify-center'>
                <CircleNotch className='animate-spin text-purple-300' size={24} />
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
                              ? 'bg-purple-500 text-white shadow-[0_6px_20px_rgba(126,34,206,0.35)]'
                              : 'border border-white/10 bg-zinc-800/95 text-gray-200'
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
            className='flex gap-2 border-t border-white/10 bg-zinc-900 px-3 py-3'
            onSubmit={handleSendMessage}
          >
            <input
              type='text'
              placeholder='Type your message...'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoComplete='off'
              className='h-10 flex-1 rounded-md border border-white/15 bg-zinc-800 px-3 text-sm text-white outline-none placeholder:text-neutral-400 focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/30'
              disabled={inputDisabled}
            />
            <button
              type='submit'
              disabled={!input.trim() || inputDisabled}
              className='inline-flex h-10 min-w-10 items-center justify-center rounded-md border border-purple-300/35 bg-purple-600 px-3 text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:bg-purple-700/50'
            >
              <PaperPlaneRight size={20} />
            </button>
          </form>
        </div>
      )}
    </div>
  )

  if (typeof document === 'undefined') {
    return chatNode
  }

  return createPortal(chatNode, document.body)
}
