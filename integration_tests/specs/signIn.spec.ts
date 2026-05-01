import { test } from '../fixtures'
import IndexPage from '../pages'
import AuthSignInPage from '../pages/authSignIn'
import auth from '../mockApis/auth'
import tokenVerification from '../mockApis/tokenVerification'
import { resetStubs } from '../mockApis/wiremock'
import AuthManageDetailsPage from '../pages/authManageDetails'

const targetBaseUrl = process.env.PW_BASE_URL || process.env.DPS_PRISONER_URL || 'http://localhost:3007'
const isWiremock = process.env.PW_ENV === 'mock' || targetBaseUrl.includes('localhost')

test.describe('Sign In', () => {
  test.beforeEach(async () => {
    if (isWiremock) {
      await resetStubs()
      await auth.stubSignIn()
    }
  })

  test('Unauthenticated user directed to auth', async ({ page }) => {
    await page.goto('/')
    await new AuthSignInPage(page).checkOnPage()
  })

  test('Unauthenticated user navigating to sign in page directed to auth', async ({ page }) => {
    await page.goto('auth/sign-in')
    await new AuthSignInPage(page).checkOnPage()
  })

  test('User name visible in header', async ({ page, signIn }) => {
    await signIn()
    const indexPage = new IndexPage(page)
    await indexPage.checkOnPage()
    if (isWiremock) {
      await indexPage.assertHeaderUserNameContains('J. Smith')
    } else {
      await indexPage.assertHeaderUserNamePopulated()
    }
  })

  test('User can sign out', async ({ page, signIn }) => {
    await signIn()
    const indexPage = new IndexPage(page)
    await indexPage.checkOnPage()
    await indexPage.clickSignOut()
    await new AuthSignInPage(page).checkOnPage()
  })

  test('User can manage their details', async ({ page, signIn }) => {
    test.skip(isWiremock, 'Manage details flow is only available in DEV')
    await signIn()
    const indexPage = new IndexPage(page)
    await indexPage.checkOnPage()
    await indexPage.openManageDetailsInSameTab()
    await new AuthManageDetailsPage(page).checkOnPage()
  })

  test('Token verification failure takes user to sign in page', async ({ page, signIn }) => {
    test.skip(!isWiremock, 'Token verification stubs are only available in WireMock/mock environment')
    await signIn()
    await new IndexPage(page).checkOnPage()
    await tokenVerification.stubVerifyToken(false)

    await page.goto('/')
    await new AuthSignInPage(page).checkOnPage()
  })

  test('Token verification failure clears user session', async ({ page, signIn }) => {
    test.skip(!isWiremock, 'Token verification stubs are only available in WireMock/mock environment')
    await signIn()
    const indexPage = new IndexPage(page)
    await tokenVerification.stubVerifyToken(false)

    await page.goto('/')
    await new AuthSignInPage(page).checkOnPage()

    await tokenVerification.stubVerifyToken(true)
    await auth.stubSignIn({
      name: 'bobby brown',
      roles: ['ROLE_PRISON'],
    })
    await signIn()

    await indexPage.assertHeaderUserNameContains('B. Brown')
  })
})
