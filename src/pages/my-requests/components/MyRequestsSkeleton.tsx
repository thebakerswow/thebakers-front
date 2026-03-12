export function MyRequestsSkeleton() {
  return (
    <div className='flex h-full min-h-0 w-full flex-col px-6 pb-8 pt-6 md:px-10'>
      <section className='mb-4 rounded-xl border border-white/10 bg-white/[0.03] p-4'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div className='flex flex-wrap gap-2'>
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={`my-requests-filter-skeleton-${idx}`}
                className='h-10 w-28 rounded-md border border-white/10 bg-white/[0.08] animate-pulse'
              />
            ))}
          </div>
          <div className='h-10 w-28 rounded-md border border-white/10 bg-white/[0.08] animate-pulse' />
        </div>
      </section>

      <div className='mb-3 h-4 w-64 rounded bg-white/10 animate-pulse' />

      <div
        className='grid gap-4'
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        }}
      >
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={`my-requests-card-skeleton-${idx}`}
            className='overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]'
            style={{ height: '450px' }}
          >
            <div className='h-[180px] w-full bg-white/10 animate-pulse' />
            <div className='space-y-3 p-3'>
              <div className='h-5 w-2/3 rounded bg-white/10 animate-pulse' />
              <div className='h-16 w-full rounded bg-white/10 animate-pulse' />
              <div className='h-12 w-full rounded bg-white/10 animate-pulse' />
              <div className='h-10 w-1/2 rounded bg-white/10 animate-pulse' />
            </div>
          </div>
        ))}
      </div>

      <div className='mt-5 flex items-center justify-center gap-1'>
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={`my-requests-pagination-skeleton-${idx}`}
            className='h-9 w-9 rounded-md border border-white/10 bg-white/[0.08] animate-pulse'
          />
        ))}
      </div>
    </div>
  )
}
