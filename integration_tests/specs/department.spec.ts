import { Page } from '@playwright/test'
import { test, expect } from '../fixtures'
import auth from '../mockApis/auth'
import managingPrisonerAppsApi from '../mockApis/managingPrisonerApps'
import prisonApi from '../mockApis/prison'
import { resetStubs } from '../mockApis/wiremock'
import departmentsFixture from '../fixtures/departments.json'
import DepartmentPage from '../pages/departmentPage'
import ApplicationDetailsPage from '../pages/applicationDetailsPage'
import ConfirmDetailsPage from '../pages/confirmDetailsPage'
import SubmitApplicationPage from '../pages/submitApplicationPage'
import { app } from '../../server/testData'

const targetBaseUrl = process.env.PW_BASE_URL || process.env.DPS_PRISONER_URL || 'http://localhost:3007'
const isWiremock = process.env.PW_ENV === 'mock' || targetBaseUrl.includes('localhost')

type NavigationFixtures = {
  signIn: () => Promise<void>
  enterPrisonerDetails: () => Promise<void>
  selectGroup: (group: string) => Promise<void>
  selectApplicationType: (appType: string) => Promise<void>
}

const navigateToDepartmentPage = async ({
  page,
  signIn,
  enterPrisonerDetails,
  selectGroup,
  selectApplicationType,
  appTypeId,
  appTypeName,
  activeCaseLoadId = 'HMI',
}: { page: Page } & NavigationFixtures & { appTypeId: number; appTypeName: string; activeCaseLoadId?: string }) => {
  if (isWiremock) {
    await resetStubs()
    await auth.stubSignIn()
    await prisonApi.stubGetCaseLoads(activeCaseLoadId)
    await prisonApi.stubGetPrisonerByPrisonerNumber('A1234AA')
    await managingPrisonerAppsApi.stubGetGroupsAndTypes()
    await managingPrisonerAppsApi.stubGetDepartments({ appType: appTypeId })
  }

  await signIn()
  await page.goto('/log/prisoner-details')
  await enterPrisonerDetails()
  await selectGroup('Pin Phone Contact Apps')
  await selectApplicationType(appTypeName)

  await expect(page).toHaveURL(/\/log\/department/)
}

