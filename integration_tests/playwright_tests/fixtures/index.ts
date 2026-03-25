import { type Page as PlaywrightPage, test as base } from '@playwright/test'
import auth from '../../mockApis/auth'
import { resetStubs } from '../../mockApis/wiremock'

const clearBrowserState = async (page: PlaywrightPage, browserName: string) => {
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

  if (browserName === 'chromium' && !page.isClosed()) {
    const client = await context.newCDPSession(page)
    await client.send('Network.enable')
    await client.send('Network.clearBrowserCache')
    await client.send('Network.clearBrowserCookies')
    await client.detach()
  }
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

const signInWithDevCredentials = async (page: PlaywrightPage) => {
  const username = process.env.MANAGE_APPS_USERNAME
  const password = process.env.MANAGE_APPS_PASSWORD

  if (!username || !password) {
    throw new Error('MANAGE_APPS_USERNAME and MANAGE_APPS_PASSWORD must be set for DEV sign-in')
  }

  await page.locator('#username').fill(username)
  await page.locator('#password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
}

const openApplicationsFromDpsHome = async (page: PlaywrightPage) => {
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
      await resetStubs()
      await auth.stubSignIn()
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
      await page.locator('#prison-number').fill('A1234AA')
      await page.getByRole('button', { name: 'Find prisoner' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })
  },

  selectGroup: async ({ page }, use) => {
    await use(async (group: string) => {
      await page.getByText(group).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })
  },

  selectApplicationType: async ({ page }, use) => {
    await use(async (appType: string) => {
      await page.getByText(appType).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })
  },

  selectDepartment: async ({ page }, use) => {
    await use(async (departmentName: string) => {
      await page.getByText(departmentName).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })
  },

  selectLoggingMethod: async ({ page }, use) => {
    await use(async (method: 'manual' | 'webcam') => {
      await page.locator(`input[name="loggingMethod"][value="${method}"]`).check({ force: true })
      await page.getByRole('button', { name: 'Continue' }).click()
    })
  },
})

test.afterEach(async ({ page, browserName }) => {
  await clearBrowserState(page, browserName)
})

export { expect } from '@playwright/test'
