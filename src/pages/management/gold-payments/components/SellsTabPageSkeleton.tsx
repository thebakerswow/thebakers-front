export function SellsTabPageSkeleton() {
  return (
    <>
      <div style={{ marginBottom: 24, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className='min-w-[220px]'>
            <div className='mb-1 h-4 w-24 animate-pulse rounded bg-white/10' />
            <div className='h-10 w-full animate-pulse rounded-md border border-white/10 bg-white/[0.06]' />
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div className='h-4 w-14 animate-pulse rounded bg-white/10' />
            <div className='h-10 w-[110px] animate-pulse rounded-md border border-white/10 bg-white/[0.06]' />
            <div className='h-10 w-[120px] animate-pulse rounded-md border border-white/10 bg-white/[0.06]' />
          </div>
        </div>
        <div className='h-10 w-[140px] animate-pulse rounded-md border border-purple-400/30 bg-purple-500/15' />
      </div>

      <div className='grid grid-cols-1 gap-3 lg:grid-cols-12' style={{ gap: '24px' }}>
        <div className='col-span-1 lg:col-span-8'>
          <div className='overflow-x-auto rounded-xl border border-white/10 bg-white/[0.05]'>
            <table className='w-full min-w-[1000px] text-sm'>
              <thead>
                <tr className='border-b border-white/10 bg-white/[0.06]'>
                  {Array.from({ length: 9 }).map((_, index) => (
                    <th key={`payments-head-skeleton-${index}`} className='px-4 py-4'>
                      <div className='mx-auto h-4 w-20 animate-pulse rounded bg-white/10' />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 8 }).map((_, rowIndex) => (
                  <tr key={`payments-row-skeleton-${rowIndex}`} className='border-b border-white/5'>
                    {Array.from({ length: 9 }).map((_, cellIndex) => (
                      <td key={`payments-cell-skeleton-${rowIndex}-${cellIndex}`} className='px-4 py-3'>
                        <div className='mx-auto h-4 w-full max-w-[120px] animate-pulse rounded bg-white/10' />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className='col-span-1 lg:col-span-4'>
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: '12px',
              boxShadow: 'none',
              padding: 24,
              position: 'sticky',
              top: 20,
            }}
          >
            <div className='mb-6 h-6 w-44 animate-pulse rounded bg-white/10' />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`summary-card-skeleton-${index}`}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    borderRadius: '10px',
                    padding: 16,
                  }}
                >
                  <div className='mb-4 flex items-center justify-between'>
                    <div className='h-5 w-20 animate-pulse rounded-full bg-white/10' />
                    <div className='h-5 w-28 animate-pulse rounded bg-white/10' />
                  </div>
                  <div className='space-y-2'>
                    <div className='h-4 w-full animate-pulse rounded bg-white/10' />
                    <div className='h-4 w-full animate-pulse rounded bg-white/10' />
                    <div className='h-4 w-4/5 animate-pulse rounded bg-white/10' />
                  </div>
                </div>
              ))}
              <div
                style={{
                  backgroundColor: 'rgba(147,51,234,0.16)',
                  border: '1px solid rgba(168,85,247,0.45)',
                  borderRadius: '10px',
                  padding: 20,
                }}
              >
                <div className='mb-4 h-5 w-20 animate-pulse rounded bg-white/20' />
                <div className='space-y-2'>
                  <div className='h-4 w-full animate-pulse rounded bg-white/20' />
                  <div className='h-4 w-full animate-pulse rounded bg-white/20' />
                  <div className='h-4 w-4/5 animate-pulse rounded bg-white/20' />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
