import React, { useState, useEffect } from 'react'
import { FloatingClock } from './floating-clock'

export const FloatingClockManager: React.FC = () => {
  const [isClockVisible, setIsClockVisible] = useState(true)

  // Verificar se o relógio deve estar visível ao carregar
  useEffect(() => {
    const savedVisibility = localStorage.getItem('floatingClockVisible')
    if (savedVisibility !== null) {
      setIsClockVisible(JSON.parse(savedVisibility))
    }
  }, [])

  // Atualizar estado quando o localStorage mudar
  useEffect(() => {
    const handleStorageChange = () => {
      const savedVisibility = localStorage.getItem('floatingClockVisible')
      if (savedVisibility !== null) {
        setIsClockVisible(JSON.parse(savedVisibility))
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleShowClock = () => {
    setIsClockVisible(true)
    localStorage.setItem('floatingClockVisible', 'true')
  }

  return (
    <>
      {isClockVisible && <FloatingClock />}
      
      {!isClockVisible && (
        <button
          onClick={handleShowClock}
          className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg transition-all duration-200 hover:scale-110"
          title="Mostrar relógio"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      )}
    </>
  )
} 