import { useState } from 'react'
import Swal from 'sweetalert2'
import { handleApiError } from '../../../../utils/apiErrorHandler'
import { createReceiptsDate } from '../services/dollarPaymentsApi'

interface AddReceiptsDateProps {
  anchorEl: HTMLElement | null
  onClose: () => void
  onDateAdded: (dateName: string, dateId: number) => void
}

export function AddReceiptsDate({ anchorEl, onClose, onDateAdded }: AddReceiptsDateProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [displayDate, setDisplayDate] = useState('')

  const handleClose = () => {
    setSelectedDate('')
    setDisplayDate('')
    onClose()
  }

  const handleDateChange = (value: string) => {
    setSelectedDate(value)

    if (value) {
      const [year, month, day] = value.split('-')
      setDisplayDate(`${month}/${day}/${year}`)
    } else {
      setDisplayDate('')
    }
  }

  const handleDateSelect = () => {
    if (!selectedDate) {
      handleClose()
      return
    }

    const [_year, month, day] = selectedDate.split('-')
    const confirmDisplayDate = `${month}/${day}`

    handleConfirmDate(selectedDate, confirmDisplayDate)
  }

  const handleConfirmDate = async (dateString: string, displayLabel: string) => {
    const result = await Swal.fire({
      title: 'Confirm Receipts Date',
      text: `Create receipts date ${displayLabel}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, create it!',
      cancelButtonText: 'Cancel',
    })

    if (!result.isConfirmed) {
      handleClose()
      return
    }

    setIsSubmitting(true)

    try {
      const newDate = await createReceiptsDate({ name: dateString })

      setSelectedDate('')
      setDisplayDate('')
      onClose()
      onDateAdded(displayLabel, newDate.id)

      setTimeout(() => {
        Swal.fire({
          title: 'Success!',
          text: 'Receipts date created successfully!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        })
      }, 100)
    } catch (error) {
      setSelectedDate('')
      setDisplayDate('')
      await handleApiError(error, 'Failed to create receipts date.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!anchorEl) {
    return null
  }

  const anchorRect = anchorEl.getBoundingClientRect()

  return (
    <div
      className='fixed z-[300] rounded-xl border border-white/10 bg-[#2a2a2a] p-3 shadow-2xl'
      style={{ top: anchorRect.bottom + 8, left: anchorRect.left, minWidth: 250 }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '250px' }}>
        <div style={{ position: 'relative' }}>
          <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>
            Select Date (MM/DD/YYYY)
          </label>
          <input
            type='text'
            value={displayDate}
            readOnly
            placeholder='MM/DD/YYYY'
            disabled={isSubmitting}
            onClick={() => {
              const dateInput = document.getElementById('hidden-receipts-date-input') as HTMLInputElement | null
              if (dateInput) {
                try {
                  dateInput.showPicker()
                } catch (_error) {
                  dateInput.click()
                }
              }
            }}
            className='h-10 w-full cursor-pointer rounded-md border border-white/15 bg-white/[0.05] px-3 text-sm text-white outline-none transition focus:border-purple-400/50'
          />
          <input
            id='hidden-receipts-date-input'
            type='date'
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            disabled={isSubmitting}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer',
              zIndex: -1,
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            style={{
              padding: '8px 16px',
              backgroundColor: '#444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: isSubmitting ? 0.6 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleDateSelect}
            disabled={isSubmitting || !selectedDate}
            className='rounded-md border border-purple-400/40 bg-purple-500/20 px-3 py-2 text-sm font-medium text-purple-100 transition hover:border-purple-300/55 hover:bg-purple-500/30 disabled:cursor-not-allowed disabled:opacity-60'
          >
            {isSubmitting ? 'Creating...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}


