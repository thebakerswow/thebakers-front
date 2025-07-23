import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Autocomplete,
  TextField,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Select,
  MenuItem,
} from '@mui/material'
import { getPlayers } from '../services/api/users'
import { getTransactionLogs } from '../services/api/balance'
import { ErrorComponent, ErrorDetails } from './error-display'
import { Modal as MuiModal, Box } from '@mui/material'

export function TransactionExtract() {
  const [players, setPlayers] = useState<
    { idDiscord: string; username: string }[]
  >([])
  const [isLoading, setIsLoading] = useState(false)
  // Removed unused error state
  const [selectedPlayer, setSelectedPlayer] = useState('')
  const today = new Date().toISOString().split('T')[0] // Get today's date in YYYY-MM-DD format
  const [initialDate, setInitialDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [isDolar, setIsDolar] = useState(false)

  useEffect(() => {
    const fetchPlayers = async () => {
      setIsLoading(true)
      try {
        const response = await getPlayers()
        if (!response) {
          throw new Error('No players found')
        }
        setPlayers(response) // Ensure response is an array of objects
      } catch (error) {
        console.error('Error fetching players:', error)
        console.error(
          axios.isAxiosError(error)
            ? {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
              }
            : { message: 'Unexpected error', response: error }
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlayers()
  }, [])

  const fetchLogs = async () => {
    if (!selectedPlayer || !initialDate || !endDate) return
    setIsLoading(true)
    try {
      const response = await getTransactionLogs({
        initial_date: initialDate,
        end_date: endDate,
        impacted: selectedPlayer,
        is_dolar: isDolar,
      })
      type LogInfo = {
        name_impacted: string
        value: string
        made_by: string
        date: string
      }

      const logsData = Array.isArray(response)
        ? response.map((log: LogInfo) => ({
            player: log.name_impacted || 'N/A',
            action: log.value || 'N/A',
            author: log.made_by || 'N/A',
            date: log.date || 'N/A',
          }))
        : []
      setLogs(logsData) // Ensure logsData is always an array
    } catch (error) {
      console.error('Error fetching logs:', error)
      setError(
        axios.isAxiosError(error)
          ? {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status,
            }
          : { message: 'Unexpected error', response: error }
      )
    } finally {
      setIsLoading(false)
    }
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
    <div>
      <div className='mb-4 mt-2 flex items-end gap-4'>
        <FormControl className='flex-1'>
          <Autocomplete
            options={players}
            getOptionLabel={(option) => option.username}
            renderInput={(params) => (
              <TextField {...params} label='Select Player' variant='outlined' />
            )}
            value={
              players.find((player) => player.idDiscord === selectedPlayer) ||
              null
            }
            onChange={(_, newValue) =>
              setSelectedPlayer(newValue?.idDiscord || '')
            }
          />
        </FormControl>
        <FormControl className='flex-1'>
          <TextField
            label='Initial Date'
            type='date'
            slotProps={{ inputLabel: { shrink: true } }}
            value={initialDate}
            onChange={(e) => setInitialDate(e.target.value)}
          />
        </FormControl>
        <FormControl className='flex-1'>
          <TextField
            label='End Date'
            type='date'
            slotProps={{ inputLabel: { shrink: true } }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </FormControl>
        <FormControl className='flex-1'>
          <Select
            value={isDolar ? 'dolar' : 'gold'}
            onChange={(e) => setIsDolar(e.target.value === 'dolar')}
            displayEmpty
          >
            <MenuItem value='gold'>Gold</MenuItem>
            <MenuItem value='dolar'>Dolar</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant='contained'
          onClick={fetchLogs}
          disabled={!selectedPlayer || !initialDate || !endDate || isLoading}
          sx={{
            backgroundColor: 'rgb(147, 51, 234)',
            '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
            height: '56px', // Match the height of the selects
          }}
        >
          Fetch Extract
        </Button>
      </div>
      <TableContainer
        component={Paper}
        className='overflow-x-auto'
        sx={{ maxHeight: 400 }} // Define a maximum height for vertical scrolling
      >
        <Table stickyHeader className='w-full table-auto'>
          <TableHead>
            <TableRow>
              <TableCell>Player</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Made By</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <TableRow key={index}>
                  <TableCell>{log.player}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.author}</TableCell>
                  <TableCell>{log.date}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align='center'>
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}
