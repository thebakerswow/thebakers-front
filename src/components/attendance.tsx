import { useState, useCallback } from 'react'
import { Modal as MuiModal, Box } from '@mui/material'
import axios from 'axios'
import { ErrorComponent, ErrorDetails } from './error-display'
import { updateRunAttendance } from '../services/api/runs'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Select,
  MenuItem,
} from '@mui/material'

interface AttendanceProps {
  attendance: {
    info: Array<{ idDiscord: string; username: string; percentage: number }>
  }
  runId: string | undefined
  markAllAsFull: () => void
  handleAttendanceClick: (playerId: string, value: number) => void
  onAttendanceUpdate: () => void
  runIsLocked: boolean // Added prop
}

export function Attendance({
  attendance,
  markAllAsFull,
  handleAttendanceClick,
  onAttendanceUpdate,
  runId,
  runIsLocked, // Added prop
}: AttendanceProps) {
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(true) // Default to true for unsaved state

  const getColorForPercentage = useCallback(
    (percentage: number) =>
      percentage === 0 ? '#ef4444' : percentage === 100 ? '#16a34a' : '#eab308', // Even darker yellow
    []
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
      setError({ message: 'Run ID is required', response: null })
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
      setIsSubmitting(false)
    }
  }, [attendance.info, onAttendanceUpdate, runId])

  if (error) {
    return (
      <MuiModal open={!!error} onClose={() => setError(null)}>
        <Box className='absolute left-1/2 top-1/2 w-96 -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-gray-400 p-4 shadow-lg'>
          <ErrorComponent error={error} onClose={() => setError(null)} />
        </Box>
      </MuiModal>
    )
  }

  const renderSelect = (idDiscord: string, percentage: number) => (
    <Select
      value={percentage}
      onChange={(e) =>
        !runIsLocked &&
        handleAttendanceClickWithChange(idDiscord, Number(e.target.value))
      }
      disabled={runIsLocked} // Disable select when runIsLocked is true
      style={{
        backgroundColor: getColorForPercentage(percentage),
        color: 'white',
        height: '30px',
        fontSize: '14px',
      }}
    >
      {[...Array(11)].map((_, i) => {
        const value = i * 10
        return (
          <MenuItem key={value} value={value}>
            {value}%
          </MenuItem>
        )
      })}
    </Select>
  )

  return (
    <div className='w-[40%]'>
      <div className='flex flex-col items-center'>
        <TableContainer
          style={{
            backgroundColor: 'white',
            overflow: 'hidden', // Alterado para garantir o borderRadius
            borderRadius: '6px',
          }}
        >
          <Table stickyHeader size='small'>
            <TableHead>
              <TableRow
                style={{
                  height: '60px', // Aumenta o tamanho da linha dos headers
                }}
              >
                <TableCell
                  style={{ textAlign: 'center', backgroundColor: '#ECEBEE' }}
                >
                  Players
                  <span
                    style={{
                      marginLeft: '8px',
                      fontWeight: 'bold',
                      color: '#4b5563',
                    }}
                  >
                    (
                    {
                      attendance.info.filter(({ percentage }) => percentage > 0)
                        .length
                    }
                    )
                  </span>
                </TableCell>
                <TableCell
                  style={{ textAlign: 'center', backgroundColor: '#ECEBEE' }}
                >
                  Attendance
                  <Button
                    variant='contained'
                    color='success'
                    onClick={markAllAsFull}
                    disabled={runIsLocked} // Disable button when runIsLocked is true
                    style={{
                      marginLeft: '8px',
                      width: '80px',
                      height: '30px',
                      backgroundColor: '#16a34a',
                    }}
                  >
                    100%
                  </Button>
                  <Button
                    variant='contained'
                    color='error'
                    onClick={() =>
                      attendance.info.forEach(({ idDiscord }) =>
                        handleAttendanceClickWithChange(idDiscord, 0)
                      )
                    }
                    disabled={runIsLocked} // Disable button when runIsLocked is true
                    style={{
                      marginLeft: '8px',
                      width: '80px',
                      height: '30px',
                      backgroundColor: '#ef4444',
                    }}
                  >
                    0%
                  </Button>
                  <Button
                    variant='contained'
                    onClick={handleAttendanceSave}
                    disabled={isSubmitting || runIsLocked} // Disable button when runIsLocked is true
                    style={{
                      marginLeft: '8px',
                      width: '80px',
                      height: '30px',
                      backgroundColor: hasUnsavedChanges
                        ? '#eab308' // Even darker yellow if unsaved changes
                        : '#16a34a',
                    }}
                  >
                    {isSubmitting
                      ? 'Saving...'
                      : isSuccess
                        ? 'Saved!'
                        : hasUnsavedChanges
                          ? 'Save*'
                          : 'Save'}
                  </Button>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendance.info.map(({ idDiscord, username, percentage }) => (
                <TableRow key={idDiscord} hover>
                  <TableCell
                    style={{ textAlign: 'center' }}
                    sx={{ padding: '8px' }}
                  >
                    {username}
                  </TableCell>
                  <TableCell
                    style={{ textAlign: 'center' }}
                    sx={{ padding: '8px' }}
                  >
                    {renderSelect(idDiscord, percentage)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  )
}
