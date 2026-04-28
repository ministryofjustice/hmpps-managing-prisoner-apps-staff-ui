import { expect, test } from '../fixtures'
import ViewApplicationPage from '../pages/viewApplicationPage'
import { applicationWithoutPhotos, visitApplicationPage } from './view-applicationTestUtils'

test.describe('View Application Page - Without Photos', () => {
  test.beforeEach(async ({ page, signIn }) => {
    await visitApplicationPage({ page, signIn, application: applicationWithoutPhotos })
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
