import { useState, useCallback } from 'react'
import axios from 'axios'
import { ErrorDetails } from '../../../components/error-display'
import { updateRunAttendance } from '../../../services/api/runs'

interface AttendanceProps {
  attendance: {
    info: Array<{ idDiscord: string; username: string; percentage: number }>
  }
  runId: string | undefined
  markAllAsFull: () => void
  handleAttendanceClick: (playerId: string, value: number) => void
  onAttendanceUpdate: () => void
  runIsLocked: boolean // Added prop
  onError?: (error: ErrorDetails) => void // Callback para passar erro para o componente pai
}

export function Attendance({
  attendance,
  markAllAsFull,
  handleAttendanceClick,
  onAttendanceUpdate,
  runId,
  runIsLocked, // Added prop
  onError, // Added prop
}: AttendanceProps) {
  const ATTENDANCE_GREEN = 'rgba(34,197,94,0.72)'
  const ATTENDANCE_RED = 'rgba(248,113,113,0.72)'
  const ATTENDANCE_YELLOW = 'rgba(252,211,77,0.72)'

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(true) // Default to true for unsaved state

  const getColorForPercentage = useCallback(
    (percentage: number) =>
      percentage === 0
        ? ATTENDANCE_RED
        : percentage === 100
          ? ATTENDANCE_GREEN
          : ATTENDANCE_YELLOW,
    [ATTENDANCE_GREEN, ATTENDANCE_RED, ATTENDANCE_YELLOW]
  )

  const handleAttendanceClickWithChange = useCallback(
    (playerId: string, value: number) => {
      setHasUnsavedChanges(true) // Mark as having unsaved changes
      handleAttendanceClick(playerId, value)
    },
    [handleAttendanceClick]
  )

  const handleAttendanceSave = useCallback(async () => {
    if (!runId) {
      const error = { message: 'Run ID is required', response: null }
      onError?.(error)
      return
    }

    setIsSubmitting(true)

    const payload = attendance.info.map(({ idDiscord, percentage }) => ({
      idDiscord,
      percentage,
    }))

    try {
      await updateRunAttendance(runId, payload)
      await onAttendanceUpdate()
      setIsSuccess(true)
      setHasUnsavedChanges(false) // Reset unsaved changes
      setTimeout(() => setIsSuccess(false), 2000)
    } catch (error) {
      console.error('Error updating attendance:', error)
      const errorDetails = axios.isAxiosError(error)
        ? {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          }
        : { message: 'Unexpected error updating attendance', response: error }

      onError?.(errorDetails)
    } finally {
      setIsSubmitting(false)
    }
  }, [attendance.info, onAttendanceUpdate, runId, onError])

  const handleMarkAllAsFull = useCallback(() => {
    if (runIsLocked) return
    setHasUnsavedChanges(true)
    markAllAsFull()
  }, [markAllAsFull, runIsLocked])

  const handleMarkAllAsZero = useCallback(() => {
    if (runIsLocked) return
    setHasUnsavedChanges(true)
    attendance.info.forEach(({ idDiscord }) =>
      handleAttendanceClickWithChange(idDiscord, 0)
    )
  }, [attendance.info, handleAttendanceClickWithChange, runIsLocked])

  const renderSelect = (idDiscord: string, percentage: number) => (
    <select
      value={percentage}
      onChange={(e) =>
        !runIsLocked &&
        handleAttendanceClickWithChange(idDiscord, Number(e.target.value))
      }
      disabled={runIsLocked}
      className='h-9 rounded-md border border-white/20 px-2 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60'
      style={{ background: getColorForPercentage(percentage) }}
    >
      {[...Array(11)].map((_, i) => {
        const value = i * 10
        return (
          <option key={value} value={value} className='bg-neutral-900 text-white'>
            {value}%
          </option>
        )
      })}
    </select>
  )

  return (
    <div className='w-full'>
      <div className='rounded-xl border border-white/10 bg-black/30 p-3 text-white'>
        <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
          <h3 className='text-sm font-semibold text-neutral-200'>
            Players ({attendance.info.filter(({ percentage }) => percentage > 0).length})
          </h3>
          <div className='flex flex-wrap items-center gap-2'>
            <button
              type='button'
              onClick={handleMarkAllAsFull}
              disabled={runIsLocked}
              className='balance-action-btn balance-action-btn--primary h-8 px-3 text-xs !border-transparent disabled:cursor-not-allowed disabled:opacity-60'
              style={{ background: ATTENDANCE_GREEN }}
            >
              100%
            </button>
            <button
              type='button'
              onClick={handleMarkAllAsZero}
              disabled={runIsLocked}
              className='balance-action-btn balance-action-btn--primary h-8 px-3 text-xs !border-transparent disabled:cursor-not-allowed disabled:opacity-60'
              style={{ background: ATTENDANCE_RED }}
            >
              0%
            </button>
            <button
              type='button'
              onClick={handleAttendanceSave}
              disabled={isSubmitting || runIsLocked}
              className='balance-action-btn balance-action-btn--primary h-8 min-w-[88px] px-3 text-xs !border-transparent disabled:cursor-not-allowed disabled:opacity-60'
              style={{
                background: hasUnsavedChanges
                  ? ATTENDANCE_YELLOW
                  : ATTENDANCE_GREEN,
              }}
            >
              {isSubmitting
                ? 'Saving...'
                : isSuccess
                  ? 'Saved!'
                  : hasUnsavedChanges
                    ? 'Save*'
                    : 'Save'}
            </button>
          </div>
        </div>

        <div className='overflow-hidden rounded-md border border-white/10 bg-white/[0.03]'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-white/10 text-neutral-300'>
                <th className='px-3 py-2 text-left font-semibold'>Players</th>
                <th className='px-3 py-2 text-center font-semibold'>Attendance</th>
              </tr>
            </thead>
            <tbody>
              {attendance.info.map(({ idDiscord, username, percentage }) => (
                <tr key={idDiscord} className='border-b border-white/5 last:border-b-0'>
                  <td className='px-3 py-2 text-left'>{username}</td>
                  <td className='px-3 py-2 text-center'>{renderSelect(idDiscord, percentage)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
