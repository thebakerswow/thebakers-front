import { CircleNotch } from '@phosphor-icons/react'

type LoadingSpinnerProps = {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
  color?: string
}

const sizeClasses = {
  sm: 20,
  md: 28,
  lg: 40,
}

export function LoadingSpinner({
  size = 'md',
  className = '',
  label = 'Loading',
  color = 'rgb(147, 51, 234)',
}: LoadingSpinnerProps) {
  return (
    <span role='status' aria-live='polite' className={`inline-flex items-center justify-center ${className}`}>
      <CircleNotch
        size={sizeClasses[size]}
        className='animate-spin'
        style={{ color }}
        aria-hidden='true'
      />
      <span className='sr-only'>{label}</span>
    </span>
  )
}
