export function CategoriesSkeletonGrid() {
  const skeletonItems = Array.from({ length: 8 })

  return (
    <div className='grid grid-cols-1 gap-3 rounded-xl border border-white/10 bg-black/20 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {skeletonItems.map((_, index) => (
        <div
          key={`category-skeleton-${index}`}
          className='h-[200px] rounded-xl border border-white/10 bg-white/[0.04] p-4'
        >
          <div className='flex h-full animate-pulse flex-col justify-between'>
            <div>
              <div className='mx-auto mb-4 h-10 w-10 rounded-full bg-white/[0.08]' />
              <div className='mx-auto mb-2 h-5 w-2/3 rounded bg-white/[0.08]' />
              <div className='mx-auto h-4 w-1/2 rounded bg-white/[0.08]' />
            </div>
            <div className='mx-auto space-y-2'>
              <div className='h-4 w-20 rounded-full bg-white/[0.08]' />
              <div className='h-3 w-28 rounded bg-white/[0.08]' />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
