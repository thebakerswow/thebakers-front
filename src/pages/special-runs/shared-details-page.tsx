import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../services/axiosConfig'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import { RunData } from '../../types/runs-interface'
import { BuyerData } from '../../types/buyer-interface'
import { useAuth } from '../../context/auth-context'
import { getChatMessages } from '../../services/api/chat'
import { sendDiscordMessage } from '../../services/api/discord'
import { RunChat } from '../../components/run-chat'
import Swal from 'sweetalert2'
import CryptoJS from 'crypto-js'
import { CircularProgress } from '@mui/material'
import { RUN_FLAG_QUERY_PARAM, RunScreenFlag } from '../../constants/run-flags'

interface ChatMessage {
  id?: string | number
  user_name: string
  id_discord: string
  message: string
  created_at: string
}

interface RaidLeader {
  idCommunication: string
  idDiscord: string
  username: string
}

interface SharedRunInfoProps {
  run: RunData
  onBuyerAddedReload: () => void
  onRunEdit: () => void
  runScreen: RunScreenFlag
  detailsRoutePrefix: string
  onError?: (error: ErrorDetails) => void
}

interface SharedBuyersGridProps {
  data: BuyerData[]
  onBuyerStatusEdit: () => void
  onBuyerNameNoteEdit: () => void
  onDeleteSuccess: () => void
  runIsLocked?: boolean
  raidLeaders?: RaidLeader[]
  runIdTeam?: string
  onError?: (error: ErrorDetails) => void
}

interface SharedDetailsPageProps {
  runScreen: RunScreenFlag
  chatRunLinkPath: string
  detailsRoutePrefix: string
  RunInfoComponent: React.ComponentType<SharedRunInfoProps>
  BuyersGridComponent: React.ComponentType<SharedBuyersGridProps>
}

