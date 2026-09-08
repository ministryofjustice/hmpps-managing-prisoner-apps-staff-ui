import { expect, Page, test as base } from '@playwright/test'
import auth from '../mockApis/auth'
import managingPrisonerAppsApi from '../mockApis/managingPrisonerApps'
import ApplicationGroupPage from '../pages/applicationGroup'
import ApplicationTypePage from '../pages/applicationTypePage'
import DepartmentPage from '../pages/departmentPage'
import LogMethodPage from '../pages/logMethodPage'
import PrisonerDetailsPage from '../pages/prisonerDetailsPage'
import prisonApi from '../mockApis/prison'
import { resetStubs } from '../mockApis/wiremock'

const clearBrowserState = async (page: Page) => {
  if (!page.isClosed()) {
    await page
      .evaluate(() => {
        window.localStorage.clear()
        window.sessionStorage.clear()
      })
      .catch(() => undefined)
  }

  const context = page.context()
  await context.clearCookies()
  await context.clearPermissions()
}

const getSignInUrlWithRetry = async (
  waitForTimeout: (timeout: number) => Promise<void>,
  attempts = 30,
): Promise<string> => {
  try {
    return await auth.getSignInUrl()
  } catch (error) {
    if (attempts <= 1) throw error
    await waitForTimeout(100)
    return getSignInUrlWithRetry(waitForTimeout, attempts - 1)
  }
}

type Fixtures = {
  signIn: () => Promise<void>
  resetAndSignIn: () => Promise<void>
  enterPrisonerDetails: () => Promise<void>
  selectGroup: (group: string) => Promise<void>
  selectApplicationType: (appType: string) => Promise<void>
  selectDepartment: (departmentName: string) => Promise<void>
  selectLoggingMethod: (method: 'manual' | 'webcam') => Promise<void>
}

const targetBaseUrl = process.env.PW_BASE_URL || process.env.DPS_PRISONER_URL || ''
const isLocalhost = !targetBaseUrl || targetBaseUrl.includes('localhost')

const signInWithDevCredentials = async (page: Page) => {
  const username = process.env.MANAGE_APPS_USERNAME
  const password = process.env.MANAGE_APPS_PASSWORD

  if (!username || !password) {
    throw new Error('MANAGE_APPS_USERNAME and MANAGE_APPS_PASSWORD must be set for DEV sign-in')
  }

  await page.locator('#username').fill(username)
  await page.locator('#password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
}

const openApplicationsFromDpsHome = async (page: Page) => {
  const dpsHomeHeading = page.getByRole('heading', { name: 'Welcome to Digital Prison Services' })
  const onDpsHome = await dpsHomeHeading.isVisible().catch(() => false)

  if (onDpsHome) {
    const applicationsLink = page.getByRole('link', { name: 'Applications' }).first()
    const linkVisible = await applicationsLink.isVisible().catch(() => false)

    if (!linkVisible) {
      throw new Error('Could not find Applications service link on DPS home page')
    }

    const href = await applicationsLink.getAttribute('href')
    if (href) {
      await page.goto(href)
    } else {
      await applicationsLink.click()
    }

    await page.getByRole('heading', { name: 'Applications' }).waitFor({ timeout: 15000 })
  }
}

export const test = base.extend<Fixtures>({
  signIn: async ({ page }, use) => {
    await use(async () => {
      if (isLocalhost) {
        // Fallback stub so tests that forget caseLoads still sign in; test-specific stubs can override.
        await prisonApi.stubGetCaseLoads('HMI', 100)
        await managingPrisonerAppsApi.stubGetActiveAgencies(undefined, 100)
      }
      await page.goto('/')
      if (isLocalhost) {
        const signInUrl = await getSignInUrlWithRetry(timeout => page.waitForTimeout(timeout))
        await page.goto(signInUrl)
      } else {
        await page.goto('/sign-in')
        await signInWithDevCredentials(page)
        await openApplicationsFromDpsHome(page)
      }
    })
  },

  resetAndSignIn: async ({ page }, use) => {
    await use(async () => {
      if (isLocalhost) {
        await resetStubs()
        await auth.stubSignIn()
        // Keep this as a low-priority default to avoid missing-stub failures.
        await prisonApi.stubGetCaseLoads('HMI', 100)
        await managingPrisonerAppsApi.stubGetActiveAgencies(undefined, 100)
      }
      await page.goto('/')
      if (isLocalhost) {
        const signInUrl = await getSignInUrlWithRetry(timeout => page.waitForTimeout(timeout))
        await page.goto(signInUrl)
      } else {
        await page.goto('/sign-in')
        await signInWithDevCredentials(page)
        await openApplicationsFromDpsHome(page)
      }
    })
  },

  enterPrisonerDetails: async ({ page }, use) => {
    await use(async () => {
      const prisonerDetailsPage = new PrisonerDetailsPage(page)
      await prisonerDetailsPage.completePrisonerLookup('A1234AA')
      await expect(prisonerDetailsPage.prisonerLookupButton()).toHaveValue('true')
      await expect(prisonerDetailsPage.prisonerExistsInput()).toHaveValue('true')
      await prisonerDetailsPage.clickContinue()
      await expect(page).toHaveURL(/\/log\/group/)
    })
  },

  selectGroup: async ({ page }, use) => {
    await use(async (group: string) => {
      const applicationGroupPage = new ApplicationGroupPage(page)
      await applicationGroupPage.checkOnPage()
      await expect(applicationGroupPage.radioButtonByLabel(group)).toBeVisible()
      await applicationGroupPage.selectGroup(group)
      await applicationGroupPage.continueToNextPage()
    })
  },

  selectApplicationType: async ({ page }, use) => {
    await use(async (appType: string) => {
      const applicationTypePage = new ApplicationTypePage(page)
      await applicationTypePage.selectApplicationType(appType)
      await applicationTypePage.continueToNextPage()
    })
  },

  selectDepartment: async ({ page }, use) => {
    await use(async (departmentName: string) => {
      const departmentPage = new DepartmentPage(page)
      await departmentPage.selectDepartment(departmentName)
      await departmentPage.continueToNextPage()
    })
  },

  selectLoggingMethod: async ({ page }, use) => {
    await use(async (method: 'manual' | 'webcam') => {
      const logMethodPage = new LogMethodPage(page)
      await logMethodPage.selectLoggingMethod(method)
      await logMethodPage.continueToNextPage()
    })
  },
})

test.afterEach(async ({ page }) => {
  await clearBrowserState(page)
})

export { expect } from '@playwright/test'
