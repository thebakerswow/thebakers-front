import React, { useState, useEffect, useRef } from 'react'

interface Position {
  x: number
  y: number
}

export const FloatingClock: React.FC = () => {
  const [time, setTime] = useState(new Date())
  const [position, setPosition] = useState<Position>({ x: 20, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(true)
  const clockRef = useRef<HTMLDivElement>(null)

  // Atualizar o relógio a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Função para formatar a hora em EST
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'America/New_York'
    })
  }

  // Handlers para arrastar
  const handleMouseDown = (e: React.MouseEvent) => {
    if (clockRef.current) {
      const rect = clockRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
      setIsDragging(true)
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y
      
      // Limitar o relógio dentro da tela
      const maxX = window.innerWidth - (clockRef.current?.offsetWidth || 200)
      const maxY = window.innerHeight - (clockRef.current?.offsetHeight || 100)
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Event listeners para arrastar
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragOffset])

  // Salvar posição no localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem('floatingClockPosition')
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('floatingClockPosition', JSON.stringify(position))
  }, [position])

  // Salvar visibilidade no localStorage
  useEffect(() => {
    const savedVisibility = localStorage.getItem('floatingClockVisible')
    if (savedVisibility !== null) {
      setIsVisible(JSON.parse(savedVisibility))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('floatingClockVisible', JSON.stringify(isVisible))
  }, [isVisible])

  if (!isVisible) {
    return null
  }

  return (
    <div
      ref={clockRef}
      className="fixed z-50 cursor-move select-none rounded-lg bg-black/80 backdrop-blur-sm text-white shadow-lg border border-gray-600"
      style={{
        left: position.x,
        top: position.y,
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="relative p-3">
        <div className="flex flex-col">
          <div className="text-2xl font-bold font-mono">
            {formatTime(time)}
          </div>
          <div className="text-xs text-gray-300 font-semibold">
            EST
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 hover:bg-red-600 transition-colors"
          title="Close"
        >
          <span className="text-xs font-bold">×</span>
        </button>
      </div>
    </div>
  )
} 