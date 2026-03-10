import { RUN_SCREEN_FLAGS } from '../../constants/run-flags'
import { SpecialRunEntryPage } from './special-run-entry-page'

export function PvpPage() {
  return (
    <SpecialRunEntryPage
      runScreen={RUN_SCREEN_FLAGS.PVP}
      detailsRoutePrefix='/bookings-na/pvp'
      runType='PVP'
    />
  )
}
