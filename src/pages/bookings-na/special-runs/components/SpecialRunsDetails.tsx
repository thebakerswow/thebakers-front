import { forwardRef } from 'react'
import { CalendarBlank, CaretLeft, CaretRight, Clock, UserPlus } from '@phosphor-icons/react'
import DatePicker from 'react-datepicker'
import type { SpecialRunDetailsProps } from '../types/specialRuns'

const DatePickerInput = forwardRef<
  HTMLButtonElement,
  { value?: string; onClick?: () => void }
>(({ value, onClick }, ref) => (
  <button
    ref={ref}
    type='button'
    onClick={onClick}
    className='inline-flex h-10 min-w-[220px] items-center justify-center gap-2 rounded-md border border-white/15 bg-white/[0.08] px-4 text-sm font-medium text-neutral-100 transition hover:border-purple-300/40 hover:bg-white/[0.12]'
  >
    <CalendarBlank size={16} />
    {value || '-'}
  </button>
))

DatePickerInput.displayName = 'DatePickerInput'

export function SpecialRunDetails({
  selectedDate,
  onPreviousDate,
  onNextDate,
  onDateSelect,
  onOpenAddBuyer,
  onOpenHistory,
  canSeeHistoryButton,
}: SpecialRunDetailsProps) {
  const actionButtonClass =
    'inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-purple-400/40 bg-purple-500/20 px-4 text-sm text-purple-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.22)] transition hover:border-purple-300/55 hover:bg-purple-500/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/45 disabled:cursor-not-allowed disabled:border-zinc-500/60 disabled:bg-zinc-700/60 disabled:text-zinc-300 disabled:shadow-none'
  const dateButtonClass =
    'inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/15 bg-white/[0.08] text-white transition hover:border-purple-300/40 hover:bg-white/[0.12]'

  return (
    <div className='m-4 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-stretch'>
      <div className='rounded-xl border border-white/10 bg-white/[0.04] p-3 text-white'>
        <div className='flex h-full items-center justify-center gap-2'>
          <button type='button' onClick={onPreviousDate} className={dateButtonClass} aria-label='Previous day'>
            <CaretLeft size={18} />
          </button>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => date && onDateSelect(date)}
            dateFormat='EEE, MMM dd, yyyy'
            customInput={<DatePickerInput />}
            popperClassName='z-[240] balance-datepicker-popper'
            calendarClassName='balance-datepicker add-run-datepicker'
          />
          <button type='button' onClick={onNextDate} className={dateButtonClass} aria-label='Next day'>
            <CaretRight size={18} />
          </button>
        </div>
      </div>

      <div className='w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-white lg:w-[320px]'>
        <div className='grid w-full gap-2 lg:h-full'>
          <button type='button' onClick={onOpenAddBuyer} className={actionButtonClass}>
            <UserPlus size={18} />
            Add Buyer
          </button>
          {canSeeHistoryButton && (
            <button type='button' onClick={onOpenHistory} className={actionButtonClass}>
              <Clock size={18} />
              History
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
