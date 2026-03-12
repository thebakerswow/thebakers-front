import { useState, useEffect } from 'react'
import { CircleNotch, Copy, X } from '@phosphor-icons/react'
import { getInviteBuyers } from '../../../../services/api/buyers'
import { ErrorDetails } from '../../../../components/error-display'

interface InviteBuyersProps {
  onClose: () => void
  runId: string | undefined
  onError?: (error: ErrorDetails) => void
}

export function InviteBuyers({ onClose, runId, onError }: InviteBuyersProps) {
  const [inviteData, setInviteData] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchInviteBuyersData() {
      if (!runId) return

      try {
        setLoading(true)
        const data = await getInviteBuyers(runId)
        setInviteData(data)
      } catch (error) {
        console.error('Error fetching invite buyers data:', error)
        if (onError) {
          const errorDetails = {
            message: 'Error fetching invite buyers data',
            response: error,
          }
          onError(errorDetails)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchInviteBuyersData()
  }, [runId, onError])

  function formatInviteData(rawData: string): string {
    try {
      const parsedData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData

      if (Array.isArray(parsedData)) {
        return parsedData
          .map((name: unknown) => String(name).trim())
          .filter((name: string) => name.length > 0)
          .join('\n')
      }

      if (
        parsedData &&
        typeof parsedData === 'object' &&
        'info' in parsedData &&
        Array.isArray((parsedData as { info: unknown[] }).info)
      ) {
        return (parsedData as { info: unknown[] }).info
          .map((name: unknown) => String(name).trim())
          .filter((name: string) => name.length > 0)
          .join('\n')
      }

      return typeof rawData === 'string' ? rawData : JSON.stringify(rawData, null, 2)
    } catch {
      return rawData
        .replace(/[\[\]{}",]/g, '')
        .replace(/info:/g, '')
        .split(/\s+/)
        .filter((item: string) => item.length > 0)
        .join('\n')
    }
  }

  function handleCopy() {
    if (inviteData) {
      const formattedData = formatInviteData(inviteData).replace(/\n/g, '\n\n')
      navigator.clipboard.writeText(formattedData)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }
  }

  const formattedInviteData = inviteData ? formatInviteData(inviteData) : ''

  return (
    <div className='fixed inset-0 z-[240] flex items-center justify-center bg-black/70 p-4'>
      <div className='w-full max-w-md rounded-xl border border-white/10 bg-[#1a1a1a] p-4 text-white shadow-2xl'>
        <div className='mb-3 flex items-center justify-between'>
          <h2 className='text-lg font-semibold'>Invite Buyers</h2>
          <button
            type='button'
            onClick={onClose}
            className='rounded-md border border-white/10 bg-white/5 p-1.5 text-white transition hover:border-purple-500/40 hover:text-purple-300'
            aria-label='Close invite buyers modal'
          >
            <X size={18} />
          </button>
        </div>

        <div className='flex flex-col gap-4'>
          {loading ? (
            <div className='flex min-h-[120px] items-center justify-center'>
              <CircleNotch className='animate-spin text-purple-300' size={24} />
            </div>
          ) : (
            <>
              <div className='max-h-96 overflow-y-auto rounded-md border border-white/15 bg-white/[0.05] p-4'>
                <pre className='whitespace-pre-wrap text-sm text-neutral-100'>
                  {formattedInviteData}
                </pre>
              </div>
              <div className='flex justify-end'>
                <button
                  type='button'
                  onClick={handleCopy}
                  className='inline-flex items-center justify-center gap-2 rounded-md border border-purple-400/40 bg-purple-500/20 px-3 py-2 text-sm font-medium text-purple-100 transition hover:border-purple-300/55 hover:bg-purple-500/30'
                >
                  <Copy size={18} />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
