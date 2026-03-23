import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Pencil, X } from '@phosphor-icons/react'
import { format, parse } from 'date-fns'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { updateRun, getTeamMembers } from '../services/runApi'
import Swal from 'sweetalert2'
import { CustomSelect } from '../../../../components/CustomSelect'
import { LoadingSpinner } from '../../../../components/LoadingSpinner'
import type { ApiOption, EditRunProps } from '../types/run'
import { handleApiError } from '../../../../utils/apiErrorHandler'

export function EditRun({ onClose, run, onRunEdit }: EditRunProps) {
  const [apiOptions, setApiOptions] = useState<ApiOption[]>([])
  const isSpecialRun = false

  const [formData, setFormData] = useState({
    name: run.name
      ? { String: run.name.String || '', Valid: !!run.name.Valid }
      : { String: '', Valid: false },
    date: run.date,
    time: run.time, // Preencher o campo time com o valor vindo do run
    raid: run.raid,
    runType: run.runType,
    difficulty: run.difficulty,
    idTeam: run.idTeam,
    maxBuyers: run.maxBuyers,
    raidLeader:
      run.raidLeaders?.map((rl) => `${rl.idDiscord};${rl.username}`) || [],
    loot: run.loot,
    note: run.note,
    quantityBoss: run.quantityBoss
      ? {
          String: run.quantityBoss.String || '',
          Valid: !!run.quantityBoss.Valid,
        }
      : { String: '', Valid: false },
    minPriceEnabled:
      typeof run.minPriceEnabled === 'boolean' ? run.minPriceEnabled : true,
    minPriceGold:
      run.minPriceGold != null && Number(run.minPriceGold) > 0
        ? String(Math.round(Number(run.minPriceGold)))
        : '',
    minPriceDollar:
      run.minPriceDollar != null && Number(run.minPriceDollar) > 0
        ? Number(run.minPriceDollar).toString()
        : '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dateInputValue, setDateInputValue] = useState('')
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false)
  const [timeInputValue, setTimeInputValue] = useState('')
  const [raidLeaderSearch, setRaidLeaderSearch] = useState('')
  const [isRaidLeaderAutocompleteOpen, setIsRaidLeaderAutocompleteOpen] = useState(false)
  const datePickerRef = useRef<DatePicker | null>(null)
  const timePickerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const teamId = import.meta.env.VITE_TEAM_PREFEITO
        const response = await getTeamMembers(teamId)
        if (response) setApiOptions(response)
      } catch (err) {
        await handleApiError(err, 'Failed to fetch team members')
      }
    }
    fetchOptions()
  }, [])

  const handleChange = (field: string, value: any) => {
    if (field === 'minPriceGold' && !/^[0-9]*$/.test(value)) return
    if (field === 'minPriceDollar' && !/^\d*([.]\d{0,2})?$/.test(value)) return
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // So valida o horario se nao for uma run especial
    if (!isSpecialRun && !formData.time) {
      await Swal.fire({
        title: 'Validation',
        text: 'Time is required',
        icon: 'warning',
        confirmButtonText: 'Close',
      })
      return
    }

    const parsedMinPriceGold = Number(formData.minPriceGold)
    const parsedMinPriceDollar = Number(formData.minPriceDollar)

    if (
      formData.minPriceEnabled &&
      (!formData.minPriceGold ||
        !formData.minPriceDollar ||
        parsedMinPriceGold <= 0 ||
        parsedMinPriceDollar <= 0)
    ) {
      await Swal.fire({
        title: 'Validation',
        text: 'When Min Price is enabled, Gold and USD values must be greater than zero.',
        icon: 'warning',
        confirmButtonText: 'Close',
      })
      return
    }

    setIsSubmitting(true)

    const data = {
      ...formData,
      id: run.id,
      maxBuyers: formData.maxBuyers.toString(),
      minPriceEnabled: formData.minPriceEnabled,
      minPriceGold: formData.minPriceEnabled ? parsedMinPriceGold : 0,
      minPriceDollar: formData.minPriceEnabled ? parsedMinPriceDollar : 0,
      raidLeader: formData.raidLeader.map((value) => {
        const parts = value.split(';')
        return `${parts[0]};${parts[1]}`
      }),
    }

    try {
      await updateRun(run.id, data)
      await onRunEdit()
      onClose() // Close the modal first
      Swal.fire({
        title: 'Success!',
        text: 'Run edited successfully!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (err) {
      await handleApiError(err, 'Failed to edit run')
    } finally {
      setIsSubmitting(false)
    }
  }

  const baseFieldClass =
    'h-10 w-full rounded-md border border-white/15 bg-white/[0.05] px-3 text-sm text-white outline-none transition focus:border-purple-400/50'
  const dateTriggerClass =
    'h-10 w-full rounded-md border border-white/15 bg-white/[0.05] px-3 pr-9 text-left text-sm text-white shadow-none outline-none transition focus:border-purple-400/50'
  const isMythic = formData.difficulty === 'Mythic'
  const customSelectTriggerClass =
    'h-10 ![background-image:none] !border-white/15 !bg-white/[0.05] !shadow-none text-sm !text-white focus:!border-purple-400/50 focus:!ring-0'
  const nameOptions = [
    'Nerub-ar Palace',
    "March on Quel'Danas",
    'The Dreamrift',
    'The Voidspire',
    'The Voidspire & The Dreamrift',
  ].map((value) => ({ value, label: value }))
  const runTypeOptions = [
    'Full Clear',
    'Last Boss',
    'Achievment',
    'Legacy',
    'Remix',
    'Mount Only',
  ].map((value) => ({ value, label: value }))
  const difficultyOptions = ['Normal', 'Heroic', 'Mythic'].map((value) => ({
    value,
    label: value,
  }))
  const mythicCutOptions = [
    { value: 'Up to 6/8', label: 'Up to 6/8' },
    { value: '7/8, 8/8 & Last Boss', label: '7/8, 8/8 & Last Boss' },
  ]
  const teamOptions = [
    { value: import.meta.env.VITE_TEAM_GARCOM, label: 'Garçom' },
    { value: import.meta.env.VITE_TEAM_CONFEITEIROS, label: 'Confeiteiros' },
    { value: import.meta.env.VITE_TEAM_JACKFRUIT, label: 'Jackfruit' },
    { value: import.meta.env.VITE_TEAM_INSANOS, label: 'Insanos' },
    { value: import.meta.env.VITE_TEAM_APAE, label: 'APAE' },
    { value: import.meta.env.VITE_TEAM_LOSRENEGADOS, label: 'Los Renegados' },
    { value: import.meta.env.VITE_TEAM_DTM, label: 'DTM' },
    { value: import.meta.env.VITE_TEAM_KFFC, label: 'KFFC' },
    { value: import.meta.env.VITE_TEAM_GREENSKY, label: 'Greensky' },
    { value: import.meta.env.VITE_TEAM_GUILD_AZRALON_1, label: 'Guild Azralon BR#1' },
    { value: import.meta.env.VITE_TEAM_GUILD_AZRALON_2, label: 'Guild Azralon BR#2' },
    { value: import.meta.env.VITE_TEAM_ROCKET, label: 'Rocket' },
    { value: import.meta.env.VITE_TEAM_PUNKS, label: 'Punks' },
    { value: import.meta.env.VITE_TEAM_PADEIRINHO, label: 'Padeirinho' },
    { value: import.meta.env.VITE_TEAM_MILHARAL, label: 'Milharal' },
    { value: import.meta.env.VITE_TEAM_BASTARD, label: 'Bastard Munchen' },
    { value: import.meta.env.VITE_TEAM_GACHI_SQUAD, label: 'Gachi Squad' },
  ]
  const lootOptions = [
    'Group loot',
    'Unsaved Group loot',
    'Full priority',
    'No Loot',
    'Armor and Token Priority',
  ].map((value) => ({ value, label: value }))
  const hourOptions = useMemo(
    () => Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0')),
    []
  )
  const minuteOptions = useMemo(
    () => Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0')),
    []
  )
  const formatTime12h = useCallback((time24: string) => {
    const [hourPart, minutePart = '00'] = time24.split(':')
    const parsedHour = Number(hourPart)
    const parsedMinute = Number(minutePart)

    if (
      Number.isNaN(parsedHour) ||
      Number.isNaN(parsedMinute) ||
      parsedHour < 0 ||
      parsedHour > 23 ||
      parsedMinute < 0 ||
      parsedMinute > 59
    ) {
      return ''
    }

    const period = parsedHour >= 12 ? 'PM' : 'AM'
    const normalizedHour = parsedHour % 12 || 12
    return `${String(normalizedHour).padStart(2, '0')}:${String(parsedMinute).padStart(2, '0')} ${period}`
  }, [])
  const normalizeTimeInput = useCallback((rawValue: string) => {
    const value = rawValue.trim()
    if (!value) return ''

    const hourMinuteMatch = value.match(/^([01]?\d|2[0-3]):([0-5]\d)$/)
    if (hourMinuteMatch) {
      const [, hour, minute] = hourMinuteMatch
      return `${hour.padStart(2, '0')}:${minute}`
    }

    const meridiemMatch = value.match(/^(\d{1,2}):([0-5]\d)\s*([aApP][mM])$/)
    if (meridiemMatch) {
      const [, hourRaw, minute, periodRaw] = meridiemMatch
      const hour12 = Number(hourRaw)
      if (hour12 < 1 || hour12 > 12) return null

      const period = periodRaw.toUpperCase()
      let hour24 = hour12 % 12
      if (period === 'PM') hour24 += 12

      return `${String(hour24).padStart(2, '0')}:${minute}`
    }

    return null
  }, [])
  const normalizeDateInput = useCallback((rawValue: string) => {
    const value = rawValue.trim()
    if (!value) return ''

    const dayMonthYearMatch = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
    if (dayMonthYearMatch) {
      const [, dayRaw, monthRaw, year] = dayMonthYearMatch
      const day = dayRaw.padStart(2, '0')
      const month = monthRaw.padStart(2, '0')
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
  const handleRaidLeaderChange = (value: string, checked: boolean) => {
    setFormData((prev) => {
      const nextRaidLeaders = checked
        ? [...prev.raidLeader, value]
        : prev.raidLeader.filter((leader) => leader !== value)
      return { ...prev, raidLeader: nextRaidLeaders }
    })
  }
  const raidLeaderOptions = useMemo(
    () =>
      apiOptions
        .map((option) => ({
          value: `${option.id};${option.username}`,
          label: option.global_name,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [apiOptions]
  )
  const selectedRaidLeaders = formData.raidLeader.map((value) => {
    const found = apiOptions.find((option) => `${option.id};${option.username}` === value)
    return { value, label: found?.global_name || value }
  })
  const filteredRaidLeaderOptions = useMemo(() => {
    const normalizedSearch = raidLeaderSearch.trim().toLowerCase()
    if (!normalizedSearch) return raidLeaderOptions

    return raidLeaderOptions.filter((option) =>
      option.label.toLowerCase().includes(normalizedSearch)
    )
  }, [raidLeaderSearch, raidLeaderOptions])
  const selectedDate = useMemo(() => {
    if (!formData.date) return null
    const parsedDate = parse(formData.date, 'yyyy-MM-dd', new Date())
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
  }, [formData.date])
  useEffect(() => {
    if (!formData.date) {
      setDateInputValue('')
      return
    }

    const parsedDate = parse(formData.date, 'yyyy-MM-dd', new Date())
    if (Number.isNaN(parsedDate.getTime())) {
      setDateInputValue('')
      return
    }

    setDateInputValue(format(parsedDate, 'dd/MM/yyyy'))
  }, [formData.date])
  const timeParts = useMemo(() => {
    if (!formData.time) {
      return { hour: '12', minute: '00', period: 'AM', hasValue: false }
    }

    const [hourPart, minutePart = '00'] = formData.time.split(':')
    const parsedHour = Number(hourPart)
    if (Number.isNaN(parsedHour)) {
      return { hour: '12', minute: '00', period: 'AM', hasValue: false }
    }

    const period = parsedHour >= 12 ? 'PM' : 'AM'
    const normalizedHour = parsedHour % 12 || 12

    return {
      hour: String(normalizedHour).padStart(2, '0'),
      minute: minutePart.padStart(2, '0'),
      period,
      hasValue: true,
    }
  }, [formData.time])
  useEffect(() => {
    if (!formData.time) {
      setTimeInputValue('')
      return
    }

    const formatted = formatTime12h(formData.time)
    setTimeInputValue(formatted || '')
  }, [formData.time, formatTime12h])

  useEffect(() => {
    if (!isTimePickerOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (!timePickerRef.current) return
      if (!timePickerRef.current.contains(event.target as Node)) {
        setIsTimePickerOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isTimePickerOpen])

  const updateTimePart = (part: 'hour' | 'minute' | 'period', value: string) => {
    const nextHour12 = part === 'hour' ? value : timeParts.hour
    const nextMinute = part === 'minute' ? value : timeParts.minute
    const nextPeriod = part === 'period' ? value : timeParts.period

    let hour24 = Number(nextHour12) % 12
    if (nextPeriod === 'PM') hour24 += 12

    const normalizedTime = `${String(hour24).padStart(2, '0')}:${nextMinute}`
    handleChange('time', normalizedTime)
    setTimeInputValue(formatTime12h(normalizedTime))
  }
  const applyManualDate = useCallback(() => {
    const normalizedDate = normalizeDateInput(dateInputValue)

    if (normalizedDate === '') {
      handleChange('date', '')
      return
    }

    if (!normalizedDate) return

    handleChange('date', normalizedDate)
    const parsedDate = parse(normalizedDate, 'yyyy-MM-dd', new Date())
    setDateInputValue(format(parsedDate, 'dd/MM/yyyy'))
  }, [dateInputValue, normalizeDateInput])
  const applyManualTime = useCallback(() => {
    const normalizedTime = normalizeTimeInput(timeInputValue)

    if (normalizedTime === '') {
      handleChange('time', '')
      return
    }

    if (!normalizedTime) return

    handleChange('time', normalizedTime)
    setTimeInputValue(formatTime12h(normalizedTime))
  }, [formatTime12h, normalizeTimeInput, timeInputValue])

  return createPortal(
    <div className='fixed inset-0 z-[240] flex items-center justify-center bg-black/70 p-4'>
      <div className='w-full max-w-3xl rounded-xl border border-white/10 bg-[#1a1a1a] p-4 text-white shadow-2xl'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-lg font-semibold text-white'>Edit Run</h2>
          <button
            type='button'
            onClick={onClose}
            className='rounded-md border border-white/10 bg-white/5 p-1.5 text-white transition hover:border-purple-500/40 hover:text-purple-300'
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div>
            <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>Name</label>
            <CustomSelect
              value={formData.name.String}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  name: { String: value, Valid: !!value },
                }))
              }
              options={nameOptions}
              placeholder='Select name'
              minWidthClassName='min-w-full'
              triggerClassName={customSelectTriggerClass}
              menuClassName='!border-white/15 !bg-[#1a1a1a]'
              optionClassName='text-white/90 hover:bg-white/10'
              renderInPortal
            />
          </div>

          <div>
            <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>Date</label>
            <div className='relative'>
              <DatePicker
                ref={datePickerRef}
                selected={selectedDate}
                onChange={(date) => {
                  const normalizedDate = date ? format(date, 'yyyy-MM-dd') : ''
                  handleChange('date', normalizedDate)
                  setDateInputValue(date ? format(date, 'dd/MM/yyyy') : '')
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
                dateFormat='dd/MM/yyyy'
                placeholderText='dd/mm/aaaa'
                showPopperArrow={false}
                popperClassName='z-[240] balance-datepicker-popper'
                calendarClassName='balance-datepicker add-run-datepicker'
                wrapperClassName='w-full'
                className={`${dateTriggerClass} pr-10`}
                value={dateInputValue}
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
            <span className='mt-1 block text-[11px] text-neutral-400'>
              Type `dd/mm/yyyy` or use the calendar selector.
            </span>
          </div>

          {!isSpecialRun && (
            <div>
              <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>Time</label>
              <div ref={timePickerRef} className='relative'>
                <input
                  type='text'
                  value={timeInputValue}
                  onChange={(event) => setTimeInputValue(event.target.value)}
                  onBlur={applyManualTime}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      applyManualTime()
                    }
                  }}
                  placeholder={timeParts.hasValue ? `${timeParts.hour}:${timeParts.minute} ${timeParts.period}` : 'hh:mm AM/PM or HH:mm'}
                  className={`${dateTriggerClass} pr-10`}
                />
                <button
                  type='button'
                  onClick={() => setIsTimePickerOpen((prev) => !prev)}
                  aria-label='Open time picker'
                  className='absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-xs text-purple-300/85 transition hover:bg-white/10 hover:text-purple-200'
                >
                  ▼
                </button>
                {isTimePickerOpen && (
                  <div className='absolute left-0 top-[calc(100%+8px)] z-[240] w-full overflow-hidden rounded-xl border border-purple-300/25 bg-[rgba(14,10,28,0.98)] p-3 shadow-[0_20px_40px_rgba(0,0,0,0.45)]'>
                    <div className='grid grid-cols-3 gap-2'>
                      <div className='flex flex-col'>
                        <span className='mb-1 text-[10px] font-semibold uppercase tracking-wide text-purple-200/70'>
                          Hour
                        </span>
                        <div className='max-h-32 overflow-y-auto rounded-md border border-purple-300/20 bg-[rgba(8,4,20,0.55)] p-1'>
                          {hourOptions.map((hour) => (
                            <button
                              key={hour}
                              type='button'
                              onClick={() => updateTimePart('hour', hour)}
                              className={`mb-1 w-full rounded px-2 py-1 text-sm transition last:mb-0 ${
                                timeParts.hour === hour
                                  ? 'bg-purple-500/65 text-white'
                                  : 'text-purple-100/90 hover:bg-purple-500/20'
                              }`}
                            >
                              {hour}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className='flex flex-col'>
                        <span className='mb-1 text-[10px] font-semibold uppercase tracking-wide text-purple-200/70'>
                          Minute
                        </span>
                        <div className='max-h-32 overflow-y-auto rounded-md border border-purple-300/20 bg-[rgba(8,4,20,0.55)] p-1'>
                          {minuteOptions.map((minute) => (
                            <button
                              key={minute}
                              type='button'
                              onClick={() => updateTimePart('minute', minute)}
                              className={`mb-1 w-full rounded px-2 py-1 text-sm transition last:mb-0 ${
                                timeParts.minute === minute
                                  ? 'bg-purple-500/65 text-white'
                                  : 'text-purple-100/90 hover:bg-purple-500/20'
                              }`}
                            >
                              {minute}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className='flex flex-col'>
                        <span className='mb-1 text-[10px] font-semibold uppercase tracking-wide text-purple-200/70'>
                          AM/PM
                        </span>
                        <div className='rounded-md border border-purple-300/20 bg-[rgba(8,4,20,0.55)] p-1'>
                          {(['AM', 'PM'] as const).map((period) => (
                            <button
                              key={period}
                              type='button'
                              onClick={() => updateTimePart('period', period)}
                              className={`mb-1 w-full rounded px-2 py-1 text-sm transition last:mb-0 ${
                                timeParts.period === period
                                  ? 'bg-purple-500/65 text-white'
                                  : 'text-purple-100/90 hover:bg-purple-500/20'
                              }`}
                            >
                              {period}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <span className='mt-1 block text-[11px] text-neutral-400'>
                Type `HH:mm` or `hh:mm AM/PM`, or use the selector.
              </span>
            </div>
          )}

          {!isSpecialRun && (
            <div>
              <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>Raid</label>
              <input
                value={formData.raid}
                onChange={(e) => handleChange('raid', e.target.value)}
                className={baseFieldClass}
                required
              />
            </div>
          )}

          {!isSpecialRun && (
            <div>
              <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>Run Type</label>
              <CustomSelect
                value={formData.runType}
                onChange={(value) => handleChange('runType', value)}
                options={runTypeOptions}
                minWidthClassName='min-w-full'
                triggerClassName={customSelectTriggerClass}
                menuClassName='!border-white/15 !bg-[#1a1a1a]'
                optionClassName='text-white/90 hover:bg-white/10'
                renderInPortal
              />
            </div>
          )}

          {!isSpecialRun && (
            <div>
              <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>Difficulty</label>
              <CustomSelect
                value={formData.difficulty}
                onChange={(value) => handleChange('difficulty', value)}
                options={difficultyOptions}
                minWidthClassName='min-w-full'
                triggerClassName={customSelectTriggerClass}
                menuClassName='!border-white/15 !bg-[#1a1a1a]'
                optionClassName='text-white/90 hover:bg-white/10'
                renderInPortal
              />
            </div>
          )}

          {!isSpecialRun && isMythic && (
            <div>
              <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>Mythic Cut</label>
              <CustomSelect
                value={formData.quantityBoss.String}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    quantityBoss: { String: value, Valid: true },
                  }))
                }
                options={mythicCutOptions}
                placeholder='Select Mythic cut'
                minWidthClassName='min-w-full'
                triggerClassName={customSelectTriggerClass}
                menuClassName='!border-white/15 !bg-[#1a1a1a]'
                optionClassName='text-white/90 hover:bg-white/10'
                renderInPortal
              />
            </div>
          )}

          {!isSpecialRun && (
            <div>
              <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>Team</label>
              <CustomSelect
                value={formData.idTeam}
                onChange={(value) => handleChange('idTeam', value)}
                options={teamOptions}
                minWidthClassName='min-w-full'
                triggerClassName={customSelectTriggerClass}
                menuClassName='!border-white/15 !bg-[#1a1a1a]'
                optionClassName='text-white/90 hover:bg-white/10'
                renderInPortal
              />
            </div>
          )}

          {!isSpecialRun && (
            <div>
              <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>Max Buyers</label>
              <input
                value={formData.maxBuyers}
                onChange={(e) => handleChange('maxBuyers', e.target.value)}
                className={baseFieldClass}
                required
              />
            </div>
          )}

          {!isSpecialRun && (
            <div>
              <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>Min Price (Gold)</label>
              <input
                value={formData.minPriceGold}
                onChange={(e) => handleChange('minPriceGold', e.target.value)}
                placeholder='Ex: 600000'
                className={baseFieldClass}
                disabled={!formData.minPriceEnabled}
              />
            </div>
          )}

          {!isSpecialRun && (
            <div>
              <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>Min Price (USD)</label>
              <input
                value={formData.minPriceDollar}
                onChange={(e) => handleChange('minPriceDollar', e.target.value)}
                placeholder='Ex: 25.00'
                className={baseFieldClass}
                disabled={!formData.minPriceEnabled}
              />
            </div>
          )}

          {!isSpecialRun && (
            <label className='col-span-1 inline-flex items-center gap-2 text-sm text-neutral-200 md:col-span-2'>
              <input
                type='checkbox'
                checked={formData.minPriceEnabled}
                onChange={(e) => handleChange('minPriceEnabled', e.target.checked)}
                className='h-4 w-4 rounded border-white/40 bg-transparent accent-purple-500'
              />
              Min Price Enabled
            </label>
          )}

          <div className='col-span-1 flex flex-col md:col-span-2'>
            <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>Raid Leader</label>
            <div className='relative'>
              <input
                type='text'
                value={raidLeaderSearch}
                onChange={(event) => {
                  setRaidLeaderSearch(event.target.value)
                  setIsRaidLeaderAutocompleteOpen(true)
                }}
                onFocus={() => setIsRaidLeaderAutocompleteOpen(true)}
                onBlur={() => setTimeout(() => setIsRaidLeaderAutocompleteOpen(false), 120)}
                placeholder='Search raid leader'
                className={baseFieldClass}
              />

              {isRaidLeaderAutocompleteOpen && (
                <div className='absolute left-0 right-0 top-[calc(100%+6px)] z-[250] max-h-56 overflow-auto rounded-md border border-white/15 bg-neutral-900/95 p-1 shadow-xl backdrop-blur-sm'>
                  {filteredRaidLeaderOptions.length > 0 ? (
                    filteredRaidLeaderOptions.map((option) => (
                      <button
                        key={option.value}
                        type='button'
                        onMouseDown={(event) => {
                          event.preventDefault()
                          const isChecked = formData.raidLeader.includes(option.value)
                          handleRaidLeaderChange(option.value, !isChecked)
                          setRaidLeaderSearch('')
                          setIsRaidLeaderAutocompleteOpen(true)
                        }}
                        className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition ${
                          formData.raidLeader.includes(option.value)
                            ? 'bg-purple-500/20 text-purple-100'
                            : 'text-white/90 hover:bg-white/10'
                        }`}
                      >
                        <span>{option.label}</span>
                        {formData.raidLeader.includes(option.value) && (
                          <span className='ml-2 text-xs text-purple-200'>Selected</span>
                        )}
                      </button>
                    ))
                  ) : (
                    <p className='px-3 py-2 text-sm text-neutral-400'>No raid leader found</p>
                  )}
                </div>
              )}
            </div>
            {selectedRaidLeaders.length > 0 ? (
              <div className='mt-2 flex flex-wrap gap-1'>
                {selectedRaidLeaders.map((leader) => (
                  <button
                    key={leader.value}
                    type='button'
                    onClick={() => handleRaidLeaderChange(leader.value, false)}
                    className='rounded-full border border-purple-300/30 bg-purple-500/20 px-2 py-0.5 text-xs text-purple-100'
                  >
                    {leader.label} <span className='ml-1 text-purple-200/80'>x</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {!isSpecialRun && (
            <div>
              <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>Loot Options</label>
              <CustomSelect
                value={formData.loot}
                onChange={(value) => handleChange('loot', value)}
                options={lootOptions}
                minWidthClassName='min-w-full'
                triggerClassName={customSelectTriggerClass}
                menuClassName='!border-white/15 !bg-[#1a1a1a]'
                optionClassName='text-white/90 hover:bg-white/10'
                renderInPortal
              />
            </div>
          )}

          <div className={isSpecialRun ? 'md:col-span-2' : 'md:col-span-1'}>
            <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>Note</label>
            <textarea
              value={formData.note}
              onChange={(e) => handleChange('note', e.target.value)}
              className={`${baseFieldClass} min-h-12 resize-none overflow-hidden py-3`}
            />
          </div>

          <div className='col-span-1 flex items-center justify-end gap-2 md:col-span-2'>
            <button
              type='button'
              onClick={onClose}
              className='rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-200 transition hover:bg-white/10'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className='inline-flex min-w-[140px] items-center justify-center gap-2 rounded-md border border-purple-400/40 bg-purple-500/20 px-3 py-2 text-sm font-medium text-purple-100 transition hover:border-purple-300/55 hover:bg-purple-500/30 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {isSubmitting ? (
                <LoadingSpinner size='sm' label='Editing run' />
              ) : (
                <Pencil size={18} />
              )}
              {isSubmitting ? 'Editing...' : 'Edit Run'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
