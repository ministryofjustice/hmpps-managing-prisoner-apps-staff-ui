import { Page } from '@playwright/test'
import auth from '../../mockApis/auth'
import managingPrisonerAppsApi from '../../mockApis/managingPrisonerApps'
import documentManagement from '../../mockApis/documentManagement'
import prisonApi from '../../mockApis/prison'
import { resetStubs } from '../../mockApis/wiremock'
import { app, appWithPhotos } from '../../../server/testData'
import applicationTypesData from '../../fixtures/applicationTypes.json'

const targetBaseUrl = process.env.PW_BASE_URL || process.env.DPS_PRISONER_URL || 'http://localhost:3007'
export const isWiremock = process.env.PW_ENV === 'mock' || targetBaseUrl.includes('localhost')

const { applicationTypes } = applicationTypesData
export const filteredApplicationTypes = applicationTypes.filter(type => type.id !== 6)

export const applicationWithPhotos = {
  ...appWithPhotos,
  applicationType: { id: 7, name: 'Make a general PIN phone enquiry' },
}

export const applicationWithoutPhotos = {
  ...app,
  applicationType: { id: 3, name: 'Add a social PIN phone contact' },
  files: [],
}

export async function visitApplicationPage({
  page,
  signIn,
  application,
  documentUuids = [],
}: {
  page: Page
  signIn: () => Promise<void>
  application: typeof app
  documentUuids?: string[]
}) {
  if (isWiremock) {
    await resetStubs()
    await auth.stubSignIn()
    await prisonApi.stubGetCaseLoads()
    await managingPrisonerAppsApi.stubGetGroupsAndTypes()
    await managingPrisonerAppsApi.stubGetPrisonerApp({ app: application })
    await Promise.all(
      documentUuids.flatMap(uuid => [
        documentManagement.stubGetDocument({ documentUuid: uuid }),
        documentManagement.stubDownloadDocument({ documentUuid: uuid }),
      ]),
    )
  }
  await signIn()
  await page.goto(`/applications/${application.requestedBy.username}/${application.id}`)
}