test.describe('Department Page', () => {
  test('should display the page title', async ({ page, signIn, enterPrisonerDetails, selectGroup, selectApplicationType }) => {
    await navigateToDepartmentPage({
      page,
      signIn,
      enterPrisonerDetails,
      selectGroup,
      selectApplicationType,
      appTypeId: 7,
      appTypeName: 'Make a general PIN phone enquiry',
    })

    const departmentPage = new DepartmentPage(page)
    await expect(page).toHaveTitle(/Select department/)
    await departmentPage.checkOnPage()
  })

  test('should display the back link', async ({ page, signIn, enterPrisonerDetails, selectGroup, selectApplicationType }) => {
    await navigateToDepartmentPage({
      page,
      signIn,
      enterPrisonerDetails,
      selectGroup,
      selectApplicationType,
      appTypeId: 7,
      appTypeName: 'Make a general PIN phone enquiry',
    })

    const departmentPage = new DepartmentPage(page)
    await expect(departmentPage.backLink()).toBeVisible()
    await expect(departmentPage.backLink()).toHaveAttribute('href', '/log/application-type')
  })

  test('should display radio buttons with department names', async ({
    page,
    signIn,
    enterPrisonerDetails,
    selectGroup,
    selectApplicationType,
  }) => {
    await navigateToDepartmentPage({
      page,
      signIn,
      enterPrisonerDetails,
      selectGroup,
      selectApplicationType,
      appTypeId: 7,
      appTypeName: 'Make a general PIN phone enquiry',
    })

    const departmentPage = new DepartmentPage(page)
    const { departments } = departmentsFixture

    await expect(departmentPage.radioButtons()).toHaveCount(departments.length)

    for (const [idx, dept] of departments.entries()) {
      const row = departmentPage.radioButtons().nth(idx)
      await expect(row.locator('label.govuk-label.govuk-radios__label')).toHaveText(dept.name)
      await expect(row.locator('input.govuk-radios__input')).toHaveAttribute('value', dept.name)
    }
  })

  test('should display the continue button', async ({ page, signIn, enterPrisonerDetails, selectGroup, selectApplicationType }) => {
    await navigateToDepartmentPage({
      page,
      signIn,
      enterPrisonerDetails,
      selectGroup,
      selectApplicationType,
      appTypeId: 7,
      appTypeName: 'Make a general PIN phone enquiry',
    })

    const departmentPage = new DepartmentPage(page)
    await expect(departmentPage.continueButton()).toBeVisible()
    await expect(departmentPage.continueButton()).toContainText('Continue')
  })

  test('should show error message when no department selected', async ({
    page,
    signIn,
    enterPrisonerDetails,
    selectGroup,
    selectApplicationType,
  }) => {
    await navigateToDepartmentPage({
      page,
      signIn,
      enterPrisonerDetails,
      selectGroup,
      selectApplicationType,
      appTypeId: 7,
      appTypeName: 'Make a general PIN phone enquiry',
    })

    const departmentPage = new DepartmentPage(page)
    await departmentPage.continueButton().click()

    await expect(departmentPage.errorSummary()).toContainText('Choose a department')
    await expect(departmentPage.errorMessage()).toContainText('Choose a department')
  })

  test('should successfully select a department and redirect to logging method page', async ({
    page,
    signIn,
    enterPrisonerDetails,
    selectGroup,
    selectApplicationType,
    selectDepartment,
  }) => {
    await navigateToDepartmentPage({
      page,
      signIn,
      enterPrisonerDetails,
      selectGroup,
      selectApplicationType,
      appTypeId: 7,
      appTypeName: 'Make a general PIN phone enquiry',
    })

    await selectDepartment('Business Hub')
    await expect(page).toHaveURL(/\/log\/method/)
  })

  test('should redirect to application details page for excluded application types', async ({
    page,
    signIn,
    enterPrisonerDetails,
    selectGroup,
    selectApplicationType,
    selectDepartment,
  }) => {
    await navigateToDepartmentPage({
      page,
      signIn,
      enterPrisonerDetails,
      selectGroup,
      selectApplicationType,
      appTypeId: 2,
      appTypeName: 'Add an official PIN phone contact',
      activeCaseLoadId: 'HMI',
    })

    await selectDepartment('Business Hub')
    await expect(page).toHaveURL(/\/log\/application-details/)
    await expect(page).not.toHaveURL(/\/log\/method/)
  })

  test('should redirect to logging method page when caseload is enabled', async ({
    page,
    signIn,
    enterPrisonerDetails,
    selectGroup,
    selectApplicationType,
    selectDepartment,
  }) => {
    await navigateToDepartmentPage({
      page,
      signIn,
      enterPrisonerDetails,
      selectGroup,
      selectApplicationType,
      appTypeId: 7,
      appTypeName: 'Make a general PIN phone enquiry',
      activeCaseLoadId: 'HMI',
    })

    await selectDepartment('Business Hub')
    await expect(page).toHaveURL(/\/log\/method/)
  })

  test('should redirect to application details page when caseload is not enabled', async ({
    page,
    signIn,
    enterPrisonerDetails,
    selectGroup,
    selectApplicationType,
    selectDepartment,
  }) => {
    await navigateToDepartmentPage({
      page,
      signIn,
      enterPrisonerDetails,
      selectGroup,
      selectApplicationType,
      appTypeId: 7,
      appTypeName: 'Make a general PIN phone enquiry',
      activeCaseLoadId: 'PEI',
    })

    await selectDepartment('Business Hub')
    await expect(page).toHaveURL(/\/log\/application-details/)
    await expect(page).not.toHaveURL(/\/log\/method/)
  })

  test('should complete a full application creation journey from department selection to submission', async ({
    page,
    signIn,
    enterPrisonerDetails,
    selectGroup,
    selectApplicationType,
    selectLoggingMethod,
  }) => {
    await navigateToDepartmentPage({
      page,
      signIn,
      enterPrisonerDetails,
      selectGroup,
      selectApplicationType,
      appTypeId: 5,
      appTypeName: 'Swap Visiting Orders (VOs) for PIN Credit',
      activeCaseLoadId: 'HMI',
    })

    const departmentPage = new DepartmentPage(page)
    await page.getByRole('radio', { name: 'Business Hub' }).check()
    await departmentPage.continueButton().click()
    await expect(page).toHaveURL(/\/log\/method/)

    await selectLoggingMethod('manual')
    await expect(page).toHaveURL(/\/log\/application-details/)

    const applicationDetailsPage = new ApplicationDetailsPage(page)
    await applicationDetailsPage.textArea().fill('Need to swap 2 visiting orders for phone credit')
    await applicationDetailsPage.continueButton().click()

    await expect(page).toHaveURL(/\/log\/confirm/)

    const confirmDetailsPage = new ConfirmDetailsPage(page)
    await expect(confirmDetailsPage.applicationTypeSummary()).toContainText('Swap Visiting Orders (VOs) for PIN Credit')
    await expect(confirmDetailsPage.summaryRowByLabel('Department')).toContainText('Business Hub')

    const submittedApp = {
      ...app,
      id: '13d2c453-be11-44a8-9861-21fd8ae6e911',
      requestedBy: { ...app.requestedBy, username: 'A1234AA' },
      applicationType: { id: 5, name: 'Swap Visiting Orders (VOs) for PIN Credit' },
    }

    if (isWiremock) {
      await managingPrisonerAppsApi.stubSubmitPrisonerApp({ app: submittedApp })
      await managingPrisonerAppsApi.stubGetPrisonerApp({ app: submittedApp })
    }

    await confirmDetailsPage.submitApplicationButton().click()
    await expect(page).toHaveURL(/\/log\/submit\/A1234AA\//)

    const submitApplicationPage = new SubmitApplicationPage(page)
    await submitApplicationPage.checkOnPage()
    await expect(submitApplicationPage.panelBody()).toContainText('Swap Visiting Orders (VOs) for PIN Credit')
  })
})
