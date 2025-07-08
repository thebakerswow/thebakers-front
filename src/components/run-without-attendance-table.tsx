import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
} from '@mui/material'
import { api } from '../services/axiosConfig'

interface RunWithoutAttendance {
  idRun: number
  raid: string
  text: string
  date: string
}

function extractUrl(text: string): string | null {
  const match = text.match(/https?:\/\/\S+/)
  return match ? match[0] : null
}

export default function RunWithoutAttendanceTable() {
  const [runs, setRuns] = useState<RunWithoutAttendance[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRuns = async () => {
      try {
        const response = await api.get('/run-attendance/info')
        setRuns(response.data.info)
        setError(null)
      } catch (err) {
        setError('Failed to fetch runs without attendance.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchRuns()
    const interval = setInterval(fetchRuns, 300000) // 5 minutos
    return () => clearInterval(interval)
  }, [])

  return (
    <div className='mt-4 flex max-h-[300px] flex-col'>
      <div className='top-0 flex justify-center rounded-t-md bg-zinc-400 p-3'>
        <Typography variant='h6' align='center'>
          Runs Without Attendance
        </Typography>
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead style={{ position: 'sticky', top: 0 }}>
            <TableRow>
              <TableCell
                align='center'
                style={{ fontWeight: 'bold', backgroundColor: '#ECEBEE' }}
              >
                Link
              </TableCell>
              <TableCell
                align='center'
                style={{ fontWeight: 'bold', backgroundColor: '#ECEBEE' }}
              >
                Date
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={2} align='center'>
                  <CircularProgress />
                  <Typography>Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={2} align='center'>
                  <Typography color='error'>{error}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              runs?.map((run, index) => {
                const url = extractUrl(run.text)
                return (
                  <TableRow key={index}>
                    <TableCell align='center'>
                      {url ? (
                        <a
                          href={url}
                          target='_blank'
                          rel='noopener noreferrer'
                          style={{
                            color: '#1976d2',
                            textDecoration: 'underline',
                          }}
                        >
                          {url}
                        </a>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell align='center'>{run.date}</TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}
