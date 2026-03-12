export function PaymentsTabPageSkeleton() {
  return (
    <div>
      <div className='mb-6 rounded-xl border border-white/10 bg-white/[0.04] p-4'>
        <div className='flex flex-wrap items-end justify-between gap-4'>
          <div className='flex flex-wrap items-end gap-4'>
            <div className='min-w-[220px]'>
              <div className='mb-1 h-4 w-24 animate-pulse rounded bg-white/10' />
              <div className='h-10 w-full animate-pulse rounded-md border border-white/10 bg-white/[0.06]' />
            </div>
            <div className='min-w-[180px]'>
              <div className='mb-1 h-4 w-12 animate-pulse rounded bg-white/10' />
              <div className='h-10 w-full animate-pulse rounded-md border border-white/10 bg-white/[0.06]' />
            </div>
            <div className='h-10 w-44 animate-pulse rounded border border-emerald-500/20 bg-emerald-500/10' />
          </div>
          <div className='flex items-end gap-3'>
            <div className='h-10 w-[300px] animate-pulse rounded-md border border-purple-400/30 bg-purple-500/15' />
            <div className='h-10 w-[230px] animate-pulse rounded-md border border-blue-400/30 bg-blue-500/15' />
          </div>
        </div>
      </div>

      <div className='flex flex-col gap-6'>
        {Array.from({ length: 2 }).map((_, tableIndex) => (
          <div key={`payments-team-skeleton-${tableIndex}`} className='rounded-xl border border-white/10 bg-white/[0.04] p-4'>
            <div className='mb-4 h-6 w-36 animate-pulse rounded bg-white/10' />
            <div className='overflow-x-auto rounded-xl border border-white/10 bg-white/[0.05]'>
              <table className='w-full min-w-[1000px] text-sm'>
                <thead>
                  <tr className='border-b border-white/10 bg-white/[0.06]'>
                    {Array.from({ length: 6 }).map((_, headIndex) => (
                      <th key={`payments-head-skeleton-${tableIndex}-${headIndex}`} className='px-4 py-4'>
                        <div className='mx-auto h-4 w-20 animate-pulse rounded bg-white/10' />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, rowIndex) => (
                    <tr key={`payments-row-skeleton-${tableIndex}-${rowIndex}`} className='border-b border-white/5'>
                      {Array.from({ length: 6 }).map((_, cellIndex) => (
                        <td key={`payments-cell-skeleton-${tableIndex}-${rowIndex}-${cellIndex}`} className='px-4 py-3'>
                          <div className='h-4 w-full animate-pulse rounded bg-white/10' />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
