import { BuyersDataGrid } from '../bookings-na/run/buyers-data-grid'
import { RUN_SCREEN_FLAGS } from '../../constants/run-flags'
import { SharedDetailsPage } from './shared-details-page'
import { SpecialRunInfo } from './special-run-info'

function PvpRunInfo(props: any) {
  return <SpecialRunInfo {...props} />
}

export function PvpDetails() {
  return (
    <SharedDetailsPage
      runScreen={RUN_SCREEN_FLAGS.PVP}
      chatRunLinkPath='/bookings-na/pvp'
      detailsRoutePrefix='/bookings-na/pvp'
      RunInfoComponent={PvpRunInfo}
      BuyersGridComponent={BuyersDataGrid}
    />
  )
}
