import { test } from '../fixtures'
import { APP_SUBMITTED_JOURNEYS, runApplicationSubmissionJourney } from './application-submitted-journey-helper'

const journey = APP_SUBMITTED_JOURNEYS.find(item => item.id === 5)
if (!journey) throw new Error('Journey definition for app type 5 is missing')

test.describe('Application Submitted - Swap Visiting Orders (VOs) for PIN Credit', () => {
  test('should complete full application submission journey', async ({
    page,
    resetAndSignIn,
    enterPrisonerDetails,
    selectGroup,
    selectApplicationType,
    selectLoggingMethod,
  }) => {
    await runApplicationSubmissionJourney({
      page,
      resetAndSignIn,
      enterPrisonerDetails,
      selectGroup,
      selectApplicationType,
      selectLoggingMethod,
      journey,
    })
  })
})
