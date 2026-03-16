import { useEffect, useMemo, useState } from 'react'
import { X } from '@phosphor-icons/react'
import dayjs from 'dayjs'
import { LoadingSpinner } from '../../../../components/LoadingSpinner'
import { getClaimServicesHistory } from '../services/specialRunsApi'
import type {
  ClaimServiceHistoryEntry,
  ClaimServicesHistoryDialogProps,
} from '../types/specialRuns'
import { handleApiError } from '../../../../utils/apiErrorHandler'

const toText = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return ''
}

export function ClaimServicesHistoryDialog({
  open,
  onClose,
  date,
  type,
}: ClaimServicesHistoryDialogProps) {
  const [filter, setFilter] = useState('')
  const [history, setHistory] = useState<ClaimServiceHistoryEntry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return

    setLoading(true)
    getClaimServicesHistory(date, type)
      .then((historyData) => {
        setHistory(Array.isArray(historyData) ? historyData : [])
      })
      .catch(async (error) => {
        await handleApiError(error, 'Failed to fetch claim service history')
      })
      .finally(() => setLoading(false))
  }, [open, date, type])

  const scopedHistory = useMemo(() => {
    return history.filter((item) => {
      const itemDate = toText(item.date)
      const itemType = toText(item.type).toLowerCase()
      const matchesDate = itemDate ? itemDate === date : true
      const matchesType = itemType ? itemType === type : true
      return matchesDate && matchesType
    })
  }, [history, date, type])

  const filteredHistory = useMemo(() => {
    if (!filter.trim()) return scopedHistory
    const lower = filter.toLowerCase()

    return scopedHistory.filter((edit) => {
      const buyerName = toText(edit.nameAndRealm || edit.name_and_realm)
      const searchString = [
        toText(edit.id ?? edit.id_claim_service),
        toText(edit.field),
        toText(edit.old_value),
        toText(edit.new_value),
        toText(edit.name_edited_by),
        toText(edit.created_at),
        buyerName,
      ]
        .join(' ')
        .toLowerCase()
      return searchString.includes(lower)
    })
  }, [filter, scopedHistory])

  if (!open) return null

  return (
    <div className='fixed inset-0 z-[240] flex items-center justify-center bg-black/70 p-4'>
      <div className='w-full max-w-6xl rounded-xl border border-white/10 bg-[#1a1a1a] p-4 text-white shadow-2xl'>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-white'>Edit History</h3>
          <button
            type='button'
            onClick={onClose}
            className='rounded-md border border-white/10 bg-white/5 p-1.5 text-white transition hover:border-purple-500/40 hover:text-purple-300'
          >
            <X size={18} />
          </button>
        </div>

        <input
          type='text'
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder='Filter edits'
          className='mb-3 h-10 w-full rounded-md border border-white/15 bg-white/[0.05] px-3 text-sm text-white outline-none placeholder:text-neutral-500 transition focus:border-purple-400/50'
        />

        <div className='max-h-[60vh] overflow-auto rounded-md border border-white/10 bg-white/[0.03] p-3'>
          {loading ? (
            <div className='py-8 text-center'>
              <LoadingSpinner
                size='sm'
                className='mx-auto'
                label='Loading history'
              />
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className='py-6 text-center text-neutral-400'>
              No history found
            </div>
          ) : (
            <div className='space-y-2'>
              {filteredHistory.map((edit, idx) => {
                const buyerName = toText(edit.nameAndRealm || edit.name_and_realm)
                const claimServiceId = toText(edit.id_claim_service ?? edit.id)
                const claimServiceText =
                  buyerName.trim().length > 0
                    ? `Buyer ${buyerName}`
                    : claimServiceId
                    ? `Claim Service ${claimServiceId}`
                    : 'Claim Service'

                const oldValue =
                  toText(edit.old_value).trim().length > 0
                    ? toText(edit.old_value)
                    : '(vazio)'
                const newValue =
                  toText(edit.new_value).trim().length > 0
                    ? toText(edit.new_value)
                    : '(vazio)'
                const field = toText(edit.field)
                const normalizedField = field.trim().toLowerCase()
                const isCreatedEvent = normalizedField === 'created'
                const isDeletedEvent =
                  normalizedField === 'delete' ||
                  normalizedField === 'deleted'
                const isClaimedEvent = normalizedField === 'claimed'
                const isUnclaimedEvent = normalizedField === 'unclaimed'
                const editedBy = toText(edit.name_edited_by) || 'Unknown'
                const timeLabel = dayjs(toText(edit.created_at)).format(
                  'HH:mm - MM/DD/YYYY'
                )

                return (
                  <p
                    key={`${claimServiceId}-${idx}`}
                    className='rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-neutral-100'
                  >
                    {isCreatedEvent ? (
                      <>
                        <span className='font-semibold text-purple-200'>
                          {claimServiceText}
                        </span>{' '}
                        was created by{' '}
                        <span className='font-semibold text-neutral-200'>
                          {editedBy}
                        </span>{' '}
                        at <span className='text-neutral-300'>{timeLabel}</span>.
                      </>
                    ) : isDeletedEvent ? (
                      <>
                        <span className='font-semibold text-purple-200'>
                          {claimServiceText}
                        </span>{' '}
                        was deleted by{' '}
                        <span className='font-semibold text-neutral-200'>
                          {editedBy}
                        </span>{' '}
                        at <span className='text-neutral-300'>{timeLabel}</span>.
                      </>
                    ) : isClaimedEvent ? (
                      <>
                        <span className='font-semibold text-purple-200'>
                          {claimServiceText}
                        </span>{' '}
                        has been claimed by{' '}
                        <span className='font-semibold text-neutral-200'>
                          {editedBy}
                        </span>{' '}
                        at <span className='text-neutral-300'>{timeLabel}</span>.
                      </>
                    ) : isUnclaimedEvent ? (
                      <>
                        <span className='font-semibold text-purple-200'>
                          {claimServiceText}
                        </span>{' '}
                        has been unclaimed by{' '}
                        <span className='font-semibold text-neutral-200'>
                          {editedBy}
                        </span>{' '}
                        at <span className='text-neutral-300'>{timeLabel}</span>.
                      </>
                    ) : (
                      <>
                        <span className='font-semibold text-purple-200'>
                          {claimServiceText}
                        </span>{' '}
                        had field{' '}
                        <span className='font-semibold text-purple-200'>
                          {field}
                        </span>{' '}
                        changed from{' '}
                        <span className='font-medium text-rose-300'>
                          {oldValue}
                        </span>{' '}
                        to{' '}
                        <span className='font-medium text-emerald-300'>
                          {newValue}
                        </span>{' '}
                        by{' '}
                        <span className='font-semibold text-neutral-200'>
                          {editedBy}
                        </span>{' '}
                        at <span className='text-neutral-300'>{timeLabel}</span>.
                      </>
                    )}
                  </p>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
