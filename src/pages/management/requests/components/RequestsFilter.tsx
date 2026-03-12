import { CSSProperties, forwardRef, useMemo } from 'react'
import { format, parse } from 'date-fns'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { CustomSelect } from '../../../../components/CustomSelect'
import type { RequestsFilterProps, RequestsStatusFilter } from '../types/requests'

const DatePickerInput = forwardRef<
  HTMLButtonElement,
  { value?: string; onClick?: () => void; className: string; placeholder?: string }
>(({ value, onClick, className, placeholder = 'dd/mm/aaaa' }, ref) => (
  <button ref={ref} type='button' onClick={onClick} className={className}>
    <span className={value ? 'text-white' : 'text-white/60'}>{value || placeholder}</span>
  </button>
))

DatePickerInput.displayName = 'DatePickerInput'

const getStatusButtonClass = (currentStatus: RequestsStatusFilter, status: RequestsStatusFilter) => {
  const isActive = currentStatus === status
  if (status === 'pending') {
    return isActive
      ? 'border-amber-400/60 bg-amber-500/25 text-amber-100'
      : 'border-white/15 bg-white/[0.03] text-neutral-200 hover:border-amber-400/60 hover:bg-amber-500/15'
  }
  if (status === 'accepted') {
    return isActive
      ? 'border-emerald-400/60 bg-emerald-500/25 text-emerald-100'
      : 'border-white/15 bg-white/[0.03] text-neutral-200 hover:border-emerald-400/60 hover:bg-emerald-500/15'
  }
  if (status === 'denied') {
    return isActive
      ? 'border-red-400/60 bg-red-500/25 text-red-100'
      : 'border-white/15 bg-white/[0.03] text-neutral-200 hover:border-red-400/60 hover:bg-red-500/15'
  }
  return isActive
    ? 'border-purple-400/60 bg-purple-500/25 text-purple-100'
    : 'border-white/15 bg-white/[0.03] text-neutral-200 hover:border-purple-400/60 hover:bg-purple-500/15'
}

const getStatusButtonStyle = (
  currentStatus: RequestsStatusFilter,
  status: RequestsStatusFilter
): CSSProperties => {
  const isActive = currentStatus === status
  if (status === 'pending') {
    return {
      borderColor: isActive ? '#f59e0b' : '#d97706',
      backgroundColor: isActive ? 'rgba(245,158,11,0.28)' : 'rgba(245,158,11,0.10)',
      color: '#fef3c7',
    }
  }
  if (status === 'accepted') {
    return {
      borderColor: isActive ? '#10b981' : '#059669',
      backgroundColor: isActive ? 'rgba(16,185,129,0.28)' : 'rgba(16,185,129,0.10)',
      color: '#d1fae5',
    }
  }
  if (status === 'denied') {
    return {
      borderColor: isActive ? '#ef4444' : '#dc2626',
      backgroundColor: isActive ? 'rgba(239,68,68,0.28)' : 'rgba(239,68,68,0.10)',
      color: '#fee2e2',
    }
  }
  return {
    borderColor: isActive ? '#a855f7' : '#9333ea',
    backgroundColor: isActive ? 'rgba(168,85,247,0.28)' : 'rgba(168,85,247,0.10)',
    color: '#f3e8ff',
  }
}

