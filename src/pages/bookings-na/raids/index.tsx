import { useEffect, useMemo, useRef, useState } from 'react'
import { RunsDataGrid } from './components/runs-data-grid'
import { DateFilter } from '../../../components/date-filter'
import { format } from 'date-fns'
import { UserPlus, ClipboardText, UsersFour, X } from '@phosphor-icons/react'
import { AddRun } from './components/add-run'
import { useAuth } from '../../../context/auth-context'
import { getRuns, createRun } from '../../../services/api/runs'
import axios from 'axios'
import { ErrorComponent, ErrorDetails } from '../../../components/error-display'
import { RunData } from '../../../types/runs-interface'
import Swal from 'sweetalert2'
import { CustomSelect } from '../../../components/custom-select'
import { createPortal } from 'react-dom'

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
  const runsRequestInFlightRef = useRef(false)
  const runsSnapshotRef = useRef('')
  const isUserActiveRef = useRef(true)
  const teamOptions = useMemo(
    () => [
      { value: 'All', label: 'All' },
      { value: 'Garçom', label: 'Garçom' },
      { value: 'Confeiteiros', label: 'Confeiteiros' },
      { value: 'Jackfruit', label: 'Jackfruit' },
      { value: 'Insanos', label: 'Insanos' },
      { value: 'APAE', label: 'APAE' },
      { value: 'Los Renegados', label: 'Los Renegados' },
      { value: 'DTM', label: 'DTM' },
      { value: 'KFFC', label: 'KFFC' },
      { value: 'Greensky', label: 'Greensky' },
      { value: 'Guild Azralon BR#1', label: 'Guild Azralon BR#1' },
      { value: 'Guild Azralon BR#2', label: 'Guild Azralon BR#2' },
      { value: 'Rocket', label: 'Rocket' },
      { value: 'Booty Reaper', label: 'Booty Reaper' },
      { value: 'Padeirinho', label: 'Padeirinho' },
      { value: 'Milharal', label: 'Milharal' },
      { value: 'Bastard Munchen', label: 'Bastard Munchen' },
      { value: 'Kiwi', label: 'Kiwi' },
    ],
    []
  )
  const difficultyOptions = useMemo(
    () => [
      { value: 'All', label: 'All' },
      { value: 'Normal', label: 'Normal' },
      { value: 'Heroic', label: 'Heroic' },
      { value: 'Mythic', label: 'Mythic' },
    ],
    []
  )
  const lootOptions = useMemo(
    () => [
      { value: 'All', label: 'All' },
      { value: 'Group loot', label: 'Group loot' },
      { value: 'Unsaved Group loot', label: 'Unsaved Group loot' },
      { value: 'Full priority', label: 'Full priority' },
      { value: 'No Loot', label: 'No Loot' },
      { value: 'Armor and Token Priority', label: 'Armor and Token Priority' },
    ],
    []
  )
  const runTypeOptions = useMemo(
    () => [
      { value: 'All', label: 'All' },
      { value: 'Full Clear', label: 'Full Clear' },
      { value: 'Last Boss', label: 'Last Boss' },
      { value: 'Achievment', label: 'Achievment' },
      { value: 'Legacy', label: 'Legacy' },
      { value: 'Remix', label: 'Remix' },
      { value: 'Mount Only', label: 'Mount Only' },
    ],
    []
  )

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
        name: run.name,
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
    if (runsRequestInFlightRef.current) {
      return
    }

    if (isUserRequest && selectedDate) setIsLoading(true)
    runsRequestInFlightRef.current = true

    try {
      if (!selectedDate) {
        if (runsSnapshotRef.current !== '[]') {
          runsSnapshotRef.current = '[]'
          setRows([])
        }
        return
      }

      const data = await getRuns(format(selectedDate, 'yyyy-MM-dd'))
      const mappedRows = (data || []).map((run: any) => ({
        ...run,
        buyersCount: `${run.maxBuyers - run.slotAvailable}/${run.maxBuyers}`,
      }))
      const nextSnapshot = JSON.stringify(mappedRows)

      if (runsSnapshotRef.current !== nextSnapshot) {
        runsSnapshotRef.current = nextSnapshot
        setRows(mappedRows)
      }
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
      runsRequestInFlightRef.current = false
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

    let inactivityTimeout: ReturnType<typeof setTimeout>
    let pollingTimeout: ReturnType<typeof setTimeout>

    const resetActivityTimer = () => {
      isUserActiveRef.current = true
      clearTimeout(inactivityTimeout)
      inactivityTimeout = setTimeout(() => {
        isUserActiveRef.current = false
      }, 5000)
    }

    const handleMouseOrKeyActivity = () => {
      resetActivityTimer()
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isUserActiveRef.current = false
      } else {
        isUserActiveRef.current = true
        resetActivityTimer()
      }
    }

    const schedulePolling = () => {
      const delay = isUserActiveRef.current ? 20000 : 45000
      pollingTimeout = setTimeout(() => {
        fetchRuns(false)
        schedulePolling()
      }, delay)
    }

    window.addEventListener('mousemove', handleMouseOrKeyActivity)
    window.addEventListener('keydown', handleMouseOrKeyActivity)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    resetActivityTimer()
    schedulePolling()

    return () => {
      clearTimeout(pollingTimeout)
      clearTimeout(inactivityTimeout)
      window.removeEventListener('mousemove', handleMouseOrKeyActivity)
      window.removeEventListener('keydown', handleMouseOrKeyActivity)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [selectedDate])

  return (
    <div className='flex min-h-screen w-full flex-col items-center pb-20'>
      {error && <ErrorComponent error={error} onClose={() => setError(null)} />}
      <DateFilter onDaySelect={setSelectedDate} />

      <div className='mx-auto mt-6 flex w-[90%] flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm'>
        <div className='mb-2 flex flex-wrap items-end justify-between gap-4'>
          {hasRequiredRole([import.meta.env.VITE_TEAM_CHEFE]) && (
            <div className='flex flex-wrap gap-3'>
              <button
                className='inline-flex h-10 min-w-[120px] items-center justify-center gap-2 rounded-md border border-purple-400/40 bg-purple-500/20 px-4 text-sm text-purple-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.22)] transition hover:border-purple-300/55 hover:bg-purple-500/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/45'
                onClick={() => setIsAddRunOpen(true)}
              >
                <UserPlus size={18} />
                Add Run
              </button>
              <button
                className='inline-flex h-10 min-w-[130px] items-center justify-center gap-2 rounded-md border border-purple-400/40 bg-purple-500/20 px-4 text-sm text-purple-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.22)] transition hover:border-purple-300/55 hover:bg-purple-500/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/45'
                onClick={copyRunsToClipboard}
              >
                <ClipboardText size={18} />
                {isCopying ? 'Copying...' : isCopied ? 'Copied!' : 'Copy Runs'}
              </button>
              <button
                className='inline-flex h-10 min-w-[170px] items-center justify-center gap-2 rounded-md border border-purple-400/40 bg-purple-500/20 px-4 text-sm text-purple-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.22)] transition hover:border-purple-300/55 hover:bg-purple-500/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/45'
                onClick={() => setIsBulkAddOpen(true)}
              >
                <UsersFour size={18} />
                Add Multiple Runs
              </button>
            </div>
          )}

          <div className='flex flex-wrap items-end gap-4'>
            {hasRequiredRole([import.meta.env.VITE_TEAM_CHEFE]) && (
              <div className='flex flex-col'>
                <label className='mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400'>
                  Team
                </label>
                <CustomSelect
                  value={selectedTeam}
                  onChange={setSelectedTeam}
                  options={teamOptions}
                  minWidthClassName='min-w-[220px]'
                />
              </div>
            )}

            <div className='flex flex-col'>
              <label className='mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400'>
                Difficulty
              </label>
              <CustomSelect
                value={selectedDifficulty}
                onChange={setSelectedDifficulty}
                options={difficultyOptions}
                minWidthClassName='min-w-[220px]'
              />
            </div>

            <div className='flex flex-col'>
              <label className='mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400'>
                Loot
              </label>
              <CustomSelect
                value={selectedLoot}
                onChange={setSelectedLoot}
                options={lootOptions}
                minWidthClassName='min-w-[220px]'
              />
            </div>

            <div className='flex flex-col'>
              <label className='mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400'>
                Run Type
              </label>
              <CustomSelect
                value={selectedRunType}
                onChange={setSelectedRunType}
                options={runTypeOptions}
                minWidthClassName='min-w-[220px]'
              />
            </div>

            <button
              onClick={() => {
                setSelectedTeam('All')
                setSelectedDifficulty('All')
                setSelectedLoot('All')
                setSelectedRunType('All')
              }}
              className='inline-flex h-10 min-w-[100px] items-center justify-center rounded-md border border-purple-400/40 bg-purple-500/20 px-4 text-sm text-purple-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.22)] transition hover:border-purple-300/55 hover:bg-purple-500/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/45'
            >
              Reset
            </button>
          </div>
        </div>

        {isBulkAddOpen &&
          createPortal(
            <div className='fixed inset-0 z-[240] flex items-center justify-center bg-black/70 p-4'>
              <div className='w-full max-w-3xl rounded-xl border border-white/10 bg-[#1a1a1a] p-4 text-white shadow-2xl'>
                <div className='mb-4 flex items-center justify-between'>
                  <h3 className='text-lg font-semibold text-white'>Add Multiple Runs</h3>
                  <button
                    aria-label='close'
                    onClick={handleCloseBulkAddDialog}
                    className='rounded-md border border-white/10 bg-white/5 p-1.5 text-white transition hover:border-purple-500/40 hover:text-purple-300'
                  >
                    <X size={18} />
                  </button>
                </div>
                <textarea
                  rows={12}
                  placeholder='Paste runs data here (JSON format)'
                  value={bulkRunsData}
                  onChange={(e) => handleBulkRunsDataChange(e.target.value)}
                  className='w-full rounded-md border border-white/15 bg-white/[0.05] p-3 font-mono text-sm text-white outline-none placeholder:text-neutral-500 transition focus:border-purple-400/50'
                />
                <div className='mt-4 flex justify-end gap-2'>
                  <button
                    onClick={handleCloseBulkAddDialog}
                    className='rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-200 transition hover:bg-white/10'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkAddRuns}
                    disabled={isSubmitting}
                    className='rounded-md border border-purple-400/40 bg-purple-500/20 px-3 py-2 text-sm font-medium text-purple-100 transition hover:border-purple-300/55 hover:bg-purple-500/30 disabled:cursor-not-allowed disabled:opacity-60'
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Runs'}
                  </button>
                </div>
              </div>
            </div>,
            document.body
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
