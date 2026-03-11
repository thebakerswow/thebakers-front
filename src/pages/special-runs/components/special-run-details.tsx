import { Clock, Lock, UserPlus } from '@phosphor-icons/react'
import { MockRunInfo } from '../special-run-mock-types'

interface SpecialRunDetailsProps {
  runInfo: MockRunInfo
  onOpenAddBuyer: () => void
}

export function SpecialRunDetails({ runInfo, onOpenAddBuyer }: SpecialRunDetailsProps) {
  const hasGoldCollectors = runInfo.sumPot.some((item) => item.type === 'gold' && item.sumPot !== 0)
  const hasDolarCollectors = runInfo.sumPot.some((item) => item.type === 'dolar' && item.sumPot !== 0)
  const hasCollectors = hasGoldCollectors || hasDolarCollectors
  const actionButtonClass =
    'inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-purple-400/40 bg-purple-500/20 px-4 text-sm text-purple-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.22)] transition hover:border-purple-300/55 hover:bg-purple-500/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/45 disabled:cursor-not-allowed disabled:border-zinc-500/60 disabled:bg-zinc-700/60 disabled:text-zinc-300 disabled:shadow-none'

  return (
    <div className='m-4 flex flex-col gap-3 lg:flex-row'>
      {hasCollectors && (
        <div className='grid flex-1 grid-cols-1 gap-3 xl:grid-cols-2'>
          {hasGoldCollectors && (
            <div className='rounded-xl border border-white/10 bg-white/[0.04] p-3 text-white'>
              <h2 className='text-base font-semibold'>Gold Collectors</h2>
              <div className='mt-2 max-h-[260px] overflow-y-auto rounded-md border border-white/10 bg-black/20'>
                <table className='w-full text-sm'>
                  <tbody>
                    {runInfo.sumPot
                      .filter((item) => item.type === 'gold' && item.sumPot !== 0)
                      .map((item) => (
                        <tr key={item.idDiscord} className='border-b border-white/5'>
                          <td className='px-3 py-2 text-left'>{item.username}</td>
                          <td className='px-3 py-2 text-right'>
                            {Math.round(item.sumPot).toLocaleString('en-US')}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {hasDolarCollectors && (
            <div className='rounded-xl border border-white/10 bg-white/[0.04] p-3 text-white'>
              <h2 className='text-base font-semibold'>Dolar Collectors</h2>
              <div className='mt-2 max-h-[260px] overflow-y-auto rounded-md border border-white/10 bg-black/20'>
                <table className='w-full text-sm'>
                  <tbody>
                    {runInfo.sumPot
                      .filter((item) => item.type === 'dolar' && item.sumPot !== 0)
                      .map((item) => (
                        <tr key={item.idDiscord} className='border-b border-white/5'>
                          <td className='px-3 py-2 text-left'>{item.username}</td>
                          <td className='px-3 py-2 text-right'>
                            {item.sumPot.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <div className='rounded-xl border border-white/10 bg-white/[0.04] p-3 text-white lg:w-[320px] lg:shrink-0'>
        <div className='flex w-full flex-col gap-2'>
          <button type='button' onClick={onOpenAddBuyer} className={actionButtonClass}>
            <UserPlus size={18} />
            Add Buyer
          </button>
          <button type='button' disabled className={actionButtonClass}>
            <Clock size={18} />
            History
          </button>
          <button type='button' disabled className={actionButtonClass}>
            <Lock size={18} />
            Lock Run
          </button>
        </div>
      </div>
    </div>
  )
}
