import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Swal from 'sweetalert2'

import { ErrorDetails } from '../../components/error-display'
import { getUserGbanks, createTransactionRequest } from '../../services/api/gbanks'
import { GBank } from '../../types'

// Mapeamento de IDs dos times para cores
const teamIdToColorMap: Record<string, string> = {
  [import.meta.env.VITE_TEAM_CHEFE]: '#DC2626', // Chefe de cozinha
  [import.meta.env.VITE_TEAM_MPLUS]: '#7C3AED', // M+
  [import.meta.env.VITE_TEAM_LEVELING]: '#059669', // Leveling
  [import.meta.env.VITE_TEAM_GARCOM]: '#2563EB', // Garçom
  [import.meta.env.VITE_TEAM_CONFEITEIROS]: '#EC4899', // Confeiteiros
  [import.meta.env.VITE_TEAM_JACKFRUIT]: '#16A34A', // Jackfruit
  [import.meta.env.VITE_TEAM_INSANOS]: '#1E40AF', // Insanos
  [import.meta.env.VITE_TEAM_APAE]: '#F87171', // APAE
  [import.meta.env.VITE_TEAM_LOSRENEGADOS]: '#F59E0B', // Los Renegados
  [import.meta.env.VITE_TEAM_DTM]: '#8B5CF6', // DTM
  [import.meta.env.VITE_TEAM_KFFC]: '#06B6D4', // KFFC
  [import.meta.env.VITE_TEAM_GREENSKY]: '#10B981', // Greensky
  [import.meta.env.VITE_TEAM_GUILD_AZRALON_1]: '#F97316', // Guild Azralon BR#1
  [import.meta.env.VITE_TEAM_GUILD_AZRALON_2]: '#EF4444', // Guild Azralon BR#2
  [import.meta.env.VITE_TEAM_ROCKET]: '#8B5A2B', // Rocket
  [import.meta.env.VITE_TEAM_BOOTY_REAPER]: '#6B7280', // Booty Reaper
  [import.meta.env.VITE_TEAM_PADEIRINHO]: '#EA580C', // Padeirinho
  [import.meta.env.VITE_TEAM_MILHARAL]: '#FEF08A', // Milharal
  [import.meta.env.VITE_TEAM_BASTARD]: '#D97706', // Bastard Munchen
  [import.meta.env.VITE_TEAM_KIWI]: '#84CC16', // Kiwi
}

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
  'Bastard Munchen',
  'Kiwi',
]

const colorOptions = [

  { value: '#DC2626', label: 'Chefe de cozinha' },
  { value: '#7C3AED', label: 'M+' },
  { value: '#059669', label: 'Leveling' },
  { value: '#2563EB', label: 'Garçom' },
  { value: '#EC4899', label: 'Confeiteiros' },
  { value: '#16A34A', label: 'Jackfruit' },
  { value: '#1E40AF', label: 'Insanos' },
  { value: '#F87171', label: 'APAE' },
  { value: '#F59E0B', label: 'Los Renegados' },
  { value: '#8B5CF6', label: 'DTM' },
  { value: '#047857', label: 'KFFC' },
  { value: '#BE185D', label: 'Greensky' },
  { value: '#0D9488', label: 'Guild Azralon BR#1' },
  { value: '#1D4ED8', label: 'Guild Azralon BR#2' },
  { value: '#B91C1C', label: 'Rocket' },
  { value: '#4C1D95', label: 'Booty Reaper' },
  { value: '#EA580C', label: 'Padeirinho' },
  { value: '#FEF08A', label: 'Milharal' },
  { value: '#9CA3AF', label: 'Advertiser' },
  { value: '#86EFAC', label: 'Freelancer' },
  { value: '#D97706', label: 'Bastard Munchen' },
  { value: '#84CC16', label: 'Kiwi' },
]

const compareByPriority = (aLabel: string, bLabel: string) => {
  const aIndex = priorityOrder.indexOf(aLabel)
  const bIndex = priorityOrder.indexOf(bLabel)
  if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
  if (aIndex !== -1 && bIndex === -1) return -1
  if (aIndex === -1 && bIndex !== -1) return 1
  return aLabel.localeCompare(bLabel)
}

type GBankListNewProps = {
  onError?: (error: ErrorDetails) => void
}