export function SharedDetailsPage({
  runScreen,
  chatRunLinkPath,
  detailsRoutePrefix,
  RunInfoComponent,
  BuyersGridComponent,
}: SharedDetailsPageProps) {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [runData, setRunData] = useState<RunData | undefined>(undefined)
  const [isLoadingRun, setIsLoadingRun] = useState(true)
  const [isLoadingBuyers, setIsLoadingBuyers] = useState(true)
  const [rows, setRows] = useState<BuyerData[]>([])
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [isActive, setIsActive] = useState(true)
  const { idDiscord } = useAuth()
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatLoading, setChatLoading] = useState(false)
  const [chatUnreadCount, setChatUnreadCount] = useState(0)
  const [chatRaidLeaders, setChatRaidLeaders] = useState<RaidLeader[]>([])
  const chatWs = useRef<WebSocket | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [wsConnected, setWsConnected] = useState(false)
  const runScreenParams = { [RUN_FLAG_QUERY_PARAM]: runScreen }

  const reloadAllData = async () => {
    await fetchRunData()
    await fetchBuyersData()
  }

  const handleError = (errorDetails: ErrorDetails) => setError(errorDetails)
  const clearError = () => setError(null)

  async function fetchRunData() {
    try {
      const response = await api.get(`/run/${id}`, { params: runScreenParams })
      const data = response.data.info
      setRunData({
        ...data,
        slotAvailable: Number(data.slotAvailable),
        maxBuyers: Number(data.maxBuyers),
      })
      clearError()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError({
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        })
      } else {
        setError({ message: 'Unexpected error', response: error })
      }
    } finally {
      setIsLoadingRun(false)
    }
  }

  async function fetchBuyersData() {
    try {
      setIsLoadingBuyers(false)
      const response = await api.get(`/run/${id}/buyers`, { params: runScreenParams })
      setRows(response.data.info)
      clearError()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError({
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        })
      } else {
        setError({ message: 'Unexpected error', response: error })
      }
    } finally {
      setIsLoadingBuyers(false)
    }
  }

  async function checkRunAccess() {
    try {
      const response = await api.get(`/access/run/${id}`, { params: runScreenParams })
      if (!response.data.info) navigate('/check-access')
    } catch {
      navigate('/')
    }
  }

  useEffect(() => {
    if (!id) return

    checkRunAccess().then(() => {
      fetchBuyersData()
      fetchRunData()
    })

    let inactivityTimeout: ReturnType<typeof setTimeout>
    const resetActivityTimer = () => {
      setIsActive(true)
      clearTimeout(inactivityTimeout)
      inactivityTimeout = setTimeout(() => setIsActive(false), 5000)
    }

    const handleVisibilityChange = () => {
      setIsActive(!document.hidden)
    }

    const handleMouseOrKeyActivity = () => {
      resetActivityTimer()
    }

    window.addEventListener('mousemove', handleMouseOrKeyActivity)
    window.addEventListener('keydown', handleMouseOrKeyActivity)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    const buyersInterval = setInterval(() => {
      if (isActive) fetchBuyersData()
    }, 2000)

    const runInterval = setInterval(() => {
      if (isActive) fetchRunData()
    }, 10000)

    return () => {
      clearInterval(buyersInterval)
      clearInterval(runInterval)
      clearTimeout(inactivityTimeout)
      window.removeEventListener('mousemove', handleMouseOrKeyActivity)
      window.removeEventListener('keydown', handleMouseOrKeyActivity)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [id, isActive])

  useEffect(() => {
    if (!id) return
    fetchRunData()
    fetchBuyersData()
  }, [id])

  useEffect(() => {
    if (!id) return

    let reconnectAttempts = 0
    const maxReconnectAttempts = 5
    const reconnectDelay = 2000

    const connectWebSocket = () => {
      setChatLoading(true)
      getChatMessages(id)
        .then((messages) => setChatMessages(messages || []))
        .finally(() => setChatLoading(false))

      api
        .get(`/run/${id}`, { params: runScreenParams })
        .then((response) => setChatRaidLeaders(response.data.info.raidLeaders || []))
        .catch(() => undefined)

      const apiUrl = import.meta.env.VITE_API_BASE_URL as string
      const token = localStorage.getItem('jwt')
      if (!apiUrl || !token) return

      const wsUrl = apiUrl.replace(/^http/, 'ws') + `/v1/chat?id_run=${id}&authorization=${token}`
      setWsConnected(false)
      chatWs.current = new WebSocket(wsUrl)

      chatWs.current.onopen = () => {
        setWsConnected(true)
        reconnectAttempts = 0
      }

      chatWs.current.onclose = (event) => {
        setWsConnected(false)
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++
          setTimeout(connectWebSocket, reconnectDelay)
        }
      }

      chatWs.current.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type !== 'new_message') return

        const newMsg = {
          ...data.payload,
          user_name: data.payload.user_name || data.payload.username || 'Unknown user',
        }

        setChatMessages((prev) => [...prev, newMsg])
        if (String(newMsg.id_discord) !== String(idDiscord) && !isChatOpen) {
          setChatUnreadCount((prev) => prev + 1)
        }
      }
    }

    connectWebSocket()
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => {
      setWsConnected(false)
      if (chatWs.current) chatWs.current.close(1000, 'Component unmounting')
    }
  }, [id, idDiscord])

  useEffect(() => {
    if (isChatOpen) setChatUnreadCount(0)
  }, [isChatOpen])

  const decryptIdCommunication = (encryptedId: string): string => {
    try {
      const secretKey = import.meta.env.VITE_DECRYPTION_KEY
      if (!secretKey) return ''
      const keyHash = CryptoJS.MD5(secretKey)
      const iv = CryptoJS.lib.WordArray.create(keyHash.words.slice(0, 4))
      const decrypted = CryptoJS.AES.decrypt(encryptedId, keyHash, {
        mode: CryptoJS.mode.CFB,
        padding: CryptoJS.pad.NoPadding,
        iv,
      })
      return decrypted.toString(CryptoJS.enc.Utf8) || ''
    } catch {
      return ''
    }
  }

  const getRaidLeaderDiscordId = (raidLeader: RaidLeader): string => {
    if (raidLeader.idDiscord === 'Encrypted') {
      return decryptIdCommunication(raidLeader.idCommunication)
    }
    return raidLeader.idDiscord
  }

  const handleTagRaidLeader = async (message?: ChatMessage) => {
    let msg = message
    if (!msg) {
      const userMessages = chatMessages.filter((m) => String(m.id_discord) === String(idDiscord))
      msg = userMessages[userMessages.length - 1]
    }
    if (!msg || !chatRaidLeaders.length) return

    const validRaidLeaders = chatRaidLeaders.filter((rl) => !!getRaidLeaderDiscordId(rl))
    if (validRaidLeaders.length === 0) return

    try {
      await Promise.all(
        validRaidLeaders.map((rl) =>
          sendDiscordMessage(
            getRaidLeaderDiscordId(rl),
            `Run Chat Message:\n${msg.user_name}: ${msg.message}\nRun Link: ${window.location.origin}${chatRunLinkPath}/${id}`
          )
        )
      )
      Swal.fire({
        title: 'Success!',
        text: 'Message sent to raid leader.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      })
    } catch {
      Swal.fire({
        title: 'Error',
        text: 'Failed to send message to raid leader.',
        icon: 'error',
        timer: 1500,
        showConfirmButton: false,
      })
    }
  }

  const handleSendChatMessage = (msg: string) => {
    if (!msg.trim() || !chatWs.current || chatWs.current.readyState !== WebSocket.OPEN) return
    chatWs.current.send(JSON.stringify({ type: 'send_message', payload: { message: msg } }))
  }

  const waitingCount = Array.isArray(rows)
    ? rows.filter((buyer) => buyer.status === 'waiting').length
    : 0
  const groupCount = Array.isArray(rows)
    ? rows.filter((buyer) => buyer.status === 'group').length
    : 0

  return (
    <div
      className={`flex w-full flex-col overflow-auto rounded-xl text-gray-100 shadow-2xl ${
        isLoadingRun || !runData ? 'items-center justify-center' : ''
      }`}
    >
      {error && <ErrorComponent error={error} onClose={clearError} />}

      {isLoadingRun ? (
        <div className='flex flex-col items-center'>
          <CircularProgress />
        </div>
      ) : (
        <div className='mx-2 p-4 pb-20'>
          {runData ? (
            <RunInfoComponent
              run={runData}
              onBuyerAddedReload={reloadAllData}
              onRunEdit={fetchRunData}
              runScreen={runScreen}
              detailsRoutePrefix={detailsRoutePrefix}
              onError={handleError}
            />
          ) : (
            <div>Loading</div>
          )}

          <div className='p-4'>
            {isLoadingBuyers ? (
              <div className='mt-40 flex flex-col items-center'>
                <CircularProgress />
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span className='rounded-md bg-gray-300 px-4 py-1 text-gray-800'>
                    Waiting: {waitingCount} | Group: {groupCount}
                  </span>
                </div>
                <BuyersGridComponent
                  data={rows}
                  onBuyerStatusEdit={reloadAllData}
                  onBuyerNameNoteEdit={reloadAllData}
                  onDeleteSuccess={reloadAllData}
                  runIsLocked={runData?.runIsLocked ?? false}
                  raidLeaders={chatRaidLeaders}
                  runIdTeam={runData?.idTeam}
                  onError={handleError}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {runData?.id && idDiscord && (
        <RunChat
          runId={runData.id}
          messages={chatMessages}
          loading={chatLoading}
          unreadCount={chatUnreadCount}
          inputDisabled={!wsConnected}
          onSendMessage={handleSendChatMessage}
          onTagRaidLeader={handleTagRaidLeader}
          raidLeaders={chatRaidLeaders}
          idDiscord={idDiscord}
          isChatOpen={isChatOpen}
          setIsChatOpen={setIsChatOpen}
        />
      )}
    </div>
  )
}
