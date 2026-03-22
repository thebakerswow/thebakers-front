import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface SelectOption {
  value: string
  label: string
}

interface CustomSelectProps {
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  searchable?: boolean
  disabled?: boolean
  minWidthClassName?: string
  triggerClassName?: string
  menuClassName?: string
  optionClassName?: string
  activeOptionClassName?: string
  renderInPortal?: boolean
}

export function CustomSelect({
  value,
  options,
  onChange,
  placeholder = 'Select an option',
  searchPlaceholder = 'Type to search...',
  searchable = false,
  disabled = false,
  minWidthClassName = 'min-w-[220px]',
  triggerClassName = '',
  menuClassName = '',
  optionClassName = '',
  activeOptionClassName = '',
  renderInPortal = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [menuPosition, setMenuPosition] = useState<{
    top: number
    left: number
    width: number
    maxHeight: number
  }>({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 256,
  })

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current) return
      const target = event.target as Node
      const isInsideWrapper = wrapperRef.current.contains(target)
      const isInsideMenu = menuRef.current?.contains(target) ?? false

      if (!isInsideWrapper && !isInsideMenu) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!isOpen || !renderInPortal || !triggerRef.current) return

    const updateMenuPosition = () => {
      if (!triggerRef.current) return
      const rect = triggerRef.current.getBoundingClientRect()
      const viewportPadding = 8
      const gap = 8
      const preferredHeight = 256
      const estimatedMenuBoxHeight = preferredHeight + 8 // menu body + paddings/border
      const spaceBelow = window.innerHeight - rect.bottom - viewportPadding
      const spaceAbove = rect.top - viewportPadding
      const shouldOpenUp =
        spaceBelow < estimatedMenuBoxHeight && spaceAbove > spaceBelow

      const maxHeight = Math.max(
        140,
        Math.min(preferredHeight, shouldOpenUp ? spaceAbove - gap : spaceBelow - gap)
      )

      const top = shouldOpenUp
        ? Math.max(viewportPadding, rect.top - gap - (maxHeight + 8))
        : rect.bottom + gap

      setMenuPosition({
        top,
        left: rect.left,
        width: rect.width,
        maxHeight,
      })
    }

    updateMenuPosition()
    window.addEventListener('resize', updateMenuPosition)
    window.addEventListener('scroll', updateMenuPosition, true)

    return () => {
      window.removeEventListener('resize', updateMenuPosition)
      window.removeEventListener('scroll', updateMenuPosition, true)
    }
  }, [isOpen, renderInPortal])

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('')
    }
  }, [isOpen])

  const selectedLabel = options.find((option) => option.value === value)?.label || placeholder
  useEffect(() => {
    if (!searchable || isOpen) return
    setSearchTerm(selectedLabel === placeholder ? '' : selectedLabel)
  }, [searchable, isOpen, selectedLabel, placeholder])

  const normalizedSearchTerm = searchTerm.trim().toLowerCase()
  const filteredOptions =
    searchable && normalizedSearchTerm
      ? options.filter((option) => option.label.toLowerCase().includes(normalizedSearchTerm))
      : options

  const menuContent = (
    <div
      ref={menuRef}
      className={`z-[140] overflow-hidden rounded-xl border border-purple-300/25 bg-[#0e0e12] shadow-[0_20px_40px_rgba(0,0,0,0.45)] ${menuClassName}`}
      style={
        renderInPortal
          ? {
              position: 'fixed',
              top: menuPosition.top,
              left: menuPosition.left,
              width: menuPosition.width,
              zIndex: 99999,
            }
          : undefined
      }
    >
      <div className='overflow-auto p-1' style={{ maxHeight: menuPosition.maxHeight }}>
        {filteredOptions.length === 0 ? (
          <div className='px-3 py-2 text-sm text-neutral-400'>No options available</div>
        ) : (
          filteredOptions.map((option) => (
            <button
              key={option.value}
              type='button'
              onClick={() => {
                onChange(option.value)
                if (searchable) {
                  setSearchTerm(option.label)
                }
                setIsOpen(false)
              }}
              className={`mb-1 w-full rounded-md px-3 py-2 text-left text-sm transition last:mb-0 ${
                option.value === value
                  ? `border border-purple-400/40 bg-purple-500/20 text-purple-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${activeOptionClassName}`
                  : `text-white/90 hover:bg-white/10 ${optionClassName}`
              }`}
            >
              {option.label}
            </button>
          ))
        )}
      </div>
    </div>
  )

  return (
    <div ref={wrapperRef} className={`relative ${minWidthClassName}`}>
      {searchable ? (
        <input
          ref={(node) => {
            triggerRef.current = node
          }}
          type='text'
          disabled={disabled}
          value={searchTerm}
          placeholder={searchPlaceholder}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          onChange={(event) => {
            if (!isOpen) setIsOpen(true)
            setSearchTerm(event.target.value)
          }}
          className={`balance-filter-control h-10 w-full rounded-md border border-purple-300/20 bg-[linear-gradient(180deg,rgba(23,23,27,0.92)_0%,rgba(14,14,18,0.92)_100%)] px-3 pr-9 text-left text-sm text-white/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.22)] outline-none transition placeholder:text-white/50 focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/35 disabled:cursor-not-allowed disabled:opacity-60 ${triggerClassName}`}
        />
      ) : (
        <button
          ref={(node) => {
            triggerRef.current = node
          }}
          type='button'
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`balance-filter-control h-10 w-full rounded-md border border-purple-300/20 bg-[linear-gradient(180deg,rgba(23,23,27,0.92)_0%,rgba(14,14,18,0.92)_100%)] px-3 pr-9 text-left text-sm text-white/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.22)] outline-none transition focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/35 disabled:cursor-not-allowed disabled:opacity-60 ${triggerClassName}`}
        >
          {selectedLabel}
        </button>
      )}
      <span className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-purple-300/85'>
        ▼
      </span>

      {isOpen && !disabled
        ? renderInPortal
          ? createPortal(menuContent, document.body)
          : (
              <div className='absolute left-0 top-[calc(100%+8px)] w-full'>
                {menuContent}
              </div>
            )
        : null}
    </div>
  )
}
