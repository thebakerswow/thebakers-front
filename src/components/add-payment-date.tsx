import { useEffect, useRef, useState } from 'react'
import Swal from 'sweetalert2'
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
  const dateInputRef = useRef<HTMLInputElement>(null)
  const hasOpenedRef = useRef(false)

  // Abre o calendário automaticamente apenas uma vez ao montar
  useEffect(() => {
    if (anchorEl && !hasOpenedRef.current) {
      hasOpenedRef.current = true
      setTimeout(() => {
        if (dateInputRef.current) {
          dateInputRef.current.showPicker()
        }
      }, 100)
    }
    
    // Reset quando o componente é desmontado
    return () => {
      hasOpenedRef.current = false
    }
  }, [anchorEl])

  const handleDateChange = (dateString: string) => {
    if (!dateString) {
      onClose()
      return
    }
    
    // Converte YYYY-MM-DD para MM/DD
    const [_year, month, day] = dateString.split('-')
    const formattedDate = `${month}/${day}`
    
    // Abre modal de confirmação imediatamente
    handleConfirmDate(formattedDate)
  }

  const handleConfirmDate = async (formattedDate: string) => {
    // Abre modal de confirmação
    const result = await Swal.fire({
      title: 'Confirm Payment Date',
      html: `<p style="color: white; font-size: 1.1rem;">Create payment date <strong style="color: rgb(147, 51, 234);">${formattedDate}</strong>?</p>`,
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
        // Chama API para criar a payment date
        const newPaymentDate = await createPaymentDate({ 
          name: formattedDate 
        })
        
        // Fecha e atualiza
        onClose()
        onPaymentDateAdded(newPaymentDate.name, newPaymentDate.id)
        
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
      onClose()
    }
  }

  // Não renderiza nada se não há anchor
  if (!anchorEl) {
    return null
  }

  return (
    <>
      {/* Input que abre o calendário nativo - só renderiza quando há anchor */}
      <div
        style={{
          position: 'fixed',
          left: anchorEl.getBoundingClientRect().left,
          top: anchorEl.getBoundingClientRect().bottom + 5,
          zIndex: 1300,
          opacity: 0, // Invisível mas ainda funcional
          pointerEvents: 'none', // Não interfere com outros elementos
        }}
      >
        <input
          ref={dateInputRef}
          type="date"
          onChange={(e) => handleDateChange(e.target.value)}
          onBlur={onClose}
          disabled={isSubmitting}
          style={{ 
            padding: '8px',
            fontSize: '14px',
            border: '1px solid rgba(255, 255, 255, 0.23)',
            borderRadius: '4px',
            backgroundColor: 'transparent',
            color: 'transparent',
            cursor: 'pointer',
            pointerEvents: 'auto', // Input precisa ser interativo
          }}
        />
      </div>
      
      {/* Loading overlay enquanto salva */}
      {isSubmitting && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600'></div>
        </div>
      )}
    </>
  )
}
