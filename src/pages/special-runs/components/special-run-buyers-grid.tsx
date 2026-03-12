import { CheckFat, Pencil, Trash, X } from '@phosphor-icons/react'
import {
  RiAlertLine,
  RiArrowDownLine,
  RiLoginCircleLine,
  RiSwordLine,
  RiUserHeartLine,
  RiWifiOffLine,
  RiZzzFill,
} from 'react-icons/ri'
import { CustomSelect } from '../../../components/CustomSelect'
import { MockBuyer, MockBuyerStatus } from '../special-run-mock-types'

interface StatusOption {
  value: string
  label: string
}

interface SpecialRunBuyersGridProps {
  buyers: MockBuyer[]
  statusOptions: StatusOption[]
  getStatusStyle: (status: MockBuyerStatus) => string
  onStatusChange: (buyerId: string, newStatus: string) => void
  onClaim: (buyerId: string) => void
  canToggleClaim: (buyer: MockBuyer) => boolean
}

export function SpecialRunBuyersGrid({
  buyers,
  statusOptions,
  getStatusStyle,
  onStatusChange,
  onClaim,
  canToggleClaim,
}: SpecialRunBuyersGridProps) {
  return (
    <div className='p-4'>
      <div className='overflow-x-auto rounded-xl border border-white/10 bg-black/30'>
        <table className='w-full min-w-[1200px] text-sm'>
          <thead>
            <tr className='border-b border-white/10 bg-white/[0.03] text-neutral-300'>
              <th className='px-2 py-3 text-center font-semibold'>Slot</th>
              <th className='px-2 py-3 text-center font-semibold'>Status</th>
              <th className='px-2 py-3 text-center font-semibold'>Name-Realm</th>
              <th className='px-2 py-3 text-center font-semibold'>Note</th>
              <th className='px-2 py-3 text-center font-semibold'>Advertiser</th>
              <th className='px-2 py-3 text-center font-semibold'>Collector</th>
              <th className='px-2 py-3 text-center font-semibold'>Claimed By</th>
              <th className='px-2 py-3 text-center font-semibold'>Paid Full</th>
              <th className='px-2 py-3 text-center font-semibold'>Dollar Pot</th>
              <th className='px-2 py-3 text-center font-semibold'>Gold Pot</th>
              <th className='px-2 py-3 text-center font-semibold'>Run Pot</th>
              <th className='px-2 py-3 text-center font-semibold'>Class</th>
              <th className='px-2 py-3 text-center font-semibold'>Claim</th>
              <th className='px-2 py-3 text-center font-semibold'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {buyers.map((buyer, index) => (
              <tr key={buyer.id} className={`border-b border-white/5 ${getStatusStyle(buyer.status)}`}>
                <td className='px-2 py-2 text-center'>{index + 1}</td>
                <td className='px-2 py-2 text-center'>
                  <CustomSelect
                    value={buyer.status}
                    onChange={(value) => onStatusChange(buyer.id, value)}
                    options={statusOptions}
                    minWidthClassName='min-w-[120px]'
                    triggerClassName='!h-9 ![background-image:none] !bg-white/10 !backdrop-blur-sm !shadow-none !border-white/25 !text-center text-white'
                    renderInPortal
                  />
                </td>
                <td className='px-2 py-2 text-center'>{buyer.nameAndRealm}</td>
                <td className='px-2 py-2 text-center'>{buyer.note}</td>
                <td className='px-2 py-2 text-center'>{buyer.advertiser}</td>
                <td className='px-2 py-2 text-center'>{buyer.collector}</td>
                <td className='px-2 py-2 text-center'>
                  {buyer.claimed ? buyer.claimedByName || buyer.claimedById || '-' : '-'}
                </td>
                <td className='px-2 py-2 text-center'>
                  <span className='inline-flex rounded-md border border-white/25 bg-white/10 p-1 backdrop-blur-sm'>
                    {buyer.paidFull ? (
                      <CheckFat className='text-green-500' size={22} weight='fill' />
                    ) : (
                      <X className='text-red-600' size={22} weight='bold' />
                    )}
                  </span>
                </td>
                <td className='px-2 py-2 text-center'>
                  {buyer.dolarPot > 0
                    ? buyer.dolarPot.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : '-'}
                </td>
                <td className='px-2 py-2 text-center'>
                  {buyer.goldPot > 0 ? Math.round(buyer.goldPot).toLocaleString('en-US') : '-'}
                </td>
                <td className='px-2 py-2 text-center'>
                  {buyer.dolarPot > 0
                    ? buyer.runPot.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : Math.round(buyer.runPot).toLocaleString('en-US')}
                </td>
                <td className='px-2 py-2 text-center'>{buyer.playerClass}</td>
                <td className='px-2 py-2 text-center'>
                  {buyer.status === 'waiting' ? (
                    <button
                      type='button'
                      onClick={() => onClaim(buyer.id)}
                      disabled={!canToggleClaim(buyer)}
                      className={`rounded-md border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                        buyer.claimed
                          ? 'border-emerald-300/60 bg-emerald-500/30 text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.45)]'
                          : 'border-yellow-300/70 bg-yellow-500/30 text-yellow-100 shadow-[0_0_20px_rgba(250,204,21,0.45)] hover:bg-yellow-500/40'
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {buyer.claimed ? 'Claimed' : 'Claim'}
                    </button>
                  ) : buyer.status === 'group' || buyer.status === 'done' ? (
                    <span className='rounded-md border border-emerald-300/60 bg-emerald-500/30 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.45)]'>
                      Claimed
                    </span>
                  ) : (
                    <span className='text-neutral-400'>-</span>
                  )}
                </td>
                <td className='px-2 py-2 text-center'>
                  <div className='mx-auto grid max-w-[136px] grid-cols-2 justify-items-center gap-1 min-[1750px]:max-w-[196px] min-[1750px]:grid-cols-3 min-[2300px]:flex min-[2300px]:max-w-none min-[2300px]:justify-center'>
                    <button type='button' title='AFK' disabled className='rounded-md p-1 opacity-50'>
                      <RiZzzFill size={18} />
                    </button>
                    <button type='button' title='Offline' disabled className='rounded-md p-1 opacity-50'>
                      <RiWifiOffLine size={18} />
                    </button>
                    <button type='button' title='Buyer in combat' disabled className='rounded-md p-1 opacity-50'>
                      <RiSwordLine size={18} />
                    </button>
                    <button
                      type='button'
                      title='Price below minimum'
                      disabled
                      className='rounded-md p-1 opacity-50'
                    >
                      <RiArrowDownLine size={18} />
                    </button>
                    <button type='button' title='Buyer Ready' disabled className='rounded-md p-1 opacity-50'>
                      <RiUserHeartLine size={18} />
                    </button>
                    <button type='button' title='Buyer Logging' disabled className='rounded-md p-1 opacity-50'>
                      <RiLoginCircleLine size={18} />
                    </button>
                    <button
                      type='button'
                      title='Attention! Check Note'
                      disabled
                      className='rounded-md p-1 opacity-50'
                    >
                      <RiAlertLine size={18} />
                    </button>
                    <button type='button' title='Edit' disabled className='rounded-md p-1 opacity-50'>
                      <Pencil size={18} />
                    </button>
                    <button type='button' title='Delete' disabled className='rounded-md p-1 opacity-50'>
                      <Trash size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
