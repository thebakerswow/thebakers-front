import { useState, useCallback } from 'react'
import { Modal as MuiModal, Box } from '@mui/material'
import axios from 'axios'
import { ErrorComponent, ErrorDetails } from './error-display'
import { api } from '../services/axiosConfig'
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

  const getColorForPercentage = useCallback(
    (percentage: number) =>
      percentage === 0 ? '#ef4444' : percentage === 100 ? '#16a34a' : '#fde047',
    []
  )

  const handleAttendanceSave = useCallback(async () => {
    setIsSubmitting(true)
    const payload = attendance.info.map(({ idDiscord, percentage }) => ({
      idDiscord,
      percentage,
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
      onChange={(e) => handleAttendanceClick(idDiscord, Number(e.target.value))}
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
                  Player
                </TableCell>
                <TableCell
                  style={{ textAlign: 'center', backgroundColor: '#ECEBEE' }}
                >
                  Attendance
                  <Button
                    variant='contained'
                    color='success'
                    onClick={markAllAsFull}
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
                    color='success'
                    onClick={handleAttendanceSave}
                    disabled={isSubmitting || isSuccess}
                    style={{
                      marginLeft: '8px',
                      width: '80px',
                      height: '30px',
                      backgroundColor: '#16a34a',
                    }}
                  >
                    {isSubmitting ? 'Saving...' : isSuccess ? 'Saved!' : 'Save'}
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
