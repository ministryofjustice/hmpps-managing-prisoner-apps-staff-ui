import { expect, test } from '../fixtures'
import ViewApplicationPage from '../pages/viewApplicationPage'
import { applicationWithPhotos, visitApplicationPage } from './view-applicationTestUtils'

test.describe('View Application Page - With Photos', () => {
  test.beforeEach(async ({ page, signIn }) => {
    await visitApplicationPage({
      page,
      signIn,
      application: applicationWithPhotos,
      documentUuids: ['uuid-1234', 'uuid-9876'],
    })
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
