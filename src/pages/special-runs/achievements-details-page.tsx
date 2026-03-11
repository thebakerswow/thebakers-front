import { BuyersDataGrid } from '../bookings-na/run/buyers-data-grid'
import { RUN_SCREEN_FLAGS } from '../../constants/run-flags'
import { SharedDetailsPage } from './shared-details-page'
import { SpecialRunInfo } from './special-run-info'

function AchievementsRunInfo(props: any) {
  return <SpecialRunInfo {...props} />
}

export function AchievementsDetails() {
  return (
    <SharedDetailsPage
      runScreen={RUN_SCREEN_FLAGS.ACHIEVEMENTS}
      chatRunLinkPath='/bookings-na/achievements'
      detailsRoutePrefix='/bookings-na/achievements'
      RunInfoComponent={AchievementsRunInfo}
      BuyersGridComponent={BuyersDataGrid}
    />
  )
}
