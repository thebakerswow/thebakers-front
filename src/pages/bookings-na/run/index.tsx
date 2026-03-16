import { useEffect, useState, useRef } from 'react'
import { RunInfo } from './components/RunInfo'
import { BuyersDataGrid } from './components/BuyersGrid'
import { useParams, useNavigate } from 'react-router-dom'
import { UserPlus } from '@phosphor-icons/react'
import { InviteBuyers } from './components/InviteBuyers'
import {
  getRun,
  getRunBuyers,
  getRunAttendance,
  checkRunAccess as checkRunAccessService,
  getChatMessages,
  sendDiscordMessage,
} from './services/runApi'
import { Attendance } from './components/Attendance'
import { useAuth } from '../../../context/AuthContext'
import { canViewAttendanceButton } from '../../../utils/roleUtils'
import { Freelancers } from './components/Freelancers'
import { RunChat } from './components/Chat'
import { LoadingSpinner } from '../../../components/LoadingSpinner'
import { RunPageSkeleton } from './components/RunPageSkeleton'
import Swal from 'sweetalert2'
import CryptoJS from 'crypto-js'
import { handleApiError } from '../../../utils/apiErrorHandler'
import type {
  AttendanceState,
  BuyerData,
  ChatMessage,
  RaidLeader,
  RunData,
} from './types/run'