export function RequestsFilter({
  statusFilter,
  onStatusFilterChange,
  teamFilter,
  onTeamFilterChange,
  teamOptions,
  playerFilterInput,
  onPlayerFilterInputChange,
  onPlayerFilterKeyPress,
  dateMinFilter,
  onDateMinFilterChange,
  dateMaxFilter,
  onDateMaxFilterChange,
  minValueFilterInput,
  onMinValueFilterInputChange,
  onMinValueFilterKeyPress,
  maxValueFilterInput,
  onMaxValueFilterInputChange,
  onMaxValueFilterKeyPress,
  onClearFilters,
}: RequestsFilterProps) {
  const selectedDateMin = useMemo(() => {
    if (!dateMinFilter) return null
    const parsedDate = parse(dateMinFilter, 'yyyy-MM-dd', new Date())
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
  }, [dateMinFilter])

  const selectedDateMax = useMemo(() => {
    if (!dateMaxFilter) return null
    const parsedDate = parse(dateMaxFilter, 'yyyy-MM-dd', new Date())
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
  }, [dateMaxFilter])

  return (
    <div className='relative isolate mb-4 rounded-xl border border-white/10 bg-white/[0.04] p-4'>
      <div className='mb-3 flex flex-wrap gap-2'>
        {(['pending', 'accepted', 'denied', 'all'] as const).map((status) => (
          <button
            key={status}
            type='button'
            onClick={() => onStatusFilterChange(status)}
            className={`rounded-md border px-3 py-2 text-sm transition ${getStatusButtonClass(statusFilter, status)}`}
            style={getStatusButtonStyle(statusFilter, status)}
          >
            {status === 'all' ? 'All Requests' : status[0].toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'>
        <div>
          <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>Team</label>
          <CustomSelect
            value={teamFilter}
            onChange={onTeamFilterChange}
            options={teamOptions}
            minWidthClassName='min-w-0'
            triggerClassName='h-10 ![background-image:none] !border-white/15 !bg-white/[0.05] !shadow-none text-sm !text-white focus:!border-purple-400/50 focus:!ring-0'
            menuClassName='!border-white/15 !bg-[#1a1a1a]'
            optionClassName='text-white/90 hover:bg-purple-500/20'
            renderInPortal
          />
        </div>

        <div>
          <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>Player</label>
          <input
            value={playerFilterInput}
            onChange={(event) => onPlayerFilterInputChange(event.target.value)}
            onKeyDown={onPlayerFilterKeyPress}
            placeholder='Search player...'
            className='h-10 w-full rounded-md border border-white/15 bg-white/[0.05] px-3 text-sm text-white outline-none transition focus:border-purple-400/50'
          />
        </div>

        <div>
          <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>From Date</label>
          <div className='relative'>
            <DatePicker
              selected={selectedDateMin}
              onChange={(date) => onDateMinFilterChange(date ? format(date, 'yyyy-MM-dd') : '')}
              dateFormat='dd/MM/yyyy'
              placeholderText='dd/mm/aaaa'
              showPopperArrow={false}
              popperClassName='z-[99999] balance-datepicker-popper'
              calendarClassName='balance-datepicker add-run-datepicker'
              wrapperClassName='w-full'
              customInput={
                <DatePickerInput className='h-10 w-full rounded-md border border-white/15 bg-white/[0.05] px-3 pr-9 text-left text-sm text-white shadow-none outline-none transition focus:border-purple-400/50' />
              }
            />
            <span className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-purple-300/85'>
              ▼
            </span>
          </div>
        </div>

        <div>
          <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>To Date</label>
          <div className='relative'>
            <DatePicker
              selected={selectedDateMax}
              onChange={(date) => onDateMaxFilterChange(date ? format(date, 'yyyy-MM-dd') : '')}
              dateFormat='dd/MM/yyyy'
              placeholderText='dd/mm/aaaa'
              showPopperArrow={false}
              popperClassName='z-[99999] balance-datepicker-popper'
              calendarClassName='balance-datepicker add-run-datepicker'
              wrapperClassName='w-full'
              customInput={
                <DatePickerInput className='h-10 w-full rounded-md border border-white/15 bg-white/[0.05] px-3 pr-9 text-left text-sm text-white shadow-none outline-none transition focus:border-purple-400/50' />
              }
            />
            <span className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-purple-300/85'>
              ▼
            </span>
          </div>
        </div>

        <div>
          <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>Min Value</label>
          <input
            type='text'
            value={minValueFilterInput}
            onChange={(event) => onMinValueFilterInputChange(event.target.value)}
            onKeyDown={onMinValueFilterKeyPress}
            placeholder='0'
            className='h-10 w-full rounded-md border border-white/15 bg-white/[0.05] px-3 text-sm text-white outline-none transition focus:border-purple-400/50'
          />
        </div>

        <div>
          <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>Max Value</label>
          <input
            type='text'
            value={maxValueFilterInput}
            onChange={(event) => onMaxValueFilterInputChange(event.target.value)}
            onKeyDown={onMaxValueFilterKeyPress}
            placeholder='inf'
            className='h-10 w-full rounded-md border border-white/15 bg-white/[0.05] px-3 text-sm text-white outline-none transition focus:border-purple-400/50'
          />
        </div>
      </div>

      <div className='mt-3 flex justify-end'>
        <button
          type='button'
          onClick={onClearFilters}
          className='rounded-md border border-white/15 bg-white/[0.03] px-3 py-2 text-sm text-neutral-300 transition hover:border-purple-400/50 hover:bg-purple-500/15'
        >
          Clear Filters
        </button>
      </div>
    </div>
  )
}
