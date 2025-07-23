import { useAuth } from '../context/auth-context'
import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useCallback } from 'react'
import Swal from 'sweetalert2'

export interface ErrorDetails {
  message: string
  response?: any
  status?: number
}

import { ErrorComponentProps } from '../types'

// Map global para rastrear erros já exibidos
const displayedErrors = new Map<string, number>()

export function ErrorComponent({ error, onClose }: ErrorComponentProps) {
  const { response, message, status } = error
  const errorData = response?.errors?.[0]
  const { logout } = useAuth()
  const navigate = useNavigate()
  const isProcessingRef = useRef(false)

  // Verifica se é um erro de autenticação
  const isAuthError =
    status === 401 ||
    errorData?.type === 'autenticacao-invalida' ||
    errorData?.title === 'User not authenticated'

  // Memoiza a função onClose para evitar re-renderizações
  const handleClose = useCallback(() => {
    if (onClose) {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    // Se já está processando, não faz nada
    if (isProcessingRef.current) {
      return
    }

    // Cria uma chave única para este erro
    const errorKey = `${message}-${status}-${JSON.stringify(errorData)}`
    const now = Date.now()

    // Verifica se este erro já foi exibido nos últimos 5 segundos
    const lastDisplayed = displayedErrors.get(errorKey)
    if (lastDisplayed && now - lastDisplayed < 5000) {
      return
    }

    // Marca como processando
    isProcessingRef.current = true
    displayedErrors.set(errorKey, now)

    // Configuração do SweetAlert2
    const showError = async () => {
      try {
        const title = errorData?.title || 'Error'
        const detail = errorData?.detail || message || 'Unexpected error'

        if (isAuthError) {
          // Para erros de autenticação, mostra alerta com tema padrão e redireciona
          await Swal.fire({
            title: 'Authentication Error',
            text: 'Your session has expired. You will be redirected to the login page.',
            icon: 'warning',
            confirmButtonText: 'OK',
            timer: 2000,
            timerProgressBar: true,
            allowOutsideClick: false,
            // Não aplica classes customizadas para manter tema padrão
          })

          logout()
          navigate('/')
        } else {
          // Para outros erros, mostra alerta com tema escuro
          const result = await Swal.fire({
            title: title,
            text: detail,
            icon: 'error', // Este ícone ativa automaticamente o tema escuro via CSS
            confirmButtonText: 'Close',
            confirmButtonColor: '#ef4444',
            allowOutsideClick: true,
            allowEscapeKey: true,
          })

          if (result.isConfirmed) {
            handleClose()
          }
        }
      } catch (swalError) {
        // Fallback caso o SweetAlert2 falhe
        console.error('Error displaying SweetAlert:', swalError)
        handleClose()
      } finally {
        // Reseta o flag de processamento após um delay
        setTimeout(() => {
          isProcessingRef.current = false
        }, 2000)
      }
    }

    showError()

    // Cleanup: remove entradas antigas do Map (mais de 10 segundos)
    const cleanup = () => {
      const currentTime = Date.now()
      for (const [key, timestamp] of displayedErrors.entries()) {
        if (currentTime - timestamp > 10000) {
          displayedErrors.delete(key)
        }
      }
    }

    // Executa cleanup a cada 30 segundos
    const cleanupInterval = setInterval(cleanup, 30000)

    return () => {
      clearInterval(cleanupInterval)
      // Não reseta imediatamente para evitar loops durante polling
      setTimeout(() => {
        isProcessingRef.current = false
      }, 3000)
    }
  }, [
    error,
    isAuthError,
    logout,
    navigate,
    handleClose,
    errorData,
    message,
    status,
  ])

  // Não renderiza nada visualmente, pois o SweetAlert2 cuida da interface
  return null
}
