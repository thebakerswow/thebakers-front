export function ResquestsSkeleton() {
  const skeletonCards = Array.from({ length: 8 })

  return (
    <div className='space-y-4'>
      <div className='relative isolate rounded-xl border border-white/10 bg-white/[0.04] p-4'>
        <div className='mb-3 flex flex-wrap gap-2'>
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`status-skeleton-${index}`}
              className='h-9 w-24 animate-pulse rounded-md border border-white/10 bg-white/[0.06]'
            />
          ))}
        </div>

        <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={`filter-skeleton-${index}`} className='space-y-1'>
              <div className='h-3 w-16 animate-pulse rounded bg-white/[0.08]' />
              <div className='h-10 w-full animate-pulse rounded-md border border-white/10 bg-white/[0.06]' />
            </div>
          ))}
        </div>

        <div className='mt-3 flex justify-end'>
          <div className='h-9 w-28 animate-pulse rounded-md border border-white/10 bg-white/[0.06]' />
        </div>
      </div>

      <div className='h-4 w-52 animate-pulse rounded bg-white/[0.08]' />

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {skeletonCards.map((_, index) => (
          <div
            key={`request-card-skeleton-${index}`}
            className='h-[450px] overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]'
          >
            <div className='h-[180px] w-full animate-pulse bg-white/[0.08]' />
            <div className='flex h-[270px] flex-col p-3'>
              <div className='mb-2 h-6 w-2/3 animate-pulse rounded bg-white/[0.08]' />
              <div className='mb-3 h-16 animate-pulse rounded-md border border-white/10 bg-white/[0.06]' />
              <div className='mb-3 space-y-2'>
                <div className='h-3 w-20 animate-pulse rounded bg-white/[0.08]' />
                <div className='h-4 w-3/4 animate-pulse rounded bg-white/[0.08]' />
              </div>
              <div className='mb-4 space-y-2'>
                <div className='h-3 w-24 animate-pulse rounded bg-white/[0.08]' />
                <div className='h-4 w-2/3 animate-pulse rounded bg-white/[0.08]' />
              </div>
              <div className='mt-auto grid grid-cols-2 gap-2'>
                <div className='h-9 animate-pulse rounded-md border border-white/10 bg-white/[0.06]' />
                <div className='h-9 animate-pulse rounded-md border border-white/10 bg-white/[0.06]' />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
