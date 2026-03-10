import { RUN_SCREEN_FLAGS } from '../../constants/run-flags'
import { SpecialRunEntryPage } from './special-run-entry-page'

export function LevelingPage() {
  return (
    <SpecialRunEntryPage
      runScreen={RUN_SCREEN_FLAGS.LEVELING}
      detailsRoutePrefix='/bookings-na/leveling'
      runType='Leveling'
    />
  )
}
