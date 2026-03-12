import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { format, parse } from 'date-fns'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import Swal from 'sweetalert2'
import { handleApiError } from '../../../../utils/apiErrorHandler'
import { createPaymentDate } from '../services/goldPaymentApi'

interface AddPaymentDateProps {
  anchorEl: HTMLElement | null
  onClose: () => void
  onPaymentDateAdded: (paymentDateName: string, paymentDateId: string | number) => void
}

const DatePickerInput = forwardRef<
  HTMLButtonElement,
  { value?: string; onClick?: () => void; className: string; placeholder?: string }
>(({ value, onClick, className, placeholder = 'MM/DD/YYYY' }, ref) => (
  <button ref={ref} type='button' onClick={onClick} className={className}>
    <span className={value ? 'text-white' : 'text-neutral-500'}>{value || placeholder}</span>
  </button>
))

DatePickerInput.displayName = 'DatePickerInput'

export function AddPaymentDate({
  anchorEl,
  onClose,
  onPaymentDateAdded,
}: AddPaymentDateProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const panelRef = useRef<HTMLDivElement | null>(null)
  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0, width: 320 })

  const handleClose = () => {
    setSelectedDate('')
    onClose()
  }

  const handleDateSelect = () => {
    if (!selectedDate) {
      handleClose()
      return
    }

    // selectedDate já está no formato YYYY-MM-DD (formato do input type="date")
    const [_year, month, day] = selectedDate.split('-')
    
    // Converte para MM/DD para confirmação
    const confirmDisplayDate = `${month}/${day}`

    // Envia no formato YYYY-MM-DD para a API
    handleConfirmDate(selectedDate, confirmDisplayDate)
  }

  const handleConfirmDate = async (dateString: string, displayDate: string) => {
    // Abre modal de confirmação
    const result = await Swal.fire({
      title: 'Confirm Payment Date',
      html: `<p style="color: white; font-size: 1.1rem;">Create payment date <strong style="color: rgb(147, 51, 234);">${displayDate}</strong>?</p>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, create it!',
      cancelButtonText: 'Cancel',
    })
    
    if (result.isConfirmed) {
      setIsSubmitting(true)
      
      try {
        // Chama API para criar a payment date no formato YYYY-MM-DD
        const newPaymentDate = await createPaymentDate({ 
          name: dateString 
        })
        
        // Converte a data para MM/DD para exibição
        // Usa displayDate que já foi passado como parâmetro (já está no formato correto)
        const formattedName = displayDate
        
        // Fecha e atualiza
        setSelectedDate('')
        onClose()
        onPaymentDateAdded(formattedName, newPaymentDate.id)
        
        // Mostra mensagem de sucesso
        setTimeout(() => {
          Swal.fire({
            title: 'Success!',
            text: 'Payment date created successfully!',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
          })
        }, 100)
      } catch (error) {
        console.error('Error creating payment date:', error)
        setSelectedDate('')
        await handleApiError(error, 'Failed to create payment date.')
      } finally {
        setIsSubmitting(false)
      }
    } else {
      // Se cancelar, fecha sem criar
      handleClose()
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
              selected={selectedDateObject}
              onChange={(date) => setSelectedDate(date ? format(date, 'yyyy-MM-dd') : '')}
              dateFormat='MM/dd/yyyy'
              placeholderText='MM/DD/YYYY'
              showPopperArrow={false}
              popperPlacement='bottom-start'
              popperClassName='z-[300] balance-datepicker-popper'
              calendarClassName='balance-datepicker add-run-datepicker'
              wrapperClassName='w-full'
              disabled={isSubmitting}
              customInput={
                <DatePickerInput className='h-10 w-full rounded-md border border-white/15 bg-white/[0.05] px-3 pr-9 text-left text-sm text-white outline-none transition focus:border-purple-400/50 disabled:cursor-not-allowed disabled:opacity-70' />
              }
            />
            <span className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-purple-300/85'>
              ▼
            </span>
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
