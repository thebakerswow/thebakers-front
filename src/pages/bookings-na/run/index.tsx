import { useEffect, useState } from 'react'
import { RunInfo } from './run-info'
import { BuyersDataGrid } from './buyers-data-grid'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { UserPlus } from '@phosphor-icons/react'
import { InviteBuyers } from '../../../components/invite-buyers'
import { LoadingSpinner } from '../../../components/loading-spinner'
import { api } from '../../../services/axiosConfig'
import { ErrorComponent, ErrorDetails } from '../../../components/error-display'
import { RunData } from '../../../types/runs-interface'
import { Modal } from '../../../components/modal'
import { BuyerData } from '../../../types/buyer-interface'
import { Attendance } from '../../../components/attendance'
import { useAuth } from '../../../context/auth-context'
import { Freelancers } from '../../../components/freelancers'

export function RunDetails() {
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
  const { userRoles } = useAuth()

  const restrictedRole = '1284914400297226313'

  const isRestrictedUser =
    userRoles.includes(restrictedRole) && userRoles.length === 1

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
      const response = await api.get(
        `${import.meta.env.VITE_API_BASE_URL}/run/${id}` ||
          `http://localhost:8000/v1/run/${id}`
      )
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
      const response = await api.get(
        `${import.meta.env.VITE_API_BASE_URL}/run/${id}/buyers` ||
          `http://localhost:8000/v1/run/${id}/buyers`
      )

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

  useEffect(() => {
    if (!id) return

    fetchBuyersData()
    fetchRunData()

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
      const response = await api.get(
        `${import.meta.env.VITE_API_BASE_URL}/run/${id}/attendance` ||
          `http://localhost:8000/v1/run/${id}/attendance`
      )
      const data = response.data.info

      setAttendance({ info: data })
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

  if (error) {
    return (
      <Modal onClose={() => setError(null)}>
        <ErrorComponent error={error} onClose={() => setError(null)} />
      </Modal>
    )
  }

  return (
    <div
      className={`absolute inset-0 m-8 flex flex-col overflow-y-auto rounded-xl bg-zinc-700 text-gray-100 shadow-2xl scrollbar-thin ${
        isLoadingRun || !runData ? 'items-center justify-center' : ''
      }`}
    >
      {isLoadingRun ? (
        <div className='flex flex-col items-center'>
          <LoadingSpinner />
        </div>
      ) : (
        <div>
          {runData ? (
            <RunInfo
              run={runData}
              onBuyerAddedReload={reloadAllData}
              onRunEdit={fetchRunData}
            />
          ) : (
            <div>Loading</div>
          )}

          <div className='mx-auto mt-2 w-[95%] p-4'>
            {isLoadingBuyers ? (
              <div className='mt-40 flex flex-col items-center'>
                <LoadingSpinner />
              </div>
            ) : (
              <div>
                <button
                  onClick={handleOpenInviteBuyersModal}
                  className='mb-2 flex items-center gap-2 rounded-md bg-red-400 p-2 text-gray-100 hover:bg-red-500'
                >
                  <UserPlus size={18} />
                  Invite Buyers
                </button>
                <BuyersDataGrid
                  data={rows}
                  onBuyerStatusEdit={reloadAllData}
                  onBuyerNameNoteEdit={reloadAllData}
                  onDeleteSuccess={reloadAllData}
                />
              </div>
            )}
          </div>
          {runData && (
            <div className='flex'>
              <Attendance
                attendance={attendance}
                markAllAsFull={markAllAsFull}
                handleAttendanceClick={handleAttendanceClick}
                onAttendanceUpdate={fetchAttendanceData}
                runId={runData.id}
              />
              <Freelancers runId={runData.id} />
            </div>
          )}
        </div>
      )}
      {isInviteBuyersOpen && runData && !isRestrictedUser && (
        <InviteBuyers
          onClose={handleCloseInviteBuyersModal}
          runId={runData.id}
        />
      )}
    </div>
  )
}
