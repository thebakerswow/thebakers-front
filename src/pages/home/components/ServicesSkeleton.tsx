import { ServicesSkeletonProps } from '../types/home'

export function ServicesSkeleton({
  sections = 2,
  cardsPerSection = 8,
}: ServicesSkeletonProps) {
  return (
    <div className='py-10'>
      {Array.from({ length: sections }).map((_, sectionIndex) => (
        <section key={`services-skeleton-section-${sectionIndex}`} className='pt-12 first:pt-8'>
          <div className='mb-8'>
            <div className='mb-2 flex items-center gap-3'>
              <div className='h-px flex-1 bg-white/10' />
              <div className='h-8 w-48 animate-pulse rounded-md bg-white/10' />
              <div className='h-px flex-1 bg-white/10' />
            </div>
            <div className='mx-auto h-4 w-36 animate-pulse rounded bg-white/10' />
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-5'>
            {Array.from({ length: cardsPerSection }).map((_, cardIndex) => (
              <div
                key={`services-skeleton-card-${sectionIndex}-${cardIndex}`}
                className='rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6'
              >
                <div className='mb-3 flex items-start justify-between gap-3'>
                  <div className='h-6 w-32 animate-pulse rounded bg-white/10' />
                  <div className='h-5 w-12 animate-pulse rounded-full bg-white/10' />
                </div>
                <div className='mb-2 h-4 w-full animate-pulse rounded bg-white/10' />
                <div className='mb-2 h-4 w-11/12 animate-pulse rounded bg-white/10' />
                <div className='mb-4 h-4 w-4/5 animate-pulse rounded bg-white/10' />
                <div className='border-t border-white/5 pt-3'>
                  <div className='mb-2 h-3 w-10 animate-pulse rounded bg-white/10' />
                  <div className='h-6 w-24 animate-pulse rounded bg-white/10' />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