export function GBankListNew({ onError }: GBankListNewProps) {
  const [gbanks, setGbanks] = useState<GBank[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  const handleError = (error: unknown, defaultMessage: string) => {
    if (axios.isAxiosError(error)) {
      const errorDetails = {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      }
      if (onError) onError(errorDetails)
    } else {
      const errorDetails = { message: defaultMessage, response: error }
      if (onError) onError(errorDetails)
    }
  }

  // Formata o valor da calculadora para exibir números corretamente
  const formatCalculatorValue = (value: string) => {
    const rawValue = value.replace(/[^0-9-]/g, '').replace(/(?!^)-/g, '')
    if (rawValue === '-') return '-'
    const numberValue = Number(rawValue.replace(/,/g, ''))
    return isNaN(numberValue) ? '' : numberValue.toLocaleString('en-US')
  }


  // Função para mostrar SweetAlert com upload de imagem
  const showUploadModal = (gbank: GBank, value: string) => {
    let uploadedImage: string | null = null
    let fileInput: HTMLInputElement | null = null

    Swal.fire({
      title: `Confirm value for ${gbank.name}`,
      html: `
        <div style="text-align: center; margin: 20px 0;">
          <p style="font-size: 18px; margin-bottom: 20px;">
            Value: <strong>${value}</strong>
          </p>
          <div id="upload-area" style="
            border: 2px dashed #ccc;
            border-radius: 8px;
            padding: 40px;
            margin: 20px 0;
            cursor: pointer;
            background-color: #f9f9f9;
            transition: all 0.2s ease;
          ">
            <div id="upload-content">
              <p style="margin: 0; color: #666;">📷 Click here or drag an image</p>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">or paste with Ctrl+V</p>
            </div>
            <div id="image-preview" style="display: none;">
              <img id="preview-img" style="max-width: 100%; max-height: 200px; border-radius: 4px;" />
              <button type="button" id="remove-image" style="
                margin-top: 10px;
                padding: 5px 10px;
                background: #ff4444;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
              ">Remove</button>
            </div>
          </div>
          <input type="file" id="file-input" accept="image/*" style="display: none;" />
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#9333EA',
      cancelButtonColor: '#6B7280',
      allowOutsideClick: false,
      didOpen: () => {
        const uploadArea = document.getElementById('upload-area')
        const uploadContent = document.getElementById('upload-content')
        const imagePreview = document.getElementById('image-preview')
        const previewImg = document.getElementById('preview-img') as HTMLImageElement
        const removeBtn = document.getElementById('remove-image')
        fileInput = document.getElementById('file-input') as HTMLInputElement

        if (!uploadArea || !uploadContent || !imagePreview || !previewImg || !removeBtn || !fileInput) return

        // Função para processar arquivo de imagem
        const processImageFile = (file: File) => {
          if (!file.type.startsWith('image/')) {
            Swal.showValidationMessage('Please select only image files')
            return
          }

          const reader = new FileReader()
          reader.onload = (e) => {
            uploadedImage = e.target?.result as string
            previewImg.src = uploadedImage
            uploadContent.style.display = 'none'
            imagePreview.style.display = 'block'
          }
          reader.readAsDataURL(file)
        }

        // Click para selecionar arquivo
        uploadArea.addEventListener('click', () => {
          fileInput?.click()
        })

        // Drag & Drop
        uploadArea.addEventListener('dragover', (e) => {
          e.preventDefault()
          uploadArea.style.borderColor = '#9333EA'
          uploadArea.style.backgroundColor = '#f0f0ff'
        })

        uploadArea.addEventListener('dragleave', (e) => {
          e.preventDefault()
          uploadArea.style.borderColor = '#ccc'
          uploadArea.style.backgroundColor = '#f9f9f9'
        })

        uploadArea.addEventListener('drop', (e) => {
          e.preventDefault()
          uploadArea.style.borderColor = '#ccc'
          uploadArea.style.backgroundColor = '#f9f9f9'
          
          if (e.dataTransfer) {
            const files = Array.from(e.dataTransfer.files)
            if (files.length > 0) {
              processImageFile(files[0])
            }
          }
        })

        // Seleção de arquivo
        fileInput.addEventListener('change', (e) => {
          const files = (e.target as HTMLInputElement).files
          if (files && files.length > 0) {
            processImageFile(files[0])
          }
        })

        // Remover imagem
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation()
          uploadedImage = null
          uploadContent.style.display = 'block'
          imagePreview.style.display = 'none'
          if (fileInput) fileInput.value = ''
        })

        // Paste (Ctrl+V)
        const handlePaste = (e: ClipboardEvent) => {
          const items = e.clipboardData?.items
          if (items) {
            for (let i = 0; i < items.length; i++) {
              if (items[i].type.startsWith('image/')) {
                const file = items[i].getAsFile()
                if (file) {
                  processImageFile(file)
                }
                break
              }
            }
          }
        }

        document.addEventListener('paste', handlePaste)
        
        // Cleanup
        const cleanup = () => {
          document.removeEventListener('paste', handlePaste)
        }
        
        // Store cleanup function for later use
        ;(Swal as any).cleanup = cleanup
      },
      preConfirm: () => {
        if (!uploadedImage) {
          Swal.showValidationMessage('Please add an image to confirm')
          return false
        }
        return { value, image: uploadedImage }
      }
    }).then(async (result) => {
      if (result.isConfirmed && result.value && result.value.image) {
        // Process the value and image here
        console.log('Value confirmed:', result.value.value)
        console.log('Image:', result.value.image)
        
        try {
          // Show loading
          Swal.fire({
            title: 'Processing...',
            text: 'Please wait while we process your request',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading()
            }
          })

          // Make the POST request to create transaction request
          await createTransactionRequest({
            idGbank: gbank.id,
            value: Number(result.value.value.replace(/,/g, '')),
            image: result.value.image
          })

          // Success message
          Swal.fire({
            title: 'Success!',
            text: 'Transaction request created successfully and sent for approval',
            icon: 'success',
            confirmButtonText: 'OK'
          })

        } catch (error) {
          // Error message
          Swal.fire({
            title: 'Error!',
            text: 'Failed to create transaction request',
            icon: 'error',
            confirmButtonText: 'OK'
          })
          
          handleError(error, 'Error creating transaction request')
        }
      }
    })
  }

  const fetchGBanks = async (showLoading = false) => {
    if (showLoading) setIsLoading(true)
    try {
      const response = await getUserGbanks()
      const formattedGBanks = response?.map((gbank: any) => ({
        ...gbank,
        calculatorValue: gbank.calculatorValue
          ? formatCalculatorValue(gbank.calculatorValue.toString())
          : '',
      })) || []
      const sorted = formattedGBanks.sort((a: GBank, b: GBank) => b.balance - a.balance)
      setGbanks(sorted)
    } catch (error) {
      handleError(error, 'Error fetching G-Banks')
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGBanks(true)
    const interval = setInterval(() => fetchGBanks(false), 60000)
    return () => clearInterval(interval)
  }, [])

  const grouped = useMemo(() => {
    const byColor = gbanks.reduce((acc, g) => {
      const color = teamIdToColorMap[g.idTeam] || '#DC2626'
      const label = colorOptions.find((o) => o.value === color)?.label || 'Chefe de cozinha'
      if (!acc[color]) acc[color] = { color, label, items: [] as GBank[] }
      acc[color].items.push(g)
      return acc
    }, {} as Record<string, { color: string; label: string; items: GBank[] }>)

    return Object.values(byColor)
      .sort((a, b) => compareByPriority(a.label, b.label))
      .map((group) => ({
        ...group,
        items: group.items.sort((a, b) => b.balance - a.balance),
      }))
  }, [gbanks])

  const toggleGroupExpansion = (color: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(color)) next.delete(color)
      else next.add(color)
      return next
    })
  }

  return (
    <div className='flex h-full w-full flex-col overflow-y-auto rounded-md'>
    

      <div className='flex-1 overflow-y-auto'>
        {isLoading ? (
          <div className='bg-white p-4 text-center rounded-md'>
            <div className='flex flex-col items-center gap-2'>
              <span className='inline-block h-6 w-6 animate-spin rounded-full border-4 border-gray-600 border-t-transparent' />
              <Typography>Loading...</Typography>
            </div>
          </div>
        ) : grouped.length === 0 ? (
          <div className='bg-white p-4 text-center rounded-md'>
            <Typography variant='body1' color='textSecondary'>
              No G-Bank found
            </Typography>
          </div>
        ) : (
          grouped.map((group) => (
            <Accordion
              key={group.color}
              expanded={expandedGroups.has(group.color)}
              onChange={() => toggleGroupExpansion(group.color)}
              sx={{ '&:before': { display: 'none' }, boxShadow: 'none', border: 'none', mb: 1 }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  backgroundColor: group.color,
                  color: group.label === 'Milharal' ? '#000' : (group.color === '#DC2626' ? '#fff' : '#fff'),
                  '&:hover': { backgroundColor: group.color, opacity: 0.9 },
                }}
                data-tutorial="gbank-expand"
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
              <AccordionDetails sx={{ p: 0 }}>
                <TableContainer component={Paper} sx={{ boxShadow: 'none', border: 'none' }}>
                  <Table size='small' sx={{ border: 'none', '& .MuiTableCell-root': { border: 'none' } }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', height: '56px', fontSize: '1rem' }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', height: '56px', fontSize: '1rem' }} align='center'>Total</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', height: '56px', fontSize: '1rem' }} align='center'>Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {group.items.map((g) => (
                        <TableRow key={g.id}>
                          <TableCell sx={{ py: 3, fontSize: '0.875rem', fontWeight: 'medium' }}>{g.name}</TableCell>
                          <TableCell align='center' sx={{ py: 3, fontSize: '0.875rem', fontWeight: 'medium' }}>{Math.round(Number(g.balance)).toLocaleString('en-US')}</TableCell>
                          <TableCell align='center' sx={{ py: 3, fontSize: '0.875rem', fontWeight: 'medium' }}>
                            <input
                              className='rounded-sm bg-zinc-100 p-2'
                              style={{ fontSize: '1rem', height: '40px', minWidth: '120px' }}
                              type='text'
                              value={g.calculatorValue}
                              onChange={(e) => {
                                const formatted = formatCalculatorValue(e.target.value)
                                setGbanks((prev) =>
                                  prev.map((gbank) =>
                                    gbank.id === g.id
                                      ? { ...gbank, calculatorValue: formatted }
                                      : gbank
                                  )
                                )
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  const value = e.currentTarget.value
                                  if (value.trim()) {
                                    showUploadModal(g, value)
                                  }
                                }
                              }}
                              data-tutorial="gbank-transactions"
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
    </div>
  )
}


