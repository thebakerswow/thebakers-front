import { useEffect, useState } from 'react'
import { BalanceGridSkeletonProps } from '../types/balance'
import { isSoftwareRenderingLikely } from '../../../utils/renderingMode'

export function BalanceGridSkeleton({
  rows = 6,
  columns = 6,
}: BalanceGridSkeletonProps) {
  return (
    <div className='relative rounded-lg bg-transparent'>
      <div className='overflow-x-auto'>
        <table className='w-full min-w-max text-sm'>
          <thead>
            <tr className='border-b border-white/10'>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={`balance-grid-skeleton-header-${index}`} className='py-3 px-3 text-left'>
                  <div className='h-4 w-20 animate-pulse rounded bg-white/10' />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={`balance-grid-skeleton-row-${rowIndex}`} className='border-b border-white/5'>
                {Array.from({ length: columns }).map((_, columnIndex) => (
                  <td
                    key={`balance-grid-skeleton-cell-${rowIndex}-${columnIndex}`}
                    className='py-3 px-3'
                  >
                    <div
                      className={`h-5 animate-pulse rounded bg-white/10 ${
                        columnIndex === 0 ? 'w-40' : 'w-16'
                      }`}
                    />
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

export function BalancePageSkeleton() {
  const [useLightVisualEffects, setUseLightVisualEffects] = useState(false)

  useEffect(() => {
    setUseLightVisualEffects(isSoftwareRenderingLikely())
  }, [])

  return (
    <div className='flex w-full flex-col gap-6 px-6 pb-10 pt-6 md:px-10'>
      <section
        className={`relative z-30 rounded-xl border border-white/10 p-4 md:p-6 ${
          useLightVisualEffects
            ? 'bg-white/[0.05]'
            : 'bg-white/[0.03] backdrop-blur-sm'
        }`}
      >
        <div className='flex flex-wrap items-end justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-[220px] animate-pulse rounded-md bg-white/10' />
            <div className='h-10 w-[90px] animate-pulse rounded-md bg-white/10' />
          </div>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-[220px] animate-pulse rounded-md bg-white/10' />
            <div className='h-10 w-[260px] animate-pulse rounded-md bg-white/10' />
            <div className='h-10 w-[100px] animate-pulse rounded-md bg-white/10' />
          </div>
        </div>
      </section>

      <section
        className={`relative z-10 rounded-xl border border-white/10 p-2 md:p-4 ${
          useLightVisualEffects
            ? 'bg-white/[0.05]'
            : 'bg-white/[0.03] backdrop-blur-sm'
        }`}
      >
        <BalanceGridSkeleton />
      </section>
    </div>
  )
}
