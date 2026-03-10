import keyLogo from '../../assets/key.png'
import { BuyersDataGrid } from '../bookings-na/run/buyers-data-grid'
import { RUN_SCREEN_FLAGS } from '../../constants/run-flags'
import { SharedDetailsPage } from './shared-details-page'
import { SpecialRunInfo } from './special-run-info'

function KeyRunInfo(props: any) {
  return <SpecialRunInfo {...props} logoSrc={keyLogo} />
}

export function KeyDetails() {
  return (
    <SharedDetailsPage
      runScreen={RUN_SCREEN_FLAGS.KEYS}
      chatRunLinkPath='/keys/key-details'
      detailsRoutePrefix='/bookings-na/key'
      RunInfoComponent={KeyRunInfo}
      BuyersGridComponent={BuyersDataGrid}
    />
  )
}
