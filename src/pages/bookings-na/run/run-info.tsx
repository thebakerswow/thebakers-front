import { useState } from 'react'
import { Lock, LockOpen, Pencil, UserPlus } from '@phosphor-icons/react'
import undermineLogo from '../../../assets/undermine-logo.png'
import { AddBuyer } from '../../../components/add-buyer'
import { EditRun } from '../../../components/edit-run'
import { useAuth } from '../../../context/auth-context'
import { RunData } from '../../../types/runs-interface'
import {
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
} from '@mui/material'
import { api } from '../../../services/axiosConfig'

interface RunInfoProps {
  run: RunData
  onBuyerAddedReload: () => void
  onRunEdit: () => void
  attendanceAccessDenied: boolean
}

export function RunInfo({
  run,
  onBuyerAddedReload,
  onRunEdit,
  attendanceAccessDenied,
}: RunInfoProps) {
  const [isAddBuyerOpen, setIsAddBuyerOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isRunLocked, setIsRunLocked] = useState(run.runIsLocked) // Assume `isLocked` is part of `run`
  const { userRoles } = useAuth() // Obtenha as roles do contexto

  const hasRequiredRole = (requiredRoles: string[]): boolean => {
    return requiredRoles.some((required) =>
      userRoles.some((userRole) => userRole.toString() === required.toString())
    )
  }

  const handleOpenEditModal = () => {
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
  }

  function handleOpenAddBuyer() {
    setIsAddBuyerOpen(true)
  }

  function handleCloseAddBuyer() {
    setIsAddBuyerOpen(false)
  }

  function convertFromEST(timeStr: string) {
    const [hours, minutes] = timeStr.split(':').map(Number)
    let adjustedHours = hours + 1 // Ajuste para BRT

    // Ajustar caso a conversão ultrapasse 24h
    if (adjustedHours === 24) {
      adjustedHours = 0 // Meia-noite
    }

    // Formatar para 12 horas
    const period = adjustedHours >= 12 ? 'PM' : 'AM'
    const formattedHours = adjustedHours % 12 || 12 // Converte 0 para 12 no formato 12h

    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  function formatTo12HourEST(timeStr: string) {
    const [hours, minutes] = timeStr.split(':').map(Number)

    const period = hours >= 12 ? 'PM' : 'AM'
    const formattedHours = hours % 12 || 12 // Converte 0 para 12 no formato 12h

    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  const toggleRunLock = async () => {
    try {
      const response = await api.put(
        `${import.meta.env.VITE_API_BASE_URL}/run/${run.id}/lock`,
        {
          isLocked: !isRunLocked,
        }
      )
      if (response.status === 200) {
        setIsRunLocked(!isRunLocked)
        window.location.reload() // Reload the page after toggling the lock
      }
    } catch (error) {
      console.error('Failed to toggle run lock:', error)
    }
  }

  return (
    <div className='m-4 flex gap-2 rounded-md'>
      <img
        className='h-[220px] w-[400px] rounded-md'
        src={undermineLogo}
        alt='Run Cover'
      />
      <div className='min-w-[200px] max-w-[400px] flex-1 rounded-md bg-gray-100 p-4 text-center text-black'>
        <h2 className='text-lg font-semibold'>Gold Collectors</h2>
        <TableContainer component={Paper}>
          {!attendanceAccessDenied && (
            <Table>
              <TableBody>
                {run.sumPot?.map((item) =>
                  item.sumPot !== 0 ? ( // Verifica se sumPot não é igual a zero
                    <TableRow key={item.idDiscord} style={{ height: '20px' }}>
                      <TableCell style={{ padding: '10px' }}>
                        {item.username}
                      </TableCell>
                      <TableCell align='right' style={{ padding: '10px' }}>
                        {Math.round(Number(item.sumPot)).toLocaleString(
                          'en-US'
                        )}
                      </TableCell>
                    </TableRow>
                  ) : null
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </div>
      <Card
        className='grid flex-1 grid-cols-4 items-center text-left text-zinc-900'
        style={{ minWidth: '1000px', backgroundColor: '#f3f4f6' }}
      >
        <CardContent className='col-span-3 mb-6 ml-10 flex flex-col'>
          <h1 className='text-center text-lg font-semibold'>
            {run.raid} {run.difficulty} @{' '}
            {run.time ? (
              <>
                {formatTo12HourEST(run.time)} EST{' '}
                {/* Exibe o horário original recebido do backend */}
                || {convertFromEST(run.time)} BRT
              </>
            ) : (
              <span>-</span>
            )}
          </h1>

          <div className='mt-8 grid grid-cols-3 gap-4 text-left'>
            <p className='text-left font-semibold text-yellow-500'>
              <span className='text-base font-bold text-zinc-900'>
                Loot Type:{' '}
              </span>
              {run.loot}
            </p>
            <p className='text-left font-semibold text-red-500'>
              <span className='text-base font-bold text-zinc-900'>
                Max Buyers:{' '}
              </span>
              {run.maxBuyers}
            </p>
            <p className='text-left'>
              <span className='text-base font-bold'>
                Slots Available:{' '}
                <span className='font-normal'>{run.slotAvailable}</span>
              </span>
            </p>
            <p className='text-left'>
              <span className='text-base font-bold'>
                Backups: <span className='font-normal'>{run.backups}</span>
              </span>
            </p>
            <p className='text-left'>
              <span className='text-base font-bold'>Raid Leader(s): </span>
              {run.team === 'DTM' &&
              !hasRequiredRole([import.meta.env.VITE_TEAM_CHEFE]) ? (
                <span>-</span> // Hide Raid Leader(s) if team is DTM and user is not VITE_TEAM_CHEFE
              ) : run.raidLeaders && run.raidLeaders.length > 0 ? (
                run.raidLeaders
                  .map((raidLeader) => raidLeader.username)
                  .join(', ')
              ) : (
                <span>-</span>
              )}
            </p>
            <p className='text-left'>
              <span className='text-base font-bold'>
                Run Pot:{' '}
                <span className='font-normal'>
                  {attendanceAccessDenied ? (
                    <i>Encrypted</i>
                  ) : (
                    Math.round(Number(run.actualPot)).toLocaleString('en-US')
                  )}
                </span>
              </span>
            </p>
          </div>
        </CardContent>
        <CardContent className='m-4 flex flex-col items-center justify-center gap-2'>
          <Button
            variant='contained'
            startIcon={<UserPlus size={18} />}
            fullWidth
            onClick={handleOpenAddBuyer}
            disabled={isRunLocked} // Disable button if run is locked
            sx={{
              backgroundColor: isRunLocked
                ? 'rgb(209, 213, 219)'
                : 'rgb(239, 68, 68)', // Gray if disabled
              '&:hover': {
                backgroundColor: isRunLocked
                  ? 'rgb(209, 213, 219)'
                  : 'rgb(248, 113, 113)', // Gray if disabled
              },
            }}
          >
            Add Buyer
          </Button>
          {/* Permissoes prefeito, chefe de cozinha, staff */}
          {hasRequiredRole([
            import.meta.env.VITE_TEAM_PREFEITO,
            import.meta.env.VITE_TEAM_CHEFE,
            import.meta.env.VITE_TEAM_STAFF,
          ]) ? (
            <>
              <Button
                variant='contained'
                startIcon={<Pencil size={18} />}
                fullWidth
                onClick={handleOpenEditModal}
                disabled={isRunLocked} // Disable button if run is locked
                sx={{
                  backgroundColor: isRunLocked
                    ? 'rgb(209, 213, 219)'
                    : 'rgb(239, 68, 68)', // Gray if disabled
                  '&:hover': {
                    backgroundColor: isRunLocked
                      ? 'rgb(209, 213, 219)'
                      : 'rgb(248, 113, 113)', // Gray if disabled
                  },
                }}
              >
                Edit Raid
              </Button>
              <Button
                variant='contained'
                startIcon={
                  isRunLocked ? <LockOpen size={18} /> : <Lock size={18} />
                }
                fullWidth
                onClick={toggleRunLock}
                sx={{
                  backgroundColor: 'rgb(239, 68, 68)',
                  '&:hover': {
                    backgroundColor: 'rgb(248, 113, 113)',
                  },
                }}
              >
                {isRunLocked ? 'Unlock Run' : 'Lock Run'}
              </Button>
            </>
          ) : (
            isRunLocked && (
              <p className='text-center font-semibold text-red-500'>
                This run is currently locked. You do not have permission to
                unlock it.
              </p>
            )
          )}
        </CardContent>
      </Card>

      {isAddBuyerOpen && (
        <AddBuyer
          run={run}
          onClose={handleCloseAddBuyer}
          onBuyerAddedReload={onBuyerAddedReload}
        />
      )}
      {isEditModalOpen && (
        <EditRun
          key={run.id}
          run={run}
          onClose={handleCloseEditModal}
          onRunEdit={onRunEdit}
        />
      )}
    </div>
  )
}
