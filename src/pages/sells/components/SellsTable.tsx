import { SellsTableProps } from '../types/sells'

const formatGold = (value: number): string => {
  const normalized = Math.round(value)
  if (normalized === 0) return '0'
  return normalized.toLocaleString('en-US')
}

const formatDollar = (value: number): string => {
  const normalized = Math.round(value * 100) / 100
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(normalized === 0 ? 0 : normalized)
}

export function SellsTable({ salesByDate, statusFilter }: SellsTableProps) {
  if (salesByDate.length === 0) {
    return (
      <div className='rounded-xl border border-white/15 bg-white/[0.08] p-4 text-center'>
        <p className='text-neutral-400'>No payments found</p>
      </div>
    )
  }

  return (
    <div className='overflow-x-auto rounded-xl border border-white/10 bg-white/[0.05]'>
      <table className='w-full' style={{ tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '120px' }} />
          {statusFilter === 'pending' && <col style={{ width: '150px' }} />}
          <col style={{ width: '150px' }} />
          <col style={{ width: '150px' }} />
          <col style={{ width: '150px' }} />
          {statusFilter === 'pending' && <col style={{ width: '150px' }} />}
          <col style={{ width: '150px' }} />
          <col style={{ width: '150px' }} />
        </colgroup>
        <thead>
          <tr className='bg-white/[0.06]'>
            <th className='px-4 py-4 text-left text-sm font-bold text-white'>Payment Date</th>
            {statusFilter === 'pending' && (
              <th className='px-4 py-4 text-right text-sm font-bold text-white'>Balance Gold</th>
            )}
            <th className='px-4 py-4 text-right text-sm font-bold text-white'>Gold Sold</th>
            <th className='px-4 py-4 text-right text-sm font-bold text-white'>Avg M</th>
            <th className='px-4 py-4 text-right text-sm font-bold text-white'>Gold In $</th>
            {statusFilter === 'pending' && (
              <th className='px-4 py-4 text-right text-sm font-bold text-white'>Balance Dolar</th>
            )}
            <th className='px-4 py-4 text-right text-sm font-bold text-white'>Shop Dolar</th>
            <th className='px-4 py-4 text-right text-sm font-bold text-white'>Total</th>
          </tr>
        </thead>
        <tbody>
          {salesByDate.map((dateData) => (
            <tr key={dateData.date} className='border-t border-white/10 transition hover:bg-white/[0.03]'>
              <td className='px-4 py-3 text-left text-sm font-medium text-white'>{dateData.paymentDate}</td>
              {statusFilter === 'pending' && (
                <td className='px-4 py-3 text-right text-sm font-semibold text-blue-300'>
                  {dateData.balanceGold !== null ? `${formatGold(dateData.balanceGold)}g` : '-'}
                </td>
              )}
              <td className='px-4 py-3 text-right text-sm font-semibold text-blue-300'>
                {dateData.type === 'dolar' ? '-' : `${formatGold(dateData.goldSold)}g`}
              </td>
              <td className='px-4 py-3 text-right text-sm font-semibold text-violet-300'>
                {dateData.type === 'dolar' ? '-' : formatDollar(dateData.avgM)}
              </td>
              <td className='px-4 py-3 text-right text-sm font-semibold text-emerald-300'>
                {dateData.type === 'dolar' ? '-' : formatDollar(dateData.goldInDollar)}
              </td>
              {statusFilter === 'pending' && (
                <td className='px-4 py-3 text-right text-sm font-semibold text-blue-300'>
                  {dateData.balanceDolar !== null ? formatDollar(dateData.balanceDolar) : '-'}
                </td>
              )}
              <td className='px-4 py-3 text-right text-sm font-semibold text-emerald-300'>
                {dateData.type === 'gold' ? '-' : formatDollar(dateData.shopDolar)}
              </td>
              <td className='px-4 py-3 text-right text-sm font-semibold text-amber-400'>
                {formatDollar(dateData.total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
