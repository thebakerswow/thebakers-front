import { useState } from 'react'
import { motion } from 'framer-motion'

interface TutorialButtonProps {
  onClick: () => void
  className?: string
}

export function TutorialButton({ onClick, className = '' }: TutorialButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        fixed bottom-6 right-6 z-40
        w-14 h-14
        bg-gradient-to-r from-purple-500 to-purple-600
        hover:from-purple-600 hover:to-purple-700
        text-white
        rounded-full
        shadow-lg hover:shadow-xl
        flex items-center justify-center
        transition-all duration-200
        ${className}
      `}
      style={{
        boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
      }}
    >
      {/* Ícone de ajuda */}
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>

      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ 
          opacity: isHovered ? 1 : 0,
          x: isHovered ? 0 : 10
        }}
        className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap pointer-events-none"
      >
        Transaction Tutorial
        <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent" />
      </motion.div>

      {/* Indicador pulsante */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 0, 0.7],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 rounded-full bg-purple-400"
      />
    </motion.button>
  )
}
