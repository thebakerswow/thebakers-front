import { useState, useMemo, useEffect } from 'react'
import { CircleNotch, X } from '@phosphor-icons/react'
import { getRunHistory } from '../services/api/runs'
import { RunHistory } from '../types/runs-interface'
import dayjs from 'dayjs'

import { EditHistoryDialogProps } from '../types'

export function EditHistoryDialog({
  open,
  onClose,
  idRun,
}: EditHistoryDialogProps) {
  const [filter, setFilter] = useState('')
  const [history, setHistory] = useState<RunHistory[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !idRun) return
    setLoading(true)
    getRunHistory(idRun.toString())
      .then((historyData) => {
        setHistory(Array.isArray(historyData) ? historyData : [])
      })
      .finally(() => setLoading(false))
  }, [open, idRun])

  const filteredHistory = useMemo(() => {
    if (!filter.trim()) return history
    const lower = filter.toLowerCase()
    return history.filter((edit) => {
      const idBuyerStr =
        edit.id_buyer && edit.id_buyer.Valid
          ? edit.id_buyer.Int64.toString()
          : ''
      const searchString = [
        idBuyerStr,
        edit.field,
        edit.old_value,
        edit.new_value,
        edit.name_edited_by,
        edit.created_at,
      ]
        .join(' ')
        .toLowerCase()
      return searchString.includes(lower)
    })
  }, [filter, history])

  if (!open) return null

  return (
    <div className='fixed inset-0 z-[2200] flex items-center justify-center bg-[rgba(8,4,20,0.8)] p-4 backdrop-blur-[2px]'>
      <div className='w-full max-w-6xl rounded-xl border border-purple-300/25 bg-[linear-gradient(180deg,rgba(27,19,44,0.95)_0%,rgba(16,11,30,0.95)_100%)] p-5 shadow-[0_24px_50px_rgba(0,0,0,0.45)]'>
        <div className='mb-4 flex items-center justify-between border-b border-white/10 pb-3'>
          <h3 className='text-lg font-semibold text-purple-100'>Edit History</h3>
          <button
            type='button'
            onClick={onClose}
            className='rounded-md p-1 text-purple-200/70 hover:bg-purple-400/15 hover:text-purple-100'
          >
            <X size={18} />
          </button>
        </div>

        {!idRun ? (
          <div className='mb-3 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300'>
            No run id provided
          </div>
        ) : null}

        <input
          type='text'
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder='Filter edits'
          className='balance-filter-control mb-3 h-11 w-full rounded-md border border-purple-300/25 bg-[rgba(14,10,28,0.9)] px-4 text-sm text-purple-100 outline-none placeholder:text-purple-200/50'
        />

        <div className='max-h-[60vh] overflow-auto rounded-md border border-white/10 bg-white/[0.03] p-3'>
          {loading ? (
            <div className='py-8 text-center'>
              <CircleNotch className='mx-auto animate-spin text-purple-300' size={22} />
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className='py-6 text-center text-neutral-400'>No history found</div>
          ) : (
            <div className='space-y-2'>
              {filteredHistory.map((edit, idx) => {
                const idBuyer =
                  edit.id_buyer && edit.id_buyer.Valid
                    ? edit.id_buyer.Int64.toString()
                    : ''
                const buyerName = (edit.nameAndRealm || '').trim()
                const idBuyerText =
                  buyerName.length > 0
                    ? `Buyer ${buyerName}`
                    : idBuyer
                      ? `Buyer ${idBuyer}`
                    : 'Run'

                const oldValue =
                  edit.old_value && edit.old_value.trim().length > 0
                    ? edit.old_value
                    : '(vazio)'
                const newValue =
                  edit.new_value && edit.new_value.trim().length > 0
                    ? edit.new_value
                    : '(vazio)'
                const normalizedField = edit.field.trim().toLowerCase()
                const isCreatedEvent = normalizedField === 'created'
                const isDeletedEvent =
                  normalizedField === 'delete' || normalizedField === 'deleted'
                const timeLabel = dayjs(edit.created_at).format('HH:mm - MM/DD/YYYY')

                return (
                  <p
                    key={idx}
                    className='rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-neutral-100'
                  >
                    {isCreatedEvent ? (
                      <>
                        <span className='font-semibold text-purple-200'>{idBuyerText}</span>{' '}
                        was created by{' '}
                        <span className='font-semibold text-neutral-200'>
                          {edit.name_edited_by}
                        </span>{' '}
                        at <span className='text-neutral-300'>{timeLabel}</span>.
                      </>
                    ) : isDeletedEvent ? (
                      <>
                        <span className='font-semibold text-purple-200'>{idBuyerText}</span>{' '}
                        was deleted by{' '}
                        <span className='font-semibold text-neutral-200'>
                          {edit.name_edited_by}
                        </span>{' '}
                        at <span className='text-neutral-300'>{timeLabel}</span>.
                      </>
                    ) : (
                      <>
                        <span className='font-semibold text-purple-200'>{idBuyerText}</span>{' '}
                        had field{' '}
                        <span className='font-semibold text-purple-200'>{edit.field}</span>{' '}
                        changed from{' '}
                        <span className='font-medium text-rose-300'>{oldValue}</span>{' '}
                        to{' '}
                        <span className='font-medium text-emerald-300'>{newValue}</span>{' '}
                        by{' '}
                        <span className='font-semibold text-neutral-200'>
                          {edit.name_edited_by}
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
