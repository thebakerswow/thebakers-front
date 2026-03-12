export function RaidsPageSkeleton() {
  return (
    <div className='mx-auto mt-6 flex w-[90%] flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm'>
        <div className='mb-2 flex flex-wrap items-end justify-between gap-4'>
          <div className='flex flex-wrap gap-3'>
            <div className='h-10 w-[120px] animate-pulse rounded-md bg-white/10' />
            <div className='h-10 w-[130px] animate-pulse rounded-md bg-white/10' />
            <div className='h-10 w-[170px] animate-pulse rounded-md bg-white/10' />
          </div>

          <div className='flex flex-wrap items-end gap-4'>
            <div className='h-10 w-[220px] animate-pulse rounded-md bg-white/10' />
            <div className='h-10 w-[220px] animate-pulse rounded-md bg-white/10' />
            <div className='h-10 w-[220px] animate-pulse rounded-md bg-white/10' />
            <div className='h-10 w-[220px] animate-pulse rounded-md bg-white/10' />
            <div className='h-10 w-[100px] animate-pulse rounded-md bg-white/10' />
          </div>
        </div>

      <div className='overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-3'>
        <div className='mb-3 h-8 w-full animate-pulse rounded bg-white/10' />
        {Array.from({ length: 8 }).map((_, rowIndex) => (
          <div key={rowIndex} className='mb-2 h-8 w-full animate-pulse rounded bg-white/10' />
        ))}
      </div>
    </div>
  )
}
