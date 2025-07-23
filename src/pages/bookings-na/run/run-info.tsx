import { useState } from 'react'
import { Clock, Lock, LockOpen, Pencil, UserPlus } from '@phosphor-icons/react'
import omega from '../../../assets/omega.png'
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
import { toggleRunLock as toggleRunLockService } from '../../../services/api/runs'
import { EditHistoryDialog } from '../../../components/edit-history-dialog'

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
  const [isEditHistoryOpen, setIsEditHistoryOpen] = useState(false)

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

  const handleToggleRunLock = async () => {
    try {
      await toggleRunLockService(run.id, isRunLocked)
      setIsRunLocked(!isRunLocked)
      window.location.reload() // Reload the page after toggling the lock
    } catch (error) {
      console.error('Failed to toggle run lock:', error)
    }
  }

  function hasPrefeitoTeamAccess(run: RunData, userRoles: string[]): boolean {
    const isPrefeito = userRoles.includes(import.meta.env.VITE_TEAM_PREFEITO)
    if (!isPrefeito) return false

    // Verifica se o usuário tem o cargo do time específico desta run
    const hasTeamRoleForThisRun = userRoles.includes(run.idTeam)
    if (!hasTeamRoleForThisRun) return false

    return true
  }

  return (
    <div className='m-4 flex gap-2 rounded-md'>
      <img
        className='min-h-[220px] max-w-[400px] rounded-md'
        src={omega}
        alt='Run Cover'
      />
      {run.sumPot?.some(
        (item) => item.type === 'gold' && item.sumPot !== 0
      ) && (
        <div className='min-w-[200px] max-w-[400px] flex-1 rounded-md bg-gray-100 p-4 text-center text-black'>
          <h2 className='text-lg font-semibold'>Gold Collectors</h2>
          <TableContainer component={Paper}>
            {!attendanceAccessDenied && (
              <Table>
                <TableBody>
                  {run.sumPot
                    ?.filter(
                      (item) => item.type === 'gold' && item.sumPot !== 0
                    )
                    .map((item) => (
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
                    ))}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </div>
      )}
      {/* Exibe Dolar Collectors apenas se houver pelo menos um item do tipo dolar */}
      {run.sumPot?.some(
        (item) => item.type === 'dolar' && item.sumPot !== 0
      ) && (
        <div className='min-w-[200px] max-w-[400px] flex-1 rounded-md bg-gray-100 p-4 text-center text-black'>
          <h2 className='text-lg font-semibold'>Dolar Collectors</h2>
          <TableContainer component={Paper}>
            {!attendanceAccessDenied && (
              <Table>
                <TableBody>
                  {run.sumPot
                    ?.filter(
                      (item) => item.type === 'dolar' && item.sumPot !== 0
                    )
                    .map((item) => (
                      <TableRow key={item.idDiscord} style={{ height: '20px' }}>
                        <TableCell style={{ padding: '10px' }}>
                          {item.username}
                        </TableCell>
                        <TableCell align='right' style={{ padding: '10px' }}>
                          {Number(item.sumPot).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </div>
      )}

      <Card
        className='grid flex-1 grid-cols-4 items-center text-left text-zinc-900'
        style={{ minWidth: '1000px', backgroundColor: '#f3f4f6' }}
      >
        <CardContent className='col-span-3 mb-6 ml-10 flex flex-col'>
          <h1 className='text-center text-lg font-semibold'>
            {run.raid} {run.difficulty}{' '}
            {run.quantityBoss?.String ?? run.quantityBoss} @{' '}
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
            {run.raidLeaders &&
              run.raidLeaders.length > 0 &&
              run.raidLeaders.some(
                (leader) => leader.username !== 'Encrypted'
              ) && (
                <p className='text-left'>
                  <span className='text-base font-bold'>Raid Leader(s): </span>
                  {run.raidLeaders
                    .filter((raidLeader) => raidLeader.username !== 'Encrypted')
                    .map((raidLeader) => raidLeader.username)
                    .join(', ')}
                </p>
              )}
            {/* Gold Pot e Dolar Pot em linhas separadas, Gold Pot em negrito, sem "Run Pot" */}
            <p className='text-left'>
              {run.actualPot != null && (
                <span className='font-bold'>
                  Gold Pot:{' '}
                  <span className='font-normal'>
                    {Math.round(Number(run.actualPot)).toLocaleString('en-US')}
                  </span>
                </span>
              )}
              {run.actualPot != null && run.actualPotDolar != null && <br />}
              {run.actualPotDolar != null && (
                <span className='font-bold'>
                  Dolar Pot:{' '}
                  <span className='font-normal'>
                    {Math.round(Number(run.actualPotDolar)).toLocaleString(
                      'en-US'
                    )}
                  </span>
                </span>
              )}
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
                : 'rgb(147, 51, 234)', // Gray if disabled
              '&:hover': {
                backgroundColor: isRunLocked
                  ? 'rgb(209, 213, 219)'
                  : 'rgb(168, 85, 247)', // Gray if disabled
              },
            }}
          >
            Add Buyer
          </Button>
          {/* Permissoes prefeito, chefe de cozinha, staff */}
          {hasPrefeitoTeamAccess(run, userRoles) ||
          userRoles.includes(import.meta.env.VITE_TEAM_CHEFE) ? (
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
                    : 'rgb(147, 51, 234)', // Gray if disabled
                  '&:hover': {
                    backgroundColor: isRunLocked
                      ? 'rgb(209, 213, 219)'
                      : 'rgb(168, 85, 247)', // Gray if disabled
                  },
                }}
              >
                Edit Raid
              </Button>
              {/* Edit History Button */}
              <Button
                variant='contained'
                startIcon={<Clock size={18} />}
                fullWidth
                onClick={() => setIsEditHistoryOpen(true)}
                sx={{
                  backgroundColor: 'rgb(147, 51, 234)',
                  '&:hover': {
                    backgroundColor: 'rgb(168, 85, 247)',
                  },
                }}
              >
                Edit History
              </Button>
              <Button
                variant='contained'
                startIcon={
                  isRunLocked ? <LockOpen size={18} /> : <Lock size={18} />
                }
                fullWidth
                onClick={handleToggleRunLock}
                sx={{
                  backgroundColor: 'rgb(147, 51, 234)',
                  '&:hover': {
                    backgroundColor: 'rgb(168, 85, 247)',
                  },
                }}
              >
                {isRunLocked ? 'Unlock Run' : 'Lock Run'}
              </Button>
            </>
          ) : (
            isRunLocked && (
              <p className='text-center font-semibold text-purple-500'>
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
      {isEditHistoryOpen && (
        <EditHistoryDialog
          open={isEditHistoryOpen}
          onClose={() => setIsEditHistoryOpen(false)}
          idRun={Number(run.id)}
        />
      )}
    </div>
  )
}
