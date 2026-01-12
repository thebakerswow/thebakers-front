import { useState } from 'react'
import { Clock, Lock, LockOpen, Pencil, UserPlus } from '@phosphor-icons/react'
import { RiMegaphoneLine } from 'react-icons/ri'
import omega from '../../../assets/omega.png'
import { AddBuyer } from '../../../components/add-buyer'
import { EditRun } from '../../../components/edit-run'
import { useAuth } from '../../../context/auth-context'
import { RunData } from '../../../types/runs-interface'
import { BuyerData } from '../../../types/buyer-interface'
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
import { ErrorDetails } from '../../../components/error-display'
import { sendDiscordMessage } from '../../../services/api/discord'
import { useParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import axios from 'axios'

interface RunInfoProps {
  run: RunData
  onBuyerAddedReload: () => void
  onRunEdit: () => void
  attendanceAccessDenied: boolean
  buyers?: BuyerData[]
  onError?: (error: ErrorDetails) => void
}

export function RunInfo({
  run,
  onBuyerAddedReload,
  onRunEdit,
  attendanceAccessDenied,
  buyers = [],
  onError,
}: RunInfoProps) {
  const [isAddBuyerOpen, setIsAddBuyerOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isRunLocked, setIsRunLocked] = useState(run.runIsLocked) // Assume `isLocked` is part of `run`
  const { userRoles, idDiscord } = useAuth() // Obtenha as roles do contexto
  const [isEditHistoryOpen, setIsEditHistoryOpen] = useState(false)
  const [cooldownMegaphone, setCooldownMegaphone] = useState(false)
  const { id: runId } = useParams<{ id: string }>()

  // Function to check if current user is a raid leader
  const isRaidLeader = (): boolean => {
    if (!run.raidLeaders || !idDiscord) return false
    return run.raidLeaders.some((leader) => {
      // Check if leader is encrypted
      if (leader.idDiscord === 'Encrypted') {
        // For encrypted leaders, we can't verify, so return false
        return false
      }
      return leader.idDiscord === idDiscord
    })
  }

  // Function to check if user can see megaphone button
  const canSeeMegaphoneButton = (): boolean => {
    return (
      isRaidLeader() ||
      userRoles.includes(import.meta.env.VITE_TEAM_CHEFE) ||
      hasPrefeitoTeamAccess(run, userRoles)
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

  // Function to get recipient IDs for buyer notifications
  // Handles special cases like baby johny, widex and advertisers
  const getBuyerRecipientIds = (buyer: BuyerData): string[] => {
    const BABY_JOHNY_ID = '466344718507442177'
    const BABY_JOHNY_EMPLOYEES = [
      '1144320612966338751',
      '1129084739597377767',
    ]

    const WIDEX_ID = '1043889212891594762'
    const WIDEX_EMPLOYEES = [
      '210470259226968066',
      '420200946405212160',
    ]

    if (buyer.idOwnerBuyer === BABY_JOHNY_ID) {
      return BABY_JOHNY_EMPLOYEES
    } else if (buyer.idOwnerBuyer === WIDEX_ID) {
      return WIDEX_EMPLOYEES
    } else if (buyer.idBuyerAdvertiser) {
      return [import.meta.env.VITE_ID_CALMAKARAI]
    } else {
      return [buyer.idOwnerBuyer]
    }
  }

  const handleSendMessageToAllAdvertisers = async () => {
    if (cooldownMegaphone) {
      Swal.fire({
        title: 'Action Not Allowed',
        text: 'Please wait before performing another action.',
        icon: 'warning',
        timer: 1500,
        showConfirmButton: false,
      })
      return
    }

    if (!runId) return

    const { value: message } = await Swal.fire({
      title: 'Send Message to All Advertisers',
      input: 'textarea',
      inputLabel: 'Message',
      inputPlaceholder: 'Type your message here...',
      inputAttributes: {
        'aria-label': 'Type your message here',
      },
      showCancelButton: true,
      confirmButtonText: 'Send',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) {
          return 'You need to write something!'
        }
      },
    })

    if (!message) return // User cancelled or didn't enter a message

    setCooldownMegaphone(true)

    const runLink = `${window.location.origin}/bookings-na/run/${runId}`

    // Collect all unique recipient IDs from all buyers
    const allRecipientIds = new Set<string>()
    buyers.forEach((buyer) => {
      const recipientIds = getBuyerRecipientIds(buyer)
      recipientIds.forEach((id) => allRecipientIds.add(id))
    })

    const recipientIdsArray = Array.from(allRecipientIds)

    if (recipientIdsArray.length === 0) {
      Swal.fire({
        title: 'No Advertisers',
        text: 'There are no advertisers in this run.',
        icon: 'info',
        timer: 2000,
        showConfirmButton: false,
      })
      setCooldownMegaphone(false)
      return
    }

    // Send message to all unique advertisers
    let successCount = 0
    let errorCount = 0

    for (const recipientId of recipientIdsArray) {
      try {
        await sendDiscordMessage(
          recipientId,
          `${message}\n\nRun: ${runLink}`
        )
        successCount++
      } catch (error) {
        errorCount++
        if (axios.isAxiosError(error)) {
          const errorDetails = {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          }
          if (onError) {
            onError(errorDetails)
          }
        } else {
          if (onError) {
            onError({ message: 'Unexpected error', response: error })
          }
        }
      }
    }

    Swal.fire({
      title: 'Messages Sent!',
      text: `Sent to ${successCount} advertiser(s)${errorCount > 0 ? `. ${errorCount} error(s) occurred.` : ''}`,
      icon: successCount > 0 ? 'success' : 'error',
      timer: 2000,
      showConfirmButton: false,
    })

    setCooldownMegaphone(false)
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
            {run.raid} {run.difficulty} @ {run.time ? (
               <>
                 {formatTo12HourEST(run.time)} EST
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
                  Run Gold Pot:{' '}
                  <span className='font-normal'>
                    {Math.round(Number(run.actualPot)).toLocaleString('en-US')}
                  </span>
                </span>
              )}
              {run.actualPot != null && run.actualPotDolar != null && <br />}
              {run.actualPotDolar != null && (
                <span className='font-bold'>
                  Run Dolar Pot:{' '}
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
          {/* Permissoes prefeito, chefe de cozinha */}
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
                History
              </Button>
              {/* Send Message to All Advertisers Button */}
              {canSeeMegaphoneButton() && (
                <Button
                  variant='contained'
                  startIcon={<RiMegaphoneLine size={18} />}
                  fullWidth
                  onClick={handleSendMessageToAllAdvertisers}
                  disabled={isRunLocked || cooldownMegaphone}
                  sx={{
                    backgroundColor:
                      isRunLocked || cooldownMegaphone
                        ? 'rgb(209, 213, 219)'
                        : 'rgb(147, 51, 234)',
                    '&:hover': {
                      backgroundColor:
                        isRunLocked || cooldownMegaphone
                          ? 'rgb(209, 213, 219)'
                          : 'rgb(168, 85, 247)',
                    },
                  }}
                >
                  Message Advertisers
                </Button>
              )}
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
          onError={onError}
        />
      )}
      {isEditModalOpen && (
        <EditRun
          key={run.id}
          run={run}
          onClose={handleCloseEditModal}
          onRunEdit={onRunEdit}
          onError={onError}
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
