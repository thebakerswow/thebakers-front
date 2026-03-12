export function BalancePageSkeleton() {
  return (
    <div className='flex h-full min-h-0 w-full flex-col px-6 pb-8 pt-6 md:px-10'>
      <div className='grid min-h-0 w-full flex-1 grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='min-h-0 h-full lg:col-span-2'>
          <div className='h-full w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] animate-pulse'>
            <div className='flex flex-wrap items-center gap-3 border-b border-white/10 bg-black/25 p-3'>
              <div className='h-10 min-w-[180px] rounded-md bg-white/10' />
              <div className='h-10 min-w-[180px] rounded-md bg-white/10' />
              <div className='h-10 min-w-[110px] rounded-md bg-white/10' />
            </div>
            <div className='space-y-3 p-3'>
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={`balance-row-skeleton-${idx}`} className='h-12 w-full rounded-md bg-white/10' />
              ))}
            </div>
          </div>
        </div>
        <div className='min-h-0 h-full'>
          <div className='flex h-full w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] animate-pulse'>
            <div className='border-b border-white/10 p-3'>
              <div className='h-10 w-[140px] rounded-md bg-white/10' />
            </div>
            <div className='flex-1 space-y-2 p-2'>
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={`gbank-group-skeleton-${idx}`} className='h-12 w-full rounded-md bg-white/10' />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
