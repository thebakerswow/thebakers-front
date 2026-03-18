import { useEffect, useMemo, useRef, useState } from 'react'
import { RunsDataGrid } from './components/RunsGrid'
import { AddMultipleRuns } from './components/AddMultipleRuns'
import { RaidsPageSkeleton } from './components/RaidsPageSkeleton'
import { DateFilter } from '../../../components/DateFilter'
import { format } from 'date-fns'
import { UserPlus, ClipboardText, UsersFour, Trash } from '@phosphor-icons/react'
import { AddRun } from './components/AddRun'
import { useAuth } from '../../../context/AuthContext'
import { deleteRaidRun, getRaidsRuns } from './services/raidsApi'
import { handleApiError } from '../../../utils/apiErrorHandler'
import type { RaidsRunData } from './types/raids'
import Swal from 'sweetalert2'
import { CustomSelect } from '../../../components/CustomSelect'

export function FullRaidsNa() {
  const [rows, setRows] = useState<RaidsRunData[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isAddRunOpen, setIsAddRunOpen] = useState(false)
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoadedRunsOnce, setHasLoadedRunsOnce] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  const [isDeletingRuns, setIsDeletingRuns] = useState(false)
  const [selectedRunIds, setSelectedRunIds] = useState<string[]>([])
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
      { value: 'Punks', label: 'Punks' },
      { value: 'Padeirinho', label: 'Padeirinho' },
      { value: 'Milharal', label: 'Milharal' },
      { value: 'Bastard Munchen', label: 'Bastard Munchen' },
      { value: 'Gachi Squad', label: 'Gachi Squad' },
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
    requiredRoles.some((required) => userRoles.includes(required))

  // Copia os dados das corridas para a área de transferência
  const copyRunsToClipboard = () => {
    if (selectedRunIds.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Select at least one run to copy.',
        confirmButtonColor: '#ef4444',
        timer: 1500,
        showConfirmButton: false,
      })
      return
    }

    const selectedRuns = filteredRows.filter((run) => selectedRunIds.includes(run.id))
    if (selectedRuns.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Selected runs are not visible with current filters.',
        confirmButtonColor: '#ef4444',
        timer: 1800,
        showConfirmButton: false,
      })
      return
    }

    const formattedRuns = selectedRuns.map((run) => ({
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
      minPriceEnabled: true,
      minPriceGold: Number(run.minPriceGold || 0),
      minPriceDollar: Number(run.minPriceDollar || 0),
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

  const handleToggleRunSelection = (runId: string) => {
    setSelectedRunIds((prev) =>
      prev.includes(runId) ? prev.filter((id) => id !== runId) : [...prev, runId]
    )
  }

  const handleToggleSelectAllVisible = (visibleRunIds: string[]) => {
    setSelectedRunIds((prev) => {
      const allVisibleSelected =
        visibleRunIds.length > 0 && visibleRunIds.every((id) => prev.includes(id))
      if (allVisibleSelected) {
        return prev.filter((id) => !visibleRunIds.includes(id))
      }
      const merged = new Set([...prev, ...visibleRunIds])
      return Array.from(merged)
    })
  }

  const handleDeleteSelectedRuns = async () => {
    if (selectedRunIds.length === 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Select at least one run to delete.',
        timer: 1500,
        showConfirmButton: false,
      })
      return
    }

    const selectedRuns = rows.filter((run) => selectedRunIds.includes(run.id))
    const result = await Swal.fire({
      title: 'Confirm Bulk Deletion',
      text: `Are you sure you want to delete ${selectedRuns.length} run(s)?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Delete Selected',
      cancelButtonText: 'Cancel',
    })

    if (!result.isConfirmed) return

    try {
      setIsDeletingRuns(true)
      Swal.fire({
        title: 'Deleting runs...',
        text: `Removing ${selectedRuns.length} run(s)`,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      let successCount = 0
      for (const run of selectedRuns) {
        try {
          await deleteRaidRun(run.id)
          successCount++
        } catch (error) {
          await handleApiError(error, `Failed to delete run ${run.raid}`)
        }
      }

      Swal.close()
      setSelectedRunIds([])
      await fetchRuns(true)

      await Swal.fire({
        title: successCount > 0 ? 'Done!' : 'No runs deleted',
        text: `Deleted ${successCount} of ${selectedRuns.length} selected run(s).`,
        icon: successCount > 0 ? 'success' : 'info',
        timer: 1700,
        showConfirmButton: false,
      })
    } finally {
      setIsDeletingRuns(false)
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

      const data = await getRaidsRuns(format(selectedDate, 'yyyy-MM-dd'))
      const mappedRows = (data || []).map((run: RaidsRunData) => ({
        ...run,
        buyersCount: `${Number(run.maxBuyers) - Number(run.slotAvailable)}/${run.maxBuyers}`,
      }))
      const nextSnapshot = JSON.stringify(mappedRows)

      if (runsSnapshotRef.current !== nextSnapshot) {
        runsSnapshotRef.current = nextSnapshot
        setRows(mappedRows)
      }
    } catch (error) {
      await handleApiError(error, 'Unexpected error loading runs')
    } finally {
      runsRequestInFlightRef.current = false
      if (isUserRequest) setIsLoading(false)
      if (isUserRequest && selectedDate && !hasLoadedRunsOnce) {
        setHasLoadedRunsOnce(true)
      }
    }
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

  useEffect(() => {
    const visibleRunIdsSet = new Set(filteredRows.map((run) => run.id))
    setSelectedRunIds((prev) => prev.filter((id) => visibleRunIdsSet.has(id)))
  }, [filteredRows])

  const showInitialPageSkeleton =
    isLoading && selectedDate !== null && !hasLoadedRunsOnce

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
      <DateFilter onDaySelect={setSelectedDate} />
      {showInitialPageSkeleton ? (
        <RaidsPageSkeleton />
      ) : (
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
                  {isCopying ? 'Copying...' : isCopied ? 'Copied!' : 'Copy Selected'}
                </button>
                <button
                  className='inline-flex h-10 min-w-[150px] items-center justify-center gap-2 rounded-md border border-purple-400/40 bg-purple-500/20 px-4 text-sm text-purple-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.22)] transition hover:border-purple-300/55 hover:bg-purple-500/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/45 disabled:cursor-not-allowed disabled:border-zinc-500/60 disabled:bg-zinc-700/60 disabled:text-zinc-300'
                  onClick={handleDeleteSelectedRuns}
                  disabled={isDeletingRuns}
                >
                  <Trash size={18} />
                  {isDeletingRuns ? 'Deleting...' : 'Delete Selected'}
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

          <AddMultipleRuns
            isOpen={isBulkAddOpen}
            selectedDate={selectedDate}
            onClose={() => setIsBulkAddOpen(false)}
            onRunsAdded={() => fetchRuns(true)}
          />

          <RunsDataGrid
            data={filteredRows}
            isLoading={isLoading}
            onDeleteSuccess={() => fetchRuns(true)}
            selectedRunIds={selectedRunIds}
            onToggleRunSelection={handleToggleRunSelection}
            onToggleSelectAllVisible={handleToggleSelectAllVisible}
          />

          {isAddRunOpen && (
            <AddRun
              onClose={() => setIsAddRunOpen(false)}
              onRunAddedReload={() => fetchRuns(true)}
            />
          )}
        </div>
      )}
    </div>
  )
}
