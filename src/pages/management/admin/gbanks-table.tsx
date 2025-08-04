import { DotsThreeVertical } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
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
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import Swal from 'sweetalert2'

import { GBank } from '../../../types'

// Função para ordenar times por prioridade baseada nos nomes
const sortTeamsByPriority = (teams: GBank[]) => {
  // Define a ordem de prioridade dos times
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
    'Fuck Bear',
    'Padeirinho',
    'Milharal',
  ]

  return teams.sort((a, b) => {
    const aIndex = priorityOrder.indexOf(a.name)
    const bIndex = priorityOrder.indexOf(b.name)

    // Se ambos estão na lista de prioridade, ordena pela posição
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex
    }

    // Se apenas um está na lista de prioridade, ele vem primeiro
    if (aIndex !== -1 && bIndex === -1) {
      return -1
    }
    if (aIndex === -1 && bIndex !== -1) {
      return 1
    }

    // Se nenhum está na lista de prioridade, ordena alfabeticamente
    return a.name.localeCompare(b.name)
  })
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
  { value: '#4C1D95', label: 'Fuck Bear' }, // Violeta
  { value: '#EA580C', label: 'Padeirinho' }, // Laranja
  { value: '#FEF08A', label: 'Milharal' }, // Amarelo claro
  { value: '#9CA3AF', label: 'Advertiser' }, // Cinza
  { value: '#86EFAC', label: 'Freelancer' }, // Verde claro
  { value: '#FFFFFF', label: 'Default (White)' },
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
  const [openRowIndex, setOpenRowIndex] = useState<number | null>(null)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  // Alterna o menu de ações para a linha selecionada
  const toggleActionsDropdown = (index: number, event: React.MouseEvent) => {
    if (openRowIndex === index) {
      setOpenRowIndex(null)
    } else {
      const button = event.currentTarget as HTMLElement
      const rect = button.getBoundingClientRect()
      const menuWidth = 120 // Largura estimada do menu
      const menuHeight = 80 // Altura estimada do menu
      
      // Verifica se o menu cabe na tela
      let x = rect.left
      let y = rect.bottom + 8
      
      // Se o menu sair pela direita, posiciona à esquerda do botão
      if (x + menuWidth > window.innerWidth) {
        x = rect.right - menuWidth
      }
      
      // Se o menu sair pela baixo, posiciona acima do botão
      if (y + menuHeight > window.innerHeight) {
        y = rect.top - menuHeight - 8
      }
      
      setMenuPosition({ x, y })
      setOpenRowIndex(index)
    }
  }

  // Formata o valor da calculadora para exibir números corretamente
  const formatCalculatorValue = (value: string) => {
    const rawValue = value.replace(/[^0-9-]/g, '').replace(/(?!^)-/g, '')
    if (rawValue === '-') return '-'
    const numberValue = Number(rawValue.replace(/,/g, ''))
    return isNaN(numberValue) ? '' : numberValue.toLocaleString('en-US')
  }

  // Busca os GBanks da API e formata os dados recebidos
  const fetchGBanks = async () => {
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
      setIsLoading(false)
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
      await fetchGBanks()
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
    fetchGBanks()
    const interval = setInterval(fetchGBanks, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Fecha o menu de ações ao clicar fora dele
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenRowIndex(null)
      }
    }
    
    // Fecha o menu quando a janela é redimensionada
    const handleResize = () => {
      setOpenRowIndex(null)
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
      <div className='top-0 flex gap-4 bg-zinc-400 p-2'>
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

      <TableContainer
        component={Paper}
        sx={{
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          minHeight: '300px',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                style={{
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  backgroundColor: '#ECEBEE',
                }}
              />
              <TableCell
                style={{
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  backgroundColor: '#ECEBEE',
                }}
                align='center'
              >
                G-Banks
              </TableCell>
              <TableCell
                style={{
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  backgroundColor: '#ECEBEE',
                }}
                align='center'
              >
                Balance
              </TableCell>
              <TableCell
                style={{
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  backgroundColor: '#ECEBEE',
                }}
                align='center'
              >
                Calculator
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} align='center'>
                  <span className='inline-block h-6 w-6 animate-spin rounded-full border-4 border-gray-600 border-t-transparent' />
                  <p>Loading...</p>
                </TableCell>
              </TableRow>
            ) : (
              gbanks.map((gbank, index) => (
                <TableRow key={gbank.id}>
                  <TableCell>
                    <div className='relative'>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleActionsDropdown(index, e)
                        }}
                      >
                        <DotsThreeVertical size={20} />
                      </IconButton>
                      {openRowIndex === index && (
                        <div
                          ref={menuRef}
                          className='fixed z-[9999] flex flex-col gap-2 rounded border bg-white p-2 shadow-lg'
                          style={{
                            left: menuPosition.x,
                            top: menuPosition.y
                          }}
                        >
                          <Button
                            variant='text'
                            onClick={() => {
                              setEditGBank(gbank)
                              setOpenRowIndex(null)
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant='text'
                            color='error'
                            onClick={() => {
                              handleDeleteGBank(gbank)
                              setOpenRowIndex(null)
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell
                    align='center'
                    style={{ backgroundColor: gbank.color || 'transparent' }}
                  >
                    {gbank.name}
                  </TableCell>
                  <TableCell align='center'>
                    {Math.round(Number(gbank.balance)).toLocaleString('en-US')}
                  </TableCell>
                  <TableCell align='center'>
                    <input
                      className='rounded-sm bg-zinc-100 p-2'
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
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
