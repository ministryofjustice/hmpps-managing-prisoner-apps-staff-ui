import { expect } from '@playwright/test'
import { test } from '../fixtures'
import auth from '../../mockApis/auth'
import managingPrisonerAppsApi from '../../mockApis/managingPrisonerApps'
import documentManagement from '../../mockApis/documentManagement'
import { resetStubs } from '../../mockApis/wiremock'
import { app, appWithPhotos } from '../../../server/testData'
import applicationTypesData from '../../fixtures/applicationTypes.json'
import ViewApplicationPage from '../pages/viewApplicationPage'

const targetBaseUrl = process.env.PW_BASE_URL || process.env.DPS_PRISONER_URL || 'http://localhost:3007'
const isWiremock = process.env.PW_ENV === 'mock' || targetBaseUrl.includes('localhost')

const { applicationTypes } = applicationTypesData
const filteredApplicationTypes = applicationTypes.filter(type => type.id !== 6)

// Test each application type except type 6
filteredApplicationTypes.forEach(({ name, id }) => {
  test.describe(`View Application Page - ${name}`, () => {
    const application = { ...app, applicationType: { id, name } }

    test.beforeEach(async ({ page, signIn }) => {
      if (isWiremock) {
        await resetStubs()
        await auth.stubSignIn()
        await managingPrisonerAppsApi.stubGetGroupsAndTypes()
        await managingPrisonerAppsApi.stubGetPrisonerApp({ app: application })
      }
      await signIn()
      await page.goto(`/applications/${application.requestedBy.username}/${application.id}`)
    })

    test('should display the correct page title', async ({ page }) => {
      const title = await page.locator('h1').innerText()
      expect(title).toContain(name)
    })

    test('should display the application type correctly', async ({ page }) => {
      const viewPage = new ViewApplicationPage(page)
      await expect(viewPage.applicationType()).toContainText(name)
    })

    test('should display the application status', async ({ page }) => {
      const viewPage = new ViewApplicationPage(page)
      await expect(viewPage.applicationStatus()).toBeVisible()
    })

    test('should display the department handling the application', async ({ page }) => {
      const viewPage = new ViewApplicationPage(page)
      await expect(viewPage.department()).toBeVisible()
    })

    test('should display the prisoner name', async ({ page }) => {
      const viewPage = new ViewApplicationPage(page)
      await expect(viewPage.prisonerName()).toBeVisible()
    })

    test('should display the prisoner cell location', async ({ page }) => {
      const viewPage = new ViewApplicationPage(page)
      await expect(viewPage.prisonerCellLocation()).toBeVisible()
    })

    test('should display the date the application was submitted', async ({ page }) => {
      const viewPage = new ViewApplicationPage(page)
      await expect(viewPage.submittedOn()).toBeVisible()
    })

    test('should display View profile and View alerts links opening in a new tab', async ({ page }) => {
      const viewPage = new ViewApplicationPage(page)
      await expect(viewPage.viewProfileLink()).toBeVisible()
      await expect(viewPage.viewProfileLink()).toHaveAttribute('target', '_blank')
      await expect(viewPage.viewProfileLink()).toHaveAttribute('rel', 'noopener noreferrer')

      await expect(viewPage.viewAlertsLink()).toBeVisible()
      await expect(viewPage.viewAlertsLink()).toHaveAttribute('target', '_blank')
      await expect(viewPage.viewAlertsLink()).toHaveAttribute('rel', 'noopener noreferrer')
    })

    test('should display the incentive level', async ({ page }) => {
      const viewPage = new ViewApplicationPage(page)
      await expect(viewPage.summaryListRowKey('Incentive level')).toBeVisible()
    })

    test('should allow navigating to the Comments section', async ({ page }) => {
      const viewPage = new ViewApplicationPage(page)
      await expect(viewPage.commentsTab()).toBeVisible()
      await expect(viewPage.commentsTab()).toContainText('Comments')
      await expect(viewPage.commentsTab()).toHaveAttribute(
        'href',
        '/applications/G123456/13d2c453-be11-44a8-9861-21fd8ae6e911/comments',
      )
    })

    test('should allow navigating to the Action and Reply section', async ({ page }) => {
      const viewPage = new ViewApplicationPage(page)
      await expect(viewPage.actionAndReplyTab()).toBeVisible()
      await expect(viewPage.actionAndReplyTab()).toContainText('Action and reply')
      await expect(viewPage.actionAndReplyTab()).toHaveAttribute(
        'href',
        '/applications/G123456/13d2c453-be11-44a8-9861-21fd8ae6e911/reply',
      )
    })

    test('should allow navigating to the History section', async ({ page }) => {
      const viewPage = new ViewApplicationPage(page)
      await expect(viewPage.historyTab()).toBeVisible()
      await expect(viewPage.historyTab()).toContainText('History')
      await expect(viewPage.historyTab()).toHaveAttribute(
        'href',
        '/applications/G123456/13d2c453-be11-44a8-9861-21fd8ae6e911/history',
      )
    })
  })
})

