type LoadingSpinnerProps = {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-4',
  lg: 'h-10 w-10 border-4',
}

export function LoadingSpinner({
  size = 'md',
  className = '',
  label = 'Loading',
}: LoadingSpinnerProps) {
  return (
    <span role='status' aria-live='polite' className={`inline-flex items-center justify-center ${className}`}>
      <span
        className={`inline-block animate-spin rounded-full border-white/20 border-t-purple-400 ${sizeClasses[size]}`}
        aria-hidden='true'
      />
      <span className='sr-only'>{label}</span>
    </span>
  )
}
