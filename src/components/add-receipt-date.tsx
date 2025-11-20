import { useState } from 'react'
import Swal from 'sweetalert2'
import { Popover, TextField } from '@mui/material'
import { createReceiptsDate } from '../services/api'

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
      html: `<p style="color: white; font-size: 1.1rem;">Create receipts date <strong style="color: rgb(147, 51, 234);">${displayLabel}</strong>?</p>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'rgb(147, 51, 234)',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, create it!',
      cancelButtonText: 'Cancel',
      background: '#2a2a2a',
      color: 'white',
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
          background: '#2a2a2a',
          color: 'white',
        })
      }, 100)
    } catch (error) {
      console.error('Error creating receipts date:', error)
      setSelectedDate('')
      setDisplayDate('')
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to create receipts date.',
        confirmButtonColor: 'rgb(147, 51, 234)',
        background: '#2a2a2a',
        color: 'white',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!anchorEl) {
    return null
  }

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={handleClose}
      disableRestoreFocus
      disableEnforceFocus
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      slotProps={{
        paper: {
          sx: {
            mt: 1,
            p: 2,
            backgroundColor: '#2a2a2a',
            border: '1px solid #444',
          },
        },
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '250px' }}>
        <div style={{ position: 'relative' }}>
          <TextField
            label='Select Date (MM/DD/YYYY)'
            type='text'
            value={displayDate}
            placeholder='MM/DD/YYYY'
            fullWidth
            disabled={isSubmitting}
            InputProps={{
              readOnly: true,
              onClick: () => {
                const dateInput = document.getElementById('hidden-receipts-date-input') as HTMLInputElement | null
                if (dateInput) {
                  try {
                    dateInput.showPicker()
                  } catch (error) {
                    dateInput.click()
                  }
                }
              },
              style: { cursor: 'pointer' },
            }}
            sx={{
              '& .MuiInputBase-input': {
                color: 'white',
                cursor: 'pointer',
              },
              '& .MuiInputLabel-root': {
                color: '#9ca3af',
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#444',
                },
                '&:hover fieldset': {
                  borderColor: 'rgb(147, 51, 234)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgb(147, 51, 234)',
                },
              },
            }}
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
            style={{
              padding: '8px 16px',
              backgroundColor: isSubmitting || !selectedDate ? '#6b7280' : 'rgb(147, 51, 234)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isSubmitting || !selectedDate ? 'not-allowed' : 'pointer',
              fontSize: '14px',
            }}
          >
            {isSubmitting ? 'Creating...' : 'Confirm'}
          </button>
        </div>
      </div>
    </Popover>
  )
}


