export function LoadingSpinner() {
  return (
    <div className='flex flex-col items-center'>
      <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-white'></div>
      <p className='mt-4 text-lg'>Loading...</p>
    </div>
  )
}
