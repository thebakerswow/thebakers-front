import { DotsThreeVertical } from '@phosphor-icons/react'
import { useEffect, useRef, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import Swal from 'sweetalert2'
import {
  getGbanks,
  createGBank,
  updateGBankValue,
  updateGBank,
  deleteGBank as deleteGBankService,
} from '../services/adminApi'
import { CustomSelect } from '../../../../components/CustomSelect'
import { LoadingSpinner } from '../../../../components/LoadingSpinner'
import { getApiErrorMessage } from '../../../../utils/apiErrorHandler'
import { useAdaptivePolling } from '../hooks/useAdaptivePolling'
import type { GBank, GBankApiItem, GBanksTableProps } from '../types/admin'
import {
  COLOR_OPTIONS,
  DEFAULT_TEAM_COLOR,
  TEAM_ID_TO_COLOR_MAP,
  compareByPriority,
} from '../../../../utils/teamConfig'

const teamIdToColorMap: Record<string, string> = {
  ...TEAM_ID_TO_COLOR_MAP,
  [import.meta.env.VITE_TEAM_ADVERTISER]: '#9CA3AF',
  [import.meta.env.VITE_TEAM_FREELANCER]: '#86EFAC',
}

const teamIdToLabelMap: Record<string, string> = {
  [import.meta.env.VITE_TEAM_CHEFE]: 'Chefe de cozinha',
  [import.meta.env.VITE_TEAM_MPLUS]: 'M+',
  [import.meta.env.VITE_TEAM_LEVELING]: 'Leveling',
  [import.meta.env.VITE_TEAM_GARCOM]: 'Garçom',
  [import.meta.env.VITE_TEAM_CONFEITEIROS]: 'Confeiteiros',
  [import.meta.env.VITE_TEAM_JACKFRUIT]: 'Jackfruit',
  [import.meta.env.VITE_TEAM_INSANOS]: 'Insanos',
  [import.meta.env.VITE_TEAM_APAE]: 'APAE',
  [import.meta.env.VITE_TEAM_LOSRENEGADOS]: 'Los Renegados',
  [import.meta.env.VITE_TEAM_DTM]: 'DTM',
  [import.meta.env.VITE_TEAM_KFFC]: 'KFFC',
  [import.meta.env.VITE_TEAM_GREENSKY]: 'Greensky',
  [import.meta.env.VITE_TEAM_GUILD_AZRALON_1]: 'Guild Azralon BR#1',
  [import.meta.env.VITE_TEAM_GUILD_AZRALON_2]: 'Guild Azralon BR#2',
  [import.meta.env.VITE_TEAM_ROCKET]: 'Rocket',
  [import.meta.env.VITE_TEAM_BOOTY_REAPER]: 'Booty Reaper',
  [import.meta.env.VITE_TEAM_PADEIRINHO]: 'Padeirinho',
  [import.meta.env.VITE_TEAM_MILHARAL]: 'Milharal',
  [import.meta.env.VITE_TEAM_ADVERTISER]: 'Advertiser',
  [import.meta.env.VITE_TEAM_FREELANCER]: 'Freelancer',
  [import.meta.env.VITE_TEAM_BASTARD]: 'Bastard Munchen',
  [import.meta.env.VITE_TEAM_KIWI]: 'Kiwi',
}

const teamSelectOptions = Object.entries(teamIdToLabelMap)
  .filter(([id]) => Boolean(id))
  .map(([id, label]) => ({ id, label }))

const sortTeamsByPriority = (teams: GBank[]) => {
  return teams.sort((a, b) => {
    const priorityComparison = compareByPriority(a.name, b.name)
    if (priorityComparison === 0) {
      return b.balance - a.balance
    }
    return priorityComparison
  })
}

export function GBanksTable({ onError }: GBanksTableProps) {
  const [gbanks, setGbanks] = useState<GBank[]>([])
  const [newGBankName, setNewGBankName] = useState('')
  const [newGBankColor, setNewGBankColor] = useState('')
  const [editGBank, setEditGBank] = useState<GBank | null>(null)
  const [addGBankModalOpen, setAddGBankModalOpen] = useState(false)
  const [openRowIndex, setOpenRowIndex] = useState<string | null>(null)
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedColorFilter, setSelectedColorFilter] = useState<string>('all')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const menuRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const formatIntNoNegativeZero = (value: number) => {
    const rounded = Math.round(value)
    const safeValue = rounded === 0 ? 0 : rounded
    return safeValue.toLocaleString('en-US')
  }

  // Filtra e agrupa os gbanks baseado na busca e cor selecionada
  const filteredAndGroupedGBanks = useMemo(() => {
    let filtered = gbanks

    // Filtra por termo de busca
    if (searchTerm.trim()) {
      filtered = filtered.filter((gbank) =>
        gbank.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtra por cor selecionada
    if (selectedColorFilter !== 'all') {
      filtered = filtered.filter((gbank) => {
        const gbankColor = teamIdToColorMap[gbank.idTeam] || '#DC2626'
        return gbankColor === selectedColorFilter
      })
    }

    // Agrupa por idTeam (convertido para cor para exibição)
    const grouped = filtered.reduce((acc, gbank) => {
      const teamId = gbank.idTeam
      const color = teamIdToColorMap[teamId] || DEFAULT_TEAM_COLOR
      const colorLabel = teamIdToLabelMap[teamId] || 'Chefe de cozinha'

      if (!acc[teamId]) {
        acc[teamId] = {
          teamId,
          color,
          label: colorLabel,
          items: [],
        }
      }
      acc[teamId].items.push(gbank)
      return acc
    }, {} as Record<string, { teamId: string; color: string; label: string; items: GBank[] }>)

    // Ordena os grupos e itens dentro de cada grupo
    return Object.values(grouped)
      .sort((a, b) => compareByPriority(a.label, b.label))
      .map((group) => ({
        ...group,
        items: group.items.sort((a, b) => b.balance - a.balance),
      }))
  }, [gbanks, searchTerm, selectedColorFilter])

  // Alterna o menu de ações para a linha selecionada
  const toggleActionsDropdown = (
    gbankId: string,
    groupColor: string,
    event: React.MouseEvent
  ) => {
    const rowId = `${groupColor}-${gbankId}`
    if (openRowIndex === rowId) {
      setOpenRowIndex(null)
      setMenuPosition(null)
    } else {
      const rect = event.currentTarget.getBoundingClientRect()
      setMenuPosition({
        x: rect.right + 8,
        y: rect.top + rect.height / 2,
      })
      setOpenRowIndex(rowId)
    }
  }
  // Alterna a expansão de um grupo
  const toggleGroupExpansion = (color: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(color)) {
        newSet.delete(color)
      } else {
        newSet.add(color)
      }
      return newSet
    })
  }

  // Formata o valor da calculadora para exibir números corretamente
  const formatCalculatorValue = (value: string) => {
    const rawValue = value.replace(/[^0-9-]/g, '').replace(/(?!^)-/g, '')
    if (rawValue === '-') return '-'
    const numberValue = Number(rawValue.replace(/,/g, ''))
    return isNaN(numberValue) ? '' : numberValue.toLocaleString('en-US')
  }

  // Busca os GBanks da API e formata os dados recebidos
  const fetchGBanks = async (showLoading = false) => {
    if (showLoading) {
      setIsLoading(true)
    }
    try {
      const response = await getGbanks()
      const formattedGBanks =
        response?.map((gbank: GBankApiItem) => ({
          ...gbank,
          calculatorValue: gbank.calculatorValue
            ? formatCalculatorValue(gbank.calculatorValue.toString())
            : '',
        })) || []

      // Aplica a ordenação por prioridade
      const sortedGBanks = sortTeamsByPriority(formattedGBanks)
      setGbanks(sortedGBanks)
    } catch (error) {
      handleError(error, 'Error fetching GBanks')
    } finally {
      if (showLoading) {
        setIsLoading(false)
      }
    }
  }

  // Executa uma ação assíncrona e atualiza os GBanks após a conclusão
  const handleAction = async (
    action: () => Promise<void>,
    errorMessage: string
  ) => {
    setIsSubmitting(true)
    try {
      await action()
      await fetchGBanks(false) // Atualiza sem mostrar loading
    } catch (error) {
      handleError(error, errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Trata erros de requisições e exibe mensagens apropriadas
  const handleError = (error: unknown, defaultMessage: string) => {
    if (onError) {
      onError({ message: getApiErrorMessage(error, defaultMessage) })
    }
  }

  // Handle G-Bank deletion with SweetAlert confirmation
  const handleDeleteGBank = async (gbank: GBank) => {
    const result = await Swal.fire({
      title: 'Confirm Deletion',
      text: `Are you sure you want to delete G-Bank "${gbank.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          await deleteGBankService(gbank.id)
          await fetchGBanks(false)
        } catch (error) {
          handleError(error, 'Error deleting G-Bank')
          const message = getApiErrorMessage(error, 'Error deleting G-Bank')
          Swal.showValidationMessage(message)
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
      allowEscapeKey: () => !Swal.isLoading(),
      heightAuto: false,
      scrollbarPadding: false,
    })

    if (result.isConfirmed) {
      await Swal.fire({
        title: 'Deleted!',
        text: `G-Bank "${gbank.name}" deleted successfully.`,
        icon: 'success',
        heightAuto: false,
        scrollbarPadding: false,
      })
    }
  }

  useEffect(() => {
    // Busca os GBanks ao montar o componente
    fetchGBanks(true)
  }, [])

  useAdaptivePolling({
    onPoll: () => fetchGBanks(false),
    activeDelayMs: 10000,
    inactiveDelayMs: 30000,
  })

  useEffect(() => {
    // Fecha o menu de ações ao clicar fora dele
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      let clickedOutside = true

      menuRefs.current.forEach((menuRef) => {
        if (menuRef && menuRef.contains(target)) {
          clickedOutside = false
        }
      })

      if (clickedOutside) {
        setOpenRowIndex(null)
        setMenuPosition(null)
        menuRefs.current.clear()
      }
    }

    const handleResize = () => {
      setOpenRowIndex(null)
      setMenuPosition(null)
      menuRefs.current.clear()
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('resize', handleResize)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className='flex h-full w-full flex-col overflow-y-auto rounded-xl border border-white/10 bg-white/[0.04] text-white'>
      <div className='sticky top-0 z-20 flex flex-col gap-3 border-b border-white/10 bg-white/[0.03] p-2'>
        <div className='relative'>
          <input
            className='h-10 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 pr-10 text-sm text-white outline-none transition focus:border-purple-400/60'
            placeholder='Search...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className='pointer-events-none absolute right-3 top-2 text-neutral-400'>🔍</span>
        </div>

        <CustomSelect
          value={selectedColorFilter}
          onChange={setSelectedColorFilter}
          options={[
            { value: 'all', label: 'All Teams' },
            ...COLOR_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
            })),
          ]}
          minWidthClassName='w-full'
          renderInPortal
        />

        <button
          type='button'
          className='h-10 rounded-md border border-purple-400/45 bg-purple-500/20 px-3 text-sm font-semibold text-purple-100 transition hover:bg-purple-500/30'
          onClick={() => setAddGBankModalOpen(true)}
        >
          Add G-Bank
        </button>
      </div>

      {addGBankModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
          <div className='w-full max-w-md rounded-xl border border-white/10 bg-[#111115] p-4 text-white shadow-2xl'>
            <div className='mb-3 flex items-center justify-between'>
              <h3 className='text-base font-semibold'>Add New G-Bank</h3>
              <button
                type='button'
                className='rounded px-2 py-1 text-sm hover:bg-white/10'
                onClick={() => setAddGBankModalOpen(false)}
              >
                X
              </button>
            </div>
            <input
              className='mb-2 h-10 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none focus:border-purple-400/60'
              placeholder='Name'
              value={newGBankName}
              onChange={(e) => setNewGBankName(e.target.value)}
            />
            <CustomSelect
              value={newGBankColor || import.meta.env.VITE_TEAM_CHEFE}
              onChange={setNewGBankColor}
              options={teamSelectOptions.map((option) => ({
                value: option.id,
                label: option.label,
              }))}
              minWidthClassName='mb-3 w-full'
              renderInPortal
            />
            <div className='flex justify-end gap-2'>
              <button
                type='button'
                className='rounded-md border border-white/10 px-3 py-1 text-sm hover:bg-white/10'
                onClick={() => setAddGBankModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type='button'
                className='rounded-md border border-purple-400/45 bg-purple-500/20 px-3 py-1 text-sm text-purple-100 hover:bg-purple-500/30 disabled:opacity-50'
                disabled={isSubmitting}
                onClick={() =>
                  handleAction(
                    () =>
                      createGBank({
                        name: newGBankName,
                        idTeam: newGBankColor || import.meta.env.VITE_TEAM_CHEFE,
                      }),
                    'Error adding G-Bank'
                  ).then(() => {
                    setNewGBankName('')
                    setNewGBankColor('')
                    setAddGBankModalOpen(false)
                  })
                }
              >
                {isSubmitting ? 'Adding...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='flex-1 overflow-y-auto'>
        {isLoading ? (
          <div className='rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center'>
            <div className='flex flex-col items-center gap-2'>
              <LoadingSpinner size='md' color='#4b5563' label='Loading gbanks' />
              <p>Loading...</p>
            </div>
          </div>
        ) : filteredAndGroupedGBanks.length === 0 ? (
          <div className='rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center text-neutral-400'>
            {searchTerm || selectedColorFilter !== 'all'
              ? 'No results found for the applied filters'
              : 'No G-Bank found'}
          </div>
        ) : (
          filteredAndGroupedGBanks.map((group) => (
            <div key={group.teamId} className='mb-2 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]'>
              <button
                type='button'
                className='flex w-full items-center justify-between px-3 py-2 text-left font-semibold'
                style={{ background: group.color, color: group.label === 'Milharal' ? '#000' : '#fff' }}
                onClick={() => toggleGroupExpansion(group.teamId)}
              >
                <span>
                  {group.label} ({group.items.length} item{group.items.length !== 1 ? 's' : ''})
                </span>
                <span>{expandedGroups.has(group.teamId) ? '▾' : '▸'}</span>
              </button>

              {expandedGroups.has(group.teamId) && (
                <table className='w-full border-collapse'>
                  <thead className='bg-white/[0.05] text-xs uppercase text-neutral-300'>
                    <tr>
                      <th className='border border-white/10 p-2' />
                      <th className='border border-white/10 p-2 text-center'>Name</th>
                      <th className='border border-white/10 p-2 text-center'>Balance</th>
                      <th className='border border-white/10 p-2 text-center'>Calculator</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((gbank) => (
                      <tr key={gbank.id} className='border-b border-white/5 odd:bg-white/[0.02]'>
                        <td className='border border-white/10 p-2 text-center'>
                          <button
                            type='button'
                            className='rounded p-1 hover:bg-white/10'
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleActionsDropdown(gbank.id, group.teamId, e)
                            }}
                          >
                            <DotsThreeVertical size={16} />
                          </button>
                          {openRowIndex === `${group.teamId}-${gbank.id}` &&
                            createPortal(
                              <div
                                ref={(element) => {
                                  if (element) {
                                    menuRefs.current.set(`${group.teamId}-${gbank.id}`, element)
                                  } else {
                                    menuRefs.current.delete(`${group.teamId}-${gbank.id}`)
                                  }
                                }}
                                className='fixed z-[99999] min-w-[120px] rounded-md border border-white/10 bg-[#111115] p-2 text-white shadow-lg'
                                style={{
                                  left: menuPosition?.x || 0,
                                  top: menuPosition?.y ? menuPosition.y - 20 : 0,
                                }}
                              >
                                <button
                                  type='button'
                                  className='mb-1 w-full rounded px-2 py-1 text-left text-sm hover:bg-white/10'
                                  onClick={() => {
                                    setEditGBank(gbank)
                                    setOpenRowIndex(null)
                                    setMenuPosition(null)
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  type='button'
                                  className='w-full rounded px-2 py-1 text-left text-sm text-red-300 hover:bg-red-500/15'
                                  onClick={() => {
                                    handleDeleteGBank(gbank)
                                    setOpenRowIndex(null)
                                    setMenuPosition(null)
                                  }}
                                >
                                  Delete
                                </button>
                              </div>,
                              document.body
                            )}
                        </td>
                        <td className='border border-white/10 p-2 text-center text-base'>{gbank.name}</td>
                        <td className='border border-white/10 p-2 text-center text-base'>
                          {formatIntNoNegativeZero(Number(gbank.balance))}
                        </td>
                        <td className='border border-white/10 p-2 text-center'>
                          <input
                            className='w-[110px] rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-right text-white outline-none transition focus:border-purple-400/60'
                            type='text'
                            value={gbank.calculatorValue}
                            onChange={(e) => {
                              const formatted = formatCalculatorValue(e.target.value)
                              setGbanks((prev) =>
                                prev.map((item) =>
                                  item.id === gbank.id ? { ...item, calculatorValue: formatted } : item
                                )
                              )
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handleAction(
                                  () =>
                                    updateGBankValue({
                                      id: gbank.id,
                                      balance: Number(e.currentTarget.value.replace(/,/g, '')),
                                    }),
                                  'Error updating G-Bank calculator'
                                )
                              }
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))
        )}
      </div>

      {editGBank && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
          <div className='w-full max-w-md rounded-xl border border-white/10 bg-[#111115] p-4 text-white shadow-2xl'>
            <div className='mb-3 flex items-center justify-between'>
              <h3 className='text-base font-semibold'>Edit G-Bank</h3>
              <button
                type='button'
                className='rounded px-2 py-1 text-sm hover:bg-white/10'
                onClick={() => setEditGBank(null)}
              >
                X
              </button>
            </div>
            <input
              className='mb-2 h-10 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none focus:border-purple-400/60'
              value={editGBank.name}
              onChange={(e) => setEditGBank({ ...editGBank, name: e.target.value })}
            />
            <CustomSelect
              value={editGBank.idTeam}
              onChange={(value) => setEditGBank({ ...editGBank, idTeam: value })}
              options={teamSelectOptions.map((option) => ({
                value: option.id,
                label: option.label,
              }))}
              minWidthClassName='mb-3 w-full'
              renderInPortal
            />
            <div className='flex justify-end gap-2'>
              <button
                type='button'
                className='rounded-md border border-white/10 px-3 py-1 text-sm hover:bg-white/10'
                onClick={() => setEditGBank(null)}
              >
                Cancel
              </button>
              <button
                type='button'
                className='rounded-md border border-purple-400/45 bg-purple-500/20 px-3 py-1 text-sm text-purple-100 hover:bg-purple-500/30 disabled:opacity-50'
                disabled={isSubmitting}
                onClick={() =>
                  handleAction(
                    () =>
                      updateGBank({
                        id: editGBank.id,
                        name: editGBank.name,
                        idTeam: editGBank.idTeam,
                      }),
                    'Error updating G-Bank'
                  ).then(() => setEditGBank(null))
                }
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
