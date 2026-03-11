import { useEffect, useRef, useState } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface CustomSelectProps {
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  minWidthClassName?: string
}

export function CustomSelect({
  value,
  options,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  minWidthClassName = 'min-w-[220px]',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedLabel = options.find((option) => option.value === value)?.label || placeholder

  return (
    <div ref={wrapperRef} className={`relative ${minWidthClassName}`}>
      <button
        type='button'
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className='balance-filter-control h-10 w-full rounded-md border border-purple-300/20 bg-[linear-gradient(180deg,rgba(23,23,27,0.92)_0%,rgba(14,14,18,0.92)_100%)] px-3 pr-9 text-left text-sm text-white/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.22)] outline-none transition focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/35 disabled:cursor-not-allowed disabled:opacity-60'
      >
        {selectedLabel}
      </button>
      <span className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-purple-300/85'>
        ▼
      </span>

      {isOpen && !disabled && (
        <div className='absolute left-0 top-[calc(100%+8px)] z-[140] w-full overflow-hidden rounded-xl border border-purple-300/25 bg-[#0e0e12] shadow-[0_20px_40px_rgba(0,0,0,0.45)]'>
          <div className='max-h-64 overflow-auto p-1'>
            {options.length === 0 ? (
              <div className='px-3 py-2 text-sm text-neutral-400'>No options available</div>
            ) : (
              options.map((option) => (
                <button
                  key={option.value}
                  type='button'
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                  className={`mb-1 w-full rounded-md px-3 py-2 text-left text-sm transition last:mb-0 ${
                    option.value === value
                      ? 'bg-[linear-gradient(180deg,rgba(168,85,247,0.95),rgba(147,51,234,0.95))] text-white'
                      : 'text-white/90 hover:bg-white/10'
                  }`}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
