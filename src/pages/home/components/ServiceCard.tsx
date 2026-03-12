import { Fire } from '@phosphor-icons/react'
import { ServiceCardProps } from '../types/home'

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className='group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition-all duration-300 hover:scale-[1.02] hover:border-purple-500/20'>
      <div className='absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
      <div className='flex h-full flex-col p-5 sm:p-6'>
        <div className='mb-2 flex items-start gap-2'>
          <h3 className='line-clamp-1 flex-1 text-lg font-bold text-white transition-colors duration-300 group-hover:text-purple-100'>
            {service.name}
          </h3>
          {service.hotItem && (
            <span className='inline-flex shrink-0 items-center gap-1 rounded-full border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-orange-400'>
              <Fire size={12} />
              Hot
            </span>
          )}
        </div>

        <p className='line-clamp-3 mb-4 flex-1 text-sm leading-relaxed text-gray-400'>
          {service.description?.replace(/<[^>]*>/g, '') || 'No description available.'}
        </p>

        <div className='border-t border-white/5 pt-3'>
          <span className='text-[10px] uppercase tracking-wider text-gray-500'>Price</span>
          <p className='text-xl font-bold text-amber-400'>
            {service.price.toLocaleString('en-US')}{' '}
            <span className='text-xs font-medium text-amber-500/70'>gold</span>
          </p>
        </div>
      </div>
    </div>
  )
}
