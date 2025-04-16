import { useEffect, useState } from 'react'
import { RunsDataGrid } from './runs-data-grid'
import { DateFilter } from './date-filter'
import { format } from 'date-fns'
import { UserPlus, ClipboardText, UsersFour } from '@phosphor-icons/react'
import { AddRun } from '../../components/add-run'
import { useAuth } from '../../context/auth-context'
import { api } from '../../services/axiosConfig'
import axios from 'axios'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import { RunData } from '../../types/runs-interface'
import Button from '@mui/material/Button'
import {
  Modal as MuiModal,
  Box,
  TextareaAutosize,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import Swal from 'sweetalert2'

export function FullRaidsNa() {
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [rows, setRows] = useState<RunData[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isAddRunOpen, setIsAddRunOpen] = useState(false)
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false)
  const [bulkRunsData, setBulkRunsData] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { userRoles } = useAuth()

  // Verifica se o usuário possui o papel necessário
  const hasRequiredRole = (requiredRoles: string[]) =>
    requiredRoles.some((required) => userRoles.includes(required.toString()))

  // Copia os dados das corridas para a área de transferência
  const copyRunsToClipboard = () => {
    if (rows.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No runs available to copy.',
        confirmButtonColor: '#ef4444',
        timer: 1500,
        showConfirmButton: false,
      })
      return
    }

    const formattedRuns = rows.map((run) => ({
      date: run.date,
      time: run.time,
      raid: run.raid,
      runType: run.runType,
      difficulty: run.difficulty,
      idTeam: run.idTeam,
      maxBuyers: run.maxBuyers.toString(),
      raidLeader:
        run.raidLeaders?.map(
          (leader) => `${leader.idDiscord};${leader.username}`
        ) || [],
      loot: run.loot,
      note: run.note || '',
    }))

    setIsCopying(true)
    navigator.clipboard
      .writeText(JSON.stringify(formattedRuns, null, 2))
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000) // Reset after 2 seconds
      })
      .finally(() => setIsCopying(false))
  }

  // Adiciona múltiplas corridas
  const handleBulkAddRuns = async () => {
    setIsSubmitting(true)
    try {
      const parsedRuns = JSON.parse(bulkRunsData)
      const runsArray = Array.isArray(parsedRuns) ? parsedRuns : [parsedRuns]

      const formattedRuns = runsArray.map((run) => ({
        date: run.date,
        time: run.time,
        raid: run.raid,
        runType: run.runType,
        difficulty: run.difficulty,
        idTeam: run.idTeam,
        maxBuyers: run.maxBuyers.toString(), // Converte para string
        raidLeader: run.raidLeader,
        loot: run.loot,
        note: run.note || '',
      }))

      for (const run of formattedRuns) {
        await api.post(`${import.meta.env.VITE_API_BASE_URL}/run`, run)
      }

      Swal.fire({
        icon: 'success',
        title: 'Runs added successfully!',
        confirmButtonColor: '#22c55e',
        timer: 1500,
        showConfirmButton: false,
      })
      setBulkRunsData('')
      setIsBulkAddOpen(false)
      fetchRuns(true)
    } catch (error) {
      console.error('Error adding runs:', error)
      Swal.fire({
        icon: 'error',
        title: 'Failed to add runs.',
        text: 'Please check the data format.',
        confirmButtonColor: '#ef4444',
        timer: 1500,
        showConfirmButton: false,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseBulkAddDialog = () => {
    setIsBulkAddOpen(false)
    setBulkRunsData('') // Clear the text area when the dialog is closed
  }

  const handleBulkRunsDataChange = (value: string) => {
    if (!selectedDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Please select a date from the filter.',
        confirmButtonColor: '#ef4444',
        timer: 1500,
        showConfirmButton: false,
      })
      return
    }

    try {
      const parsedRuns = JSON.parse(value)
      const runsArray = Array.isArray(parsedRuns) ? parsedRuns : [parsedRuns]

      const updatedRuns = runsArray.map((run) => ({
        ...run,
        date: format(selectedDate, 'yyyy-MM-dd'), // Automatically replace the date with the selected date
      }))

      setBulkRunsData(JSON.stringify(updatedRuns, null, 2))
    } catch (error) {
      setBulkRunsData(value) // Keep the raw input if it's not valid JSON
    }
  }

  // Busca os dados das corridas na API
  const fetchRuns = async (isUserRequest: boolean) => {
    if (isUserRequest && selectedDate) setIsLoading(true)

    try {
      if (!selectedDate) {
        setRows([])
        return
      }

      const { data } = await api.get('/run', {
        params: { date: format(selectedDate, 'yyyy-MM-dd') },
      })
      console.log(data)

      setRows(
        (data.info || [])
          .filter((run: any) => run.team !== 'DTM') // Exclude runs with team 'DTM'
          .map((run: any) => ({
            ...run,
            buyersCount: `${run.maxBuyers - run.slotAvailable}/${run.maxBuyers}`,
          }))
      )
    } catch (error) {
      const errorDetails = axios.isAxiosError(error)
        ? {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          }
        : { message: 'Erro inesperado', response: error }
      console.error('Erro:', errorDetails)
      setError(errorDetails)
    } finally {
      if (isUserRequest) setIsLoading(false)
    }
  }

  const handleEditRunSuccess = () => {
    Swal.fire({
      title: 'Success!',
      text: 'Run edited successfully!',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
    })
  }

  // Busca inicial e configuração de polling
  useEffect(() => {
    fetchRuns(true)

    const interval = setInterval(() => fetchRuns(false), 20000)
    return () => clearInterval(interval)
  }, [selectedDate])

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
    <div className='flex min-h-screen w-full flex-col items-center justify-center'>
      <DateFilter onDaySelect={setSelectedDate} />
      <div
        className='mx-auto mt-6 flex w-[90%] flex-col p-4'
        style={{
          minHeight: '500px',
          height: 'calc(100vh - 200px)', // Ajusta a altura para ocupar o espaço disponível
        }}
      >
        {/* Deve possuir o papel de Chefe de Cozinha para adicionar corridas. */}
        {hasRequiredRole(['1101231955120496650']) && (
          <div className='mb-2 flex gap-2 self-start'>
            <Button
              variant='contained'
              sx={{
                backgroundColor: 'rgb(239, 68, 68)',
                '&:hover': { backgroundColor: 'rgb(248, 113, 113)' },
                padding: '10px 20px',
                boxShadow: 3,
                display: 'flex',
                alignItems: 'center',
              }}
              startIcon={<UserPlus size={18} />}
              onClick={() => setIsAddRunOpen(true)}
            >
              Add Run
            </Button>
            <Button
              variant='contained'
              sx={{
                backgroundColor: 'rgb(239, 68, 68)',
                '&:hover': {
                  backgroundColor: 'rgb(248, 113, 113)',
                },
                padding: '10px 20px',
                boxShadow: 3,
                display: 'flex',
                justify: 'center',
              }}
              startIcon={<ClipboardText size={18} />}
              onClick={copyRunsToClipboard}
            >
              {isCopying ? 'Copying...' : isCopied ? 'Copied!' : 'Copy Runs'}
            </Button>
            <Button
              variant='contained'
              sx={{
                backgroundColor: 'rgb(239, 68, 68)',
                '&:hover': { backgroundColor: 'rgb(248, 113, 113)' },
                padding: '10px 20px',
                boxShadow: 3,
                display: 'flex',
                alignItems: 'center',
              }}
              startIcon={<UsersFour size={18} />}
              onClick={() => setIsBulkAddOpen(true)}
            >
              Add Multiple Runs
            </Button>
          </div>
        )}

        {isBulkAddOpen && (
          <Dialog
            open={isBulkAddOpen}
            onClose={handleCloseBulkAddDialog}
            fullWidth
            maxWidth='md'
          >
            <DialogTitle>Add Multiple Runs</DialogTitle>
            <DialogContent>
              <TextareaAutosize
                minRows={10}
                placeholder='Paste runs data here (JSON format)'
                value={bulkRunsData}
                onChange={(e) => handleBulkRunsDataChange(e.target.value)} // Automatically handle pasted data
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button
                variant='contained'
                sx={{
                  backgroundColor: 'rgb(34, 197, 94)',
                  '&:hover': { backgroundColor: 'rgb(52, 211, 153)' },
                }}
                onClick={handleBulkAddRuns}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Runs'}
              </Button>
              <Button
                variant='outlined'
                sx={{
                  borderColor: 'rgb(239, 68, 68)',
                  color: 'rgb(239, 68, 68)',
                  '&:hover': {
                    borderColor: 'rgb(248, 113, 113)',
                    color: 'rgb(248, 113, 113)',
                  },
                }}
                onClick={handleCloseBulkAddDialog}
              >
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
        )}

        <div className='mb-4 flex flex-1 flex-col'>
          <RunsDataGrid
            data={rows}
            isLoading={isLoading}
            onDeleteSuccess={() => fetchRuns(true)}
            onEditSuccess={handleEditRunSuccess}
          />
        </div>

        {isAddRunOpen && (
          <AddRun
            onClose={() => setIsAddRunOpen(false)}
            onRunAddedReload={() => fetchRuns(true)}
          />
        )}
      </div>
    </div>
  )
}
