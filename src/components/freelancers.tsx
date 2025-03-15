import { useState } from 'react'
import { Modal } from './modal'
import axios from 'axios'
import { ErrorComponent, ErrorDetails } from './error-display'
import { api } from '../services/axiosConfig'
import { Check, CircleNotch, Trash } from '@phosphor-icons/react'

interface AttendanceProps {
  attendance: {
    info: Array<{ idDiscord: string; username: string; percentage: number }>
  }
  runId: string | undefined
  markAllAsFull: () => void
  handleAttendanceClick: (playerId: string, value: number) => void
  onAttendanceUpdate: () => void
}

export function Freelancers({
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
    <div className='w-[50%] mx-auto mt-2 p-4'>
      <div className='  flex flex-col items-center'>
        <div className='flex gap-2 mb-2 w-[80%]'>
          <input
            className='p-1 rounded-md text-black'
            type='text'
            placeholder='Player'
          />
          <button className='bg-red-400 p-1 px-2 rounded-md'>ADD</button>
        </div>
        <table className='w-[80%] border-collapse'>
          <thead className='table-header-group'>
            <tr className='text-md bg-zinc-400 text-gray-700'>
              <th className='p-2 border'>Freelancer</th>
              <th className='p-2 border flex items-center justify-center'>
                Attendance
                <button
                  className='ml-2 px-2 py-1 text-xs font-semibold border rounded bg-green-500 text-white hover:bg-green-600 transition'
                  onClick={markAllAsFull}
                >
                  100%
                </button>
              </th>
              <th className='p-2 border'>Delete</th>
            </tr>
          </thead>
          <tbody className='table-row-group text-sm font-medium text-zinc-900 bg-zinc-200'>
            {attendance.info.map((player) => (
              <tr key={player.idDiscord} className='border border-gray-300'>
                <td className='p-2 text-center'>{player.username}</td>
                <td className='p-2 text-center'>
                  <div className='flex gap-2 px-2 justify-center'>
                    <select
                      value={player.percentage}
                      onChange={(e) =>
                        handleAttendanceClick(
                          player.idDiscord,
                          Number(e.target.value)
                        )
                      }
                      className={`px-2 py-1 text-xs border rounded transition-colors ${getColorForPercentage(
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
                <td className='p-2 text-center'>
                  <button>
                    <Trash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className='flex justify-center items-center mt-4 w-[50%]'>
          <button
            onClick={handleAttendanceSave}
            disabled={isSubmitting || isSuccess}
            className={`px-4 py-2 bg-green-500 hover:bg-green-600 transition-all text-white rounded flex items-center justify-center gap-2 ${
              isSubmitting || isSuccess ? 'cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <CircleNotch className='animate-spin h-5 w-5' />
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
        </div>
      </div>
    </div>
  )
}
