import { DotsThreeVertical } from '@phosphor-icons/react'
import { useEffect, useRef, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import axios from 'axios'
import { ErrorDetails } from '../../../components/error-display'
import {
  getGbanks,
  createGBank,
  updateGBankValue,
  updateGBank,
  deleteGBank as deleteGBankService,
} from '../../../services/api/gbanks'
import {
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Swal from 'sweetalert2'

import { GBank } from '../../../types'

// Ordem de prioridade dos times/grupos
const priorityOrder = [
  'Chefe de cozinha',
  'M+',
  'Leveling',
  'Garçom',
  'Confeiteiros',
  'Jackfruit',
  'Insanos',
  'APAE',
  'Los Renegados',
  'DTM',
  'KFFC',
  'Greensky',
  'Guild Azralon BR#1',
  'Guild Azralon BR#2',
  'Rocket',
  'Booty Reaper',
  'Padeirinho',
  'Milharal',
  'Bastard München',
  'Kiwi',
  'Default',
]

// Comparador que respeita a priorityOrder e cai para ordem alfabética
const compareByPriority = (aLabel: string, bLabel: string) => {
  const aIndex = priorityOrder.indexOf(aLabel)
  const bIndex = priorityOrder.indexOf(bLabel)

  if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
  if (aIndex !== -1 && bIndex === -1) return -1
  if (aIndex === -1 && bIndex !== -1) return 1
  return aLabel.localeCompare(bLabel)
}

// Função para ordenar times por prioridade baseada nos nomes
const sortTeamsByPriority = (teams: GBank[]) => {
  return teams.sort((a, b) => compareByPriority(a.name, b.name))
}

const colorOptions = [
  { value: '#DC2626', label: 'Chefe de cozinha' }, // Vermelho escuro
  { value: '#7C3AED', label: 'M+' }, // Roxo
  { value: '#059669', label: 'Leveling' }, // Verde esmeralda
  { value: '#2563EB', label: 'Garçom' }, // Azul
  { value: '#EC4899', label: 'Confeiteiros' }, // Rosa
  { value: '#16A34A', label: 'Jackfruit' }, // Verde
  { value: '#1E40AF', label: 'Insanos' }, // Azul escuro
  { value: '#F87171', label: 'APAE' }, // Rosa claro
  { value: '#F59E0B', label: 'Los Renegados' }, // Amarelo
  { value: '#8B5CF6', label: 'DTM' }, // Violeta
  { value: '#047857', label: 'KFFC' }, // Verde escuro
  { value: '#BE185D', label: 'Greensky' }, // Rosa escuro
  { value: '#0D9488', label: 'Guild Azralon BR#1' }, // Verde azulado
  { value: '#1D4ED8', label: 'Guild Azralon BR#2' }, // Azul médio
  { value: '#B91C1C', label: 'Rocket' }, // Vermelho
  { value: '#4C1D95', label: 'Booty Reaper' }, // Violeta
  { value: '#EA580C', label: 'Padeirinho' }, // Laranja
  { value: '#FEF08A', label: 'Milharal' }, // Amarelo claro
  { value: '#9CA3AF', label: 'Advertiser' }, // Cinza
  { value: '#86EFAC', label: 'Freelancer' }, // Verde claro
  { value: '#D97706', label: 'Bastard München' }, // Âmbar
  { value: '#84CC16', label: 'Kiwi' }, // Verde lima
  { value: '#FFFFFF', label: 'Default' },
]

interface GBanksTableProps {
  onError?: (error: ErrorDetails) => void
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

  // Filtra e agrupa os gbanks baseado na busca e cor selecionada
  const filteredAndGroupedGBanks = useMemo(() => {
    let filtered = gbanks

    // Filtra por termo de busca
    if (searchTerm.trim()) {
      filtered = filtered.filter(gbank =>
        gbank.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtra por cor selecionada
    if (selectedColorFilter !== 'all') {
      filtered = filtered.filter(gbank => gbank.color === selectedColorFilter)
    }

    // Agrupa por cor
    const grouped = filtered.reduce((acc, gbank) => {
      const color = gbank.color || '#FFFFFF'
      const colorLabel = colorOptions.find(opt => opt.value === color)?.label || 'Default'
      
      if (!acc[color]) {
        acc[color] = {
          color,
          label: colorLabel,
          items: []
        }
      }
      acc[color].items.push(gbank)
      return acc
    }, {} as Record<string, { color: string; label: string; items: GBank[] }>)

    // Ordena os grupos e itens dentro de cada grupo
    return Object.values(grouped)
      .sort((a, b) => compareByPriority(a.label, b.label))
      .map(group => ({
        ...group,
        items: sortTeamsByPriority(group.items)
      }))
  }, [gbanks, searchTerm, selectedColorFilter])

  // Alterna o menu de ações para a linha selecionada
  const toggleActionsDropdown = (gbankId: string, groupColor: string, event: React.MouseEvent) => {
    const rowId = `${groupColor}-${gbankId}`
    if (openRowIndex === rowId) {
      setOpenRowIndex(null)
      setMenuPosition(null)
    } else {
      const rect = event.currentTarget.getBoundingClientRect()
      setMenuPosition({
        x: rect.right + 8,
        y: rect.top + rect.height / 2
      })
      setOpenRowIndex(rowId)
    }
  }



  // Alterna a expansão de um grupo
  const toggleGroupExpansion = (color: string) => {
    setExpandedGroups(prev => {
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
        response?.map((gbank: any) => ({
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
    if (axios.isAxiosError(error)) {
      const errorDetails = {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      }
      if (onError) {
        onError(errorDetails)
      }
    } else {
      const errorDetails = { message: defaultMessage, response: error }
      if (onError) {
        onError(errorDetails)
      }
    }
  }

  // Handle G-Bank deletion with SweetAlert confirmation
  const handleDeleteGBank = async (gbank: GBank) => {
    const result = await Swal.fire({
      title: 'Confirm Deletion',
      text: `Are you sure you want to delete G-Bank "${gbank.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#9333EA',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      allowOutsideClick: true,
      allowEscapeKey: true,
      heightAuto: false,
      scrollbarPadding: false,
    })

    if (result.isConfirmed) {
      await handleAction(
        () => deleteGBankService(gbank.id),
        'Error deleting G-Bank'
      )
    }
  }

  useEffect(() => {
    // Busca os GBanks ao montar o componente e atualiza periodicamente
    fetchGBanks(true) // Mostra loading apenas na primeira vez
    const interval = setInterval(() => fetchGBanks(false), 10000) // Atualiza sem mostrar loading
    return () => clearInterval(interval)
  }, [])

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
        // Limpa as refs quando o menu é fechado
        menuRefs.current.clear()
      }
    }
    
    // Fecha o menu quando a janela é redimensionada
    const handleResize = () => {
      setOpenRowIndex(null)
      setMenuPosition(null)
      // Limpa as refs quando a janela é redimensionada
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
    <div className='flex h-[90%] w-[30%] flex-col overflow-y-auto rounded-md'>
      <div className='top-0 flex flex-col gap-4 bg-white p-2'>
        {/* Campo de busca */}
        <TextField
          fullWidth
          variant='outlined'
          placeholder='Search...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          size='small'
        />
        
        {/* Filtro por cor */}
        <FormControl fullWidth size='small'>
          <InputLabel>Filter by team</InputLabel>
          <Select
            value={selectedColorFilter}
            onChange={(e) => setSelectedColorFilter(e.target.value)}
            label='Filtrar por cor'
          >
            <MenuItem value='all'>All Teams</MenuItem>
            {colorOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Box display='flex' alignItems='center' gap={1}>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      backgroundColor: option.value,
                      border: '1px solid #ccc',
                      borderRadius: 2
                    }}
                  />
                  {option.label}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant='contained'
          color='error'
          onClick={() => setAddGBankModalOpen(true)}
          sx={{
            backgroundColor: 'rgb(147, 51, 234)',
            '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
          }}
        >
          Add G-Bank
        </Button>
      </div>

      {/* Add G-Bank Modal */}
      {addGBankModalOpen && (
        <Dialog
          open={addGBankModalOpen}
          onClose={() => setAddGBankModalOpen(false)}
        >
          <DialogTitle className='relative text-center'>
            Add New G-Bank
            <IconButton
              aria-label='close'
              onClick={() => setAddGBankModalOpen(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              margin='dense'
              variant='outlined'
              label='Name'
              value={newGBankName}
              onChange={(e) => setNewGBankName(e.target.value)}
            />
            <TextField
              select
              fullWidth
              margin='dense'
              variant='outlined'
              label='Color'
              value={newGBankColor || '#FFFFFF'}
              onChange={(e) => setNewGBankColor(e.target.value)}
              SelectProps={{
                native: true,
              }}
            >
              {colorOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center' }}>
            <Button
              variant='contained'
              onClick={() =>
                handleAction(
                  () =>
                    createGBank({
                      name: newGBankName,
                      color: newGBankColor || '#FFFFFF',
                    }),
                  'Error adding G-Bank'
                ).then(() => {
                  setNewGBankName('')
                  setNewGBankColor('')
                  setAddGBankModalOpen(false)
                })
              }
              disabled={isSubmitting}
              sx={{
                backgroundColor: 'rgb(147, 51, 234)',
                '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
              }}
            >
              {isSubmitting ? 'Adding...' : 'Save'}
            </Button>
            <Button
              variant='outlined'
              onClick={() => setAddGBankModalOpen(false)}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Tabela agrupada por cor */}
      <div className='flex-1 overflow-y-auto'>
                 {isLoading ? (
           <div className='bg-white p-4 text-center border border-gray-200 rounded-md'>
             <div className='flex flex-col items-center gap-2'>
               <span className='inline-block h-6 w-6 animate-spin rounded-full border-4 border-gray-600 border-t-transparent' />
               <Typography>Loading...</Typography>
             </div>
           </div>
                 ) : filteredAndGroupedGBanks.length === 0 ? (
           <div className='bg-white p-4 text-center border border-gray-200 rounded-md'>
             <Typography variant='body1' color='textSecondary'>
               {searchTerm || selectedColorFilter !== 'all' 
                 ? 'No results found for the applied filters'
                 : 'No G-Bank found'
               }
             </Typography>
           </div>
        ) : (
          filteredAndGroupedGBanks.map((group) => (
            <Accordion
              key={group.color}
              expanded={expandedGroups.has(group.color)}
              onChange={() => toggleGroupExpansion(group.color)}
              sx={{
                '&:before': { display: 'none' },
                boxShadow: 'none',
                border: '1px solid #e0e0e0',
                marginBottom: 1,
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  backgroundColor: group.color,
                  color: group.label === 'Milharal' ? '#000' : (group.color === '#FFFFFF' ? '#000' : '#fff'),
                  '&:hover': { backgroundColor: group.color, opacity: 0.9 },
                }}
              >
                <Box display='flex' alignItems='center' gap={2} width='100%'>
                  <Typography variant='subtitle1' fontWeight='bold'>
                    {group.label}
                  </Typography>
                  <Typography variant='body2'>
                    ({group.items.length} item{group.items.length !== 1 ? 's' : ''})
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ padding: 0 }}>
                <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          style={{
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                            backgroundColor: '#f5f5f5',
                          }}
                        />
                        <TableCell
                          style={{
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                            backgroundColor: '#f5f5f5',
                          }}
                          align='center'
                        >
                          Nome
                        </TableCell>
                        <TableCell
                          style={{
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                            backgroundColor: '#f5f5f5',
                          }}
                          align='center'
                        >
                          Balance
                        </TableCell>
                        <TableCell
                          style={{
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                            backgroundColor: '#f5f5f5',
                          }}
                          align='center'
                        >
                          Calculator
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {group.items.map((gbank) => (
                        <TableRow key={gbank.id}>
                          <TableCell>
                            <div className='relative' style={{ position: 'relative' }}>
                              <IconButton
                                size='small'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleActionsDropdown(gbank.id, group.color, e)
                                }}
                              >
                                <DotsThreeVertical size={16} />
                              </IconButton>
                                                             {openRowIndex === `${group.color}-${gbank.id}` && createPortal(
                                 <div
                                   ref={(el) => {
                                     if (el) {
                                       menuRefs.current.set(`${group.color}-${gbank.id}`, el)
                                     } else {
                                       menuRefs.current.delete(`${group.color}-${gbank.id}`)
                                     }
                                   }}
                                   className='fixed z-[99999] flex flex-col gap-2 rounded border bg-white p-2 shadow-lg min-w-[120px]'
                                   style={{
                                     position: 'fixed',
                                     left: menuPosition?.x || 0,
                                     top: menuPosition?.y ? menuPosition.y - 20 : 0,
                                     zIndex: 99999
                                   }}
                                   onMouseLeave={() => {
                                     setOpenRowIndex(null)
                                     setMenuPosition(null)
                                   }}
                                 >
                                   <Button
                                     variant='text'
                                     size='small'
                                     onClick={() => {
                                       setEditGBank(gbank)
                                       setOpenRowIndex(null)
                                       setMenuPosition(null)
                                     }}
                                   >
                                     Edit
                                   </Button>
                                   <Button
                                     variant='text'
                                     color='error'
                                     size='small'
                                     onClick={() => {
                                       handleDeleteGBank(gbank)
                                       setOpenRowIndex(null)
                                       setMenuPosition(null)
                                     }}
                                   >
                                     Delete
                                   </Button>
                                 </div>,
                                 document.body
                               )}
                            </div>
                          </TableCell>
                          <TableCell align='center'>
                            {gbank.name}
                          </TableCell>
                          <TableCell align='center'>
                            {Math.round(Number(gbank.balance)).toLocaleString('en-US')}
                          </TableCell>
                          <TableCell align='center'>
                            <input
                              className='rounded-sm bg-zinc-100 p-1 text-sm'
                              type='text'
                              value={gbank.calculatorValue}
                              onChange={(e) => {
                                const formatted = formatCalculatorValue(e.target.value)
                                setGbanks((prev) =>
                                  prev.map((g) =>
                                    g.id === gbank.id
                                      ? { ...g, calculatorValue: formatted }
                                      : g
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
                                        balance: Number(
                                          e.currentTarget.value.replace(/,/g, '')
                                        ),
                                      }),
                                    'Error updating G-Bank calculator'
                                  )
                                }
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </div>

      {editGBank && (
        <Dialog open={!!editGBank} onClose={() => setEditGBank(null)}>
          <DialogTitle className='relative text-center'>
            Edit G-Bank
            <IconButton
              aria-label='close'
              onClick={() => setEditGBank(null)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              margin='dense'
              variant='outlined'
              label='Name'
              value={editGBank.name}
              onChange={(e) =>
                setEditGBank({ ...editGBank, name: e.target.value })
              }
            />
            <TextField
              select
              fullWidth
              margin='dense'
              variant='outlined'
              label='Color'
              value={editGBank.color || '#FFFFFF'}
              onChange={(e) =>
                setEditGBank({ ...editGBank, color: e.target.value })
              }
              SelectProps={{
                native: true,
              }}
            >
              {colorOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center' }}>
            <Button
              variant='contained'
              color='primary'
              onClick={() =>
                handleAction(
                  () =>
                    updateGBank({
                      id: editGBank.id,
                      name: editGBank.name,
                      color: editGBank.color || '#FFFFFF',
                    }),
                  'Error updating G-Bank'
                ).then(() => setEditGBank(null))
              }
              disabled={isSubmitting}
              sx={{
                backgroundColor: 'rgb(147, 51, 234)',
                '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
              }}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  )
}
