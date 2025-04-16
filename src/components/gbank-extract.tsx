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
} from '@mui/material'
import { api } from '../services/axiosConfig'
import { ErrorComponent, ErrorDetails } from './error-display'
import { Modal as MuiModal, Box } from '@mui/material'

export function GbankExtract() {
  const [gbanks, setGbanks] = useState<{ id: string; name: string }[]>([])
  const [selectedGbank, setSelectedGbank] = useState('') // State for selected Gbank
  const [isLoading, setIsLoading] = useState(false)
  const today = new Date().toISOString().split('T')[0] // Get today's date in YYYY-MM-DD format
  const [initialDate, setInitialDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    const fetchGbanks = async () => {
      try {
        const response = await api.get(
          `${import.meta.env.VITE_API_BASE_URL}/gbanks`
        )
        if (!response.data.info) {
          throw new Error('No gbanks found')
        }
        setGbanks(response.data.info) // Ensure response.data.info is an array of objects
      } catch (error) {
        console.error('Error fetching gbanks:', error)
      }
    }
    fetchGbanks() // Fetch gbanks on component mount
  }, [])

  const fetchLogs = async () => {
    if (!initialDate || !endDate || !selectedGbank) return
    setIsLoading(true)
    try {
      const response = await api.get(
        `${import.meta.env.VITE_API_BASE_URL}/gbanks/logs`,
        {
          params: {
            initial_date: initialDate,
            end_date: endDate,
            impacted: selectedGbank, // Send the name of the selected Gbank
          },
        }
      )
      type LogInfo = {
        name_impacted: string
        value: string
        made_by: string
        date: string // Added date field
      }

      const logsData = Array.isArray(response.data.info)
        ? response.data.info.map((log: LogInfo) => ({
            player: log.name_impacted || 'N/A',
            action: log.value || 'N/A',
            author: log.made_by || 'N/A',
            date: log.date || 'N/A', // Map date field
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
            options={gbanks} // Populate with gbanks
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
              <TextField {...params} label='Select Gbank' variant='outlined' />
            )}
            value={gbanks.find((gbank) => gbank.name === selectedGbank) || null}
            onChange={(_, newValue) => setSelectedGbank(newValue?.name || '')} // Update selected Gbank
          />
        </FormControl>
        <FormControl className='flex-1'>
          <TextField
            label='Initial Date'
            type='date'
            slotProps={{ inputLabel: { shrink: true } }} // Updated to use slotProps.inputLabel
            value={initialDate}
            onChange={(e) => setInitialDate(e.target.value)}
          />
        </FormControl>
        <FormControl className='flex-1'>
          <TextField
            label='End Date'
            type='date'
            slotProps={{ inputLabel: { shrink: true } }} // Updated to use slotProps.inputLabel
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </FormControl>
        <Button
          variant='contained'
          onClick={fetchLogs}
          disabled={!initialDate || !endDate || !selectedGbank || isLoading}
          sx={{
            backgroundColor: 'rgb(239, 68, 68)',
            '&:hover': { backgroundColor: 'rgb(248, 113, 113)' },
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
              <TableCell>G-Bank</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Made By</TableCell>
              <TableCell>Date</TableCell> {/* Added Date column */}
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <TableRow key={index}>
                  <TableCell>{log.player}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.author}</TableCell>
                  <TableCell>{log.date}</TableCell> {/* Display Date */}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align='center'> {/* Updated colspan */}
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
