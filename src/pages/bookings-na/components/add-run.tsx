import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { UserPlus, X } from '@phosphor-icons/react'
import axios from 'axios'
import { format, parse } from 'date-fns'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import Swal from 'sweetalert2'
import { getTeamMembers } from '../../../services/api/users'
import { createRun } from '../../../services/api/runs'
import { ErrorDetails } from '../../../components/error-display'
import { CustomSelect } from '../../../components/custom-select'

interface ApiOption {
  id: string
  username: string
  global_name: string
}

export interface AddRunProps {
  onClose: () => void
  onRunAddedReload: () => void
  onError: (error: ErrorDetails | null) => void
}

const DatePickerInput = forwardRef<
  HTMLButtonElement,
  { value?: string; onClick?: () => void; className: string; placeholder?: string }
>(({ value, onClick, className, placeholder = 'dd/mm/aaaa' }, ref) => (
  <button ref={ref} type='button' onClick={onClick} className={className}>
    <span className={value ? 'text-purple-100' : 'text-purple-200/50'}>{value || placeholder}</span>
  </button>
))

DatePickerInput.displayName = 'DatePickerInput'

export function AddRun({ onClose, onRunAddedReload, onError }: AddRunProps) {
  const [formData, setFormData] = useState({
    name: { String: '', Valid: false },
    date: '',
    time: '',
    raid: '',
    runType: '',
    difficulty: '',
    idTeam: '',
    maxBuyers: '',
    raidLeader: [] as string[],
    loot: '',
    note: '',
    quantityBoss: { String: '', Valid: false },
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiOptions, setApiOptions] = useState<ApiOption[]>([])
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false)
  const timePickerRef = useRef<HTMLDivElement | null>(null)

  const baseFieldClass =
    'h-10 w-full rounded-md border border-white/15 bg-white/[0.05] px-3 text-sm text-white outline-none placeholder:text-neutral-500 transition focus:border-purple-400/50'
  const selectTriggerClass =
    'h-10 ![background-image:none] !border-white/15 !bg-white/[0.05] px-3 pr-9 text-sm !text-white !shadow-none focus:!border-purple-400/50 focus:!ring-0'
  const selectMenuClass =
    'z-[240] !border-white/15 !bg-[#1a1a1a] !bg-none !shadow-[0_20px_40px_rgba(0,0,0,0.45)]'
  const selectOptionClass = 'text-white/90 hover:bg-white/10'
  const selectActiveOptionClass = 'shadow-[0_0_0_1px_rgba(216,180,254,0.35)_inset]'
  const dateTriggerClass =
    'h-10 w-full rounded-md border border-white/15 bg-white/[0.05] px-3 pr-9 text-left text-sm text-white shadow-none outline-none transition focus:border-purple-400/50'

  const runNameOptions = useMemo(
    () => [
      'Nerub-ar Palace',
      'Liberation of Undermine',
      'Manaforge Omega',
      "March on Quel'Danas",
      'The Dreamrift',
      'The Voidspire',
    ],
    []
  )

  const runTypeOptions = useMemo(
    () => ['Full Clear', 'Last Boss', 'Achievment', 'Legacy', 'Remix', 'Mount Only'],
    []
  )

  const teamOptions = useMemo(
    () => [
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
      { value: import.meta.env.VITE_TEAM_BOOTY_REAPER, label: 'Booty Reaper' },
      { value: import.meta.env.VITE_TEAM_PADEIRINHO, label: 'Padeirinho' },
      { value: import.meta.env.VITE_TEAM_MILHARAL, label: 'Milharal' },
      { value: import.meta.env.VITE_TEAM_BASTARD, label: 'Bastard Munchen' },
      { value: import.meta.env.VITE_TEAM_KIWI, label: 'Kiwi' },
    ],
    []
  )

  const lootOptions = useMemo(
    () => [
      'Group loot',
      'Unsaved Group loot',
      'Full priority',
      'No Loot',
      'Armor and Token Priority',
    ],
    []
  )

  const hourOptions = useMemo(
    () => Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0')),
    []
  )
  const minuteOptions = useMemo(
    () => Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, '0')),
    []
  )

  const fetchTeamMembers = useCallback(async () => {
    try {
      const teamId = import.meta.env.VITE_TEAM_PREFEITO
      const response = await getTeamMembers(teamId)
      setApiOptions(response)
      onError(null)
    } catch (error) {
      const errorDetails = axios.isAxiosError(error)
        ? {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          }
        : {
            message: 'Unexpected error fetching team members',
            response: error,
          }
      onError(errorDetails)
    }
  }, [onError])

  useEffect(() => {
    fetchTeamMembers()
  }, [fetchTeamMembers])

  const setField = (field: string, value: string) => {
    if (field === 'name') {
      setFormData((prev) => ({ ...prev, name: { String: value, Valid: !!value } }))
      return
    }
    if (field === 'quantityBoss') {
      setFormData((prev) => ({
        ...prev,
        quantityBoss: { String: value, Valid: !!value },
      }))
      return
    }
    if (field === 'difficulty') {
      setFormData((prev) => ({
        ...prev,
        difficulty: value,
        quantityBoss: { String: '', Valid: false },
      }))
      return
    }
    if (field === 'maxBuyers' && !/^[0-9]*$/.test(value)) return
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleRaidLeaderChange = (value: string, checked: boolean) => {
    setFormData((prev) => {
      const nextRaidLeaders = checked
        ? [...prev.raidLeader, value]
        : prev.raidLeader.filter((leader) => leader !== value)

      return { ...prev, raidLeader: nextRaidLeaders }
    })
  }

  const selectedRaidLeaders = formData.raidLeader.map((value) => {
    const found = apiOptions.find((option) => `${option.id};${option.username}` === value)
    return found?.global_name || value
  })

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    onError(null)

    if (
      !formData.name.String ||
      !formData.date ||
      !formData.time ||
      !formData.raid ||
      !formData.runType ||
      !formData.difficulty ||
      !formData.idTeam ||
      !formData.maxBuyers ||
      !formData.loot ||
      formData.raidLeader.length === 0 ||
      (formData.difficulty === 'Mythic' && !formData.quantityBoss.String)
    ) {
      Swal.fire({
        title: 'Missing fields',
        text: 'Please fill all required fields.',
        icon: 'warning',
        timer: 1600,
        showConfirmButton: false,
      })
      setIsSubmitting(false)
      return
    }

    try {
      await createRun({
        ...formData,
        quantityBoss: formData.quantityBoss,
      })
      await onRunAddedReload()
      onClose()
      setTimeout(() => {
        Swal.fire({
          title: 'Success!',
          text: 'Run created successfully!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        })
      }, 150)
    } catch (error) {
      const errorDetails = axios.isAxiosError(error)
        ? {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          }
        : { message: 'Unexpected error creating run', response: error }
      onError(errorDetails)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNoteInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const target = event.currentTarget
    target.style.height = 'auto'
    target.style.height = `${target.scrollHeight}px`
  }

  const selectedDate = useMemo(() => {
    if (!formData.date) return null
    const parsedDate = parse(formData.date, 'yyyy-MM-dd', new Date())
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
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

    setField('time', `${String(hour24).padStart(2, '0')}:${nextMinute}`)
  }

  return createPortal(
    <div className='fixed inset-0 z-[240] flex items-center justify-center bg-black/70 p-4'>
      <div className='w-full max-w-3xl rounded-xl border border-white/10 bg-[#1a1a1a] p-4 text-white shadow-2xl'>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-white'>Add Run</h3>
          <button
            aria-label='close'
            onClick={onClose}
            className='rounded-md border border-white/10 bg-white/5 p-1.5 text-white transition hover:border-purple-500/40 hover:text-purple-300'
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='grid grid-cols-2 gap-4'>
          <div className='flex flex-col'>
            <label className='mb-1 text-xs uppercase tracking-wide text-neutral-300'>
              Name
            </label>
            <CustomSelect
              value={formData.name.String}
              onChange={(value) => setField('name', value)}
              options={runNameOptions.map((name) => ({ value: name, label: name }))}
              placeholder='Select name'
              minWidthClassName='w-full min-w-0'
              triggerClassName={selectTriggerClass}
              menuClassName={selectMenuClass}
              optionClassName={selectOptionClass}
              activeOptionClassName={selectActiveOptionClass}
              renderInPortal
            />
          </div>

          <div className='flex flex-col'>
            <label className='mb-1 text-xs uppercase tracking-wide text-neutral-300'>
              Date
            </label>
            <div className='relative'>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setField('date', date ? format(date, 'yyyy-MM-dd') : '')}
                dateFormat='dd/MM/yyyy'
                placeholderText='dd/mm/aaaa'
                popperClassName='z-[240] balance-datepicker-popper'
                calendarClassName='balance-datepicker add-run-datepicker'
                wrapperClassName='w-full'
                customInput={<DatePickerInput className={dateTriggerClass} />}
              />
              <span className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-purple-300/85'>
                ▼
              </span>
            </div>
          </div>

          <div className='flex flex-col'>
            <label className='mb-1 text-xs uppercase tracking-wide text-neutral-300'>
              Time
            </label>
            <div ref={timePickerRef} className='relative'>
              <button
                type='button'
                onClick={() => setIsTimePickerOpen((prev) => !prev)}
                className={dateTriggerClass}
              >
                <span className={timeParts.hasValue ? 'text-purple-100' : 'text-purple-200/50'}>
                  {timeParts.hasValue
                    ? `${timeParts.hour}:${timeParts.minute} ${timeParts.period}`
                    : '--:--'}
                </span>
              </button>
              <span className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-purple-300/85'>
                ▼
              </span>
              {isTimePickerOpen && (
                <div className='absolute left-0 top-[calc(100%+8px)] z-[240] w-full overflow-hidden rounded-xl border border-white/15 bg-[#1a1a1a] p-3 shadow-[0_20px_40px_rgba(0,0,0,0.45)]'>
                  <div className='grid grid-cols-3 gap-2'>
                    <div className='flex flex-col'>
                      <span className='mb-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-400'>
                        Hour
                      </span>
                      <div className='max-h-32 overflow-y-auto rounded-md border border-white/15 bg-white/[0.04] p-1'>
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
                      <span className='mb-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-400'>
                        Minute
                      </span>
                      <div className='max-h-32 overflow-y-auto rounded-md border border-white/15 bg-white/[0.04] p-1'>
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
                      <span className='mb-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-400'>
                        AM/PM
                      </span>
                      <div className='rounded-md border border-white/15 bg-white/[0.04] p-1'>
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
          </div>

          <div className='flex flex-col'>
            <label className='mb-1 text-xs uppercase tracking-wide text-neutral-300'>
              Raid
            </label>
            <input
              type='text'
              value={formData.raid}
              onChange={(e) => setField('raid', e.target.value)}
              className={baseFieldClass}
            />
          </div>

          <div className='flex flex-col'>
            <label className='mb-1 text-xs uppercase tracking-wide text-neutral-300'>
              Run Type
            </label>
            <CustomSelect
              value={formData.runType}
              onChange={(value) => setField('runType', value)}
              options={runTypeOptions.map((option) => ({ value: option, label: option }))}
              placeholder='Select run type'
              minWidthClassName='w-full min-w-0'
              triggerClassName={selectTriggerClass}
              menuClassName={selectMenuClass}
              optionClassName={selectOptionClass}
              activeOptionClassName={selectActiveOptionClass}
              renderInPortal
            />
          </div>

          <div className='flex flex-col'>
            <label className='mb-1 text-xs uppercase tracking-wide text-neutral-300'>
              Difficulty
            </label>
            <CustomSelect
              value={formData.difficulty}
              onChange={(value) => setField('difficulty', value)}
              options={[
                { value: 'Normal', label: 'Normal' },
                { value: 'Heroic', label: 'Heroic' },
                { value: 'Mythic', label: 'Mythic' },
              ]}
              placeholder='Select difficulty'
              minWidthClassName='w-full min-w-0'
              triggerClassName={selectTriggerClass}
              menuClassName={selectMenuClass}
              optionClassName={selectOptionClass}
              activeOptionClassName={selectActiveOptionClass}
              renderInPortal
            />
          </div>

          {formData.difficulty === 'Mythic' && (
            <div className='flex flex-col'>
              <label className='mb-1 text-xs uppercase tracking-wide text-neutral-300'>
                Mythic Cut
              </label>
              <CustomSelect
                value={formData.quantityBoss.String}
                onChange={(value) => setField('quantityBoss', value)}
                options={[
                  { value: 'Up to 6/8', label: 'Up to 6/8' },
                  { value: '7/8, 8/8 & Last Boss', label: '7/8, 8/8 & Last Boss' },
                ]}
                placeholder='Select option'
                minWidthClassName='w-full min-w-0'
                triggerClassName={selectTriggerClass}
                menuClassName={selectMenuClass}
                optionClassName={selectOptionClass}
                activeOptionClassName={selectActiveOptionClass}
                renderInPortal
              />
            </div>
          )}

          <div className='flex flex-col'>
            <label className='mb-1 text-xs uppercase tracking-wide text-neutral-300'>
              Team
            </label>
            <CustomSelect
              value={formData.idTeam}
              onChange={(value) => setField('idTeam', value)}
              options={teamOptions}
              placeholder='Select team'
              minWidthClassName='w-full min-w-0'
              triggerClassName={selectTriggerClass}
              menuClassName={selectMenuClass}
              optionClassName={selectOptionClass}
              activeOptionClassName={selectActiveOptionClass}
              renderInPortal
            />
          </div>

          <div className='flex flex-col'>
            <label className='mb-1 text-xs uppercase tracking-wide text-neutral-300'>
              Max Buyers
            </label>
            <input
              type='text'
              value={formData.maxBuyers}
              onChange={(e) => setField('maxBuyers', e.target.value)}
              className={baseFieldClass}
            />
          </div>

          <div className='col-span-2 flex flex-col'>
            <label className='mb-1 text-xs uppercase tracking-wide text-neutral-300'>
              Raid Leader
            </label>
            <div className='max-h-[190px] w-full overflow-y-auto rounded-md border border-white/15 bg-white/[0.05] px-4 py-3'>
              <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                {apiOptions.map((option) => {
                  const optionValue = `${option.id};${option.username}`
                  const isChecked = formData.raidLeader.includes(optionValue)

                  return (
                    <label
                      key={option.username}
                      className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm text-white hover:bg-white/10'
                    >
                      <input
                        type='checkbox'
                        checked={isChecked}
                        onChange={(event) =>
                          handleRaidLeaderChange(optionValue, event.target.checked)
                        }
                        className='h-4 w-4 cursor-pointer rounded border-white/20 bg-white/[0.05] accent-purple-500'
                      />
                      <span>{option.global_name}</span>
                    </label>
                  )
                })}
              </div>
            </div>
            {selectedRaidLeaders.length > 0 ? (
              <div className='mt-2 flex flex-wrap gap-1'>
                {selectedRaidLeaders.map((leader) => (
                  <span
                    key={leader}
                    className='rounded-full border border-purple-300/30 bg-purple-500/20 px-2 py-0.5 text-xs text-purple-100'
                  >
                    {leader}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className='flex flex-col'>
            <label className='mb-1 text-xs uppercase tracking-wide text-neutral-300'>
              Loot Options
            </label>
            <CustomSelect
              value={formData.loot}
              onChange={(value) => setField('loot', value)}
              options={lootOptions.map((option) => ({ value: option, label: option }))}
              placeholder='Select loot'
              minWidthClassName='w-full min-w-0'
              triggerClassName={selectTriggerClass}
              menuClassName={selectMenuClass}
              optionClassName={selectOptionClass}
              activeOptionClassName={selectActiveOptionClass}
              renderInPortal
            />
          </div>

          <div className='flex flex-col'>
            <label className='mb-1 text-xs uppercase tracking-wide text-neutral-300'>
              Note
            </label>
            <textarea
              rows={1}
              placeholder='Note'
              value={formData.note}
              onChange={(e) => setField('note', e.target.value)}
              onInput={handleNoteInput}
              className={`${baseFieldClass} min-h-12 resize-none overflow-hidden py-3`}
            />
          </div>

          <div className='col-span-2 mt-2 flex items-center justify-end gap-2'>
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
                <span className='h-4 w-4 animate-spin rounded-full border-b-2 border-white'></span>
              ) : (
                <UserPlus size={18} />
              )}
              {isSubmitting ? 'Creating...' : 'Add Run'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
