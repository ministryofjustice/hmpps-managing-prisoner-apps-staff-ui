import { test, expect } from '../fixtures'
import {
  appSearchResponse,
  getAppsByType,
  getAppsSortedByOldest,
  app as appDetailTemplate,
} from '../../server/testData'
import auth from '../mockApis/auth'
import managingPrisonerAppsApi from '../mockApis/managingPrisonerApps'
import prisonApi from '../mockApis/prison'
import { resetStubs } from '../mockApis/wiremock'

const targetBaseUrl = process.env.PW_BASE_URL || process.env.DPS_PRISONER_URL || 'http://localhost:3007'
const isWiremock = process.env.PW_ENV === 'mock' || targetBaseUrl.includes('localhost')

test.describe('Applications List - Filter Functionality', () => {
  test.beforeEach(async ({ page, signIn }) => {
    if (isWiremock) {
      await resetStubs()
      await auth.stubSignIn()
      await prisonApi.stubGetCaseLoads('HMI')
      await prisonApi.stubGetPrisonerByPrisonerNumber('A12345')
      await managingPrisonerAppsApi.stubGetGroupsAndTypes()
      await managingPrisonerAppsApi.stubGetActiveAgencies()
      await managingPrisonerAppsApi.stubGetApps(appSearchResponse)
    }

    await signIn()
    await page.goto('/applications')
    await expect(page.getByRole('heading', { name: 'View all applications in your prison' })).toBeVisible()
  })

  test('should display applications table with correct columns', async ({ page }) => {
    await expect(page.locator('table')).toBeVisible()

    const headers = page.locator('thead th')
    await expect(headers).toHaveCount(6)
    await expect(headers.nth(0)).toContainText('Date')
    await expect(headers.nth(1)).toContainText('Application type')
    await expect(headers.nth(2)).toContainText('From')
    await expect(headers.nth(3)).toContainText('Department')
    await expect(headers.nth(4)).toContainText('Comments')
  })

  test('should display default filter values with Pending and Newest', async ({ page }) => {
    await expect(page.locator('.moj-filter')).toBeVisible()
    await expect(page.locator('input[name="status"][value="PENDING"]')).toBeChecked()
    await expect(page.locator('input[name="order"][value="newest"]')).toBeChecked()
    await expect(page.locator('input[name="order"][value="oldest"]')).not.toBeChecked()
  })

  test('should filter by order oldest', async ({ page }) => {
    const oldestResponse = getAppsSortedByOldest()

    if (isWiremock) {
      await managingPrisonerAppsApi.stubGetApps(oldestResponse.apps)
    }

    await page.locator('input[name="order"][value="oldest"]').check({ force: true })
    await page.locator('[data-test-id="submit-button"]').first().click()

    await expect(page).toHaveURL(/order=oldest/)
    await expect(page.locator('tbody tr').first().locator('td').nth(0)).toContainText('21/03/2025')
  })

  test('should filter by app type and retain filters when navigating back', async ({ page }) => {
    const filteredApps = getAppsByType(3)
    const selectedApp = filteredApps.apps[0]

    const application = {
      ...appDetailTemplate,
      id: selectedApp.id,
      requestedBy: { username: selectedApp.requestedBy },
    }

    if (isWiremock) {
      await managingPrisonerAppsApi.stubGetApps(filteredApps.apps)
    }

    await page.locator('input[name="type"][value="3"]').check({ force: true })
    await page.locator('[data-test-id="submit-button"]').first().click()

    await expect(page).toHaveURL(/type=3/)
    await expect(page.locator('tbody tr')).toHaveCount(filteredApps.apps.length)
    await expect(page.locator('tbody tr').first().locator('td').nth(1)).toContainText(selectedApp.appType.name)

    if (isWiremock) {
      await managingPrisonerAppsApi.stubGetPrisonerApp({ app: application })
      await managingPrisonerAppsApi.stubGetComments({ app: application })
      await managingPrisonerAppsApi.stubGetHistory({ app: application })
      await prisonApi.stubGetPrisonerByPrisonerNumber(application.requestedBy.username)
      await managingPrisonerAppsApi.stubGetGroupsAndTypes()
      await managingPrisonerAppsApi.stubGetActiveAgencies()
    }

    await page.locator('tbody tr').first().getByRole('link', { name: 'View' }).click()
    await expect(page).toHaveURL(new RegExp(`/applications/${application.requestedBy.username}/${application.id}`))
    await expect(page.locator('h1')).toBeVisible()

    await page.goBack()

    await expect(page).toHaveURL(/type=3/)
    await expect(page.locator('input[name="type"][value="3"]')).toBeChecked()
    await expect(page.locator('tbody tr')).toHaveCount(filteredApps.apps.length)
    await expect(page.locator('tbody tr').first().locator('td').nth(1)).toContainText(selectedApp.appType.name)
  })

  test('should clear all filters when clicking clear filters', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Clear filters' })).toBeVisible()

    if (isWiremock) {
      await managingPrisonerAppsApi.stubGetApps(appSearchResponse)
    }

    await page.getByRole('link', { name: 'Clear filters' }).click()

    await expect(page).toHaveURL(/clearFilters=true/)
    await expect(page.locator('input[name="status"][value="PENDING"]')).not.toBeChecked()
    await expect(page.locator('input[name="order"][value="newest"]')).toBeChecked()
    await expect(page.locator('input[name="order"][value="oldest"]')).not.toBeChecked()
    await expect(page.locator('input[name="type"]:checked')).toHaveCount(0)
    await expect(page.locator('.moj-filter__tag')).toHaveCount(0)
  })
})
