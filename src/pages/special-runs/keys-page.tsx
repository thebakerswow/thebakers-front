import { RUN_SCREEN_FLAGS } from '../../constants/run-flags'
import { SpecialRunEntryPage } from './special-run-entry-page'

export function KeysPage() {
  return (
    <SpecialRunEntryPage
      runScreen={RUN_SCREEN_FLAGS.KEYS}
      detailsRoutePrefix='/bookings-na/key'
      runType='Keys'
    />
  )
}
