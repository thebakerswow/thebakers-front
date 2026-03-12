export function SellsPageSkeleton() {
  return (
    <div className='w-full overflow-auto overflow-x-hidden pr-20'>
      <div className='m-8 min-h-screen w-full pb-12 text-white'>
        <div className='mb-4 flex items-center gap-2'>
          <div className='h-10 w-24 rounded-md border border-white/10 bg-white/[0.08] animate-pulse' />
          <div className='h-10 w-28 rounded-md border border-white/10 bg-white/[0.08] animate-pulse' />
        </div>

        <div className='overflow-x-auto rounded-xl border border-white/10 bg-white/[0.05]'>
          <div className='border-b border-white/10 bg-white/[0.06] px-4 py-4'>
            <div className='h-5 w-44 rounded bg-white/10 animate-pulse' />
          </div>

          <div className='space-y-2 p-3'>
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={`sells-skeleton-row-${idx}`} className='h-12 w-full rounded-md bg-white/10 animate-pulse' />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
