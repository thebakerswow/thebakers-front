import { RUN_SCREEN_FLAGS } from '../../constants/run-flags'
import { SpecialRunEntryPage } from './special-run-entry-page'

export function DelvesPage() {
  return (
    <SpecialRunEntryPage
      runScreen={RUN_SCREEN_FLAGS.DELVES}
      detailsRoutePrefix='/bookings-na/delves'
      runType='Delves'
    />
  )
}
