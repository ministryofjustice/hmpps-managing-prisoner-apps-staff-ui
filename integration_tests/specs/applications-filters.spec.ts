import { test, expect } from '../fixtures'
import {
  appSearchResponse,
  getAppsByType,
  getAppsSortedByOldest,
  app as appDetailTemplate,
} from '../../server/testData'
import { ApplicationSearchPayload } from '../../server/@types/managingAppsApi'
import {
  businessHubId,
  detailForListApp,
  filterApplication,
  filteredDetailListApp,
  filterPrisoner,
  omuId,
} from '../fixtures/applicationFilters'
import {
  expectSearch,
  setupApplicationsFilterMocks,
  stubFilteredAppDetails,
  stubFilteredApps,
} from '../helpers/applicationsFilters'
import managingPrisonerAppsApi from '../mockApis/managingPrisonerApps'
import prisonApi from '../mockApis/prison'
import ViewApplicationPage from '../pages/viewApplicationPage'

const targetBaseUrl = process.env.PW_BASE_URL || process.env.DPS_PRISONER_URL || 'http://localhost:3007'
const isWiremock = process.env.PW_ENV === 'mock' || targetBaseUrl.includes('localhost')

test.describe('Applications List - Filter Functionality', () => {
  test.beforeEach(async ({ page, signIn, applicationsListPage }) => {
    if (isWiremock) {
      await setupApplicationsFilterMocks()
    }

    await signIn()
    await page.goto('/applications')
    await applicationsListPage.checkOnPage()
  })

  test('should display applications table with correct columns', async ({ applicationsListPage }) => {
    await expect(applicationsListPage.table()).toBeVisible()

    const headers = applicationsListPage.tableHeaders()
    await expect(headers).toHaveCount(6)
    await expect(headers.nth(0)).toContainText('Date')
    await expect(headers.nth(1)).toContainText('Application type')
    await expect(headers.nth(2)).toContainText('From')
    await expect(headers.nth(3)).toContainText('Status')
    await expect(headers.nth(4)).toContainText('Messages')
  })

  test('should display default filter values with New, In Progress and Newest', async ({ applicationsListPage }) => {
    await expect(applicationsListPage.filterPanel()).toBeVisible()
    await expect(applicationsListPage.filterCheckbox('New')).toBeChecked()
    await expect(applicationsListPage.filterCheckbox('In progress')).toBeChecked()
    await expect(applicationsListPage.order('Newest')).toBeChecked()
    await expect(applicationsListPage.order('Oldest')).not.toBeChecked()
  })

  test('should filter by order oldest', async ({ page, applicationsListPage }) => {
    const oldestResponse = getAppsSortedByOldest()

    if (isWiremock) {
      await managingPrisonerAppsApi.stubGetApps(oldestResponse.apps)
    }

    await applicationsListPage.order('Oldest').check()
    await applicationsListPage.applyFilters()

    await expect(page).toHaveURL(/order=oldest/)
    await expect(applicationsListPage.firstRowCell(0)).toContainText('21/03/2025')
    if (isWiremock) await expectSearch({ oldestAppFirst: true })
  })

  for (const { label, status, result } of [
    { label: 'New', status: 'NEW', result: 'New' },
    { label: 'In progress', status: 'IN_PROGRESS', result: 'In progress' },
  ] as const) {
    test(`should apply the ${label} status filter`, async ({ applicationsListPage }) => {
      test.skip(!isWiremock, 'Uses controlled application search results')
      const payload = { status: [status] }
      await stubFilteredApps(payload, [{ ...filterApplication, status }])

      await applicationsListPage.filterCheckbox('New').setChecked(status === 'NEW')
      await applicationsListPage.filterCheckbox('In progress').setChecked(status === 'IN_PROGRESS')
      await applicationsListPage.applyFilters()

      await applicationsListPage.expectSingleResult()
      await expect(applicationsListPage.firstRowCell(3)).toContainText(result)
      await expect(applicationsListPage.filterCheckbox(label)).toBeChecked()
      await expectSearch(payload)
    })
  }

  test('should apply closed decisions and retain only the selected decision', async ({ applicationsListPage }) => {
    test.skip(!isWiremock, 'Uses controlled application search results')
    const payload: Partial<ApplicationSearchPayload> = { status: ['DECLINED'] }
    await stubFilteredApps(payload, [{ ...filterApplication, status: 'DECLINED' }])

    await applicationsListPage.filterCheckbox('New').uncheck()
    await applicationsListPage.filterCheckbox('In progress').uncheck()
    await applicationsListPage.filterCheckbox('Closed').check()
    await expect(applicationsListPage.filterCheckbox('Approved')).toBeChecked()
    await expect(applicationsListPage.filterCheckbox('Declined')).toBeChecked()
    await expect(applicationsListPage.filterCheckbox('Rejected')).toBeChecked()
    await applicationsListPage.filterCheckbox('Approved').uncheck()
    await applicationsListPage.filterCheckbox('Rejected').uncheck()
    await applicationsListPage.applyFilters('bottom')

    await applicationsListPage.expectSingleResult()
    await expect(applicationsListPage.firstRowCell(3)).toContainText('Declined')
    await expect(applicationsListPage.filterCheckbox('Closed')).toBeChecked()
    await expect(applicationsListPage.filterCheckbox('Declined')).toBeChecked()
    await expect(applicationsListPage.filterCheckbox('Approved')).not.toBeChecked()
    await expect(applicationsListPage.filterCheckbox('Rejected')).not.toBeChecked()
    await expectSearch(payload)
  })

  test('should search for and filter by prisoner', async ({ applicationsListPage }) => {
    test.skip(!isWiremock, 'Uses a controlled prisoner search')
    const payload = { requestedBy: [filterPrisoner.prisonerId] }
    await managingPrisonerAppsApi.stubSearchPrisoners([filterPrisoner])
    await prisonApi.stubGetPrisonerByPrisonerNumber(filterPrisoner.prisonerId)
    await stubFilteredApps(payload, [{ ...filterApplication, requestedBy: filterPrisoner.prisonerId }])

    await applicationsListPage.selectPrisoner('John', 'John Smith (A1234AA)')
    await applicationsListPage.applyFilters()

    await applicationsListPage.expectSingleResult()
    await expect(applicationsListPage.rows().first()).toContainText(filterPrisoner.prisonerId)
    await expect(applicationsListPage.prisoner()).toHaveValue('John Smith (A1234AA)')
    await expectSearch(payload)
  })

  test('should apply the first night or early days centre filter', async ({ applicationsListPage }) => {
    test.skip(!isWiremock, 'Uses controlled application search results')
    const payload = { firstNightCenter: true }
    await stubFilteredApps(payload)

    const priority = applicationsListPage.filterCheckbox(/First night or early days centre/)
    await priority.check()
    await applicationsListPage.applyFilters()

    await applicationsListPage.expectSingleResult()
    await expect(priority).toBeChecked()
    await expect(applicationsListPage.selectedFilters()).toContainText([
      'New',
      'In progress',
      'First night or early days centre',
    ])
    await expectSearch(payload)
  })

  test('should apply a location filter', async ({ applicationsListPage }) => {
    test.skip(!isWiremock, 'Requires the mock location filter')
    const payload = { locations: ['wing-a'] }
    await stubFilteredApps(payload)

    await applicationsListPage.filterCheckbox('A Wing').check()
    await applicationsListPage.applyFilters()

    await applicationsListPage.expectSingleResult()
    await expect(applicationsListPage.filterCheckbox('A Wing')).toBeChecked()
    await expect(applicationsListPage.selectedFilter('A Wing')).toBeVisible()
    await expectSearch(payload)
  })

  for (const { wing, locationId, cellLocation } of [
    { wing: 'A Wing', locationId: 'wing-a', cellLocation: 'A-1-123' },
    { wing: 'B Wing', locationId: 'wing-b', cellLocation: 'B-1-456' },
  ]) {
    test(`should show the full cell location on an application filtered by ${wing}`, async ({
      page,
      applicationsListPage,
    }) => {
      test.skip(!isWiremock, 'Requires controlled results and the mock location filter')
      const payload = { locations: [locationId] }
      const application = detailForListApp(filteredDetailListApp, cellLocation)
      await stubFilteredApps(payload, [filteredDetailListApp])
      await stubFilteredAppDetails(application)

      await applicationsListPage.filterCheckbox(wing).check()
      await applicationsListPage.applyFilters()
      await expect(applicationsListPage.rows()).toHaveCount(1)
      await expectSearch(payload)
      await applicationsListPage.viewFirstApplication()

      await expect(page).toHaveURL(new RegExp(`/applications/${application.requestedBy.username}/${application.id}\\?`))
      const viewPage = new ViewApplicationPage(page)
      await viewPage.checkOnPage()
      await expect(viewPage.prisonerCellLocation()).toHaveText(cellLocation)

      await page.getByRole('link', { name: 'View all applications' }).click()
      await expect(applicationsListPage.filterCheckbox(wing)).toBeChecked()
    })
  }

  test('should apply multiple departments and remove an individual filter', async ({ applicationsListPage }) => {
    test.skip(!isWiremock, 'Uses controlled application search results')
    const payload = { assignedGroups: [businessHubId, omuId] }
    await stubFilteredApps(payload)

    await applicationsListPage.filterCheckbox(/Business Hub/).check()
    await applicationsListPage.filterCheckbox(/OMU/).check()
    await applicationsListPage.applyFilters()

    await applicationsListPage.expectSingleResult()
    await expect(applicationsListPage.filterCheckbox(/Business Hub/)).toBeChecked()
    await expect(applicationsListPage.filterCheckbox(/OMU/)).toBeChecked()
    await expectSearch(payload)

    await stubFilteredApps({ assignedGroups: [omuId] })
    await applicationsListPage.selectedFilter('Business Hub').click()
    await applicationsListPage.expectSingleResult()
    await expect(applicationsListPage.filterCheckbox(/Business Hub/)).not.toBeChecked()
    await expect(applicationsListPage.filterCheckbox(/OMU/)).toBeChecked()
    await expectSearch({ assignedGroups: [omuId] })
  })

  test('should search application types and apply a selected type', async ({ applicationsListPage }) => {
    test.skip(!isWiremock, 'Uses controlled application search results')
    const payload = { applicationTypes: [3] }
    await stubFilteredApps(payload, getAppsByType(3).apps)

    await applicationsListPage.applicationTypeSearch().fill('social')
    const social = applicationsListPage.filterCheckbox(/Add a social PIN phone contact/)
    const swap = applicationsListPage.filterCheckbox(/Swap Visiting Orders/)
    await expect(social).toBeVisible()
    await expect(swap).not.toBeVisible()
    await social.check()
    await applicationsListPage.applyFilters('bottom')

    await expect(applicationsListPage.rows()).toHaveCount(1)
    await expect(applicationsListPage.rows().first()).toContainText('Add a social PIN phone contact')
    await expect(social).toBeChecked()
    await expect(applicationsListPage.applicationTypeSearch()).toHaveValue('social')
    await expectSearch(payload)
  })

  test('should apply combined filters and clear them all', async ({ applicationsListPage }) => {
    test.skip(!isWiremock, 'Requires controlled results and the mock location filter')
    const payload: Partial<ApplicationSearchPayload> = {
      status: ['NEW'],
      oldestAppFirst: true,
      firstNightCenter: true,
      locations: ['wing-a'],
      assignedGroups: [businessHubId],
      applicationTypes: [5],
    }
    await stubFilteredApps(payload)

    await applicationsListPage.order('Oldest').check()
    await applicationsListPage.filterCheckbox('In progress').uncheck()
    await applicationsListPage.filterCheckbox(/First night or early days centre/).check()
    await applicationsListPage.filterCheckbox('A Wing').check()
    await applicationsListPage.filterCheckbox(/Business Hub/).check()
    await applicationsListPage.filterCheckbox(/Swap Visiting Orders/).check()
    await applicationsListPage.applyFilters()

    await applicationsListPage.expectSingleResult()
    await expectSearch(payload)
    await applicationsListPage.clearFilters()

    await expect(applicationsListPage.rows()).toHaveCount(appSearchResponse.apps.length)
    await expect(applicationsListPage.order('Newest')).toBeChecked()
    await expect(applicationsListPage.checkedFilters('status')).toHaveCount(0)
    await expect(applicationsListPage.checkedFilters('priority')).toHaveCount(0)
    await expect(applicationsListPage.checkedFilters('location')).toHaveCount(0)
    await expect(applicationsListPage.checkedFilters('group')).toHaveCount(0)
    await expect(applicationsListPage.checkedFilters('type')).toHaveCount(0)
    await expect(applicationsListPage.selectedFilters()).toHaveCount(0)
    await expectSearch(
      {
        page: 1,
        size: 10,
        status: ['NEW', 'IN_PROGRESS', 'APPROVED', 'DECLINED', 'REJECTED'],
        oldestAppFirst: false,
      },
      true,
    )
  })

  for (const { status, label } of [
    { status: 'NEW', label: 'New' },
    { status: 'IN_PROGRESS', label: 'In progress' },
    { status: 'APPROVED', label: 'Approved' },
    { status: 'DECLINED', label: 'Declined' },
    { status: 'REJECTED', label: 'Rejected' },
  ] as const) {
    test(`should verify filtered ${label} application details and retain filters`, async ({
      page,
      applicationsListPage,
    }) => {
      test.skip(!isWiremock, 'Requires controlled results and the mock location filter')
      const listApp = { ...filteredDetailListApp, status }
      const application = detailForListApp(listApp)
      const payload: Partial<ApplicationSearchPayload> = {
        status: [status],
        oldestAppFirst: true,
        requestedBy: [filterPrisoner.prisonerId],
        firstNightCenter: true,
        locations: ['wing-a'],
        assignedGroups: [businessHubId],
        applicationTypes: [3],
      }
      await managingPrisonerAppsApi.stubSearchPrisoners([filterPrisoner])
      await stubFilteredApps(payload, [listApp])
      await stubFilteredAppDetails(application)

      await applicationsListPage.order('Oldest').check()
      await applicationsListPage.filterCheckbox('New').setChecked(status === 'NEW')
      await applicationsListPage.filterCheckbox('In progress').setChecked(status === 'IN_PROGRESS')
      if (status !== 'NEW' && status !== 'IN_PROGRESS') {
        await applicationsListPage.filterCheckbox('Closed').check()
        await applicationsListPage.filterCheckbox('Approved').setChecked(label === 'Approved')
        await applicationsListPage.filterCheckbox('Declined').setChecked(label === 'Declined')
        await applicationsListPage.filterCheckbox('Rejected').setChecked(label === 'Rejected')
      }
      await applicationsListPage.selectPrisoner('John', 'John Smith (A1234AA)')
      await applicationsListPage.filterCheckbox(/First night or early days centre/).check()
      await applicationsListPage.filterCheckbox('A Wing').check()
      await applicationsListPage.filterCheckbox(/Business Hub/).check()
      await applicationsListPage.filterCheckbox(/Add a social PIN phone contact/).check()
      await applicationsListPage.applyFilters()

      await expect(applicationsListPage.rows()).toHaveCount(1)
      await expectSearch(payload)
      await applicationsListPage.viewFirstApplication()
      await expect(page).toHaveURL(new RegExp(`/applications/${filterPrisoner.prisonerId}/${application.id}\\?`))

      const viewPage = new ViewApplicationPage(page)
      await viewPage.checkOnPage()
      await expect(viewPage.applicationStatus()).toHaveText(label)
      await expect(viewPage.prisonerName()).toContainText('John Smith (A1234AA)')
      await expect(viewPage.prisonerCellLocation()).toHaveText('A-1-123')
      await expect(viewPage.firstNightCentre()).toHaveText('Yes')
      await expect(viewPage.department()).toHaveText('Business Hub')
      await expect(viewPage.applicationType()).toHaveText('Add a social PIN phone contact')
      await expect(viewPage.submittedOn()).toHaveText('23 March 2025')

      await page.getByRole('link', { name: 'View all applications' }).click()
      await expect(applicationsListPage.order('Oldest')).toBeChecked()
      await expect(applicationsListPage.filterCheckbox(label)).toBeChecked()
      await expect(applicationsListPage.prisoner()).toHaveValue('John Smith (A1234AA)')
      await expect(applicationsListPage.filterCheckbox(/First night or early days centre/)).toBeChecked()
      await expect(applicationsListPage.filterCheckbox('A Wing')).toBeChecked()
      await expect(applicationsListPage.filterCheckbox(/Business Hub/)).toBeChecked()
      await expect(applicationsListPage.filterCheckbox(/Add a social PIN phone contact/)).toBeChecked()
      await expect(applicationsListPage.rows()).toHaveCount(1)
    })
  }

  for (const { order, oldestAppFirst, expectedListDate, expectedDetailDate } of [
    { order: 'Newest', oldestAppFirst: false, expectedListDate: '24/03/2025', expectedDetailDate: '24 March 2025' },
    { order: 'Oldest', oldestAppFirst: true, expectedListDate: '21/03/2025', expectedDetailDate: '21 March 2025' },
  ] as const) {
    test(`should open the first application in ${order.toLowerCase()} order`, async ({
      page,
      applicationsListPage,
    }) => {
      test.skip(!isWiremock, 'Uses controlled application search results')
      const apps = oldestAppFirst ? getAppsSortedByOldest().apps : appSearchResponse.apps
      const application = detailForListApp(apps[0])
      await stubFilteredApps({ oldestAppFirst }, apps)
      await stubFilteredAppDetails(application)

      await applicationsListPage.order(order).check()
      await applicationsListPage.applyFilters()
      await expectSearch({ oldestAppFirst })
      await expect(applicationsListPage.rows()).toHaveCount(apps.length)
      await expect(applicationsListPage.firstRowCell(0)).toHaveText(expectedListDate)
      await applicationsListPage.viewFirstApplication()

      await expect(page).toHaveURL(new RegExp(`/applications/${application.requestedBy.username}/${application.id}\\?`))
      const viewPage = new ViewApplicationPage(page)
      await viewPage.checkOnPage()
      await expect(viewPage.submittedOn()).toHaveText(expectedDetailDate)
    })
  }

  test('should filter by app type and retain filters when navigating back', async ({ page, applicationsListPage }) => {
    const filteredApps = getAppsByType(3)
    const selectedApp = filteredApps.apps[0]

    const application = {
      ...appDetailTemplate,
      id: selectedApp.id,
      requestedBy: {
        ...appDetailTemplate.requestedBy,
        username: selectedApp.requestedBy,
      },
    }

    if (isWiremock) {
      await managingPrisonerAppsApi.stubGetApps(filteredApps.apps)
    }

    await applicationsListPage.filterCheckbox(/Add a social PIN phone contact/).check()
    await applicationsListPage.applyFilters()

    await expect(page).toHaveURL(/type=3/)
    await expect(applicationsListPage.rows()).toHaveCount(filteredApps.apps.length)
    await expect(applicationsListPage.firstRowCell(1)).toContainText(selectedApp.appType.name)

    if (isWiremock) {
      await managingPrisonerAppsApi.stubGetPrisonerApp({ app: application })
      await managingPrisonerAppsApi.stubGetComments({ app: application })
      await managingPrisonerAppsApi.stubGetHistory({ app: application })
      await prisonApi.stubGetPrisonerByPrisonerNumber(application.requestedBy.username)
      await managingPrisonerAppsApi.stubGetGroupsAndTypes()
      await managingPrisonerAppsApi.stubGetActiveAgencies()
    }

    await applicationsListPage.viewFirstApplication()
    await expect(page).toHaveURL(new RegExp(`/applications/${application.requestedBy.username}/${application.id}`))
    await expect(page.locator('h1')).toBeVisible()

    await page.goBack()

    await expect(page).toHaveURL(/type=3/)
    await expect(applicationsListPage.filterCheckbox(/Add a social PIN phone contact/)).toBeChecked()
    await expect(applicationsListPage.rows()).toHaveCount(filteredApps.apps.length)
    await expect(applicationsListPage.firstRowCell(1)).toContainText(selectedApp.appType.name)
  })

  test('should retain filters when returning via the View all applications breadcrumb', async ({
    page,
    applicationsListPage,
  }) => {
    const filteredApps = getAppsByType(3)
    const selectedApp = filteredApps.apps[0]

    const application = {
      ...appDetailTemplate,
      id: selectedApp.id,
      requestedBy: {
        ...appDetailTemplate.requestedBy,
        username: selectedApp.requestedBy,
      },
    }

    if (isWiremock) {
      await managingPrisonerAppsApi.stubGetApps(filteredApps.apps)
    }

    await applicationsListPage.filterCheckbox(/Add a social PIN phone contact/).check()
    await applicationsListPage.applyFilters()

    await expect(page).toHaveURL(/type=3/)

    if (isWiremock) {
      await managingPrisonerAppsApi.stubGetPrisonerApp({ app: application })
      await managingPrisonerAppsApi.stubGetComments({ app: application })
      await managingPrisonerAppsApi.stubGetHistory({ app: application })
      await prisonApi.stubGetPrisonerByPrisonerNumber(application.requestedBy.username)
      await managingPrisonerAppsApi.stubGetGroupsAndTypes()
      await managingPrisonerAppsApi.stubGetActiveAgencies()
    }

    await applicationsListPage.viewFirstApplication()
    await expect(page).toHaveURL(
      new RegExp(`/applications/${application.requestedBy.username}/${application.id}\\?.*type=3`),
    )

    if (isWiremock) {
      await managingPrisonerAppsApi.stubGetApps(filteredApps.apps)
    }

    await page.getByRole('link', { name: 'View all applications' }).click()

    await expect(page).toHaveURL(/type=3/)
    await expect(applicationsListPage.filterCheckbox(/Add a social PIN phone contact/)).toBeChecked()
    await expect(applicationsListPage.rows()).toHaveCount(filteredApps.apps.length)
    await expect(applicationsListPage.firstRowCell(1)).toContainText(selectedApp.appType.name)
  })

  test('should clear all filters when clicking clear filters', async ({ page, applicationsListPage }) => {
    await expect(page.getByRole('link', { name: 'Clear filters' })).toBeVisible()

    if (isWiremock) {
      await managingPrisonerAppsApi.stubGetApps(appSearchResponse)
    }

    await applicationsListPage.clearFilters()

    await expect(page).toHaveURL(/clearFilters=true/)
    await expect(applicationsListPage.filterCheckbox('New')).not.toBeChecked()
    await expect(applicationsListPage.filterCheckbox('In progress')).not.toBeChecked()
    await expect(applicationsListPage.order('Newest')).toBeChecked()
    await expect(applicationsListPage.order('Oldest')).not.toBeChecked()
    await expect(applicationsListPage.checkedFilters('type')).toHaveCount(0)
    await expect(applicationsListPage.selectedFilters()).toHaveCount(0)
  })
})
