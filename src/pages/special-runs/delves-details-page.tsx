import { BuyersDataGrid } from '../bookings-na/run/buyers-data-grid'
import { RUN_SCREEN_FLAGS } from '../../constants/run-flags'
import { SharedDetailsPage } from './shared-details-page'
import { SpecialRunInfo } from './special-run-info'

function DelvesRunInfo(props: any) {
  return <SpecialRunInfo {...props} />
}

export function DelvesDetails() {
  return (
    <SharedDetailsPage
      runScreen={RUN_SCREEN_FLAGS.DELVES}
      chatRunLinkPath='/bookings-na/delves'
      detailsRoutePrefix='/bookings-na/delves'
      RunInfoComponent={DelvesRunInfo}
      BuyersGridComponent={BuyersDataGrid}
    />
  )
}
