import { useEffect, useState, useRef } from 'react'
import { RunInfo } from './run-info'
import { BuyersDataGrid } from './buyers-data-grid'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { UserPlus } from '@phosphor-icons/react'
import { InviteBuyers } from '../../../components/invite-buyers'
import { LoadingSpinner } from '../../../components/loading-spinner'
import { api } from '../../../services/axiosConfig'
import { ErrorComponent, ErrorDetails } from '../../../components/error-display'
import { RunData } from '../../../types/runs-interface'
import { Modal as MuiModal, Box } from '@mui/material'
import { BuyerData } from '../../../types/buyer-interface'
import { Attendance } from '../../../components/attendance'
import { useAuth } from '../../../context/auth-context'
import { Freelancers } from '../../../components/freelancers'
import { Button } from '@mui/material'
import { RunChat } from '../../../components/run-chat'
import Swal from 'sweetalert2'
import CryptoJS from 'crypto-js'

// ChatMessage interface igual ao run-chat.tsx
interface ChatMessage {
  id?: string | number
  user_name: string
  id_discord: string
  message: string
  created_at: string
}

// Nova interface para raid leaders
interface RaidLeader {
  idCommunication: string
  idDiscord: string
  username: string
}

export function RunDetails() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [runData, setRunData] = useState<RunData | undefined>(undefined)
  const [isLoadingRun, setIsLoadingRun] = useState(true)
  const [isLoadingBuyers, setIsLoadingBuyers] = useState(true)
  const [rows, setRows] = useState<BuyerData[]>([])
  const [isInviteBuyersOpen, setIsInviteBuyersOpen] = useState(false)
  const [attendance, setAttendance] = useState<{
    info: Array<{ idDiscord: string; username: string; percentage: number }>
  }>({ info: [] })
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [isActive, setIsActive] = useState(true)
  const [hasAttendanceAccess, setHasAttendanceAccess] = useState(true)
  const { userRoles, idDiscord } = useAuth()
  const [showDetails, setShowDetails] = useState(false)
  // --- CHAT STATES ---
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatLoading, setChatLoading] = useState(false)
  const [chatUnreadCount, setChatUnreadCount] = useState(0)

  const [chatRaidLeaders, setChatRaidLeaders] = useState<RaidLeader[]>([])
  const chatWs = useRef<WebSocket | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)

  const allowedRoles = [
    import.meta.env.VITE_TEAM_CHEFE,
    import.meta.env.VITE_TEAM_PREFEITO,
  ]
  const canViewInviteButton = userRoles.some((role) =>
    allowedRoles.includes(role)
  )
  const canViewAttendanceButton =
    userRoles.length !== 1 ||
    !userRoles.includes(import.meta.env.VITE_TEAM_ADVERTISER)

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
    try {
      const response = await api.get(`/run/${id}`)
      const data = response.data.info
      setRunData({
        ...data,
        slotAvailable: Number(data.slotAvailable),
        maxBuyers: Number(data.maxBuyers),
      })
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorDetails = {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        }
        setError(errorDetails)
      } else {
        setError({
          message: 'Erro inesperado',
          response: error,
        })
      }
    } finally {
      setIsLoadingRun(false)
    }
  }

  // Função para buscar os dados dos buyers
  async function fetchBuyersData() {
    try {
      setIsLoadingBuyers(false)
      const response = await api.get(`/run/${id}/buyers`)

      setRows(response.data.info)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorDetails = {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        }
        setError(errorDetails)
      } else {
        setError({
          message: 'Erro inesperado',
          response: error,
        })
      }
    } finally {
      setIsLoadingBuyers(false)
    }
  }

  // Função para verificar acesso à run
  async function checkRunAccess() {
    try {
      const response = await api.get(`/access/run/${id}`)
      if (!response.data.info) {
        navigate('/check-access') // Redireciona para a home se o acesso for negado
      }
    } catch (error) {
      navigate('/') // Redireciona para a home em caso de erro
    }
  }

  useEffect(() => {
    if (!id) return

    // Verifica acesso antes de buscar dados
    checkRunAccess().then(() => {
      fetchBuyersData()
      fetchRunData()
    })

    // Função para resetar o temporizador
    const resetActivityTimer = () => {
      setIsActive(true)
      clearTimeout(inactivityTimeout)
      inactivityTimeout = setTimeout(() => {
        setIsActive(false)
      }, 5000)
    }

    // Função para monitorar a visibilidade da página
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsActive(false)
      } else {
        setIsActive(true)
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

    // Intervalo para fetchBuyersData (2 segundos)
    const buyersInterval = setInterval(() => {
      if (isActive) {
        fetchBuyersData()
      }
    }, 2000)

    // Intervalo para fetchRunData (por exemplo, 10 segundos)
    const runInterval = setInterval(() => {
      if (isActive) {
        fetchRunData()
      }
    }, 10000)

    return () => {
      clearInterval(buyersInterval)
      clearInterval(runInterval)
      clearTimeout(inactivityTimeout)
      window.removeEventListener('mousemove', handleMouseOrKeyActivity)
      window.removeEventListener('keydown', handleMouseOrKeyActivity)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [id, isActive]) // Adicione isActive às dependências

  // Função para buscar os dados de atendimento
  async function fetchAttendanceData() {
    try {
      const response = await api.get(`/run/${id}/attendance`)
      const data = response.data.info

      setAttendance({ info: data })
      setHasAttendanceAccess(true)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          setHasAttendanceAccess(false)
        } else {
          const errorDetails = {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          }
          setError(errorDetails)
        }
      } else {
        setError({
          message: 'Erro inesperado',
          response: error,
        })
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
      fetchRunData()
      fetchBuyersData()
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
    setChatLoading(true)
    // Fetch previous messages
    api
      .get(`/chat/${id}`)
      .then((response) => {
        setChatMessages(response.data.info || [])
      })
      .catch((error) => {
        console.error('Falha ao buscar mensagens anteriores:', error)
      })
      .finally(() => setChatLoading(false))

    // Fetch raid leaders
    api
      .get(`/run/${id}`)
      .then((response) => {
        setChatRaidLeaders(response.data.info.raidLeaders || [])
      })
      .catch((error) => {
        console.error('Error fetching raid leaders:', error)
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
    chatWs.current = new WebSocket(wsUrl)

    chatWs.current.onerror = (err) =>
      console.error('WebSocket Chat Error:', err)
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
          setChatMessages((prev) => [...prev, newMsg])
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
          console.error('Erro do Servidor:', data.payload)
          break
        default:
          console.warn('Tipo de mensagem desconhecido:', data.type)
      }
    }
    // Solicita permissão para notificações ao montar
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    return () => {
      chatWs.current?.close()
    }
  }, [id, idDiscord])

  // Função para enviar mensagem
  const handleSendChatMessage = (msg: string) => {
    if (msg.trim() && chatWs.current?.readyState === WebSocket.OPEN) {
      chatWs.current.send(
        JSON.stringify({
          type: 'send_message',
          payload: { message: msg },
        })
      )
    }
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
        console.error('Erro na decriptação AES-128-CFB:', error)
      }

      return ''
    } catch (error) {
      console.error('Erro ao decriptar idCommunication:', error)
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
          return api.post('/discord/send_message', {
            id_discord_recipient: discordId,
            message: `Run Chat Message:\n${msg.user_name}: ${msg.message}\nRun Link: ${window.location.origin}/bookings-na/run/${id}`,
          })
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
      console.error('Error sending message to raid leader:', error)
      Swal.fire({
        title: 'Error',
        text: 'Failed to send message to raid leader.',
        icon: 'error',
        timer: 1500,
        showConfirmButton: false,
      })
    }
  }

  // Zerar contador de não lidas ao abrir o chat
  useEffect(() => {
    if (isChatOpen) {
      setChatUnreadCount(0)
    }
  }, [isChatOpen])

  // Adicionar o mesmo mapeamento e função utilitária já usada em run-info.tsx
  const TEAM_ROLE_IDS = [
    import.meta.env.VITE_TEAM_PADEIRINHO,
    import.meta.env.VITE_TEAM_GARCOM,
    import.meta.env.VITE_TEAM_CONFEITEIROS,
    import.meta.env.VITE_TEAM_JACKFRUIT,
    import.meta.env.VITE_TEAM_MILHARAL,
    import.meta.env.VITE_TEAM_RAIO,
    import.meta.env.VITE_TEAM_APAE,
    import.meta.env.VITE_TEAM_DTM,
    import.meta.env.VITE_TEAM_KFFC,
    import.meta.env.VITE_TEAM_SAPOCULEANO,
    import.meta.env.VITE_TEAM_GREENSKY,
    import.meta.env.VITE_TEAM_GUILD_AZRALON_1,
    import.meta.env.VITE_TEAM_GUILD_AZRALON_2,
    import.meta.env.VITE_TEAM_ROCKET,
  ]
  function hasPrefeitoTeamAccess(
    runIdTeam: string,
    userRoles: string[]
  ): boolean {
    const isPrefeito = userRoles.includes(import.meta.env.VITE_TEAM_PREFEITO)
    if (!isPrefeito) return false
    const userTeamRole = TEAM_ROLE_IDS.find((teamId) =>
      userRoles.includes(teamId)
    )
    if (!userTeamRole) return false
    return runIdTeam === userTeamRole
  }

  if (error) {
    return (
      <MuiModal open={!!error} onClose={() => setError(null)}>
        <Box className='absolute left-1/2 top-1/2 w-96 -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-gray-400 p-4 shadow-lg'>
          <ErrorComponent error={error} onClose={() => setError(null)} />
        </Box>
      </MuiModal>
    )
  }

  return (
    <div
      className={`flex min-h-screen w-full flex-col rounded-xl text-gray-100 shadow-2xl ${
        isLoadingRun || !runData ? 'items-center justify-center' : ''
      }`}
    >
      {isLoadingRun ? (
        <div className='flex flex-col items-center'>
          <LoadingSpinner />
        </div>
      ) : (
        <div className='mx-2 p-4'>
          {runData ? (
            <RunInfo
              run={runData}
              onBuyerAddedReload={reloadAllData}
              onRunEdit={fetchRunData}
              attendanceAccessDenied={!hasAttendanceAccess}
            />
          ) : (
            <div>Loading</div>
          )}

          <div className='p-4'>
            {isLoadingBuyers ? (
              <div className='mt-40 flex flex-col items-center'>
                <LoadingSpinner />
              </div>
            ) : (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  {runData &&
                    (userRoles.includes(import.meta.env.VITE_TEAM_CHEFE) ||
                      hasPrefeitoTeamAccess(runData.idTeam, userRoles)) && (
                      <Button
                        onClick={handleOpenInviteBuyersModal}
                        variant='contained'
                        startIcon={<UserPlus size={18} />}
                        sx={{
                          backgroundColor: 'rgb(239, 68, 68)',
                          '&:hover': { backgroundColor: 'rgb(248, 113, 113)' },
                          minWidth: 140,
                          fontWeight: 500,
                          boxShadow: 'none',
                        }}
                      >
                        Invite Buyers
                      </Button>
                    )}
                  <Button
                    onClick={toggleDetailsVisibility}
                    variant='contained'
                    sx={{
                      backgroundColor: 'rgb(239, 68, 68)',
                      '&:hover': { backgroundColor: 'rgb(248, 113, 113)' },
                      minWidth: 160,
                      fontWeight: 500,
                      boxShadow: 'none',
                    }}
                    style={{
                      display:
                        canViewAttendanceButton && hasAttendanceAccess
                          ? 'inline-flex'
                          : 'none',
                    }}
                  >
                    {showDetails ? 'Hide Attendance' : 'Show Attendance'}
                  </Button>
                  {/* Informativo de status */}
                  <span className='rounded-md bg-gray-300 px-4 py-1 text-gray-800'>
                    Waiting: {waitingCount} | Group: {groupCount}
                  </span>
                </div>
                <BuyersDataGrid
                  data={rows}
                  onBuyerStatusEdit={reloadAllData}
                  onBuyerNameNoteEdit={reloadAllData}
                  onDeleteSuccess={reloadAllData}
                  runIsLocked={runData?.runIsLocked ?? false}
                  runIdTeam={runData?.idTeam}
                />
              </div>
            )}
          </div>
          {runData && hasAttendanceAccess && showDetails && (
            <div className='mx-4 mt-8 flex justify-center gap-40'>
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
          inputDisabled={chatWs.current?.readyState !== WebSocket.OPEN}
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
