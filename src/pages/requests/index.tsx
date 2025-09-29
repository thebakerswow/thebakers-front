import { useState, useEffect, useRef } from 'react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Box,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  TextField,
  InputAdornment,
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import { Check, X, Eye, MagnifyingGlass, Calendar, CurrencyDollar } from '@phosphor-icons/react'
import { PencilSimple } from '@phosphor-icons/react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import { getTransactionRequests, updateTransactionRequest, updateTransactionRequestValue } from '../../services/api/gbanks'
import Swal from 'sweetalert2'

interface TransactionRequest {
  id: string | number
  idDiscord: string
  idGbank: string | number
  value: number
  status: 'pending' | 'accepted' | 'denied'
  urlImage: string
  createdAt: string
  nameUserRequest: string
  nameGbank: string
  idTeam: string
  balanceTotal: number
  sumDay: number
}

interface TransactionRequestResponse {
  transactions: TransactionRequest[]
  totalPages: number
}

// Mapeamento dos IDs dos times para nomes legíveis
const TEAM_NAMES: Record<string, string> = {
  [import.meta.env.VITE_TEAM_MPLUS]: 'M+',
  [import.meta.env.VITE_TEAM_LEVELING]: 'Leveling',
  [import.meta.env.VITE_TEAM_GARCOM]: 'Garçom',
  [import.meta.env.VITE_TEAM_CONFEITEIROS]: 'Confeiteiros',
  [import.meta.env.VITE_TEAM_JACKFRUIT]: 'Jackfruit',
  [import.meta.env.VITE_TEAM_INSANOS]: 'Insanos',
  [import.meta.env.VITE_TEAM_APAE]: 'APAE',
  [import.meta.env.VITE_TEAM_LOSRENEGADOS]: 'Los Renegados',
  [import.meta.env.VITE_TEAM_BOOTY_REAPER]: 'Booty Reaper',
}




