import { useState } from 'react'
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

  const getColorForPercentage = (percentage: number) => {
    if (percentage === 0) return 'bg-red-500 text-white'
    if (percentage === 100) return 'bg-green-500 text-white'
    return 'bg-yellow-500 text-white'
  }

  const handleAttendanceSave = async () => {
    setIsSubmitting(true)

    const payload = attendance.info.map((player) => ({
      idDiscord: player.idDiscord,
      percentage: player.percentage,
    }))

    try {
      await api.put(
        `${import.meta.env.VITE_API_BASE_URL}/run/${runId}/attendance` ||
          `http://localhost:8000/v1/run/${runId}/attendance`,
        payload
      )

      await onAttendanceUpdate()
      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 2000)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError({
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        })
      } else {
        setError({ message: 'Erro inesperado', response: error })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (error) {
    return (
      <Modal onClose={() => setError(null)}>
        <ErrorComponent error={error} onClose={() => setError(null)} />
      </Modal>
    )
  }

  return (
    <div className='mx-auto mt-2 w-[50%] p-4'>
      <div className='flex flex-col items-center'>
        <table className='w-[80%] border-collapse'>
          <thead className='table-header-group'>
            <tr className='text-md bg-zinc-400 text-gray-700'>
              <th className='border p-2'>Player</th>
              <th className='flex items-center justify-center border p-2'>
                Attendance
                <button
                  className='ml-2 rounded border bg-green-500 px-2 py-1 text-xs font-semibold text-white transition hover:bg-green-600'
                  onClick={markAllAsFull}
                >
                  100%
                </button>
                <button
                  onClick={handleAttendanceSave}
                  disabled={isSubmitting || isSuccess}
                  className={`ml-2 flex items-center gap-2 rounded border bg-green-500 px-2 py-1 text-xs font-semibold text-white hover:bg-green-600 transition${
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
            {attendance.info.map((player) => (
              <tr key={player.idDiscord} className='border border-gray-300'>
                <td className='p-2 text-center'>{player.username}</td>
                <td className='p-2 text-center'>
                  <div className='flex justify-center gap-2 px-2'>
                    <select
                      value={player.percentage}
                      onChange={(e) =>
                        handleAttendanceClick(
                          player.idDiscord,
                          Number(e.target.value)
                        )
                      }
                      className={`rounded border px-2 py-1 text-xs transition-colors ${getColorForPercentage(
                        player.percentage
                      )}`}
                    >
                      {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(
                        (value) => (
                          <option
                            key={value}
                            value={value}
                            className='bg-white text-zinc-900'
                          >
                            {value}%
                          </option>
                        )
                      )}
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
