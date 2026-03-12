import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X } from '@phosphor-icons/react'
import { BuyersDataGrid } from '../../run/components/BuyersGrid'
import { getRaidsRun, getRaidsRunBuyers } from '../services/raidsApi'
import { AddBuyer } from '../../run/components/AddBuyer'
import { LoadingSpinner } from '../../../../components/LoadingSpinner'
import { handleApiError } from '../../../../utils/apiErrorHandler'
import type { BuyerData } from '../../../../types/buyer-interface'
import type { RaidsRunData, BuyersPreviewProps } from '../types/raids'

export function BuyersPreview({ runId, runScreen, onClose }: BuyersPreviewProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [rows, setRows] = useState<BuyerData[]>([])
  const [runData, setRunData] = useState<RaidsRunData | undefined>()
  const [isAddBuyerOpen, setIsAddBuyerOpen] = useState(false)

  const fetchData = useCallback(
    async (showLoading = true) => {
      if (showLoading) setIsLoading(true)
      try {
        const [runResponse, buyersResponse] = await Promise.all([
          getRaidsRun(runId, runScreen),
          getRaidsRunBuyers(runId, runScreen),
        ])
        setRunData(runResponse)
        setRows(buyersResponse)
      } catch (fetchError) {
        if (showLoading) {
          await handleApiError(fetchError, 'Failed to load buyers preview')
        }
      } finally {
        if (showLoading) setIsLoading(false)
      }
    },
    [runId, runScreen]
  )

  useEffect(() => {
    if (runId) fetchData(true)
  }, [runId, fetchData])

  useEffect(() => {
    if (!runId) return
    const interval = setInterval(() => {
      fetchData(false)
    }, 2000)
    return () => clearInterval(interval)
  }, [runId, fetchData])

  return createPortal(
    (
    <div className='fixed inset-0 z-[240] flex items-center justify-center bg-black/70 p-4'>
      <div className='flex h-[78vh] w-full max-w-[82vw] flex-col rounded-xl border border-white/10 bg-[#1a1a1a] p-4 text-white shadow-2xl'>
        <div className='mb-3 flex shrink-0 items-center justify-between'>
          <h2 className='text-lg font-semibold'>Buyers Preview</h2>
          <button
            type='button'
            onClick={onClose}
            className='rounded-md border border-white/10 bg-white/5 p-1.5 text-white transition hover:border-purple-500/40 hover:text-purple-300'
            aria-label='Close buyers preview'
          >
            <X size={18} />
          </button>
        </div>

        <div className='mb-3 flex shrink-0 flex-wrap items-center gap-3'>
          <button
            onClick={() => setIsAddBuyerOpen(true)}
            className='inline-flex h-10 min-w-[140px] items-center justify-center rounded-md border border-purple-400/40 bg-purple-500/20 px-4 text-sm font-medium text-purple-100 transition hover:border-purple-300/55 hover:bg-purple-500/30'
          >
            Add Buyer
          </button>

          {rows.length > 0 && (
            <span className='rounded-md border border-white/15 bg-white/[0.08] px-4 py-2 text-sm text-neutral-200'>
              Waiting: <span className='mx-1 text-yellow-300'>{rows.filter((b) => b.status === 'waiting').length}</span>
              Group: <span className='ml-1 text-sky-300'>{rows.filter((b) => b.status === 'group').length}</span>
            </span>
          )}
        </div>

        {isLoading ? (
          <div className='flex min-h-0 flex-1 flex-col items-center justify-center gap-3'>
            <LoadingSpinner size='lg' label='Loading buyers preview' />
            <p className='text-sm text-neutral-300'>Loading buyers...</p>
          </div>
        ) : rows.length > 0 ? (
          <div className='min-h-0 flex-1 overflow-y-auto overflow-x-hidden'>
            <BuyersDataGrid
              data={rows}
              onBuyerStatusEdit={fetchData}
              onBuyerNameNoteEdit={fetchData}
              onDeleteSuccess={fetchData}
              containerClassName='h-full'
            />
          </div>
        ) : (
          <div className='flex min-h-0 flex-1 items-center justify-center text-neutral-400'>
            No buyers found
          </div>
        )}

        {isAddBuyerOpen && runData && (
          <AddBuyer
            run={runData}
            onClose={() => setIsAddBuyerOpen(false)}
            onBuyerAddedReload={fetchData}
          />
        )}
      </div>
    </div>
    ),
    document.body
  )
}
