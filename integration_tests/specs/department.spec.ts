import { Page } from '@playwright/test'
import { test, expect } from '../fixtures'
import auth from '../mockApis/auth'
import managingPrisonerAppsApi from '../mockApis/managingPrisonerApps'
import prisonApi from '../mockApis/prison'
import personalRelationshipsApi from '../mockApis/personalRelationships'
import { resetStubs } from '../mockApis/wiremock'
import departmentsFixture from '../fixtures/departments.json'
import DepartmentPage from '../pages/departmentPage'

const targetBaseUrl = process.env.PW_BASE_URL || process.env.DPS_PRISONER_URL || 'http://localhost:3007'
const isWiremock = process.env.PW_ENV === 'mock' || targetBaseUrl.includes('localhost')

type NavigationFixtures = {
  signIn: () => Promise<void>
  enterPrisonerDetails: () => Promise<void>
  selectGroup: (group: string) => Promise<void>
  selectApplicationType: (appType: string) => Promise<void>
}

type RelationshipGroup = 'SOCIAL_RELATIONSHIP' | 'OFFICIAL_RELATIONSHIP'

const navigateToDepartmentPage = async ({
  page,
  signIn,
  enterPrisonerDetails,
  selectGroup,
  selectApplicationType,
  appTypeId,
  appTypeName,
  activeCaseLoadId = 'HMI',
  relationshipGroup,
}: { page: Page } & NavigationFixtures & {
    appTypeId: number
    appTypeName: string
    activeCaseLoadId?: string
    relationshipGroup?: RelationshipGroup
  }) => {
  if (isWiremock) {
    await resetStubs()
    await auth.stubSignIn()
    await prisonApi.stubGetCaseLoads(activeCaseLoadId)
    await prisonApi.stubGetPrisonerByPrisonerNumber('A1234AA')
    await managingPrisonerAppsApi.stubGetGroupsAndTypes()
    await managingPrisonerAppsApi.stubGetDepartments({ appType: appTypeId })
    if (relationshipGroup) {
      await personalRelationshipsApi.stubGetRelationships(relationshipGroup)
    }
  }

  await signIn()
  await page.goto('/log/prisoner-details')
  await enterPrisonerDetails()
  await selectGroup('Pin Phone Contact Apps')
  await selectApplicationType(appTypeName)

  await expect(page).toHaveURL(/\/log\/department/)
}

test.describe('Department Page', () => {
  test('should display the page title', async ({
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
    await expect(page).toHaveTitle(/Select department/)
    await departmentPage.checkOnPage()
  })

  test('should display the back link', async ({
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

    await Promise.all(
      departments.map(async (dept, idx) => {
        const row = departmentPage.radioButtons().nth(idx)
        await expect(row.locator('label.govuk-label.govuk-radios__label')).toHaveText(dept.name)
        await expect(row.locator('input.govuk-radios__input')).toHaveAttribute('value', dept.name)
      }),
    )
  })

  test('should display the continue button', async ({
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
})
