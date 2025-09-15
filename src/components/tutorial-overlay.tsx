import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TutorialStep } from './tutorial-steps'

interface TutorialOverlayProps {
  isOpen: boolean
  onClose: () => void
  steps: TutorialStep[]
  onStepChange?: (stepIndex: number) => void
}

// Função para calcular a posição ideal do card de tutorial
const getCardPosition = (rect: DOMRect) => {
  const cardWidth = 400 // max-w-md = 28rem = 448px, usando 400px para margem
  const cardHeight = 300 // altura estimada do card
  const margin = 20
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  let top = rect.bottom + margin
  let left = rect.left
  let transform = 'none'

  // Se não há espaço embaixo, tenta colocar em cima
  if (top + cardHeight > viewportHeight) {
    top = rect.top - cardHeight - margin
    // Se ainda não cabe em cima, centraliza verticalmente
    if (top < 0) {
      top = Math.max(margin, (viewportHeight - cardHeight) / 2)
    }
  }

  // Ajusta horizontalmente se necessário
  if (left + cardWidth > viewportWidth - margin) {
    left = viewportWidth - cardWidth - margin
  }
  if (left < margin) {
    left = margin
  }

  return {
    top: `${top}px`,
    left: `${left}px`,
    transform,
  }
}

// Função para verificar se algum accordion GBank está expandido
const isGBankAccordionExpanded = () => {
  const accordionSummaries = document.querySelectorAll('[data-tutorial="gbank-expand"]')
  
  // Verifica se algum accordion está expandido
  for (let i = 0; i < accordionSummaries.length; i++) {
    const accordion = accordionSummaries[i].closest('.MuiAccordion-root') as HTMLElement
    if (accordion && accordion.getAttribute('aria-expanded') === 'true') {
      return true
    }
  }
  
  return false
}

export function TutorialOverlay({ isOpen, onClose, steps, onStepChange }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [elementRect, setElementRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0)
      setTargetElement(null)
      setElementRect(null)
      return
    }

    const step = steps[currentStep]
    if (step?.targetSelector) {
      const element = document.querySelector(step.targetSelector) as HTMLElement
      setTargetElement(element)
      
      if (element) {
        // Scroll para o elemento
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        
        // Aguarda um pouco para o scroll completar e então obtém a posição
        setTimeout(() => {
          const rect = element.getBoundingClientRect()
          setElementRect(rect)
        }, 300)
      }
    } else {
      setTargetElement(null)
      setElementRect(null)
    }

    onStepChange?.(currentStep)
  }, [currentStep, isOpen, steps, onStepChange])

  // Listener para redimensionamento da janela
  useEffect(() => {
    if (!isOpen || !targetElement) return

    const handleResize = () => {
      const rect = targetElement.getBoundingClientRect()
      setElementRect(rect)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleResize)
    }
  }, [isOpen, targetElement])

  const nextStep = () => {
    const currentStepData = steps[currentStep]
    
    // Executa ação onNext se existir
    if (currentStepData?.onNext) {
      currentStepData.onNext()
    }
    
    if (currentStep < steps.length - 1) {
      let nextStepIndex = currentStep + 1
      
      // Se o próximo step é gbank-expand e o accordion já está expandido, pula para o próximo
      if (steps[nextStepIndex]?.id === 'gbank-expand' && isGBankAccordionExpanded()) {
        nextStepIndex = currentStep + 2
      }
      
      setCurrentStep(nextStepIndex)
    } else {
      onClose()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      let prevStepIndex = currentStep - 1
      
      // Se o step anterior é gbank-expand e o accordion já está expandido, volta mais um step
      if (steps[prevStepIndex]?.id === 'gbank-expand' && isGBankAccordionExpanded()) {
        prevStepIndex = currentStep - 2
      }
      
      setCurrentStep(Math.max(0, prevStepIndex))
    }
  }

  const skipTutorial = () => {
    onClose()
  }

  if (!isOpen) return null

  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
      >
        {/* Highlight overlay */}
        {elementRect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed pointer-events-none"
            style={{
              top: elementRect.top - 8,
              left: elementRect.left - 8,
              width: elementRect.width + 16,
              height: elementRect.height + 16,
              border: '3px solid #8b5cf6',
              borderRadius: '8px',
              boxShadow: '0 0 0 4px rgba(139, 92, 246, 0.3)',
              zIndex: 51,
            }}
          />
        )}

        {/* Tutorial card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-md mx-4 relative z-50"
          style={{
            position: 'fixed',
            ...(elementRect ? getCardPosition(elementRect) : {
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }),
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {currentStep + 1}
              </div>
              <span className="text-sm text-gray-500">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            <button
              onClick={skipTutorial}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {step.title}
            </h3>
            <p className="text-gray-600 mb-4">
              {step.description}
            </p>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <div className="flex gap-2">
                <button
                  onClick={skipTutorial}
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Skip tutorial
                </button>
                <button
                  onClick={nextStep}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-500 rounded-md hover:bg-purple-600 transition-colors"
                >
                  {isLastStep ? 'Finish' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
