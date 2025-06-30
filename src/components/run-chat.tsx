import { useState, useEffect, useRef, FormEvent } from 'react'
import { ChatTeardropText, PaperPlaneRight, X } from '@phosphor-icons/react'
import {
  Button,
  TextField,
  IconButton,
  CircularProgress,
  Badge,
} from '@mui/material'
import { api } from '../services/axiosConfig'
import { useAuth } from '../context/auth-context'
import Swal from 'sweetalert2'

interface ChatMessage {
  id?: string | number
  user_name: string
  id_discord: string
  message: string
  created_at: string
}

export function RunChat({ runId }: { runId: string }) {
  const { idDiscord } = useAuth()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const ws = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<null | HTMLDivElement>(null)
  const [selectedMessageId, setSelectedMessageId] = useState<
    string | number | null
  >(null)
  const [raidLeaders, setRaidLeaders] = useState<
    { idDiscord: string; username: string }[]
  >([])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (messages.length && open) {
      scrollToBottom()
    }
  }, [messages, open])

  useEffect(() => {
    if (open) setHasUnread(false)
  }, [open])

  useEffect(() => {
    if (open) {
      const fetchPreviousMessages = async () => {
        setLoading(true)
        try {
          const response = await api.get(`/chat/${runId}`)
          setMessages(response.data.info || [])
        } catch (error) {
          console.error('Falha ao buscar mensagens anteriores:', error)
        } finally {
          setLoading(false)
        }
      }

      fetchPreviousMessages()

      const apiUrl = import.meta.env.VITE_API_BASE_URL as string
      if (!apiUrl) {
        console.error(
          'VITE_API_BASE_URL não está definida! Verifique seu arquivo .env'
        )
        return
      }

      const token = localStorage.getItem('jwt')
      if (!token) {
        console.error('Token JWT not found. Is the user logged in?')
        return
      }

      const wsUrl =
        apiUrl.replace(/^http/, 'ws') +
        `/v1/chat?id_run=${runId}&authorization=${token}`
      ws.current = new WebSocket(wsUrl)

      ws.current.onopen = () => console.log('WebSocket Conectado')
      ws.current.onclose = () => console.log('WebSocket Desconectado')
      ws.current.onerror = (err) => console.error('WebSocket Error:', err)

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data)
        switch (data.type) {
          case 'new_message':
            let newMsg = {
              ...data.payload,
              user_name:
                data.payload.user_name ||
                data.payload.username ||
                'Usuário desconhecido',
            }
            setMessages((prev) => [...prev, newMsg])
            if (!open && String(newMsg.id_discord) !== String(idDiscord)) {
              setHasUnread(true)
              // Notificação do navegador
              if (
                'Notification' in window &&
                Notification.permission === 'granted'
              ) {
                new Notification('Nova mensagem no Run Chat', {
                  body: `${newMsg.user_name}: ${newMsg.message}`,
                  icon: '/src/assets/logo.ico', // ajuste o caminho do ícone se necessário
                })
              }
            }
            break
          case 'confirmation':
            console.log('Confirmação:', data.payload)
            break
          case 'error':
            console.error('Erro do Servidor:', data.payload)
            break
          default:
            console.warn('Tipo de mensagem desconhecido:', data.type)
        }
      }

      // Fetch raid leaders for the run
      api
        .get(`/run/${runId}`)
        .then((response) => {
          setRaidLeaders(response.data.info.raidLeaders || [])
        })
        .catch((error) => {
          console.error('Error fetching raid leaders:', error)
        })

      return () => {
        ws.current?.close()
      }
    }
  }, [open, runId, idDiscord])

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault()
    if (input.trim() && ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: 'send_message',
          payload: { message: input },
        })
      )
      setInput('')
    }
  }

  const handleSendToRaidLeader = async () => {
    if (!selectedMessageId) return
    const msg = messages.find((m) => m.id === selectedMessageId)
    if (!msg) return
    if (!raidLeaders.length) {
      Swal.fire({
        title: 'Erro',
        text: 'No raid leader found.',
        icon: 'error',
        timer: 1500,
        showConfirmButton: false,
      })
      return
    }
    try {
      await Promise.all(
        raidLeaders.map((rl) =>
          api.post('/discord/send_message', {
            id_discord_recipient: rl.idDiscord,
            message: `Run Chat Message:\n${msg.user_name}: ${msg.message}\nRun Link: ${window.location.origin}/bookings-na/run/${runId}`,
          })
        )
      )
      Swal.fire({
        title: 'Sucesso!',
        text: 'Message sent to raid leader.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error) {
      Swal.fire({
        title: 'Erro',
        text: 'Failed to send message to raid leader.',
        icon: 'error',
        timer: 1500,
        showConfirmButton: false,
      })
    }
  }

  useEffect(() => {
    // Solicita permissão para notificações do navegador ao montar o componente
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    if (open) {
      setHasUnread(false)
    } else if (messages.length > 0) {
      // Se a última mensagem não for do usuário logado, marque como não lida
      const lastMsg = messages[messages.length - 1]
      if (lastMsg && String(lastMsg.id_discord) !== String(idDiscord)) {
        setHasUnread(true)
      }
    }
  }, [open, messages, idDiscord])

  return (
    <div className='fixed bottom-6 right-12 z-[1000]'>
      {!open ? (
        <Badge
          color='error'
          invisible={!hasUnread}
          overlap='circular'
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Button
            onClick={() => setOpen(true)}
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
              onClick={() => setOpen(false)}
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
                  const isSelected = selectedMessageId === msg.id
                  return (
                    <div
                      key={msg.id || `${msg.id_discord}-${index}`}
                      className={`flex flex-col ${
                        isOwnMessage ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-[85%] cursor-pointer rounded-lg px-3 py-2 ${
                          isOwnMessage
                            ? isSelected
                              ? 'border-2 border-yellow-400 bg-red-700 text-white'
                              : 'bg-red-500 text-white'
                            : 'bg-zinc-700 text-gray-200'
                        }`}
                        onClick={() => {
                          if (isOwnMessage) {
                            setSelectedMessageId(
                              selectedMessageId === (msg.id ?? null)
                                ? null
                                : (msg.id ?? null)
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
                onClick={handleSendToRaidLeader}
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
            />
            <Button
              type='submit'
              variant='contained'
              disabled={!input.trim()}
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
