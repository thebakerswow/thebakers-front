import React, { ReactNode, useRef } from 'react'

interface ModalProps {
  onClose: () => void
  children: ReactNode
}

export const Modal = ({ onClose, children }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)

  const handleClickOutside = (event: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose()
    }
  }

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'
      onClick={handleClickOutside}
    >
      <div
        ref={modalRef}
        className='relative flex rounded-md bg-zinc-200 p-4 text-black shadow-lg'
        onClick={(e) => e.stopPropagation()}
      >
        <div>{children}</div>
      </div>
    </div>
  )
}
