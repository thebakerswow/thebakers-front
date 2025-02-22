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
      className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'
      onClick={handleClickOutside}
    >
      <div
        ref={modalRef}
        className='bg-zinc-200 flex text-black p-4 rounded-md shadow-lg relative'
        onClick={(e) => e.stopPropagation()}
      >
        <div>{children}</div>
      </div>
    </div>
  )
}
