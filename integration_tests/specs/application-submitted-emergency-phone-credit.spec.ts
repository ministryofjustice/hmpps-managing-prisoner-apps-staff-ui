import { test } from '../fixtures'
import { APP_SUBMITTED_JOURNEYS, runApplicationSubmissionJourney } from './application-submitted-journey-helper'

const journey = APP_SUBMITTED_JOURNEYS.find(item => item.id === 1)
if (!journey) throw new Error('Journey definition for app type 1 is missing')

test.describe('Application Submitted - Add emergency phone credit', () => {
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
