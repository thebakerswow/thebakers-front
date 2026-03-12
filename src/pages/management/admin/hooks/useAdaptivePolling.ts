import { useEffect, useRef } from 'react'

type PollingCallback = () => void | Promise<void>

interface UseAdaptivePollingOptions {
  onPoll: PollingCallback
  activeDelayMs: number
  inactiveDelayMs: number
  enabled?: boolean
  inactivityTimeoutMs?: number
}

export function useAdaptivePolling({
  onPoll,
  activeDelayMs,
  inactiveDelayMs,
  enabled = true,
  inactivityTimeoutMs = 5000,
}: UseAdaptivePollingOptions) {
  const onPollRef = useRef<PollingCallback>(onPoll)
  const isUserActiveRef = useRef(true)

  onPollRef.current = onPoll

  useEffect(() => {
    if (!enabled) return

    let pollingTimer: ReturnType<typeof setTimeout>
    let inactivityTimer: ReturnType<typeof setTimeout>

    const resetActivityTimer = () => {
      isUserActiveRef.current = true
      clearTimeout(inactivityTimer)
      inactivityTimer = setTimeout(() => {
        isUserActiveRef.current = false
      }, inactivityTimeoutMs)
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isUserActiveRef.current = false
        return
      }
      resetActivityTimer()
    }

    const handleMouseOrKeyActivity = () => {
      resetActivityTimer()
    }

    const schedulePoll = () => {
      const delay = isUserActiveRef.current ? activeDelayMs : inactiveDelayMs
      pollingTimer = setTimeout(async () => {
        await Promise.resolve(onPollRef.current())
        schedulePoll()
      }, delay)
    }

    window.addEventListener('mousemove', handleMouseOrKeyActivity)
    window.addEventListener('keydown', handleMouseOrKeyActivity)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    resetActivityTimer()
    schedulePoll()

    return () => {
      clearTimeout(pollingTimer)
      clearTimeout(inactivityTimer)
      window.removeEventListener('mousemove', handleMouseOrKeyActivity)
      window.removeEventListener('keydown', handleMouseOrKeyActivity)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [activeDelayMs, inactiveDelayMs, enabled, inactivityTimeoutMs])
}
