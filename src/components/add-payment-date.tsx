import { useState } from 'react'
import Swal from 'sweetalert2'
import { Popover, TextField } from '@mui/material'
import { createPaymentDate } from '../services/api'

interface AddPaymentDateProps {
  anchorEl: HTMLElement | null
  onClose: () => void
  onPaymentDateAdded: (paymentDateName: string, paymentDateId: string | number) => void
}

export function AddPaymentDate({
  anchorEl,
  onClose,
  onPaymentDateAdded,
}: AddPaymentDateProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [displayDate, setDisplayDate] = useState<string>('')

  const handleClose = () => {
    setSelectedDate('')
    setDisplayDate('')
    onClose()
  }

  const handleDateChange = (value: string) => {
    setSelectedDate(value)
    
    // Converte YYYY-MM-DD para MM/DD/YYYY para exibição
    if (value) {
      const [year, month, day] = value.split('-')
      setDisplayDate(`${month}/${day}/${year}`)
    } else {
      setDisplayDate('')
    }
  }

  const handleDateSelect = () => {
    if (!selectedDate) {
      handleClose()
      return
    }

    // selectedDate já está no formato YYYY-MM-DD (formato do input type="date")
    const [_year, month, day] = selectedDate.split('-')
    
    // Converte para MM/DD para confirmação
    const confirmDisplayDate = `${month}/${day}`

    // Envia no formato YYYY-MM-DD para a API
    handleConfirmDate(selectedDate, confirmDisplayDate)
  }

  const handleConfirmDate = async (dateString: string, displayDate: string) => {
    // Abre modal de confirmação
    const result = await Swal.fire({
      title: 'Confirm Payment Date',
      html: `<p style="color: white; font-size: 1.1rem;">Create payment date <strong style="color: rgb(147, 51, 234);">${displayDate}</strong>?</p>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'rgb(147, 51, 234)',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, create it!',
      cancelButtonText: 'Cancel',
      background: '#2a2a2a',
      color: 'white',
    })
    
    if (result.isConfirmed) {
      setIsSubmitting(true)
      
      try {
        // Chama API para criar a payment date no formato YYYY-MM-DD
        const newPaymentDate = await createPaymentDate({ 
          name: dateString 
        })
        
        // Converte a data para MM/DD para exibição
        // Usa displayDate que já foi passado como parâmetro (já está no formato correto)
        const formattedName = displayDate
        
        // Fecha e atualiza
        setSelectedDate('')
        setDisplayDate('')
        onClose()
        onPaymentDateAdded(formattedName, newPaymentDate.id)
        
        // Mostra mensagem de sucesso
        setTimeout(() => {
          Swal.fire({
            title: 'Success!',
            text: 'Payment date created successfully!',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            background: '#2a2a2a',
            color: 'white',
          })
        }, 100)
      } catch (error) {
        console.error('Error creating payment date:', error)
        setSelectedDate('')
        setDisplayDate('')
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to create payment date.',
          confirmButtonColor: 'rgb(147, 51, 234)',
          background: '#2a2a2a',
          color: 'white',
        })
      } finally {
        setIsSubmitting(false)
      }
    } else {
      // Se cancelar, fecha sem criar
      handleClose()
    }
  }

  // Não renderiza nada se não há anchor
  if (!anchorEl) {
    return null
  }

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={handleClose}
      disableRestoreFocus
      disableEnforceFocus
      disableAutoFocus={false}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      slotProps={{
        paper: {
          sx: {
            mt: 1,
            p: 2,
            backgroundColor: '#2a2a2a',
            border: '1px solid #444',
          }
        }
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '250px' }}>
        <div style={{ position: 'relative' }}>
          {/* Campo visível que mostra a data formatada */}
          <TextField
            label="Select Date (MM/DD/YYYY)"
            type="text"
            value={displayDate}
            placeholder="MM/DD/YYYY"
            fullWidth
            disabled={isSubmitting}
            InputProps={{
              readOnly: true,
              onClick: () => {
                // Abre o calendário quando clicar no campo de texto
                const dateInput = document.getElementById('hidden-date-input') as HTMLInputElement
                if (dateInput) {
                  try {
                    dateInput.showPicker()
                  } catch (error) {
                    // showPicker pode não estar disponível em todos os navegadores
                    dateInput.click()
                  }
                }
              },
              style: { cursor: 'pointer' }
            }}
            sx={{
              '& .MuiInputBase-input': {
                color: 'white',
                cursor: 'pointer',
              },
              '& .MuiInputLabel-root': {
                color: '#9ca3af',
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#444',
                },
                '&:hover fieldset': {
                  borderColor: 'rgb(147, 51, 234)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgb(147, 51, 234)',
                },
              },
            }}
          />
          {/* Input de data oculto que abre o calendário */}
          <input
            id="hidden-date-input"
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            disabled={isSubmitting}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer',
              zIndex: -1,
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            style={{
              padding: '8px 16px',
              backgroundColor: '#444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: isSubmitting ? 0.6 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleDateSelect}
            disabled={isSubmitting || !selectedDate}
            style={{
              padding: '8px 16px',
              backgroundColor: isSubmitting || !selectedDate ? '#6b7280' : 'rgb(147, 51, 234)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isSubmitting || !selectedDate ? 'not-allowed' : 'pointer',
              fontSize: '14px',
            }}
          >
            {isSubmitting ? 'Creating...' : 'Confirm'}
          </button>
        </div>
      </div>
    </Popover>
  )
}
