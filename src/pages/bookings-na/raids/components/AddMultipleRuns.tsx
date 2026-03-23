import { useState } from 'react'
import { createPortal } from 'react-dom'
import { format } from 'date-fns'
import { X } from '@phosphor-icons/react'
import Swal from 'sweetalert2'
import { createRaidRun } from '../services/raidsApi'
import { LoadingSpinner } from '../../../../components/LoadingSpinner'
import { handleApiError } from '../../../../utils/apiErrorHandler'
import type { AddMultipleRunsProps, RaidRunCreatePayload } from '../types/raids'

export function AddMultipleRuns({
  isOpen,
  selectedDate,
  onClose,
  onRunsAdded,
}: AddMultipleRunsProps) {
  const [bulkRunsData, setBulkRunsData] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleClose = () => {
    setBulkRunsData('')
    onClose()
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
        date: format(selectedDate, 'yyyy-MM-dd'),
      }))

      setBulkRunsData(JSON.stringify(updatedRuns, null, 2))
    } catch {
      setBulkRunsData(value)
    }
  }

  const handleBulkAddRuns = async () => {
    setIsSubmitting(true)
    try {
      const parsedRuns = JSON.parse(bulkRunsData)
      const runsArray = Array.isArray(parsedRuns) ? parsedRuns : [parsedRuns]

      const formattedRuns: RaidRunCreatePayload[] = runsArray.map((run) => ({
        minPriceEnabled: false,
        minPriceGold: Number(run.minPriceGold ?? 0),
        minPriceDollar: Number(run.minPriceDollar ?? 0),
        name: run.name,
        date: run.date,
        time: run.time,
        raid: run.raid,
        runType: run.runType,
        difficulty: run.difficulty,
        idTeam: run.idTeam,
        maxBuyers: run.maxBuyers.toString(),
        raidLeader: run.raidLeader,
        loot: run.loot,
        quantityBoss: run.quantityBoss,
        note: run.note || '',
      }))

      const hasInvalidMinPrice = formattedRuns.some(
        (run) => run.minPriceGold <= 0 || run.minPriceDollar <= 0
      )
      if (hasInvalidMinPrice) {
        throw new Error('Discount Gold and Discount USD must be greater than zero.')
      }

      for (const run of formattedRuns) {
        await createRaidRun(run)
      }

      Swal.fire({
        icon: 'success',
        title: 'Runs added successfully!',
        confirmButtonColor: '#22c55e',
        timer: 1500,
        showConfirmButton: false,
      })
      await onRunsAdded()
      handleClose()
    } catch (error) {
      await handleApiError(error, 'Failed to add runs. Please check the data format.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div className='fixed inset-0 z-[240] flex items-center justify-center bg-black/70 p-4'>
      <div className='w-full max-w-3xl rounded-xl border border-white/10 bg-[#1a1a1a] p-4 text-white shadow-2xl'>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-white'>Add Multiple Runs</h3>
          <button
            aria-label='close'
            onClick={handleClose}
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
            onClick={handleClose}
            className='rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-200 transition hover:bg-white/10'
          >
            Cancel
          </button>
          <button
            onClick={handleBulkAddRuns}
            disabled={isSubmitting}
            className='inline-flex items-center gap-2 rounded-md border border-purple-400/40 bg-purple-500/20 px-3 py-2 text-sm font-medium text-purple-100 transition hover:border-purple-300/55 hover:bg-purple-500/30 disabled:cursor-not-allowed disabled:opacity-60'
          >
            {isSubmitting && <LoadingSpinner size='sm' label='Submitting runs' />}
            {isSubmitting ? 'Submitting...' : 'Submit Runs'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
