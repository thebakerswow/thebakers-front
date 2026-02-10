import { useEffect, useState } from 'react'
import { RunsDataGrid } from './runs-data-grid'
import { DateFilter } from '../../components/date-filter'
import { format } from 'date-fns'
import { UserPlus, ClipboardText, UsersFour } from '@phosphor-icons/react'
import { AddRun } from '../../components/add-run'
import { useAuth } from '../../context/auth-context'
import { getRuns, createRun } from '../../services/api/runs'
import axios from 'axios'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import { RunData } from '../../types/runs-interface'
import Button from '@mui/material/Button'
import {
  TextareaAutosize,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
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
  const [selectedTeam, setSelectedTeam] = useState<string>('All')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All')
  const [selectedLoot, setSelectedLoot] = useState<string>('All')
  const [selectedRunType, setSelectedRunType] = useState<string>('All')
  const { userRoles } = useAuth()

  // Verifica se o usuário possui o papel necessário
  const hasRequiredRole = (requiredRoles: string[]) =>
    requiredRoles.some((required) => userRoles.includes(required.toString()))

  const handleError = (error: ErrorDetails | null) => {
    setError(error)
  }

  // Copia os dados das corridas para a área de transferência
  const copyRunsToClipboard = () => {
    if (filteredRows.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No runs available to copy.',
        confirmButtonColor: '#ef4444',
        timer: 1500,
        showConfirmButton: false,
      })
      return
    }

    const formattedRuns = filteredRows.map((run) => ({
      name: run.name,
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
      quantityBoss: run.quantityBoss,
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
        quantityBoss: run.quantityBoss,
        note: run.note || '',
      }))

      for (const run of formattedRuns) {
        await createRun(run)
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

      const data = await getRuns(format(selectedDate, 'yyyy-MM-dd'))

      setRows(
        (data || []).map((run: any) => ({
          ...run,
          buyersCount: `${run.maxBuyers - run.slotAvailable}/${run.maxBuyers}`,
        }))
      )
      setError(null) // Clear any previous errors
    } catch (error) {
      const errorDetails = axios.isAxiosError(error)
        ? {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          }
        : { message: 'Unexpected error', response: error }
      console.error('Error:', errorDetails)
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

  // Filtra os dados baseado nos filtros selecionados
  const filteredRows = rows.filter((run) => {
    // Sempre exclui runs com runType = 'Remix'
    if (run.runType === 'Remix') {
      return false
    }
    const teamMatch = selectedTeam === 'All' || run.team === selectedTeam
    const difficultyMatch =
      selectedDifficulty === 'All' || run.difficulty === selectedDifficulty
    const lootMatch = selectedLoot === 'All' || run.loot === selectedLoot
    const runTypeMatch = selectedRunType === 'All' || run.runType === selectedRunType
    return teamMatch && difficultyMatch && lootMatch && runTypeMatch
  })

  // Busca inicial e configuração de polling
  useEffect(() => {
    fetchRuns(true)

    const interval = setInterval(() => fetchRuns(false), 20000)
    return () => clearInterval(interval)
  }, [selectedDate])

  return (
    <div className='flex min-h-screen w-full flex-col items-center overflow-auto pb-20'>
      {error && <ErrorComponent error={error} onClose={() => setError(null)} />}
      <DateFilter onDaySelect={setSelectedDate} />

      <div className='mx-auto mt-6 flex w-[90%] flex-col p-4'>
        {/* Linha com botões e filtros */}
        <div className='mb-2 flex flex-wrap items-end justify-between gap-4'>
          {/* Botões à esquerda */}
          {hasRequiredRole([import.meta.env.VITE_TEAM_CHEFE]) && (
            <div className='flex gap-2'>
              <Button
                variant='contained'
                sx={{
                  backgroundColor: 'rgb(147, 51, 234)',
                  '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
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
                  backgroundColor: 'rgb(147, 51, 234)',
                  '&:hover': {
                    backgroundColor: 'rgb(168, 85, 247)',
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
                  backgroundColor: 'rgb(147, 51, 234)',
                  '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
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

          {/* Filtros à direita */}
          <div className='flex flex-wrap items-end gap-4'>
            {hasRequiredRole([import.meta.env.VITE_TEAM_CHEFE]) && (
              <div className='flex flex-col'>
                <InputLabel className='font-normal' style={{ color: 'white' }}>
                  Team:
                </InputLabel>
                <Select
                  className='text-md h-10 w-56 rounded-md bg-white font-normal text-zinc-900'
                  id='team-filter'
                  value={selectedTeam}
                  onChange={(e: SelectChangeEvent) =>
                    setSelectedTeam(e.target.value)
                  }
                  variant='outlined'
                >
                  <MenuItem value='All'>All</MenuItem>
                  <MenuItem value='Garçom'>Garçom</MenuItem>
                  <MenuItem value='Confeiteiros'>Confeiteiros</MenuItem>
                  <MenuItem value='Jackfruit'>Jackfruit</MenuItem>
                  <MenuItem value='Insanos'>Insanos</MenuItem>
                  <MenuItem value='APAE'>APAE</MenuItem>
                  <MenuItem value='Los Renegados'>Los Renegados</MenuItem>
                  <MenuItem value='DTM'>DTM</MenuItem>
                  <MenuItem value='KFFC'>KFFC</MenuItem>
                  <MenuItem value='Greensky'>Greensky</MenuItem>
                  <MenuItem value='Guild Azralon BR#1'>Guild Azralon BR#1</MenuItem>
                  <MenuItem value='Guild Azralon BR#2'>
                    Guild Azralon BR#2
                  </MenuItem>
                  <MenuItem value='Rocket'>Rocket</MenuItem>
                  <MenuItem value='Booty Reaper'>Booty Reaper</MenuItem>
                  <MenuItem value='Padeirinho'>Padeirinho</MenuItem>
                  <MenuItem value='Milharal'>Milharal</MenuItem>
                  <MenuItem value='Bastard Munchen'>Bastard Munchen</MenuItem>
                  <MenuItem value='Kiwi'>Kiwi</MenuItem>
                </Select>
              </div>
            )}

            <div className='flex flex-col'>
              <InputLabel className='font-normal' style={{ color: 'white' }}>
                Difficulty:
              </InputLabel>
              <Select
                className='text-md h-10 w-56 rounded-md bg-white font-normal text-zinc-900'
                id='difficulty-filter'
                value={selectedDifficulty}
                onChange={(e: SelectChangeEvent) =>
                  setSelectedDifficulty(e.target.value)
                }
                variant='outlined'
              >
                <MenuItem value='All'>All</MenuItem>
                <MenuItem value='Normal'>Normal</MenuItem>
                <MenuItem value='Heroic'>Heroic</MenuItem>
                <MenuItem value='Mythic'>Mythic</MenuItem>
              </Select>
            </div>

            <div className='flex flex-col'>
              <InputLabel className='font-normal' style={{ color: 'white' }}>
                Loot:
              </InputLabel>
              <Select
                className='text-md h-10 w-56 rounded-md bg-white font-normal text-zinc-900'
                id='loot-filter'
                value={selectedLoot}
                onChange={(e: SelectChangeEvent) =>
                  setSelectedLoot(e.target.value)
                }
                variant='outlined'
              >
                <MenuItem value='All'>All</MenuItem>
                <MenuItem value='Saved'>Saved</MenuItem>
                <MenuItem value='Unsaved'>Unsaved</MenuItem>
              </Select>
            </div>

            <div className='flex flex-col'>
              <InputLabel className='font-normal' style={{ color: 'white' }}>
                Run Type:
              </InputLabel>
              <Select
                className='text-md h-10 w-56 rounded-md bg-white font-normal text-zinc-900'
                id='run-type-filter'
                value={selectedRunType}
                onChange={(e: SelectChangeEvent) =>
                  setSelectedRunType(e.target.value)
                }
                variant='outlined'
              >
                <MenuItem value='All'>All</MenuItem>
                <MenuItem value='Full Raid'>Full Raid</MenuItem>
                <MenuItem value='AOTC'>AOTC</MenuItem>
                <MenuItem value='Legacy'>Legacy</MenuItem>
                <MenuItem value='Remix'>Remix</MenuItem>
              </Select>
            </div>

            <Button
              onClick={() => {
                setSelectedTeam('All')
                setSelectedDifficulty('All')
                setSelectedLoot('All')
                setSelectedRunType('All')
              }}
              variant='contained'
              sx={{
                backgroundColor: 'rgb(147, 51, 234)',
                '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
                height: '40px',
              }}
              size='small'
              className='shadow-lg'
            >
              Reset
            </Button>
          </div>
        </div>

        {isBulkAddOpen && (
          <Dialog
            open={isBulkAddOpen}
            onClose={handleCloseBulkAddDialog}
            fullWidth
            maxWidth='md'
          >
            <DialogTitle className='relative'>
              Add Multiple Runs
              <IconButton
                aria-label='close'
                onClick={handleCloseBulkAddDialog}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
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
                  borderColor: 'rgb(147, 51, 234)',
                  color: 'rgb(147, 51, 234)',
                  '&:hover': {
                    borderColor: 'rgb(168, 85, 247)',
                    color: 'rgb(168, 85, 247)',
                  },
                }}
                onClick={handleCloseBulkAddDialog}
              >
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
        )}

        <RunsDataGrid
          data={filteredRows}
          isLoading={isLoading}
          onDeleteSuccess={() => fetchRuns(true)}
          onEditSuccess={handleEditRunSuccess}
          onError={handleError}
        />

        {isAddRunOpen && (
          <AddRun
            onClose={() => setIsAddRunOpen(false)}
            onRunAddedReload={() => fetchRuns(true)}
            onError={handleError}
          />
        )}
      </div>
    </div>
  )
}
