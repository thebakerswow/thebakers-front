export function SellsTabPageSkeleton() {
  return (
    <div>
      <div className='mb-6 flex flex-wrap items-end justify-between gap-4'>
        <div className='flex flex-wrap items-end gap-4'>
          <div className='min-w-[220px]'>
            <div className='mb-1 h-4 w-24 animate-pulse rounded bg-white/10' />
            <div className='h-10 w-full animate-pulse rounded-md border border-white/10 bg-white/[0.06]' />
          </div>
          <div className='flex items-center gap-2'>
            <div className='h-4 w-14 animate-pulse rounded bg-white/10' />
            <div className='h-10 w-[110px] animate-pulse rounded-md border border-white/10 bg-white/[0.06]' />
            <div className='h-10 w-[120px] animate-pulse rounded-md border border-white/10 bg-white/[0.06]' />
          </div>
        </div>
        <div className='h-10 w-[140px] animate-pulse rounded-md border border-purple-400/30 bg-purple-500/15' />
      </div>

      <div className='overflow-x-auto rounded-xl border border-white/10 bg-white/[0.05]'>
        <table className='w-full min-w-[980px] text-sm'>
          <thead>
            <tr className='border-b border-white/10 bg-white/[0.06]'>
              {Array.from({ length: 7 }).map((_, index) => (
                <th key={`sells-head-skeleton-${index}`} className='px-4 py-4'>
                  <div className='mx-auto h-4 w-20 animate-pulse rounded bg-white/10' />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, rowIndex) => (
              <tr key={`sells-row-skeleton-${rowIndex}`} className='border-b border-white/5'>
                {Array.from({ length: 7 }).map((_, cellIndex) => (
                  <td key={`sells-cell-skeleton-${rowIndex}-${cellIndex}`} className='px-4 py-3'>
                    <div className='mx-auto h-4 w-full max-w-[120px] animate-pulse rounded bg-white/10' />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
