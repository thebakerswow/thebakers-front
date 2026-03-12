export function AdminPageSkeleton() {
  return (
    <div className='flex w-full flex-col gap-4 px-6 pb-10 pt-6 text-white md:px-10'>
      <div className='flex w-full items-start gap-4'>
        <section className='w-[55%] rounded-xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-sm'>
          <div className='mb-3 flex gap-2'>
            <div className='h-10 w-[220px] animate-pulse rounded-md bg-white/10' />
            <div className='h-10 w-[200px] animate-pulse rounded-md bg-white/10' />
            <div className='h-10 w-[90px] animate-pulse rounded-md bg-white/10' />
            <div className='h-10 w-[110px] animate-pulse rounded-md bg-white/10' />
          </div>
          <div className='overflow-hidden rounded-lg border border-white/10'>
            <div className='h-10 w-full animate-pulse border-b border-white/10 bg-white/[0.06]' />
            {Array.from({ length: 8 }).map((_, rowIndex) => (
              <div
                key={`admin-balance-skeleton-row-${rowIndex}`}
                className='h-10 w-full animate-pulse border-b border-white/10 bg-white/[0.03] last:border-b-0'
              />
            ))}
          </div>
        </section>

        <section className='w-[35%] rounded-xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-sm'>
          <div className='mb-3 h-10 w-full animate-pulse rounded-md bg-white/10' />
          <div className='mb-3 h-10 w-full animate-pulse rounded-md bg-white/10' />
          <div className='mb-3 h-10 w-36 animate-pulse rounded-md bg-white/10' />
          {Array.from({ length: 4 }).map((_, groupIndex) => (
            <div
              key={`admin-gbank-skeleton-group-${groupIndex}`}
              className='mb-2 h-12 w-full animate-pulse rounded-md bg-white/10'
            />
          ))}
        </section>

        <section className='min-h-[85vh] min-w-[10%] rounded-xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-sm'>
          <div className='mb-3 h-24 w-full animate-pulse rounded-md bg-white/10' />
          <div className='mb-3 h-36 w-full animate-pulse rounded-md bg-white/10' />
          <div className='h-36 w-full animate-pulse rounded-md bg-white/10' />
        </section>
      </div>
    </div>
  )
}
