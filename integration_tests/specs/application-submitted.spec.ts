import { test, expect } from '../fixtures'
import { app } from '../../server/testData'
import auth from '../mockApis/auth'
import managingPrisonerAppsApi from '../mockApis/managingPrisonerApps'
import prisonApi from '../mockApis/prison'
import { resetStubs } from '../mockApis/wiremock'
import SubmitApplicationPage from '../pages/submitApplicationPage'

const targetBaseUrl = process.env.PW_BASE_URL || process.env.DPS_PRISONER_URL || 'http://localhost:3007'
const isWiremock = process.env.PW_ENV === 'mock' || targetBaseUrl.includes('localhost')

test.describe('Application Submitted Page', () => {
  const prisonerName = `${app.requestedBy.firstName} ${app.requestedBy.lastName}`
  const groupName = app.assignedGroup.name
  let submitApplicationPage: SubmitApplicationPage

  test.beforeEach(async ({ page, signIn }) => {
    if (isWiremock) {
      await resetStubs()
      await auth.stubSignIn()
      await prisonApi.stubGetCaseLoads()
      await managingPrisonerAppsApi.stubGetPrisonerApp({ app })
      await managingPrisonerAppsApi.stubGetGroupsAndTypes()
    }

    await signIn()
    await page.goto(`/log/submit/${app.requestedBy.username}/${app.id}`)
    submitApplicationPage = new SubmitApplicationPage(page)
  })

  test('should display the panel title and body', async () => {
    await expect(submitApplicationPage.panelTitle()).toContainText('Application submitted')
    await expect(submitApplicationPage.panelBody()).toContainText('Add a social PIN phone contact')
  })

  test('should display submission text with department info', async () => {
    await expect(submitApplicationPage.submissionText()).toContainText(`${groupName} now has this application.`)
  })

  test('should contain correct bullet point links', async () => {
    await expect(submitApplicationPage.bulletLists()).toHaveCount(2)

    await expect(submitApplicationPage.logAnotherApplicationForSamePrisonerLink()).toContainText(
      `another application for ${prisonerName}`,
    )

    await expect(submitApplicationPage.logNewApplicationLink()).toContainText('a new application')

    await expect(submitApplicationPage.viewApplicationLink(app.requestedBy.username, app.id)).toContainText(
      'this application',
    )

    await expect(submitApplicationPage.viewAllApplicationsLink()).toContainText('all applications')
  })
})
