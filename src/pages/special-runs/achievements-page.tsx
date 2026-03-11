import { RUN_SCREEN_FLAGS } from '../../constants/run-flags'
import { SpecialRunEntryPage } from './special-run-entry-page'

export function AchievementsPage() {
  return (
    <SpecialRunEntryPage
      runScreen={RUN_SCREEN_FLAGS.ACHIEVEMENTS}
      detailsRoutePrefix='/bookings-na/achievements'
      runType='Achievements'
    />
  )
}
