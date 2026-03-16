export function SpecialRunPageSkeleton() {
  return (
    <div className='w-full p-4 pb-20'>
      <div className='m-4 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_320px]'>
        <div className='rounded-xl border border-white/10 bg-white/[0.04] p-3'>
          <div className='flex h-[52px] items-center justify-center gap-2'>
            <div className='h-10 w-10 animate-pulse rounded-md bg-white/10' />
            <div className='h-10 min-w-[220px] animate-pulse rounded-md bg-white/10' />
            <div className='h-10 w-10 animate-pulse rounded-md bg-white/10' />
          </div>
        </div>

        <div className='w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 lg:w-[320px]'>
          <div className='grid w-full gap-2 lg:grid-rows-3'>
            <div className='h-10 animate-pulse rounded-md bg-white/10' />
            <div className='h-10 animate-pulse rounded-md bg-white/10' />
            <div className='h-10 animate-pulse rounded-md bg-white/10' />
          </div>
        </div>
      </div>

      <div className='p-4'>
        <div className='overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-3'>
          <div className='mb-3 h-8 w-full animate-pulse rounded bg-white/10' />
          {Array.from({ length: 8 }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className='mb-2 h-8 w-full animate-pulse rounded bg-white/10'
            />
          ))}
        </div>
      </div>
    </div>
  )
}
