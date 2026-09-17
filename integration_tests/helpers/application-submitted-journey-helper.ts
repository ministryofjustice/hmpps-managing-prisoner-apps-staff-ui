import { expect, Page } from '@playwright/test'
import { app } from '../../server/testData'
import managingPrisonerAppsApi from '../mockApis/managingPrisonerApps'
import prisonApi from '../mockApis/prison'
import personalRelationshipsApi from '../mockApis/personalRelationships'
import DepartmentPage from '../pages/departmentPage'
import ApplicationDetailsPage from '../pages/applicationDetailsPage'
import ConfirmDetailsPage from '../pages/confirmDetailsPage'
import SubmitApplicationPage from '../pages/submitApplicationPage'

const targetBaseUrl = process.env.PW_BASE_URL || process.env.DPS_PRISONER_URL || 'http://localhost:3007'
const isWiremock = process.env.PW_ENV === 'mock' || targetBaseUrl.includes('localhost')

export type RelationshipGroup = 'SOCIAL_RELATIONSHIP' | 'OFFICIAL_RELATIONSHIP'

type NavigationFixtures = {
  resetAndSignIn: () => Promise<void>
  enterPrisonerDetails: () => Promise<void>
  selectGroup: (group: string) => Promise<void>
  selectApplicationType: (appType: string) => Promise<void>
}

type JourneyFixtures = NavigationFixtures & {
  selectLoggingMethod: (method: 'manual' | 'webcam') => Promise<void>
}

export type JourneyDefinition = {
  id: number
  name: string
  relationshipGroup?: RelationshipGroup
  details: (page: Page, appDetailsPage: ApplicationDetailsPage) => Promise<void>
}

const navigateToDepartmentPage = async ({
  page,
  resetAndSignIn,
  enterPrisonerDetails,
  selectGroup,
  selectApplicationType,
  appTypeId,
  appTypeName,
  relationshipGroup,
}: { page: Page } & NavigationFixtures & {
    appTypeId: number
    appTypeName: string
    relationshipGroup?: RelationshipGroup
  }) => {
  await resetAndSignIn()

  if (isWiremock) {
    await prisonApi.stubGetPrisonerByPrisonerNumber('A1234AA')
    await managingPrisonerAppsApi.stubGetGroupsAndTypes()
    await managingPrisonerAppsApi.stubGetDepartments({ appType: appTypeId })
    if (relationshipGroup) {
      await personalRelationshipsApi.stubGetRelationships(relationshipGroup)
    }
  }

  await page.goto('/log/prisoner-details')
  await enterPrisonerDetails()
  await selectGroup('Pin Phone Contact Apps')
  await selectApplicationType(appTypeName)

  await expect(page).toHaveURL(/\/log\/department/)
}

export const APP_SUBMITTED_JOURNEYS: JourneyDefinition[] = [
  {
    id: 1,
    name: 'Add emergency phone credit',
    relationshipGroup: 'SOCIAL_RELATIONSHIP',
    details: async (_page, appDetailsPage) => {
      await appDetailsPage.fillEmergencyPhoneCredit()
    },
  },
  {
    id: 2,
    name: 'Add an official PIN phone contact',
    relationshipGroup: 'OFFICIAL_RELATIONSHIP',
    details: async (_page, appDetailsPage) => {
      await appDetailsPage.fillOfficialPinPhoneContact()
    },
  },
  {
    id: 3,
    name: 'Add a social PIN phone contact',
    relationshipGroup: 'SOCIAL_RELATIONSHIP',
    details: async (_page, appDetailsPage) => {
      await appDetailsPage.firstNightOrEarlyDaysCentreNo().check({ force: true })
      await appDetailsPage.fillSocialPinPhoneContact()
    },
  },
  {
    id: 4,
    name: 'Remove a PIN phone contact',
    relationshipGroup: 'SOCIAL_RELATIONSHIP',
    details: async (_page, appDetailsPage) => {
      await appDetailsPage.fillRemovePinPhoneContact()
    },
  },
  {
    id: 5,
    name: 'Swap Visiting Orders (VOs) for PIN Credit',
    details: async (_page, appDetailsPage) => {
      await appDetailsPage.textArea().fill('Need to swap 2 visiting orders for phone credit')
    },
  },
  {
    id: 6,
    name: 'Supply list of contacts',
    details: async (_page, appDetailsPage) => {
      await appDetailsPage.textArea().fill('Please provide full contact list for prisoner')
    },
  },
  {
    id: 7,
    name: 'Make a general PIN phone enquiry',
    details: async (_page, appDetailsPage) => {
      await appDetailsPage.textArea().fill('General enquiry details for PIN phone account')
    },
  },
]

export const runApplicationSubmissionJourney = async ({
  page,
  resetAndSignIn,
  enterPrisonerDetails,
  selectGroup,
  selectApplicationType,
  selectLoggingMethod,
  journey,
}: { page: Page } & JourneyFixtures & {
    journey: JourneyDefinition
  }) => {
  const { id, name, relationshipGroup, details } = journey

  await navigateToDepartmentPage({
    page,
    resetAndSignIn,
    enterPrisonerDetails,
    selectGroup,
    selectApplicationType,
    appTypeId: id,
    appTypeName: name,
    relationshipGroup,
  })

  const departmentPage = new DepartmentPage(page)
  await page.getByRole('radio', { name: 'Business Hub' }).check()
  await departmentPage.continueButton().click()

  if (
    page.url().includes('/log/method') ||
    (await page
      .locator('input[name="loggingMethod"]')
      .isVisible()
      .catch(() => false))
  ) {
    await selectLoggingMethod('manual')
  }

  await expect(page).toHaveURL(/\/log\/application-details/)

  const applicationDetailsPage = new ApplicationDetailsPage(page)
  await details(page, applicationDetailsPage)
  await applicationDetailsPage.continueButton().click()

  await expect(page).toHaveURL(/\/log\/confirm/)

  const confirmDetailsPage = new ConfirmDetailsPage(page)
  await expect(confirmDetailsPage.applicationTypeSummary()).toContainText(name)
  await expect(confirmDetailsPage.summaryRowByLabel('Department')).toContainText('Business Hub')

  const submittedApp = {
    ...app,
    id: '13d2c453-be11-44a8-9861-21fd8ae6e911',
    requestedBy: { ...app.requestedBy, username: 'A1234AA' },
    applicationType: { id, name },
  }

  if (isWiremock) {
    await managingPrisonerAppsApi.stubSubmitPrisonerApp({ app: submittedApp })
    await managingPrisonerAppsApi.stubGetPrisonerApp({ app: submittedApp })
  }

  await confirmDetailsPage.submitApplicationButton().click()
  await expect(page).toHaveURL(/\/log\/submit\/A1234AA\//)

  const submittedPage = new SubmitApplicationPage(page)
  await submittedPage.checkOnPage()
  await expect(submittedPage.panelBody()).toContainText(name)
}
