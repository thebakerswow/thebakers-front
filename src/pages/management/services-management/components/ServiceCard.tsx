import { Fire, PencilSimple, Trash } from '@phosphor-icons/react'
import { Service } from '../types/servicesManagement'

interface ServiceCardProps {
  service: Service
  onEdit: (service: Service) => void
  onDelete: (serviceId: number) => void
}

export function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  return (
    <div className='relative flex flex-col rounded-xl border border-white/10 bg-[#262626] p-4 transition hover:-translate-y-0.5 hover:border-purple-500/40'>
      <div className='mb-2 flex items-start gap-2'>
        <h3 className='line-clamp-1 flex-1 text-lg font-bold text-white'>{service.name}</h3>
        {service.hotItem ? (
          <span className='inline-flex shrink-0 items-center gap-1 rounded-full border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-orange-400'>
            <Fire size={12} />
            Hot
          </span>
        ) : null}
      </div>

      <p className='mb-4 flex-1 text-sm text-neutral-400'>{service.description}</p>

      <div className='border-t border-white/5 pt-3'>
        <div className='flex items-end justify-between gap-2'>
          <div>
            <span className='text-[10px] uppercase tracking-wider text-gray-500'>Price</span>
            <p className='text-xl font-bold text-amber-400'>
              {service.price.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              <span className='ml-1 text-xs font-medium text-amber-500/70'>gold</span>
            </p>
          </div>

          <div className='flex gap-1'>
            <button
              type='button'
              onClick={() => onEdit(service)}
              className='rounded-md p-2 text-purple-300 transition hover:bg-purple-500/15 hover:text-purple-200'
            >
              <PencilSimple size={16} />
            </button>
            <button
              type='button'
              onClick={() => onDelete(service.id)}
              className='rounded-md p-2 text-red-400 transition hover:bg-red-500/15 hover:text-red-300'
            >
              <Trash size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
