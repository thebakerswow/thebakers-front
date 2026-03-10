import levelingLogo from '../../assets/leveling.png'
import { BuyersDataGrid } from '../bookings-na/run/buyers-data-grid'
import { RUN_SCREEN_FLAGS } from '../../constants/run-flags'
import { SharedDetailsPage } from './shared-details-page'
import { SpecialRunInfo } from './special-run-info'

function LevelingRunInfo(props: any) {
  return <SpecialRunInfo {...props} logoSrc={levelingLogo} />
}

export function LevelingDetails() {
  return (
    <SharedDetailsPage
      runScreen={RUN_SCREEN_FLAGS.LEVELING}
      chatRunLinkPath='/leveling/leveling-details'
      detailsRoutePrefix='/bookings-na/leveling'
      RunInfoComponent={LevelingRunInfo}
      BuyersGridComponent={BuyersDataGrid}
    />
  )
}
