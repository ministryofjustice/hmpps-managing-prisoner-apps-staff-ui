import type { Page } from '@playwright/test'
import { test, expect } from '../fixtures'
import auth from '../mockApis/auth'
import managingPrisonerAppsApi from '../mockApis/managingPrisonerApps'
import prisonApi from '../mockApis/prison'
import { resetStubs } from '../mockApis/wiremock'

const targetBaseUrl = process.env.PW_BASE_URL || process.env.DPS_PRISONER_URL || 'http://localhost:3007'
const isWiremock = process.env.PW_ENV === 'mock' || targetBaseUrl.includes('localhost')

type NavigationFixtures = {
  signIn: () => Promise<void>
  enterPrisonerDetails: () => Promise<void>
  selectGroup: (group: string) => Promise<void>
  selectApplicationType: (appType: string) => Promise<void>
  selectDepartment: (departmentName: string) => Promise<void>
}

const navigateToDepartmentPage = async ({
  page,
  signIn,
  enterPrisonerDetails,
  selectGroup,
  selectApplicationType,
  appTypeId,
  appTypeName,
  activeCaseLoadId,
  skipSignIn = false,
}: { page: Page } & NavigationFixtures & {
    appTypeId: number
    appTypeName: string
    activeCaseLoadId: string
    skipSignIn?: boolean
  }) => {
  if (isWiremock) {
    await resetStubs()
    await auth.stubSignIn()
    await prisonApi.stubGetCaseLoads(activeCaseLoadId)
    await managingPrisonerAppsApi.stubGetActiveAgencies()
    await prisonApi.stubGetPrisonerByPrisonerNumber('A1234AA')
    await managingPrisonerAppsApi.stubGetGroupsAndTypes()
    await managingPrisonerAppsApi.stubGetDepartments({ appType: appTypeId })
  }

  if (!skipSignIn) {
    await signIn()
  }

  await page.goto('/log/prisoner-details')
  await enterPrisonerDetails()
  await selectGroup('Pin Phone Contact Apps')
  await selectApplicationType(appTypeName)

  await expect(page).toHaveURL(/\/log\/department/)
}

test.describe('Prison locations', () => {
  test('should update the staff journey when switching prison caseload', async ({
    page,
    signIn,
    enterPrisonerDetails,
    selectGroup,
    selectApplicationType,
    selectDepartment,
  }) => {
    const baseNavigationOptions = {
      page,
      signIn,
      enterPrisonerDetails,
      selectGroup,
      selectApplicationType,
      selectDepartment,
      appTypeId: 7,
      appTypeName: 'Make a general PIN phone enquiry',
    }

    await navigateToDepartmentPage({
      ...baseNavigationOptions,
      activeCaseLoadId: 'HMI',
    })

    await selectDepartment('Business Hub')
    await expect(page).toHaveURL(/\/log\/method/)

    await navigateToDepartmentPage({
      ...baseNavigationOptions,
      activeCaseLoadId: 'PEI',
      skipSignIn: true,
    })

    await selectDepartment('Business Hub')
    await expect(page).toHaveURL(/\/log\/application-details/)
    await expect(page).not.toHaveURL(/\/log\/method/)
  })
})
