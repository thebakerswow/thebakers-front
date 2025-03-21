import { useState, useCallback } from 'react'
import { Modal } from './modal'
import axios from 'axios'
import { ErrorComponent, ErrorDetails } from './error-display'
import { api } from '../services/axiosConfig'
import { Check, CircleNotch } from '@phosphor-icons/react'

interface AttendanceProps {
  attendance: {
    info: Array<{ idDiscord: string; username: string; percentage: number }>
  }
  runId: string | undefined
  markAllAsFull: () => void
  handleAttendanceClick: (playerId: string, value: number) => void
  onAttendanceUpdate: () => void
}

export function Attendance({
  attendance,
  markAllAsFull,
  handleAttendanceClick,
  onAttendanceUpdate,
  runId,
}: AttendanceProps) {
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Função para determinar a cor com base na porcentagem de presença
  const getColorForPercentage = useCallback((percentage: number) => {
    return percentage === 0
      ? 'bg-red-500 text-white' // Vermelho para 0%
      : percentage === 100
        ? 'bg-green-500 text-white' // Verde para 100%
        : 'bg-yellow-500 text-white' // Amarelo para valores intermediários
  }, [])

  // Função para salvar a presença no servidor
  const handleAttendanceSave = useCallback(async () => {
    setIsSubmitting(true) // Inicia o estado de submissão
    const payload = attendance.info.map(({ idDiscord, percentage }) => ({
      idDiscord,
      percentage,
    }))

    try {
      // Envia os dados para a API
      await api.put(
        `${import.meta.env.VITE_API_BASE_URL}/run/${runId}/attendance` ||
          `http://localhost:8000/v1/run/${runId}/attendance`,
        payload
      )
      await onAttendanceUpdate() // Atualiza os dados após salvar
      setIsSuccess(true) // Indica sucesso
      setTimeout(() => setIsSuccess(false), 2000) // Reseta o estado de sucesso após 2 segundos
    } catch (error) {
      // Trata erros da API
      setError(
        axios.isAxiosError(error)
          ? {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status,
            }
          : { message: 'Erro inesperado', response: error }
      )
    } finally {
      setIsSubmitting(false) // Finaliza o estado de submissão
    }
  }, [attendance.info, onAttendanceUpdate, runId])

  // Exibe o modal de erro, se houver
  if (error) {
    return (
      <Modal onClose={() => setError(null)}>
        <ErrorComponent error={error} onClose={() => setError(null)} />
      </Modal>
    )
  }

  // Classes base para botões reutilizáveis
  const baseButtonClasses =
    'rounded border px-2 py-1 text-xs font-semibold text-white transition'

  return (
    <div className='mx-auto mt-2 w-[50%] p-4'>
      <div className='flex flex-col items-center'>
        <table className='w-[80%] border-collapse'>
          <thead className='table-header-group'>
            <tr className='text-md bg-zinc-400 text-gray-700'>
              <th className='border p-2'>Player</th>
              <th className='flex items-center justify-center border p-2'>
                Attendance
                {/* Botão para marcar todos como 100% */}
                <button
                  className={`${baseButtonClasses} ml-2 bg-green-500 hover:bg-green-600`}
                  onClick={markAllAsFull}
                >
                  100%
                </button>
                {/* Botão para salvar a presença */}
                <button
                  onClick={handleAttendanceSave}
                  disabled={isSubmitting || isSuccess}
                  className={`${baseButtonClasses} ml-2 flex items-center gap-2 bg-green-500 hover:bg-green-600 ${
                    isSubmitting || isSuccess ? 'cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <CircleNotch className='h-5 w-5 animate-spin' />
                      Saving...
                    </>
                  ) : isSuccess ? (
                    <>
                      <Check className='h-5 w-5' />
                      Saved!
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className='table-row-group bg-zinc-200 text-sm font-medium text-zinc-900'>
            {attendance.info.map(({ idDiscord, username, percentage }) => (
              <tr key={idDiscord} className='border border-gray-300'>
                <td className='p-2 text-center'>{username}</td>
                <td className='p-2 text-center'>
                  <div className='flex justify-center gap-2 px-2'>
                    {/* Dropdown para selecionar a porcentagem de presença */}
                    <select
                      value={percentage}
                      onChange={(e) =>
                        handleAttendanceClick(idDiscord, Number(e.target.value))
                      }
                      className={`rounded border px-2 py-1 text-xs transition-colors ${getColorForPercentage(
                        percentage
                      )}`}
                    >
                      {/* Opções de 0% a 100% */}
                      {[...Array(11)].map((_, i) => {
                        const value = i * 10
                        return (
                          <option
                            key={value}
                            value={value}
                            className='bg-white text-zinc-900'
                          >
                            {value}%
                          </option>
                        )
                      })}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
