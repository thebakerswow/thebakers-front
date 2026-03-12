import { useState, useEffect, useCallback } from 'react'
import {
  getFreelancers,
  getFreelancerUsers,
  createFreelancer,
  deleteFreelancer,
  updateFreelancerAttendance,
} from '../services/runApi'
import { Trash } from '@phosphor-icons/react'
import { ErrorComponent, ErrorDetails } from '../../../../components/error-display'
import { LoadingSpinner } from '../../../../components/LoadingSpinner'
import type { FreelancersProps, User } from '../types/run'
import { getApiErrorMessage, handleApiError } from '../../../../utils/apiErrorHandler'

export function Freelancers({ runId, runIsLocked }: FreelancersProps) {
  const [freelancers, setFreelancers] = useState<User[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false) // For adding freelancers
  const [isLoadingFreelancers, setIsLoadingFreelancers] = useState(true)
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [freelancerToDelete, setFreelancerToDelete] = useState<string | null>(
    null
  )
  const [deletingFreelancerId, setDeletingFreelancerId] = useState<
    string | null
  >(null) // Track the specific freelancer being deleted

  const handleError = async (error: unknown, fallbackMessage = 'Unexpected error') => {
    await handleApiError(error, fallbackMessage)
    setError({ message: getApiErrorMessage(error, fallbackMessage), response: error })
  }

  useEffect(() => {
    if (runId) {
      getFreelancers(runId)
        .then((response) => setFreelancers(response || []))
        .finally(() => setIsLoadingFreelancers(false))

      getFreelancerUsers(runId)
        .then((response) => setUsers(response || []))
        .catch(handleError)
    }
  }, [runId])

  useEffect(() => {
    setFilteredUsers(
      search.trim()
        ? users.filter((user) =>
            user.username.toLowerCase().includes(search.toLowerCase())
          )
        : []
    )
  }, [search, users])

  const handleAddFreelancer = async () => {
    if (!selectedUser || !runId || runIsLocked) return // Prevent adding if runIsLocked
    setIsSubmitting(true)
    try {
      await createFreelancer({
        id_discord: selectedUser.id_discord,
        id_run: runId,
      })
      const response = await getFreelancers(runId)
      setFreelancers(response || [])
      setSearch('')
      setSelectedUser(null)
    } catch (error) {
      await handleError(error, 'Failed to add freelancer')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenDeleteDialog = (id_discord: string) => {
    setFreelancerToDelete(id_discord)
    setDeleteDialogOpen(true)
  }

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setFreelancerToDelete(null)
  }

  const handleConfirmDeleteFreelancer = async () => {
    if (!runId || !freelancerToDelete) return
    setDeletingFreelancerId(freelancerToDelete) // Set the ID of the freelancer being deleted
    setError(null) // Reset error state before attempting deletion
    try {
      await deleteFreelancer(freelancerToDelete, runId)
      const response = await getFreelancers(runId)
      setFreelancers(response || [])
    } catch (err) {
      await handleError(err, 'Failed to delete freelancer')
    } finally {
      setDeletingFreelancerId(null) // Reset the deleting state
      handleCloseDeleteDialog()
    }
  }

  const handleAttendanceClick = async (
    id_discord: string,
    percentage: number
  ) => {
    if (!runId) return

    try {
      await updateFreelancerAttendance({
        id_discord,
        id_run: runId,
        percentage,
      })
      setFreelancers((prev) =>
        prev.map((freelancer) =>
          freelancer.id_discord === id_discord
            ? { ...freelancer, percentage }
            : freelancer
        )
      )
    } catch (error) {
      await handleError(error, 'Failed to update freelancer attendance')
    }
  }

  const getColorForPercentage = useCallback(
    (percentage: number) =>
      percentage === 0 ? '#ef4444' : percentage === 100 ? '#16a34a' : '#fde047',
    []
  )

  const renderSelect = (idDiscord: string, percentage: number | undefined) => (
    <select
      value={percentage || 0}
      onChange={(e) => handleAttendanceClick(idDiscord, Number(e.target.value))}
      disabled={runIsLocked}
      className='h-9 rounded-md border border-white/20 px-2 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60'
      style={{ backgroundColor: getColorForPercentage(percentage || 0) }}
    >
      {[...Array(11)].map((_, i) => {
        const value = i * 10
        return (
          <option key={value} value={value} className='bg-neutral-900 text-white'>
            {value}%
          </option>
        )
      })}
    </select>
  )

  const selectedFreelancerName = freelancerToDelete
    ? freelancers.find((f) => f.id_discord === freelancerToDelete)?.username
    : null

  return (
    <div className='w-full'>
      {error && <ErrorComponent error={error} onClose={() => setError(null)} />}

      <div className='rounded-xl border border-white/10 bg-black/30 p-3 text-white'>
        <div className='mb-3 flex flex-wrap items-center gap-2'>
          <div className='relative min-w-[280px] flex-1'>
            <input
              type='text'
              value={search}
              onChange={(e) => {
                const value = e.target.value
                setSearch(value)
                setIsAutocompleteOpen(true)
                const normalizedValue = value.trim().toLowerCase()
                const matchedUser =
                  users.find(
                    (user) => user.username.trim().toLowerCase() === normalizedValue
                  ) || null
                setSelectedUser(matchedUser)
              }}
              onFocus={() => setIsAutocompleteOpen(true)}
              onBlur={() => setTimeout(() => setIsAutocompleteOpen(false), 120)}
              placeholder='Freelancer'
              disabled={runIsLocked}
              className='balance-filter-control h-10 w-full rounded-md border border-white/20 bg-[linear-gradient(180deg,rgba(23,23,27,0.92)_0%,rgba(14,14,18,0.92)_100%)] px-3 text-sm text-white/95 outline-none disabled:cursor-not-allowed disabled:opacity-60'
            />

            {isAutocompleteOpen && search.trim() && filteredUsers.length > 0 && (
              <div className='absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-56 overflow-auto rounded-md border border-white/15 bg-neutral-900/95 p-1 shadow-xl backdrop-blur-sm'>
                {filteredUsers.slice(0, 8).map((user) => (
                  <button
                    key={user.id_discord}
                    type='button'
                    onMouseDown={(e) => {
                      e.preventDefault()
                      setSelectedUser(user)
                      setSearch(user.username)
                      setIsAutocompleteOpen(false)
                    }}
                    className='w-full rounded-md px-3 py-2 text-left text-sm text-white/90 hover:bg-white/10'
                  >
                    {user.username}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type='button'
            onClick={handleAddFreelancer}
            disabled={runIsLocked || isSubmitting || !selectedUser}
            className='inline-flex h-10 min-w-[140px] items-center justify-center gap-2 rounded-md border border-purple-400/40 bg-purple-500/20 px-4 text-sm text-purple-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.22)] transition hover:border-purple-300/55 hover:bg-purple-500/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/45 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none'
          >
            {isSubmitting && <LoadingSpinner size='sm' label='Adding freelancer' />}
            {isSubmitting ? 'Adding...' : 'Add Freelancer'}
          </button>
        </div>

        <div className='overflow-hidden rounded-md border border-white/10 bg-white/[0.03]'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-white/10 text-neutral-300'>
                <th className='px-3 py-2 text-left font-semibold'>Freelancer</th>
                <th className='px-3 py-2 text-center font-semibold'>Attendance</th>
                <th className='px-3 py-2 text-center font-semibold'>Delete</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingFreelancers ? (
                <tr>
                  <td colSpan={3} className='px-3 py-8 text-center'>
                    <LoadingSpinner size='md' className='mx-auto' label='Loading freelancers' />
                  </td>
                </tr>
              ) : freelancers.length === 0 ? (
                <tr>
                  <td colSpan={3} className='px-3 py-4 text-center text-neutral-400'>
                    No Freelancer
                  </td>
                </tr>
              ) : (
                freelancers.map((user) => (
                  <tr key={user.id_discord} className='border-b border-white/5 last:border-b-0'>
                    <td className='px-3 py-2 text-left'>{user.username}</td>
                    <td className='px-3 py-2 text-center'>
                      {renderSelect(user.id_discord, user.percentage)}
                    </td>
                    <td className='px-3 py-2 text-center'>
                      <button
                        type='button'
                        onClick={() => handleOpenDeleteDialog(user.id_discord)}
                        disabled={runIsLocked || deletingFreelancerId === user.id_discord}
                        className='rounded-md p-1 text-red-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        {deletingFreelancerId === user.id_discord ? (
                          <LoadingSpinner size='sm' label='Deleting freelancer' />
                        ) : (
                          <Trash size={18} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteDialogOpen && (
        <div className='fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4'>
          <div className='w-full max-w-md rounded-xl border border-white/15 bg-neutral-900 p-4 text-white shadow-2xl'>
            <h2 className='mb-3 text-lg font-semibold'>Confirm Deletion</h2>
            <p className='mb-4 text-sm text-neutral-300'>
              Are you sure you want to delete{' '}
              <span className='font-semibold text-white'>{selectedFreelancerName}</span>?
            </p>
            <div className='flex justify-end gap-2'>
              <button
                type='button'
                onClick={handleCloseDeleteDialog}
                disabled={deletingFreelancerId !== null}
                className='rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50'
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={handleConfirmDeleteFreelancer}
                disabled={deletingFreelancerId !== null}
                className='inline-flex min-w-[96px] items-center justify-center gap-2 rounded-md border border-red-400/40 bg-red-500/80 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {deletingFreelancerId !== null && <LoadingSpinner size='sm' label='Deleting' />}
                {deletingFreelancerId !== null ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
