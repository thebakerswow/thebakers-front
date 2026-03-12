import { Eye, PencilSimple, Trash } from '@phosphor-icons/react'
import { RequestCardProps, TransactionRequest } from '../types/myRequests'

const statusBadgeClass: Record<TransactionRequest['status'], string> = {
  pending: 'border-amber-400/40 bg-amber-500/20 text-amber-100',
  accepted: 'border-emerald-400/40 bg-emerald-500/20 text-emerald-100',
  denied: 'border-red-400/40 bg-red-500/20 text-red-100',
}

const getStatusBadgeStyle = (status: TransactionRequest['status']) => {
  if (status === 'accepted') {
    return {
      borderColor: '#10b981',
      backgroundColor: 'rgba(16,185,129,0.20)',
      color: '#bbf7d0',
    }
  }
  if (status === 'pending') {
    return {
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245,158,11,0.20)',
      color: '#fde68a',
    }
  }
  return {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239,68,68,0.20)',
    color: '#fecaca',
  }
}

const formatDateFromAPI = (apiDateString: string) => {
  const datePart = apiDateString.split('T')[0]
  const [year, month, day] = datePart.split('-')
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  const weekday = weekdays[date.getDay()]
  return {
    date: `${weekday}, ${day} ${months[parseInt(month) - 1]} ${year}`,
    time: apiDateString.split('T')[1].split('.')[0].substring(0, 5),
  }
}

const formatValueForDisplay = (value: number) => {
  const formatted = Math.abs(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return value < 0 ? `-${formatted}` : formatted
}

export function RequestCard({ request, onOpenImage, onEditValue, onDelete }: RequestCardProps) {
  return (
    <div
      className='flex flex-col overflow-hidden rounded-xl border bg-white/[0.04] border-white/10 transition hover:bg-white/[0.06] hover:border-white/20'
      style={{ height: '450px' }}
    >
      <div className='group relative h-[180px] w-full shrink-0 overflow-hidden' style={{ flexBasis: '180px' }}>
        <img
          src={request.urlImage}
          alt='Request'
          className='block h-full w-full cursor-pointer object-cover'
          onClick={() => onOpenImage(request)}
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src =
              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDIwMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMWExYTFhIi8+CjxwYXRoIGQ9Ik0xMDAgNzBMMTIwIDEwMEg4MEwxMDAgNzBaIiBmaWxsPSIjNjY2NjY2Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEyMCIgcj0iMjAiIGZpbGw9IiM2NjY2NjYiLz4KPHN2Zz4K'
          }}
        />
        <button
          type='button'
          onClick={() => onOpenImage(request)}
          className='absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition group-hover:opacity-100'
        >
          <span className='rounded-full bg-purple-500/90 p-3'>
            <Eye size={22} />
          </span>
        </button>
      </div>

      <div className='flex flex-1 flex-col p-3'>
        <div className='mb-2 flex items-center gap-2'>
          <h3 className='line-clamp-1 text-lg font-semibold text-white'>{request.nameGbank}</h3>
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${statusBadgeClass[request.status]}`}
            style={getStatusBadgeStyle(request.status)}
          >
            {request.status}
          </span>
        </div>

        <div
          className='mb-3 rounded-md border p-2'
          style={
            request.value > 0
              ? { borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.16)' }
              : request.value < 0
                ? { borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.16)' }
                : { borderColor: 'rgba(255,255,255,0.10)', backgroundColor: 'rgba(0,0,0,0.35)' }
          }
        >
          <p className='text-[11px] uppercase tracking-wide text-neutral-400'>Transaction Value</p>
          <div className='flex items-center justify-between'>
            <p
              className={`text-xl font-bold ${
                request.value > 0 ? 'text-blue-300' : request.value < 0 ? 'text-red-400' : 'text-purple-300'
              }`}
            >
              {formatValueForDisplay(request.value)}
            </p>
            {request.status === 'pending' ? (
              <div className='flex items-center gap-1'>
                <button
                  onClick={() => onEditValue(request)}
                  className='rounded-md p-1.5 text-purple-300 transition hover:bg-purple-500/15'
                  aria-label='edit request value'
                >
                  <PencilSimple size={18} />
                </button>
                <button
                  onClick={() => onDelete(request)}
                  className='rounded-md p-1.5 text-red-300 transition hover:bg-red-500/15'
                  aria-label='delete request'
                >
                  <Trash size={18} />
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className='mb-3 text-sm'>
          <p className='text-[11px] uppercase tracking-wide text-neutral-400'>Requested by</p>
          <p className='line-clamp-1 font-medium text-white'>{request.nameUserRequest}</p>
          {request.status === 'pending' ? (
            <div className='mt-1 flex flex-wrap gap-1'>
              <span className='rounded-full border border-blue-400/40 bg-blue-500/15 px-2 py-0.5 text-[11px] text-blue-300'>
                Daily: {formatValueForDisplay(request.sumDay)}g
              </span>
              <span className='rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2 py-0.5 text-[11px] text-emerald-300'>
                Total: {formatValueForDisplay(request.balanceTotal)}g
              </span>
            </div>
          ) : null}
        </div>

        <div className='mb-4 text-sm'>
          <p className='text-[11px] uppercase tracking-wide text-neutral-400'>Date & Time</p>
          <p className='text-white'>{formatDateFromAPI(request.createdAt).date}</p>
          <p className='font-mono text-xs text-neutral-400'>{formatDateFromAPI(request.createdAt).time}</p>
        </div>
      </div>
    </div>
  )
}