export function RequestsPage() {
  const [requests, setRequests] = useState<TransactionRequest[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<TransactionRequest | null>(null)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'denied'>('pending')
  const [teamFilter, setTeamFilter] = useState<string>('all')
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [playerFilter, setPlayerFilter] = useState('')
  const [playerFilterInput, setPlayerFilterInput] = useState('') // For the input field
  const [dateFilter, setDateFilter] = useState('')
  const [minValueFilter, setMinValueFilter] = useState('')
  const [minValueFilterInput, setMinValueFilterInput] = useState('') // For the input field
  const [maxValueFilter, setMaxValueFilter] = useState('')
  const [maxValueFilterInput, setMaxValueFilterInput] = useState('') // For the input field
  const debounceTimeoutRef = useRef<number | null>(null)
  const minValueDebounceTimeoutRef = useRef<number | null>(null)
  const maxValueDebounceTimeoutRef = useRef<number | null>(null)

  // Função para extrair e formatar data diretamente da string da API
  const formatDateFromAPI = (apiDateString: string) => {
    // Extrair apenas a parte da data (YYYY-MM-DD) da string ISO
    const datePart = apiDateString.split('T')[0] // "2025-09-26"
    const [year, month, day] = datePart.split('-')
    
    // Criar array de meses em português
    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ]
    
    // Criar array de dias da semana em português
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    
    // Criar data para obter o dia da semana
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    const weekday = weekdays[date.getDay()]
    
    return {
      date: `${weekday}, ${day} ${months[parseInt(month) - 1]} ${year}`,
      time: apiDateString.split('T')[1].split('.')[0].substring(0, 5) // HH:MM
    }
  }

  // Função para formatar valor da calculadora igual ao gbank-table
  const formatCalculatorValue = (value: string) => {
    // Se está vazio, retorna vazio
    if (!value || value === '') return ''
    
    // Remove caracteres não numéricos exceto hífen no início
    const rawValue = value.replace(/[^0-9-]/g, '').replace(/(?!^)-/g, '')
    
    // Se é apenas hífen, mantém
    if (rawValue === '-') return '-'
    
    // Se não há números, retorna vazio
    if (!/\d/.test(rawValue)) return ''
    
    // Converte para número e formata
    const numberValue = Number(rawValue)
    return isNaN(numberValue) ? '' : numberValue.toLocaleString('en-US')
  }

  // Função para formatar valor para exibição em cards
  const formatValueForDisplay = (value: number): string => {
    // Formatação manual para garantir vírgula como separador de milhares
    const formatted = Math.abs(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return value < 0 ? `-${formatted}` : formatted
  }

  const fetchRequests = async () => {
    setIsLoading(true)
    try {
      const response = await getTransactionRequests({
        status: statusFilter, // Enviar o status atual do filtro
        page: currentPage,
        limit: 12,
        id_team: teamFilter,
        player_name: playerFilter,
        date: dateFilter,
        min_value: minValueFilter,
        max_value: maxValueFilter
      })
      
      // Verificar se response tem a estrutura esperada
      if (response && Array.isArray(response) && response.length > 0) {
        const data = response[0] as TransactionRequestResponse
        setRequests(data.transactions || [])
        // Calcular número de páginas baseado no total de resultados e limit de 12
        const totalResults = data.totalPages || 0
        const calculatedPages = Math.ceil(totalResults / 12)
        setTotalPages(calculatedPages)
      } else {
        setRequests([])
        setTotalPages(0)
      }
    } catch (error) {
      const errorDetails = {
        message: 'Error fetching requests',
        response: error,
      }
      setError(errorDetails)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusFilter = (status: 'all' | 'pending' | 'accepted' | 'denied') => {
    setStatusFilter(status)
    setCurrentPage(1) // Reset to first page when changing status filter
  }

  const handleTeamFilter = (teamId: string) => {
    setTeamFilter(teamId)
    setCurrentPage(1) // Reset to first page when changing team filter
  }

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page)
  }

  // Debounced search function for player
  const debouncedSearch = (value: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      setPlayerFilter(value)
      setCurrentPage(1)
    }, 1000) // 1 seconds delay
  }

  // Debounced search function for min value
  const debouncedMinValueSearch = (value: string) => {
    if (minValueDebounceTimeoutRef.current) {
      clearTimeout(minValueDebounceTimeoutRef.current)
    }
    
    minValueDebounceTimeoutRef.current = setTimeout(() => {
      setMinValueFilter(value)
      setCurrentPage(1)
    }, 1000) // 1 seconds delay
  }

  // Debounced search function for max value
  const debouncedMaxValueSearch = (value: string) => {
    if (maxValueDebounceTimeoutRef.current) {
      clearTimeout(maxValueDebounceTimeoutRef.current)
    }
    
    maxValueDebounceTimeoutRef.current = setTimeout(() => {
      setMaxValueFilter(value)
      setCurrentPage(1)
    }, 1000) // 1 seconds delay
  }

  const handlePlayerFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setPlayerFilterInput(value)
    debouncedSearch(value)
  }

  const handlePlayerFilterKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      // Clear the timeout and search immediately
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      setPlayerFilter(playerFilterInput)
      setCurrentPage(1)
    }
  }

  const handleDateFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter(event.target.value)
    setCurrentPage(1) // Reset to first page when changing date filter
  }

  const handleMinValueFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    const formattedValue = formatCalculatorValue(value)
    setMinValueFilterInput(formattedValue)
    
    // Extrair valor numérico para a API
    const rawValue = value.replace(/[^0-9-]/g, '').replace(/(?!^)-/g, '')
    
    // Se o campo está vazio ou só tem hífen, limpa o filtro
    if (!rawValue || rawValue === '-') {
      debouncedMinValueSearch('')
    } else if (!isNaN(Number(rawValue))) {
      debouncedMinValueSearch(rawValue)
    }
  }


  const handleMinValueFilterKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      // Clear the timeout and search immediately
      if (minValueDebounceTimeoutRef.current) {
        clearTimeout(minValueDebounceTimeoutRef.current)
      }
      const rawValue = minValueFilterInput.replace(/[^0-9-]/g, '').replace(/(?!^)-/g, '')
      
      // Se o campo está vazio ou só tem hífen, limpa o filtro
      if (!rawValue || rawValue === '-') {
        setMinValueFilter('')
      } else if (!isNaN(Number(rawValue))) {
        setMinValueFilter(rawValue)
      }
      setCurrentPage(1)
    }
  }

  const handleMaxValueFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    const formattedValue = formatCalculatorValue(value)
    setMaxValueFilterInput(formattedValue)
    
    // Extrair valor numérico para a API
    const rawValue = value.replace(/[^0-9-]/g, '').replace(/(?!^)-/g, '')
    
    // Se o campo está vazio ou só tem hífen, limpa o filtro
    if (!rawValue || rawValue === '-') {
      debouncedMaxValueSearch('')
    } else if (!isNaN(Number(rawValue))) {
      debouncedMaxValueSearch(rawValue)
    }
  }


  const handleMaxValueFilterKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      // Clear the timeout and search immediately
      if (maxValueDebounceTimeoutRef.current) {
        clearTimeout(maxValueDebounceTimeoutRef.current)
      }
      const rawValue = maxValueFilterInput.replace(/[^0-9-]/g, '').replace(/(?!^)-/g, '')
      
      // Se o campo está vazio ou só tem hífen, limpa o filtro
      if (!rawValue || rawValue === '-') {
        setMaxValueFilter('')
      } else if (!isNaN(Number(rawValue))) {
        setMaxValueFilter(rawValue)
      }
      setCurrentPage(1)
    }
  }

  const clearAllFilters = () => {
    setPlayerFilter('')
    setPlayerFilterInput('')
    setDateFilter('')
    setMinValueFilter('')
    setMinValueFilterInput('')
    setMaxValueFilter('')
    setMaxValueFilterInput('')
    setCurrentPage(1)
    
    // Clear any pending debounced searches
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    if (minValueDebounceTimeoutRef.current) {
      clearTimeout(minValueDebounceTimeoutRef.current)
    }
    if (maxValueDebounceTimeoutRef.current) {
      clearTimeout(maxValueDebounceTimeoutRef.current)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [statusFilter, currentPage, teamFilter, playerFilter, dateFilter, minValueFilter, maxValueFilter])


  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      if (minValueDebounceTimeoutRef.current) {
        clearTimeout(minValueDebounceTimeoutRef.current)
      }
      if (maxValueDebounceTimeoutRef.current) {
        clearTimeout(maxValueDebounceTimeoutRef.current)
      }
    }
  }, [])

  const openEditValueDialog = async (request: TransactionRequest) => {
    if (request.status !== 'pending') return
    
    const { value: newValue } = await Swal.fire({
      title: 'Edit Transaction Value',
      input: 'number',
      inputValue: request.value,
      inputAttributes: {
        step: '0.01',
        style: '-moz-appearance: textfield;'
      },
      customClass: {
        input: 'swal-no-spinner'
      },
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel',
      confirmButtonColor: 'rgb(147, 51, 234)',
      background: '#2a2a2a',
      color: 'white',
      inputValidator: (value) => {
        if (!value || Number.isNaN(parseFloat(value))) {
          return 'Please enter a valid number'
        }
      }
    })

    if (newValue && !Number.isNaN(parseFloat(newValue))) {
      try {
        await updateTransactionRequestValue({ id: request.id, value: parseFloat(newValue) })
        
        // Atualizar a lista de requisições localmente após edição do valor
        setRequests(prevRequests => 
          prevRequests.map(req => 
            req.id === request.id 
              ? { ...req, value: parseFloat(newValue) }
              : req
          )
        )
        
        Swal.fire({
          title: 'Success!',
          text: 'Transaction value updated successfully',
          icon: 'success',
          confirmButtonColor: 'rgb(147, 51, 234)',
          background: '#2a2a2a',
          color: 'white'
        })
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Failed to update transaction value',
          icon: 'error',
          confirmButtonColor: 'rgb(147, 51, 234)',
          background: '#2a2a2a',
          color: 'white'
        })
      }
    }
  }

  const handleAccept = async (requestId: string) => {
    // Adicionar à lista de requisições sendo processadas
    setProcessingRequests(prev => new Set(prev).add(requestId))
    
    try {
      await updateTransactionRequest({
        id: requestId,
        status: 'accepted'
      })
      
      // Atualizar a lista de requisições localmente após aceitação
      setRequests(prevRequests => 
        prevRequests.map(request => 
          request.id.toString() === requestId 
            ? { ...request, status: 'accepted' as const }
            : request
        )
      )
      
      // Mostrar mensagem de sucesso
      console.log('Request accepted successfully:', requestId)
    } catch (error) {
      console.error('Error accepting request:', error)
      const errorDetails = {
        message: 'Error accepting request',
        response: error,
      }
      setError(errorDetails)
    } finally {
      // Remover da lista de requisições sendo processadas
      setProcessingRequests(prev => {
        const newSet = new Set(prev)
        newSet.delete(requestId)
        return newSet
      })
    }
  }

  const handleDeny = async (requestId: string) => {
    // Adicionar à lista de requisições sendo processadas
    setProcessingRequests(prev => new Set(prev).add(requestId))
    
    try {
      await updateTransactionRequest({
        id: requestId,
        status: 'denied'
      })
      
      // Atualizar a lista de requisições localmente após negação
      setRequests(prevRequests => 
        prevRequests.map(request => 
          request.id.toString() === requestId 
            ? { ...request, status: 'denied' as const }
            : request
        )
      )
      
      // Mostrar mensagem de sucesso
      console.log('Request denied successfully:', requestId)
    } catch (error) {
      console.error('Error denying request:', error)
      const errorDetails = {
        message: 'Error denying request',
        response: error,
      }
      setError(errorDetails)
    } finally {
      // Remover da lista de requisições sendo processadas
      setProcessingRequests(prev => {
        const newSet = new Set(prev)
        newSet.delete(requestId)
        return newSet
      })
    }
  }

  const handleViewImage = (request: TransactionRequest) => {
    setSelectedRequest(request)
    setImageDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'accepted':
        return 'success'
      case 'denied':
        return 'error'
      default:
        return 'default'
    }
  }

  // Função para determinar a cor do card baseada no valor
  const getCardColor = (value: number) => {
    if (value > 0) {
      return {
        backgroundColor: '#1e3a8a', // Azul escuro para valores positivos
        borderColor: '#3b82f6', // Azul mais claro para a borda
        hoverBackgroundColor: '#1e40af', // Azul um pouco mais claro no hover
        hoverBorderColor: '#60a5fa', // Azul mais claro no hover
      }
    } else if (value < 0) {
      return {
        backgroundColor: '#2a2a2a', // Cor padrão para valores negativos
        borderColor: '#333', // Borda padrão
        hoverBackgroundColor: '#3a3a3a', // Hover padrão
        hoverBorderColor: 'rgb(147, 51, 234)', // Hover padrão
      }
    } else {
      // Para valor zero, manter a cor padrão
      return {
        backgroundColor: '#2a2a2a',
        borderColor: '#333',
        hoverBackgroundColor: '#3a3a3a',
        hoverBorderColor: 'rgb(147, 51, 234)',
      }
    }
  }

  if (isLoading) {
    return (
      <div className='w-full overflow-auto overflow-x-hidden pr-20'>
        <div className='m-8 min-h-screen w-full pb-12 text-white'>
          <div className='flex h-40 items-center justify-center'>
            <div className='flex flex-col items-center gap-2'>
              <CircularProgress size={32} sx={{ color: 'rgb(147, 51, 234)' }} />
              <span className='text-gray-400'>Loading requests...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full overflow-auto overflow-x-hidden pr-20'>
      <div className='m-8 min-h-screen w-full pb-12 text-white'>
        {error && <ErrorComponent error={error} onClose={() => setError(null)} />}
        
        <div className='mb-6 flex justify-between'>
          <Typography variant='h4' fontWeight='bold'>
            Transaction Requests
          </Typography>
        </div>

        {/* Filters */}
        <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Status Filter Buttons */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant={statusFilter === 'pending' ? 'contained' : 'outlined'}
              onClick={() => handleStatusFilter('pending')}
              sx={{
                backgroundColor: statusFilter === 'pending' ? '#f59e0b' : 'transparent',
                borderColor: '#f59e0b',
                color: 'white',
                '&:hover': {
                  backgroundColor: statusFilter === 'pending' ? '#fbbf24' : 'rgba(245, 158, 11, 0.1)',
                  borderColor: '#fbbf24',
                },
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1
              }}
            >
              Pending
            </Button>
            <Button
              variant={statusFilter === 'accepted' ? 'contained' : 'outlined'}
              onClick={() => handleStatusFilter('accepted')}
              sx={{
                backgroundColor: statusFilter === 'accepted' ? '#10b981' : 'transparent',
                borderColor: '#10b981',
                color: 'white',
                '&:hover': {
                  backgroundColor: statusFilter === 'accepted' ? '#34d399' : 'rgba(16, 185, 129, 0.1)',
                  borderColor: '#34d399',
                },
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1
              }}
            >
              Accepted
            </Button>
            <Button
              variant={statusFilter === 'denied' ? 'contained' : 'outlined'}
              onClick={() => handleStatusFilter('denied')}
              sx={{
                backgroundColor: statusFilter === 'denied' ? '#ef4444' : 'transparent',
                borderColor: '#ef4444',
                color: 'white',
                '&:hover': {
                  backgroundColor: statusFilter === 'denied' ? '#f87171' : 'rgba(239, 68, 68, 0.1)',
                  borderColor: '#f87171',
                },
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1
              }}
            >
              Denied
            </Button>
            <Button
              variant={statusFilter === 'all' ? 'contained' : 'outlined'}
              onClick={() => handleStatusFilter('all')}
              sx={{
                backgroundColor: statusFilter === 'all' ? 'rgb(147, 51, 234)' : 'transparent',
                borderColor: 'rgb(147, 51, 234)',
                color: 'white',
                '&:hover': {
                  backgroundColor: statusFilter === 'all' ? 'rgb(168, 85, 247)' : 'rgba(147, 51, 234, 0.1)',
                  borderColor: 'rgb(168, 85, 247)',
                },
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1
              }}
            >
              All Requests
            </Button>
          </Box>

          {/* Team Filter */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel sx={{ 
              color: 'white',
              '&.Mui-focused': {
                color: 'rgb(147, 51, 234)',
              },
            }}>Team</InputLabel>
            <Select
              value={teamFilter}
              onChange={(e) => handleTeamFilter(e.target.value)}
              label="Team"
              sx={{
                color: 'white',
                backgroundColor: '#2a2a2a',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgb(147, 51, 234)',
                },
                '& .MuiSvgIcon-root': {
                  color: 'white',
                },
                '& .MuiSelect-select': {
                  color: 'white',
                  backgroundColor: '#2a2a2a',
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #333',
                    '& .MuiMenuItem-root': {
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#3a3a3a',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(147, 51, 234, 0.2)',
                        '&:hover': {
                          backgroundColor: 'rgba(147, 51, 234, 0.3)',
                        },
                      },
                    },
                  },
                },
              }}
            >
              <MenuItem value="all">All Teams</MenuItem>
              {Object.entries(TEAM_NAMES).map(([teamId, teamName]) => (
                <MenuItem key={teamId} value={teamId}>
                  {teamName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Additional Filters */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Player Filter */}
          <TextField
            size="small"
            label="Filter by Player"
            value={playerFilterInput}
            onChange={handlePlayerFilterChange}
            onKeyPress={handlePlayerFilterKeyPress}
            placeholder="Search player name..."
            sx={{
              minWidth: 200,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                backgroundColor: '#2a2a2a',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgb(147, 51, 234)',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-focused': {
                  color: 'rgb(147, 51, 234)',
                },
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <MagnifyingGlass size={20} color="#9ca3af" />
                  </InputAdornment>
                ),
              },
            }}
          />

          {/* Date Filter */}
          <TextField
            size="small"
            label="Filter by Date"
            type="date"
            value={dateFilter}
            onChange={handleDateFilterChange}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Calendar size={20} color="#9ca3af" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              minWidth: 180,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                backgroundColor: '#2a2a2a',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgb(147, 51, 234)',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-focused': {
                  color: 'rgb(147, 51, 234)',
                },
              },
            }}
          />

          {/* Min Value Filter */}
          <TextField
            size="small"
            label="Min Value"
            type="text"
            value={minValueFilterInput}
            onChange={handleMinValueFilterChange}
            onKeyPress={handleMinValueFilterKeyPress}
            placeholder="0"
            sx={{
              minWidth: 120,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                backgroundColor: '#2a2a2a',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgb(147, 51, 234)',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-focused': {
                  color: 'rgb(147, 51, 234)',
                },
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <CurrencyDollar size={20} color="#9ca3af" />
                  </InputAdornment>
                ),
              },
            }}
          />

          {/* Max Value Filter */}
          <TextField
            size="small"
            label="Max Value"
            type="text"
            value={maxValueFilterInput}
            onChange={handleMaxValueFilterChange}
            onKeyPress={handleMaxValueFilterKeyPress}
            placeholder="∞"
            sx={{
              minWidth: 120,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                backgroundColor: '#2a2a2a',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgb(147, 51, 234)',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-focused': {
                  color: 'rgb(147, 51, 234)',
                },
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <CurrencyDollar size={20} color="#9ca3af" />
                  </InputAdornment>
                ),
              },
            }}
          />

          {/* Clear Filters Button */}
          <Button
            variant="outlined"
            onClick={clearAllFilters}
            sx={{
              borderColor: '#6b7280',
              color: '#9ca3af',
              '&:hover': {
                borderColor: '#9ca3af',
                backgroundColor: 'rgba(107, 114, 128, 0.1)',
              },
              textTransform: 'none',
              fontWeight: 500,
              px: 2,
              py: 1
            }}
          >
            Clear Filters
          </Button>
        </Box>

        {/* Requests Grid */}
        {requests.length === 0 ? (
          <Card sx={{ bgcolor: '#3a3a3a', border: '1px solid #555' }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="textSecondary">
                {statusFilter === 'all' && teamFilter === 'all' && !playerFilter && !dateFilter && !minValueFilter && !maxValueFilter
                  ? 'No requests found' 
                  : `No requests found for the selected filters`
                }
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Results info */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                Showing {requests.length} requests on page {currentPage}
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {requests.map((request) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={request.id}>
                <Card
                  sx={{
                    bgcolor: getCardColor(request.value).backgroundColor,
                    border: `1px solid ${getCardColor(request.value).borderColor}`,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      borderColor: getCardColor(request.value).hoverBorderColor,
                      bgcolor: getCardColor(request.value).hoverBackgroundColor,
                      transform: 'translateY(-2px)',
                      boxShadow: request.value > 0 
                        ? '0 6px 20px rgba(59, 130, 246, 0.2)' 
                        : request.value < 0 
                        ? '0 6px 20px rgba(245, 158, 11, 0.2)'
                        : '0 6px 20px rgba(147, 51, 234, 0.1)',
                    },
                  }}
                >
                  {/* Image Section */}
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      component="img"
                      src={request.urlImage}
                      alt="Request image"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDIwMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMWExYTFhIi8+CjxwYXRoIGQ9Ik0xMDAgNzBMMTIwIDEwMEg4MEwxMDAgNzBaIiBmaWxsPSIjNjY2NjY2Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEyMCIgcj0iMjAiIGZpbGw9IiM2NjY2NjYiLz4KPHN2Zz4K';
                      }}
                      sx={{
                        width: '100%',
                        height: 180,
                        objectFit: 'cover',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease-in-out',
                        backgroundColor: '#1a1a1a',
                        '&:hover': {
                          opacity: 0.7,
                          transform: 'scale(1.05)',
                        }
                      }}
                      onClick={() => handleViewImage(request)}
                    />
                    
                    {/* Hover overlay with magnifying glass */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.3s ease-in-out',
                        cursor: 'pointer',
                        '&:hover': {
                          opacity: 1,
                        }
                      }}
                      onClick={() => handleViewImage(request)}
                    >
                      <Box
                        sx={{
                          backgroundColor: 'rgba(147, 51, 234, 0.9)',
                          borderRadius: '50%',
                          padding: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transform: 'scale(1.2)',
                          transition: 'transform 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'scale(1.3)',
                          }
                        }}
                      >
                        <Eye size={24} color="white" />
                      </Box>
                    </Box>
                    
                  </Box>

                  {/* Content Section */}
                  <CardContent sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    p: 2
                  }}>
                    {/* Header with G-Bank name and status */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        mb: 0.5 
                      }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            lineHeight: 1.3,
                            color: 'white'
                          }}
                        >
                          {request.nameGbank}
                        </Typography>
                        <Chip
                          label={request.status.toUpperCase()}
                          color={getStatusColor(request.status) as any}
                          size="small"
                          sx={{
                            fontWeight: 'bold',
                            fontSize: '0.7rem',
                            height: 20,
                            '& .MuiChip-label': {
                              px: 1
                            }
                          }}
                        />
                      </Box>
                     
                    </Box>
                    
                    {/* Value section */}
                    <Box sx={{ 
                      backgroundColor: '#1a1a1a',
                      borderRadius: 1,
                      p: 1.5,
                      mb: 2,
                      border: '1px solid',
                      borderColor: '#333'
                    }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '0.8rem',
                          mb: 0.5,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          color: '#9ca3af'
                        }}
                      >
                        Transaction Value
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            fontWeight: 700,
                            color: request.value > 0 
                              ? '#60a5fa' // Azul claro para valores positivos
                              : request.value < 0 
                              ? '#ef4444' // Vermelho para valores negativos
                              : 'rgb(147, 51, 234)', // Roxo para valor zero
                            fontSize: '1.4rem'
                          }}
                        >
                          {formatValueForDisplay(request.value)}
                        </Typography>
                        {request.status === 'pending' && (
                          <Tooltip title="Edit" placement="top">
                            <IconButton
                              aria-label="edit value"
                              size="small"
                              onClick={() => openEditValueDialog(request)}
                              sx={{ 
                                color: request.value > 0 
                                  ? '#60a5fa' // Azul claro para valores positivos
                                  : request.value < 0 
                                  ? '#ef4444' // Vermelho para valores negativos
                                  : 'rgb(147, 51, 234)' // Roxo para valor zero
                              }}
                            >
                              <PencilSimple size={18} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                    
                    {/* Request details section */}
                    <Box sx={{ mb: 2.5 }}>
                      {/* Requested by */}
                      <Box sx={{ mb: 1.5 }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            mb: 0.5,
                            display: 'block',
                            color: '#9ca3af'
                          }}
                        >
                          Requested by
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontSize: '0.85rem',
                              fontWeight: 500,
                              color: 'white'
                            }}
                          >
                            {request.nameUserRequest}
                          </Typography>
                          {request.status === 'pending' && (
                            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                              <Chip
                                label={`Daily Balance: ${formatValueForDisplay(request.sumDay)}g`}
                                size="small"
                                sx={{
                                  fontSize: '1rem',
                                  height: 22,
                                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                  color: '#3b82f6',
                                  border: '1px solid #3b82f6',
                                  fontWeight: 600,
                                  px: 1,
                                  '& .MuiChip-label': {
                                    px: 0.5
                                  }
                                }}
                              />
                              <Chip
                                label={`Balance Total: ${formatValueForDisplay(request.balanceTotal)}g`}
                                size="small"
                                sx={{
                                  fontSize: '1rem',
                                  height: 22,
                                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                  color: '#10b981',
                                  border: '1px solid #10b981',
                                  fontWeight: 600,
                                  px: 1,
                                  '& .MuiChip-label': {
                                    px: 0.5
                                  }
                                }}
                              />
                            </Box>
                          )}
                        </Box>
                      </Box>

                      {/* Date and time */}
                      <Box sx={{ mb: 1.5 }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            mb: 0.5,
                            display: 'block',
                            color: '#9ca3af'
                          }}
                        >
                          Date & Time
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontSize: '0.85rem',
                              fontWeight: 500,
                              color: 'white'
                            }}
                          >
                            {formatDateFromAPI(request.createdAt).date}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontSize: '0.8rem',
                              color: '#9ca3af',
                              fontFamily: 'monospace'
                            }}
                          >
                            {formatDateFromAPI(request.createdAt).time}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Action buttons - only show for pending requests */}
                    {request.status === 'pending' && (
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1.5,
                        mt: 'auto'
                      }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<Check size={18} />}
                          onClick={() => handleAccept(String(request.id))}
                          disabled={processingRequests.has(String(request.id))}
                          sx={{
                            flex: 1,
                            py: 1,
                            fontWeight: 600,
                            textTransform: 'none',
                            borderRadius: 1.5,
                            fontSize: '0.85rem'
                          }}
                        >
                          {processingRequests.has(String(request.id)) ? 'Processing...' : 'Accept'}
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          startIcon={<X size={18} />}
                          onClick={() => handleDeny(String(request.id))}
                          disabled={processingRequests.has(String(request.id))}
                          sx={{
                            flex: 1,
                            py: 1,
                            fontWeight: 600,
                            textTransform: 'none',
                            borderRadius: 1.5,
                            fontSize: '0.85rem'
                          }}
                        >
                          {processingRequests.has(String(request.id)) ? 'Processing...' : 'Deny'}
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mt: 4,
                mb: 2
              }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: 'white',
                      backgroundColor: '#2a2a2a',
                      border: '1px solid #333',
                      '&:hover': {
                        backgroundColor: '#3a3a3a',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'rgb(147, 51, 234)',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgb(168, 85, 247)',
                        },
                      },
                      '&.MuiPaginationItem-previousNext': {
                        backgroundColor: '#2a2a2a',
                        border: '1px solid #333',
                        '&:hover': {
                          backgroundColor: '#3a3a3a',
                        },
                      },
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </div>

    {/* Image Dialog */}
    <Dialog
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ position: 'relative', pr: 6 }}>
          Request Image - {selectedRequest?.nameGbank}
          <IconButton
            aria-label="close"
            onClick={() => setImageDialogOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box>
              <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={4}
                centerOnInit={true}
                wheel={{ step: 0.1 }}
                pinch={{ step: 5 }}
                doubleClick={{ disabled: false, step: 0.9 }}
                centerZoomedOut={true}
                limitToBounds={false}
              >
                <TransformComponent
                  wrapperStyle={{
                    width: '100%',
                    height: '400px',
                    cursor: 'grab'
                  }}
                  contentStyle={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <img
                    src={selectedRequest.urlImage}
                    alt="Request image"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDIwMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMWExYTFhIi8+CjxwYXRoIGQ9Ik0xMDAgNzBMMTIwIDEwMEg4MEwxMDAgNzBaIiBmaWxsPSIjNjY2NjY2Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEyMCIgcj0iMjAiIGZpbGw9IiM2NjY2NjYiLz4KPHN2Zz4K';
                    }}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      userSelect: 'none'
                    }}
                    draggable={false}
                  />
                </TransformComponent>
              </TransformWrapper>
              <Box mt={2}>
                <Typography variant="body2" color="textSecondary">
                  Value: <strong>{formatValueForDisplay(selectedRequest.value)}</strong>
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Status: <strong>{selectedRequest.status}</strong>
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Created: {formatDateFromAPI(selectedRequest.createdAt).date} às {formatDateFromAPI(selectedRequest.createdAt).time}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