export function RunDetails() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [runData, setRunData] = useState<RunData | undefined>(undefined)
  const [isLoadingRun, setIsLoadingRun] = useState(true)
  const [isLoadingBuyers, setIsLoadingBuyers] = useState(true)
  const [rows, setRows] = useState<BuyerData[]>([])
  const [isInviteBuyersOpen, setIsInviteBuyersOpen] = useState(false)
  const [attendance, setAttendance] = useState<AttendanceState>({ info: [] })
  const [hasAttendanceAccess, setHasAttendanceAccess] = useState(true)
  const { userRoles, idDiscord } = useAuth()
  const [showDetails, setShowDetails] = useState(false)
  // --- CHAT STATES ---
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatLoading, setChatLoading] = useState(false)
  const [chatUnreadCount, setChatUnreadCount] = useState(0)

  const [chatRaidLeaders, setChatRaidLeaders] = useState<RaidLeader[]>([])
  const chatWs = useRef<WebSocket | null>(null)
  const buyersRequestInFlightRef = useRef(false)
  const runRequestInFlightRef = useRef(false)
  const buyersSnapshotRef = useRef('')
  const runSnapshotRef = useRef('')
  const isUserActiveRef = useRef(true)
  const [isChatOpen, setIsChatOpen] = useState(true)
  const [wsConnected, setWsConnected] = useState(false)

  const allowedRoles = [
    import.meta.env.VITE_TEAM_CHEFE,
    import.meta.env.VITE_TEAM_PREFEITO,
  ]
  const canViewInviteButton = userRoles.some((role) =>
    allowedRoles.includes(role)
  )
  const canViewAttendance = canViewAttendanceButton(userRoles)

  const toggleDetailsVisibility = () => {
    setShowDetails((prev) => !prev)
  }

  // Função para recarregar TODOS os dados (run e buyers)
  const reloadAllData = async () => {
    await fetchRunData() // Atualiza dados da run
    await fetchBuyersData() // Atualiza lista de buyers
  }

  const handleOpenInviteBuyersModal = () => {
    setIsInviteBuyersOpen(true)
  }

  const handleCloseInviteBuyersModal = () => {
    setIsInviteBuyersOpen(false)
  }

  // Função para buscar os dados da run
  async function fetchRunData() {
    if (!id || runRequestInFlightRef.current) {
      return
    }

    runRequestInFlightRef.current = true
    try {
      const data = await getRun(id!)
      const normalizedRunData = {
        ...data,
        slotAvailable: Number(data.slotAvailable),
        maxBuyers: Number(data.maxBuyers),
      }
      const nextSnapshot = JSON.stringify(normalizedRunData)

      if (runSnapshotRef.current !== nextSnapshot) {
        runSnapshotRef.current = nextSnapshot
        setRunData(normalizedRunData)
      }
    } catch (error) {
      await handleApiError(error, 'Failed to fetch run data')
    } finally {
      runRequestInFlightRef.current = false
      setIsLoadingRun(false)
    }
  }

  // Função para buscar os dados dos buyers
  async function fetchBuyersData(showLoading = true) {
    if (!id || buyersRequestInFlightRef.current) {
      return
    }

    buyersRequestInFlightRef.current = true
    try {
      if (showLoading) {
        setIsLoadingBuyers(true)
      }
      const data = await getRunBuyers(id!)
      const nextSnapshot = JSON.stringify(data)

      if (buyersSnapshotRef.current !== nextSnapshot) {
        buyersSnapshotRef.current = nextSnapshot
        setRows(data)
      }
    } catch (error) {
      await handleApiError(error, 'Failed to fetch buyers')
    } finally {
      buyersRequestInFlightRef.current = false
      if (showLoading) {
        setIsLoadingBuyers(false)
      }
    }
  }

  // Função para verificar acesso à run
  async function verifyRunAccess() {
    try {
      const hasAccess = await checkRunAccessService(id!)
      if (!hasAccess) {
        navigate('/check-access') // Redireciona para a home se o acesso for negado
      }
    } catch (error) {
      await handleApiError(error, 'Failed to verify run access')
      navigate('/') // Redireciona para a home em caso de erro
    }
  }

  useEffect(() => {
    if (!id) return

    // Verifica acesso antes de buscar dados
    verifyRunAccess().then(() => {
      fetchBuyersData()
      fetchRunData()
    })

    // Função para resetar o temporizador
    const resetActivityTimer = () => {
      isUserActiveRef.current = true
      clearTimeout(inactivityTimeout)
      inactivityTimeout = setTimeout(() => {
        isUserActiveRef.current = false
      }, 5000)
    }

    // Função para monitorar a visibilidade da página
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isUserActiveRef.current = false
      } else {
        isUserActiveRef.current = true
        resetActivityTimer()
      }
    }

    // Configuração de eventos para detectar atividade do usuário
    let inactivityTimeout: ReturnType<typeof setTimeout>

    const handleMouseOrKeyActivity = () => {
      resetActivityTimer()
    }

    window.addEventListener('mousemove', handleMouseOrKeyActivity)
    window.addEventListener('keydown', handleMouseOrKeyActivity)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Inicia como ativo e ajusta com os eventos de interação
    resetActivityTimer()

    let buyersTimer: ReturnType<typeof setTimeout>
    let runTimer: ReturnType<typeof setTimeout>

    const scheduleBuyersPoll = () => {
      const buyersDelay = isUserActiveRef.current ? 2000 : 12000
      buyersTimer = setTimeout(() => {
        fetchBuyersData(false)
        scheduleBuyersPoll()
      }, buyersDelay)
    }

    const scheduleRunPoll = () => {
      const runDelay = isUserActiveRef.current ? 10000 : 30000
      runTimer = setTimeout(() => {
        fetchRunData()
        scheduleRunPoll()
      }, runDelay)
    }

    scheduleBuyersPoll()
    scheduleRunPoll()

    return () => {
      clearTimeout(buyersTimer)
      clearTimeout(runTimer)
      clearTimeout(inactivityTimeout)
      window.removeEventListener('mousemove', handleMouseOrKeyActivity)
      window.removeEventListener('keydown', handleMouseOrKeyActivity)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [id])

  // Função para buscar os dados de atendimento
  async function fetchAttendanceData() {
    try {
      const data = await getRunAttendance(id!)

      setAttendance({ info: data })
      setHasAttendanceAccess(true)
    } catch (error) {
      const statusCode = (error as { response?: { status?: number } })?.response?.status
      if (statusCode === 403) {
        setHasAttendanceAccess(false)
      } else {
        await handleApiError(error, 'Failed to fetch attendance')
      }
    }
  }

  // Função para marcar todos como 100% (apenas visualização)
  const markAllAsFull = () => {
    setAttendance((prevAttendance) => ({
      info: prevAttendance.info.map((player) => ({
        ...player,
        percentage: 100,
      })),
    }))
  }

  // Função para alterar o percentual (apenas visualização)
  const handleAttendanceClick = (playerId: string, value: number) => {
    setAttendance((prevAttendance) => ({
      info: prevAttendance.info.map((player) =>
        player.idDiscord === playerId
          ? { ...player, percentage: value }
          : player
      ),
    }))
  }

  useEffect(() => {
    if (id) {
      fetchAttendanceData()
    }
  }, [id])

  // Contadores de status dos buyers
  const waitingCount = Array.isArray(rows)
    ? rows.filter((buyer) => buyer.status === 'waiting').length
    : 0
  const groupCount = Array.isArray(rows)
    ? rows.filter((buyer) => buyer.status === 'group').length
    : 0

  // --- CHAT WEBSOCKET EFFECT ---
  useEffect(() => {
    if (!id) return

    let reconnectAttempts = 0
    const maxReconnectAttempts = 5
    const reconnectDelay = 2000 // 2 segundos

    const connectWebSocket = () => {
      setChatLoading(true)

      // Fetch previous messages
      getChatMessages(id!)
        .then((messages) => {
          setChatMessages(messages || [])
        })
        .catch((error) => {
          void handleApiError(error, 'Failed to fetch chat messages')
        })
        .finally(() => setChatLoading(false))

      // Fetch raid leaders
      getRun(id!)
        .then((data) => {
          setChatRaidLeaders(data.raidLeaders || [])
        })
        .catch((error) => {
          void handleApiError(error, 'Failed to fetch raid leaders')
        })

      // WebSocket connection
      const apiUrl = import.meta.env.VITE_API_BASE_URL as string
      if (!apiUrl) {
        console.error('VITE_API_BASE_URL not found!')
        return
      }
      const token = localStorage.getItem('jwt')
      if (!token) {
        console.error('Token JWT not found. Is the user logged in?')
        return
      }

      const wsUrl =
        apiUrl.replace(/^http/, 'ws') +
        `/v1/chat?id_run=${id}&authorization=${token}`

      setWsConnected(false) // Reset connection status when attempting to connect
      chatWs.current = new WebSocket(wsUrl)

      chatWs.current.onopen = () => {
        setWsConnected(true)
        reconnectAttempts = 0 // Reset reconnect attempts on successful connection
      }

      chatWs.current.onerror = (err) => {
        console.error('WebSocket Chat Error:', err)
      }

      chatWs.current.onclose = (event) => {
        setWsConnected(false)

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++
          setTimeout(connectWebSocket, reconnectDelay)
        }
      }

      chatWs.current.onmessage = (event) => {
        const data = JSON.parse(event.data)
        switch (data.type) {
          case 'new_message': {
            let newMsg = {
              ...data.payload,
              user_name:
                data.payload.user_name ||
                data.payload.username ||
                'Usuário desconhecido',
            }
            setChatMessages((prev) => {
              const updated = [...prev, newMsg]
              return updated
            })
            // Notificação e contador se não for do usuário logado
            if (String(newMsg.id_discord) !== String(idDiscord)) {
              if (!isChatOpen) {
                setChatUnreadCount((prev) => prev + 1)
              }
              if (
                'Notification' in window &&
                Notification.permission === 'granted'
              ) {
                new Notification('Nova mensagem no Run Chat', {
                  body: `${newMsg.user_name}: ${newMsg.message}`,
                  icon: '/src/assets/logo.ico',
                })
              }
            }
            break
          }
          case 'confirmation':
            break
          case 'error':
            console.error('Error from server:', data.payload)
            break
          default:
            console.warn('Unknown message type:', data.type)
        }
      }
    }

    // Initial connection
    connectWebSocket()

    // Solicita permissão para notificações ao montar
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => {
      setWsConnected(false)
      if (chatWs.current) {
        chatWs.current.close(1000, 'Component unmounting')
      }
    }
  }, [id, idDiscord])

  // Função para enviar mensagem
  const handleSendChatMessage = (msg: string) => {
    if (!msg.trim()) {
      return
    }

    if (!chatWs.current) {
      return
    }

    if (chatWs.current.readyState !== WebSocket.OPEN) {
      return
    }

    const messageData = {
      type: 'send_message',
      payload: { message: msg },
    }

    chatWs.current.send(JSON.stringify(messageData))
  }

  // Função para decriptar idCommunication
  const decryptIdCommunication = (encryptedId: string): string => {
    try {
      const secretKey = import.meta.env.VITE_DECRYPTION_KEY

      if (!secretKey) {
        console.error('VITE_DECRYPTION_KEY não está definida')
        return ''
      }

      // Implementação compatível com Go AES-128-CFB
      try {
        // 1. Criar hash MD5 da chave (igual ao Go)
        const keyHash = CryptoJS.MD5(secretKey)

        // 2. Usar os primeiros 16 bytes como IV (igual ao Go)
        const iv = CryptoJS.lib.WordArray.create(keyHash.words.slice(0, 4))

        // 3. Decriptar usando AES-128-CFB
        const decrypted = CryptoJS.AES.decrypt(encryptedId, keyHash, {
          mode: CryptoJS.mode.CFB,
          padding: CryptoJS.pad.NoPadding,
          iv: iv,
        })

        const result = decrypted.toString(CryptoJS.enc.Utf8)

        if (result) {
          return result
        }
      } catch (error) {
        console.error('Error in AES-128-CFB decryption:', error)
      }

      return ''
    } catch (error) {
      console.error('Error decrypting idCommunication:', error)
      return ''
    }
  }

  // Função para obter o ID do Discord do raid leader
  const getRaidLeaderDiscordId = (raidLeader: RaidLeader): string => {
    if (raidLeader.idDiscord === 'Encrypted') {
      const decryptedId = decryptIdCommunication(raidLeader.idCommunication)
      if (!decryptedId) {
        console.error(
          'Falha ao decriptar ID do raid leader:',
          raidLeader.username
        )
      }
      return decryptedId
    }
    return raidLeader.idDiscord
  }

  // Função para taggear raid leader
  const handleTagRaidLeader = async (message?: ChatMessage) => {
    // Se não foi passada uma mensagem específica, usar a última mensagem do usuário
    let msg = message
    if (!msg) {
      const userMessages = chatMessages.filter(
        (m) => String(m.id_discord) === String(idDiscord)
      )
      msg = userMessages[userMessages.length - 1]
    }

    if (!msg) {
      Swal.fire({
        title: 'Error',
        text: 'No message found to tag.',
        icon: 'error',
        timer: 1500,
        showConfirmButton: false,
      })
      return
    }
    if (!chatRaidLeaders.length) {
      Swal.fire({
        title: 'Error',
        text: 'No raid leader found.',
        icon: 'error',
        timer: 1500,
        showConfirmButton: false,
      })
      return
    }

    // Validar Discord IDs antes de enviar
    const validRaidLeaders = chatRaidLeaders.filter((rl) => {
      const discordId = getRaidLeaderDiscordId(rl)
      if (!discordId) {
        console.error(`Invalid Discord ID for raid leader: ${rl.username}`)
        return false
      }
      return true
    })

    if (validRaidLeaders.length === 0) {
      Swal.fire({
        title: 'Error',
        text: 'No valid raid leaders found.',
        icon: 'error',
        timer: 3000,
        showConfirmButton: false,
      })
      return
    }

    try {
      await Promise.all(
        validRaidLeaders.map((rl) => {
          const discordId = getRaidLeaderDiscordId(rl)
          return sendDiscordMessage(
            discordId,
            `Run Chat Message:\n${msg.user_name}: ${msg.message}\nRun Link: ${window.location.origin}/bookings-na/run/${id}`
          )
        })
      )
      Swal.fire({
        title: 'Success!',
        text: 'Message sent to raid leader.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error) {
      await handleApiError(error, 'Failed to send message to raid leader')
    }
  }

  // Zerar contador de não lidas ao abrir o chat
  useEffect(() => {
    if (isChatOpen) {
      setChatUnreadCount(0)
    }
  }, [isChatOpen])

  function hasPrefeitoTeamAccess(
    runIdTeam: string,
    userRoles: string[]
  ): boolean {
    const isPrefeito = userRoles.includes(import.meta.env.VITE_TEAM_PREFEITO)
    if (!isPrefeito) return false

    // Verifica se o usuário tem o cargo do time específico desta run
    const hasTeamRoleForThisRun = userRoles.includes(runIdTeam)
    if (!hasTeamRoleForThisRun) return false

    return true
  }

  return (
    <>
      <div
        className={`flex min-h-[70vh] w-full flex-col overflow-x-hidden rounded-xl text-gray-100 shadow-2xl ${
          isLoadingRun || !runData ? 'items-center justify-center' : ''
        }`}
      >
        {isLoadingRun ? (
          <RunPageSkeleton />
        ) : (
          <div className='p-4 pb-4'>
            {runData ? (
              <RunInfo
                run={runData}
                onBuyerAddedReload={reloadAllData}
                onRunEdit={fetchRunData}
                attendanceAccessDenied={!hasAttendanceAccess}
                buyers={rows}
              />
            ) : (
              <div>Loading</div>
            )}

            <div className='p-4'>
              {isLoadingBuyers ? (
                <div className='flex min-h-[220px] items-center justify-center'>
                  <LoadingSpinner size='lg' label='Loading buyers' />
                </div>
              ) : (
                <>
                  <div className='mb-4 flex flex-wrap items-center gap-3'>
                    {runData &&
                      (userRoles.includes(import.meta.env.VITE_TEAM_CHEFE) ||
                        hasPrefeitoTeamAccess(runData.idTeam, userRoles)) && (
                        <button
                          onClick={handleOpenInviteBuyersModal}
                          className='inline-flex h-10 min-w-[140px] items-center justify-center gap-2 rounded-md border border-purple-400/40 bg-purple-500/20 px-4 text-sm text-purple-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.22)] transition hover:border-purple-300/55 hover:bg-purple-500/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/45'
                        >
                          <UserPlus size={18} />
                          Invite Buyers
                        </button>
                      )}
                    <button
                      onClick={toggleDetailsVisibility}
                      className={`inline-flex h-10 min-w-[160px] items-center justify-center rounded-md border border-purple-400/40 bg-purple-500/20 px-4 text-sm text-purple-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.22)] transition hover:border-purple-300/55 hover:bg-purple-500/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/45 ${
                        canViewAttendance && hasAttendanceAccess ? 'inline-flex' : 'hidden'
                      }`}
                    >
                      {showDetails ? 'Hide Attendance' : 'Show Attendance'}
                    </button>
                    {/* Informativo de status */}
                    <span className='inline-flex h-10 min-w-[190px] items-center justify-center rounded-md border border-white/15 bg-white/[0.08] px-4 text-sm font-normal text-neutral-200'>
                      Waiting: <span className='ml-1 mr-3 text-yellow-300'>{waitingCount}</span>
                      Group: <span className='ml-1 text-sky-300'>{groupCount}</span>
                    </span>
                  </div>
                  <BuyersDataGrid
                    data={rows}
                    onBuyerStatusEdit={reloadAllData}
                    onBuyerNameNoteEdit={reloadAllData}
                    onDeleteSuccess={reloadAllData}
                    slotAvailable={runData?.slotAvailable ?? 0}
                    runIsLocked={runData?.runIsLocked ?? false}
                    runIdTeam={runData?.idTeam}
                    raidLeaders={runData?.raidLeaders}
                  />
                </>
              )}
            </div>
            {runData && hasAttendanceAccess && showDetails && (
              <div className='mt-8 grid w-full grid-cols-1 gap-4 px-4 xl:grid-cols-2'>
                <Attendance
                  attendance={attendance}
                  markAllAsFull={markAllAsFull}
                  handleAttendanceClick={handleAttendanceClick}
                  onAttendanceUpdate={fetchAttendanceData}
                  runIsLocked={runData?.runIsLocked ?? false}
                  runId={runData.id}
                />
                <Freelancers
                  runId={runData.id}
                  runIsLocked={runData?.runIsLocked ?? false}
                />
              </div>
            )}
          </div>
        )}

        {runData && canViewInviteButton && isInviteBuyersOpen && (
          <InviteBuyers
            onClose={handleCloseInviteBuyersModal}
            runId={runData.id}
          />
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
    </>
  )
}
