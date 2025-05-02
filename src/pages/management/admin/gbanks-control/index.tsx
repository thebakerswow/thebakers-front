import { DotsThreeVertical } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import {
  ErrorDetails,
  ErrorComponent,
} from '../../../../components/error-display'
import { Modal as MuiModal, Box } from '@mui/material'
import { api } from '../../../../services/axiosConfig'
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

interface GBank {
  id: string
  name: string
  balance: number
  calculatorValue: string
  color?: string
}

const colorOptions = [
  { value: '#D97706', label: 'Padeirinho' },
  { value: '#2563EB', label: 'Garçom' },
  { value: '#F472B6', label: 'Confeiteiros' },
  { value: '#16A34A', label: 'Jackfruit' },
  { value: '#FEF08A', label: 'Milharal' },
  { value: '#FACC15', label: 'Raio' },
  { value: '#F87171', label: 'APAE' },
  { value: '#A78BFA', label: 'DTM' },
  { value: '#EF4444', label: 'Chefe de Cozinha' },
  { value: '#FFFFFF', label: 'Default (White)' },
]

export function GBanksTable() {
  const [gbanks, setGbanks] = useState<GBank[]>([])
  const [newGBankName, setNewGBankName] = useState('')
  const [newGBankColor, setNewGBankColor] = useState('')
  const [editGBank, setEditGBank] = useState<GBank | null>(null)
  const [deleteGBank, setDeleteGBank] = useState<GBank | null>(null)
  const [addGBankModalOpen, setAddGBankModalOpen] = useState(false)
  const [openRowIndex, setOpenRowIndex] = useState<number | null>(null)
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  // Alterna o menu de ações para a linha selecionada
  const toggleActionsDropdown = (index: number) => {
    setOpenRowIndex((prevIndex) => (prevIndex === index ? null : index))
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
      const response = await api.get(
        `${import.meta.env.VITE_API_BASE_URL}/gbanks`
      )
      const formattedGBanks =
        response.data?.info?.map((gbank: any) => ({
          ...gbank,
          calculatorValue: gbank.calculatorValue
            ? formatCalculatorValue(gbank.calculatorValue.toString())
            : '',
        })) || []
      setGbanks(formattedGBanks)
    } catch (error) {
      handleError(error, 'Erro ao buscar GBanks')
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
      setError({
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      })
    } else {
      setError({ message: defaultMessage, response: error })
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
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className='flex h-[90%] w-[30%] flex-col overflow-y-auto rounded-md'>
      <div className='top-0 flex gap-4 bg-zinc-400 p-2'>
        <Button
          variant='contained'
          color='error'
          onClick={() => setAddGBankModalOpen(true)}
          sx={{
            backgroundColor: 'rgb(239, 68, 68)',
            '&:hover': { backgroundColor: 'rgb(248, 113, 113)' },
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
          <DialogTitle className='text-center'>Add New G-Bank</DialogTitle>
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
              color='primary'
              onClick={() =>
                handleAction(
                  () =>
                    api.post(`${import.meta.env.VITE_API_BASE_URL}/gbanks`, {
                      name: newGBankName,
                      color: newGBankColor || '#FFFFFF',
                    }),
                  'Erro ao adicionar G-Bank'
                ).then(() => {
                  setNewGBankName('')
                  setNewGBankColor('')
                  setAddGBankModalOpen(false)
                })
              }
              disabled={isSubmitting}
              sx={{
                backgroundColor: 'rgb(239, 68, 68)',
                '&:hover': { backgroundColor: 'rgb(248, 113, 113)' },
              }}
            >
              {isSubmitting ? 'Adicionando...' : 'Salvar'}
            </Button>
            <Button
              variant='outlined'
              onClick={() => setAddGBankModalOpen(false)}
            >
              Cancelar
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
                  <p>Carregando...</p>
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
                          toggleActionsDropdown(index)
                        }}
                      >
                        <DotsThreeVertical size={20} />
                      </IconButton>
                      {openRowIndex === index && (
                        <div
                          ref={menuRef}
                          className='absolute left-0 z-50 mt-2 flex flex-col gap-2 rounded border bg-white p-2 shadow-md'
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
                              setDeleteGBank(gbank)
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
                              api.put(
                                `${import.meta.env.VITE_API_BASE_URL}/gbanks/value`,
                                {
                                  id: gbank.id,
                                  balance: Number(
                                    e.currentTarget.value.replace(/,/g, '')
                                  ),
                                }
                              ),
                            'Erro ao atualizar calculadora do G-Bank'
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
          <DialogTitle className='text-center'>Editar G-Bank</DialogTitle>
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
                    api.put(`${import.meta.env.VITE_API_BASE_URL}/gbanks`, {
                      id: editGBank.id,
                      name: editGBank.name,
                      color: editGBank.color || '#FFFFFF',
                    }),
                  'Erro ao atualizar G-Bank'
                ).then(() => setEditGBank(null))
              }
              disabled={isSubmitting}
              sx={{
                backgroundColor: 'rgb(239, 68, 68)',
                '&:hover': { backgroundColor: 'rgb(248, 113, 113)' },
              }}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {deleteGBank && (
        <Dialog open={!!deleteGBank} onClose={() => setDeleteGBank(null)}>
          <DialogTitle className='text-center'>Confirm Deletion</DialogTitle>
          <DialogContent>
            <p>Are you sure you want to delete G-Bank "{deleteGBank.name}"?</p>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center' }}>
            <Button
              variant='contained'
              color='error'
              onClick={() =>
                handleAction(
                  () =>
                    api.delete(
                      `${import.meta.env.VITE_API_BASE_URL}/gbanks/${deleteGBank.id}`
                    ),
                  'Erro ao deletar G-Bank'
                ).then(() => setDeleteGBank(null))
              }
              disabled={isSubmitting}
              sx={{
                backgroundColor: 'rgb(239, 68, 68)',
                '&:hover': { backgroundColor: 'rgb(248, 113, 113)' },
              }}
            >
              {isSubmitting ? 'Excluindo...' : 'Excluir'}
            </Button>
            <Button variant='outlined' onClick={() => setDeleteGBank(null)}>
              Cancelar
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {error && (
        <MuiModal open={!!error} onClose={() => setError(null)}>
          <Box className='absolute left-1/2 top-1/2 w-96 -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-gray-400 p-4 shadow-lg'>
            <ErrorComponent error={error} onClose={() => setError(null)} />
          </Box>
        </MuiModal>
      )}
    </div>
  )
}
