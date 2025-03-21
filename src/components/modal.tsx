import React, { ReactNode, useRef, useCallback } from 'react'

interface ModalProps {
  onClose: () => void
  children: ReactNode
}

export const Modal = ({ onClose, children }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)

  // Lida com cliques fora do modal para fechá-lo, a menos que seja parte de uma seleção de texto
  const handleClickOutside = useCallback(
    (event: React.MouseEvent) => {
      const selection = window.getSelection()
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        (!selection || selection.type !== 'Range') // Ignora se uma seleção de texto estiver ativa
      ) {
        onClose() // Dispara o callback onClose
      }
    },
    [onClose]
  )

  return (
    <div
      // Overlay que cobre toda a tela e detecta cliques fora do modal
      className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'
      onClick={handleClickOutside}
    >
      <div
        ref={modalRef} // Referência ao conteúdo do modal
        // Impede que cliques dentro do modal se propaguem para o overlay
        className='relative flex rounded-md bg-zinc-200 p-4 text-black shadow-lg'
        onClick={(e) => e.stopPropagation()}
      >
        {children /* Renderiza o conteúdo do modal */}
      </div>
    </div>
  )
}
