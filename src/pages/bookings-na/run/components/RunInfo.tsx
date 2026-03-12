import { useState } from 'react'
import { Clock, Lock, LockOpen, Pencil, UserPlus } from '@phosphor-icons/react'
import { RiMegaphoneLine } from 'react-icons/ri'
import { AddBuyer } from './AddBuyer'
import { EditRun } from './EditRun'
import { useAuth } from '../../../../context/auth-context'
import {
  getRunAttendance,
  toggleRunLock as toggleRunLockService,
  sendDiscordMessage,
} from '../services/runApi'
import { EditHistoryDialog } from './History'
import { useParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import type { BuyerData, RunData, RunInfoProps } from '../types/run'
import { handleApiError } from '../../../../utils/apiErrorHandler'

export function RunInfo({
  run,
  onBuyerAddedReload,
  onRunEdit,
  attendanceAccessDenied,
  buyers = [],
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
      if (!isRunLocked) {
        const attendanceData = await getRunAttendance(run.id)
        const hasAnyAttendanceFilled = Array.isArray(attendanceData)
          ? attendanceData.some(
              (player) => Number(player.percentage) > 0
            )
          : false

        if (!hasAnyAttendanceFilled) {
          Swal.fire({
            title: 'Attendance Required',
            text: 'Fill attendance for at least one player before locking this run.',
            icon: 'warning',
            timer: 2500,
            showConfirmButton: false,
          })
          return
        }
      }

      await toggleRunLockService(run.id, isRunLocked)
      setIsRunLocked(!isRunLocked)
      window.location.reload() // Reload the page after toggling the lock
    } catch (error) {
      await handleApiError(error, 'Failed to toggle run lock')
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
        await handleApiError(error, 'Failed to notify one or more advertisers')
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

  const visibleRaidLeaders =
    run.raidLeaders
      ?.filter((raidLeader) => raidLeader.username !== 'Encrypted')
      .map((raidLeader) => raidLeader.username)
      .join(', ') || '-'

  const canManageRun =
    hasPrefeitoTeamAccess(run, userRoles) ||
    userRoles.includes(import.meta.env.VITE_TEAM_CHEFE)
  const hasGoldCollectors = Boolean(
    run.sumPot?.some((item) => item.type === 'gold' && item.sumPot !== 0)
  )
  const hasDolarCollectors = Boolean(
    run.sumPot?.some((item) => item.type === 'dolar' && item.sumPot !== 0)
  )
  const mainCardColSpanClass =
    hasGoldCollectors && hasDolarCollectors
      ? 'lg:col-span-8'
      : hasGoldCollectors || hasDolarCollectors
        ? 'lg:col-span-9'
        : 'lg:col-span-12'
  const collectorColSpanClass =
    hasGoldCollectors && hasDolarCollectors ? 'lg:col-span-2' : 'lg:col-span-3'
  const actionButtonClass =
    'inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-purple-400/40 bg-purple-500/20 px-4 text-sm text-purple-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.22)] transition hover:border-purple-300/55 hover:bg-purple-500/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/45 disabled:cursor-not-allowed disabled:border-zinc-500/60 disabled:bg-zinc-700/60 disabled:text-zinc-300 disabled:shadow-none'

  return (
    <div className='m-4'>
      <div className='grid grid-cols-1 gap-3 lg:grid-cols-12'>
        {hasGoldCollectors && (
          <div
            className={`rounded-xl border border-white/10 bg-white/[0.04] p-3 text-white ${collectorColSpanClass}`}
          >
            <h2 className='text-base font-semibold'>Gold Collectors</h2>
            <div className='mt-2 max-h-[260px] overflow-y-auto rounded-md border border-white/10 bg-black/20'>
              {!attendanceAccessDenied && (
                <table className='w-full text-sm'>
                  <tbody>
                    {run.sumPot
                      ?.filter(
                        (item) => item.type === 'gold' && item.sumPot !== 0
                      )
                      .map((item) => (
                        <tr key={item.idDiscord} className='border-b border-white/5'>
                          <td className='px-3 py-2 text-left'>{item.username}</td>
                          <td className='px-3 py-2 text-right'>
                            {Math.round(Number(item.sumPot)).toLocaleString('en-US')}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        <div
          className={`rounded-xl border border-white/10 bg-white/[0.04] p-3 text-white ${mainCardColSpanClass}`}
        >
          <div className='flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between'>
          <div className='flex-1'>
            <h1 className='text-2xl font-semibold text-white'>
              {run.raid} {run.difficulty}
            </h1>
            <p className='mt-1 text-sm text-neutral-300'>
              {run.time ? `${formatTo12HourEST(run.time)} EST` : '-'}
            </p>

            <dl className='mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2 xl:grid-cols-3'>
              <div className='rounded-md border border-white/10 bg-black/20 px-3 py-1.5'>
                <dt className='text-xs uppercase tracking-wide text-neutral-400'>
                  Loot Type
                </dt>
                <dd className='mt-1 font-medium text-yellow-300'>{run.loot || '-'}</dd>
              </div>
              <div className='rounded-md border border-white/10 bg-black/20 px-3 py-1.5'>
                <dt className='text-xs uppercase tracking-wide text-neutral-400'>
                  Max Buyers
                </dt>
                <dd className='mt-1 font-medium text-red-300'>{run.maxBuyers}</dd>
              </div>
              <div className='rounded-md border border-white/10 bg-black/20 px-3 py-1.5'>
                <dt className='text-xs uppercase tracking-wide text-neutral-400'>
                  Slots Available
                </dt>
                <dd className='mt-1 font-medium'>{run.slotAvailable}</dd>
              </div>
              <div className='rounded-md border border-white/10 bg-black/20 px-3 py-1.5'>
                <dt className='text-xs uppercase tracking-wide text-neutral-400'>
                  Backups
                </dt>
                <dd className='mt-1 font-medium'>{run.backups}</dd>
              </div>
              <div className='rounded-md border border-white/10 bg-black/20 px-3 py-1.5'>
                <dt className='text-xs uppercase tracking-wide text-neutral-400'>
                  Raid Leader(s)
                </dt>
                <dd className='mt-1 font-medium break-words'>{visibleRaidLeaders}</dd>
              </div>
              <div className='rounded-md border border-white/10 bg-black/20 px-3 py-1.5'>
                <dt className='text-xs uppercase tracking-wide text-neutral-400'>
                  Run Gold Pot
                </dt>
                <dd className='mt-1 font-medium'>
                  {run.actualPot != null
                    ? Math.round(Number(run.actualPot)).toLocaleString('en-US')
                    : '-'}
                </dd>
              </div>
              <div className='rounded-md border border-white/10 bg-black/20 px-3 py-1.5'>
                <dt className='text-xs uppercase tracking-wide text-neutral-400'>
                  Run Dolar Pot
                </dt>
                <dd className='mt-1 font-medium'>
                  {run.actualPotDolar != null
                    ? Number(run.actualPotDolar).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : '-'}
                </dd>
              </div>
            </dl>
          </div>

          <div className='grid w-full gap-2 lg:w-[320px]'>
            <button
              onClick={handleOpenAddBuyer}
              disabled={isRunLocked}
              className={actionButtonClass}
            >
              <UserPlus size={18} />
              Add Buyer
            </button>
            {canManageRun ? (
              <>
                <button
                  onClick={handleOpenEditModal}
                  disabled={isRunLocked}
                  className={actionButtonClass}
                >
                  <Pencil size={18} />
                  Edit Raid
                </button>
                <button
                  onClick={() => setIsEditHistoryOpen(true)}
                  className={actionButtonClass}
                >
                  <Clock size={18} />
                  History
                </button>
                {canSeeMegaphoneButton() && (
                  <button
                    onClick={handleSendMessageToAllAdvertisers}
                    disabled={isRunLocked || cooldownMegaphone}
                    className={actionButtonClass}
                  >
                    <RiMegaphoneLine size={18} />
                    Message Advertisers
                  </button>
                )}
                <button
                  onClick={handleToggleRunLock}
                  className={actionButtonClass}
                >
                  {isRunLocked ? <LockOpen size={18} /> : <Lock size={18} />}
                  {isRunLocked ? 'Unlock Run' : 'Lock Run'}
                </button>
              </>
            ) : (
              isRunLocked && (
                <p className='rounded-md border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-center text-sm font-semibold text-purple-300'>
                  This run is currently locked. You do not have permission to unlock it.
                </p>
              )
            )}
          </div>
        </div>
        </div>

        {hasDolarCollectors && (
          <div
            className={`rounded-xl border border-white/10 bg-white/[0.04] p-3 text-white ${collectorColSpanClass}`}
          >
            <h2 className='text-base font-semibold'>Dolar Collectors</h2>
            <div className='mt-2 max-h-[260px] overflow-y-auto rounded-md border border-white/10 bg-black/20'>
              {!attendanceAccessDenied && (
                <table className='w-full text-sm'>
                  <tbody>
                    {run.sumPot
                      ?.filter(
                        (item) => item.type === 'dolar' && item.sumPot !== 0
                      )
                      .map((item) => (
                        <tr key={item.idDiscord} className='border-b border-white/5'>
                          <td className='px-3 py-2 text-left'>{item.username}</td>
                          <td className='px-3 py-2 text-right'>
                            {Number(item.sumPot).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

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
