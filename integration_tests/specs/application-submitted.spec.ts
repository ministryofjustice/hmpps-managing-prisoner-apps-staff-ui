import { test, expect } from '../fixtures'
import { app } from '../../server/testData'
import auth from '../mockApis/auth'
import managingPrisonerAppsApi from '../mockApis/managingPrisonerApps'
import prisonApi from '../mockApis/prison'
import { resetStubs } from '../mockApis/wiremock'

const targetBaseUrl = process.env.PW_BASE_URL || process.env.DPS_PRISONER_URL || 'http://localhost:3007'
const isWiremock = process.env.PW_ENV === 'mock' || targetBaseUrl.includes('localhost')

test.describe('Application Submitted Page', () => {
  const prisonerName = `${app.requestedBy.firstName} ${app.requestedBy.lastName}`
  const groupName = app.assignedGroup.name

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
  })

  test('should display the panel title and body', async ({ page }) => {
    await expect(page.locator('.govuk-panel__title')).toContainText('Application submitted')
    await expect(page.locator('.govuk-panel__body')).toContainText('Add a social PIN phone contact')
  })

  test('should display submission text with department info', async ({ page }) => {
    await expect(page.locator('.govuk-body-l')).toContainText(`${groupName} now has this application.`)
  })

  test('should contain correct bullet point links', async ({ page }) => {
    await expect(page.locator('.govuk-list--bullet')).toHaveCount(2)

    const samePrisonerLink = page.locator('a[href="/log/group?isLoggingForSamePrisoner=true"]')
    await expect(samePrisonerLink).toContainText(`another application for ${prisonerName}`)

    const newApplicationLink = page.locator('a[href="/log/prisoner-details"]')
    await expect(newApplicationLink).toContainText('a new application')

    const viewApplicationLink = page.locator(`a[href="/applications/${app.requestedBy.username}/${app.id}"]`)
    await expect(viewApplicationLink).toContainText('this application')

    const viewAllApplicationsLink = page.locator('a[href="/applications"]')
    await expect(viewAllApplicationsLink).toContainText('all applications')
  })
})