test.describe('View Application Page - With Photos', () => {
  const applicationWithPhotos = {
    ...appWithPhotos,
    applicationType: { id: 7, name: 'Make a general PIN phone enquiry' },
  }

  test.beforeEach(async ({ page, signIn }) => {
    if (isWiremock) {
      await resetStubs()
      await auth.stubSignIn()
      await managingPrisonerAppsApi.stubGetGroupsAndTypes()
      await managingPrisonerAppsApi.stubGetPrisonerApp({ app: applicationWithPhotos })
      await documentManagement.stubGetDocument({ documentUuid: 'uuid-1234' })
      await documentManagement.stubGetDocument({ documentUuid: 'uuid-9876' })
      await documentManagement.stubDownloadDocument({ documentUuid: 'uuid-1234' })
      await documentManagement.stubDownloadDocument({ documentUuid: 'uuid-9876' })
    }
    await signIn()
    await page.goto(`/applications/${applicationWithPhotos.requestedBy.username}/${applicationWithPhotos.id}`)
  })

  test('should display Image 1 and Image 2 (optional) labels', async ({ page }) => {
    const viewPage = new ViewApplicationPage(page)
    await expect(viewPage.image1Label()).toBeVisible()
    await expect(viewPage.image2Label()).toBeVisible()
  })

  test('should make images clickable links that open in new tab', async ({ page }) => {
    await expect(page.locator('a[target="_blank"][rel="noopener noreferrer"]').first()).toHaveAttribute('href', /http/)
  })

  test('should display Additional details field', async ({ page }) => {
    const viewPage = new ViewApplicationPage(page)
    await expect(viewPage.additionalDetailsLabel()).toBeVisible()
  })

  test('should not display Change button when photos exist', async ({ page }) => {
    const viewPage = new ViewApplicationPage(page)
    await expect(viewPage.changeButton()).not.toBeVisible()
  })
})

test.describe('View Application Page - Without Photos', () => {
  const applicationWithoutPhotos = {
    ...app,
    applicationType: { id: 3, name: 'Add a social PIN phone contact' },
    files: [],
  }

  test.beforeEach(async ({ page, signIn }) => {
    if (isWiremock) {
      await resetStubs()
      await auth.stubSignIn()
      await managingPrisonerAppsApi.stubGetGroupsAndTypes()
      await managingPrisonerAppsApi.stubGetPrisonerApp({ app: applicationWithoutPhotos })
    }
    await signIn()
    await page.goto(`/applications/${applicationWithoutPhotos.requestedBy.username}/${applicationWithoutPhotos.id}`)
  })

  test('should not display image labels when no photos', async ({ page }) => {
    const viewPage = new ViewApplicationPage(page)
    await expect(viewPage.image1Label()).not.toBeVisible()
    await expect(viewPage.image2Label()).not.toBeVisible()
  })

  test('should not display any image thumbnails', async ({ page }) => {
    const viewPage = new ViewApplicationPage(page)
    await expect(viewPage.thumbnailImages()).not.toBeVisible()
  })

  test('should not display Additional details field (photo-specific field)', async ({ page }) => {
    const viewPage = new ViewApplicationPage(page)
    await expect(viewPage.additionalDetailsLabel()).not.toBeVisible()
  })
})
