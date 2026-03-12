export function PaymentsTabPageSkeleton() {
  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className='min-w-[200px]'>
            <div className='mb-1 h-4 w-12 animate-pulse rounded bg-white/10' />
            <div className='h-10 w-full animate-pulse rounded-md border border-white/10 bg-white/[0.06]' />
          </div>
          <div className='min-w-[200px]'>
            <div className='mb-1 h-4 w-24 animate-pulse rounded bg-white/10' />
            <div className='h-10 w-full animate-pulse rounded-md border border-white/10 bg-white/[0.06]' />
          </div>
          <div className='h-10 w-44 animate-pulse rounded border border-emerald-500/20 bg-emerald-500/10' />
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end' }}>
          <div className='h-10 w-[300px] animate-pulse rounded-md border border-purple-400/30 bg-purple-500/15' />
          <div className='h-10 w-[230px] animate-pulse rounded-md border border-blue-400/30 bg-blue-500/15' />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {Array.from({ length: 2 }).map((_, tableIndex) => (
          <div key={`payments-table-skeleton-${tableIndex}`}>
            <div className='mb-2 h-6 w-36 animate-pulse rounded bg-white/10' />
            <div className='overflow-x-auto rounded-xl border border-white/10 bg-white/[0.04]'>
              <table className='min-w-full text-sm'>
                <thead>
                  <tr className='border-b border-white/10 bg-white/[0.03]'>
                    {Array.from({ length: 7 }).map((_, headIndex) => (
                      <th key={`payments-head-skeleton-${tableIndex}-${headIndex}`} className='px-3 py-3'>
                        <div className='mx-auto h-4 w-20 animate-pulse rounded bg-white/10' />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, rowIndex) => (
                    <tr key={`payments-row-skeleton-${tableIndex}-${rowIndex}`} className='border-b border-white/10'>
                      {Array.from({ length: 7 }).map((_, cellIndex) => (
                        <td key={`payments-cell-skeleton-${tableIndex}-${rowIndex}-${cellIndex}`} className='px-3 py-3'>
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
