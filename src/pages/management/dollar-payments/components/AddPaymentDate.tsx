import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { format, parse } from 'date-fns'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
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
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [dateInputValue, setDateInputValue] = useState('')
  const panelRef = useRef<HTMLDivElement | null>(null)
  const datePickerRef = useRef<DatePicker | null>(null)
  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0, width: 320 })

  const normalizeDateInput = useCallback((rawValue: string) => {
    const value = rawValue.trim()
    if (!value) return ''

    const monthDayYearMatch = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
    if (monthDayYearMatch) {
      const [, monthRaw, dayRaw, year] = monthDayYearMatch
      const month = monthRaw.padStart(2, '0')
      const day = dayRaw.padStart(2, '0')
      const isoCandidate = `${year}-${month}-${day}`
      const parsed = parse(isoCandidate, 'yyyy-MM-dd', new Date())
      if (Number.isNaN(parsed.getTime())) return null
      return format(parsed, 'yyyy-MM-dd') === isoCandidate ? isoCandidate : null
    }

    const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (isoMatch) {
      const parsed = parse(value, 'yyyy-MM-dd', new Date())
      if (Number.isNaN(parsed.getTime())) return null
      return format(parsed, 'yyyy-MM-dd') === value ? value : null
    }

    return null
  }, [])

  const handleClose = () => {
    setSelectedDate('')
    onClose()
  }

  const handleDateSelect = () => {
    if (!selectedDate) {
      handleClose()
      return
    }

    const [, month, day] = selectedDate.split('-')
    const confirmDisplayDate = `${month}/${day}`

    handleConfirmDate(selectedDate, confirmDisplayDate)
  }

  const applyManualDate = useCallback(() => {
    const normalizedDate = normalizeDateInput(dateInputValue)

    if (normalizedDate === '') {
      setSelectedDate('')
      return
    }

    if (!normalizedDate) return

    setSelectedDate(normalizedDate)
    const parsedDate = parse(normalizedDate, 'yyyy-MM-dd', new Date())
    setDateInputValue(format(parsedDate, 'MM/dd/yyyy'))
  }, [dateInputValue, normalizeDateInput])

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
      await handleApiError(error, 'Failed to create receipts date.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isOpen = Boolean(anchorEl)

  useEffect(() => {
    if (!isOpen || !anchorEl) return

    const updatePosition = () => {
      const rect = anchorEl.getBoundingClientRect()
      const viewportPadding = 12
      const desiredWidth = Math.max(320, rect.width)
      const maxAllowedWidth = Math.max(260, window.innerWidth - viewportPadding * 2)
      const width = Math.min(desiredWidth, maxAllowedWidth)
      const maxLeft = window.innerWidth - width - viewportPadding
      const left = Math.min(Math.max(viewportPadding, rect.left), Math.max(viewportPadding, maxLeft))

      setPanelPosition({
        top: rect.bottom + 8,
        left,
        width,
      })
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!panelRef.current) return
      if (!panelRef.current.contains(event.target as Node)) {
        handleClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [anchorEl, isOpen])

  const panelStyle = useMemo(
    () => ({
      position: 'fixed' as const,
      top: panelPosition.top,
      left: panelPosition.left,
      width: panelPosition.width,
      zIndex: 300,
    }),
    [panelPosition]
  )
  const selectedDateObject = useMemo(() => {
    if (!selectedDate) return null
    const parsedDate = parse(selectedDate, 'yyyy-MM-dd', new Date())
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
  }, [selectedDate])

  useEffect(() => {
    if (!selectedDate) {
      setDateInputValue('')
      return
    }

    const parsedDate = parse(selectedDate, 'yyyy-MM-dd', new Date())
    if (Number.isNaN(parsedDate.getTime())) {
      setDateInputValue('')
      return
    }

    setDateInputValue(format(parsedDate, 'MM/dd/yyyy'))
  }, [selectedDate])

  if (!isOpen) return null

  return (
    <div
      ref={panelRef}
      style={panelStyle}
      className='rounded-xl border border-white/10 bg-[#2a2a2a] p-3 shadow-2xl'
    >
      <div className='flex min-w-0 w-full flex-col gap-4'>
        <div className='relative'>
          <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>
            Select Date (MM/DD/YYYY)
          </label>
          <div className='relative'>
            <DatePicker
              ref={datePickerRef}
              selected={selectedDateObject}
              onChange={(date) => {
                const normalizedDate = date ? format(date, 'yyyy-MM-dd') : ''
                setSelectedDate(normalizedDate)
                setDateInputValue(date ? format(date, 'MM/dd/yyyy') : '')
              }}
              onChangeRaw={(event) => {
                const input = event?.target as HTMLInputElement | null
                if (!input) return
                setDateInputValue(input.value)
              }}
              onBlur={applyManualDate}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  applyManualDate()
                }
              }}
              dateFormat='MM/dd/yyyy'
              placeholderText='MM/DD/YYYY'
              showPopperArrow={false}
              popperPlacement='bottom-start'
              popperClassName='z-[300] balance-datepicker-popper'
              calendarClassName='balance-datepicker add-run-datepicker'
              wrapperClassName='w-full'
              className='h-10 w-full rounded-md border border-white/15 bg-white/[0.05] px-3 pr-10 text-left text-sm text-white outline-none transition focus:border-purple-400/50 disabled:cursor-not-allowed disabled:opacity-70'
              value={dateInputValue}
              disabled={isSubmitting}
            />
            <button
              type='button'
              onClick={() => datePickerRef.current?.setOpen(true)}
              aria-label='Open date picker'
              className='absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-xs text-purple-300/85 transition hover:bg-white/10 hover:text-purple-200'
            >
              ▼
            </button>
          </div>
        </div>
        <div className='flex flex-wrap justify-end gap-2'>
          <button
            type='button'
            onClick={handleClose}
            disabled={isSubmitting}
            className='rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60'
          >
            Cancel
          </button>
          <button
            type='button'
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


