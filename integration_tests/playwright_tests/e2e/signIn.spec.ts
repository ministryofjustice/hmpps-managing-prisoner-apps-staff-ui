import { test } from '../fixtures'
import Page from '../pages/page'
import IndexPage from '../pages/index'
import AuthSignInPage from '../pages/authSignIn'
import AuthManageDetailsPage from '../pages/authManageDetails'
import auth from '../../mockApis/auth'
import tokenVerification from '../../mockApis/tokenVerification'
import { resetStubs } from '../../mockApis/wiremock'

const targetBaseUrl = process.env.PW_BASE_URL || process.env.DPS_PRISONER_URL || 'http://localhost:3007'
const isWiremock = process.env.PW_ENV === 'mock' || targetBaseUrl.includes('localhost')

test.describe('Sign In', () => {
  test.beforeEach(async () => {
    await resetStubs()
    await auth.stubSignIn()
  })

  test('Unauthenticated user directed to auth', async ({ page }) => {
    await page.goto('/')
    await Page.verifyOnPage(AuthSignInPage, page)
  })

  test('Unauthenticated user navigating to sign in page directed to auth', async ({ page }) => {
    await page.goto('auth/sign-in')
    await Page.verifyOnPage(AuthSignInPage, page)
  })

  test('User name visible in header', async ({ page, signIn }) => {
    await signIn()
    const indexPage = await Page.verifyOnPage(IndexPage, page)
    if (isWiremock) {
      await indexPage.assertHeaderUserNameContains('J. Smith')
    } else {
      await indexPage.assertHeaderUserNamePopulated()
    }
  })

  test('User can sign out', async ({ page, signIn }) => {
    await signIn()
    const indexPage = await Page.verifyOnPage(IndexPage, page)
    await indexPage.clickSignOut()
    await Page.verifyOnPage(AuthSignInPage, page)
  })

  test('User can manage their details', async ({ page, signIn }) => {
    test.skip(isWiremock, 'Manage details flow is only available in DEV')
    await signIn()
    await auth.stubAuthManageDetails()
    const indexPage = await Page.verifyOnPage(IndexPage, page)
    await indexPage.openManageDetailsInSameTab()
    await Page.verifyOnPage(AuthManageDetailsPage, page)
  })

  test('Token verification failure takes user to sign in page', async ({ page, signIn }) => {
    test.skip(!isWiremock, 'Token verification stubs are only available in WireMock/mock environment')
    await signIn()
    await Page.verifyOnPage(IndexPage, page)
    await tokenVerification.stubVerifyToken(false)

    await page.goto('/')
    await Page.verifyOnPage(AuthSignInPage, page)
  })

  test('Token verification failure clears user session', async ({ page, signIn }) => {
    test.skip(!isWiremock, 'Token verification stubs are only available in WireMock/mock environment')
    await signIn()
    const indexPage = await Page.verifyOnPage(IndexPage, page)
    await tokenVerification.stubVerifyToken(false)

    await page.goto('/')
    await Page.verifyOnPage(AuthSignInPage, page)

    await tokenVerification.stubVerifyToken(true)
    await auth.stubSignIn({
      name: 'bobby brown',
      roles: ['ROLE_PRISON'],
    })
    await signIn()

    await indexPage.assertHeaderUserNameContains('B. Brown')
  })
})
