import TestData from '../../server/routes/testutils/testData'
import ConfirmDetailsPage from '../pages/confirmDetailsPage'
import Page from '../pages/page'

context('Confirm Details Page', () => {
  let page: ConfirmDetailsPage
  const { app } = new TestData()

  beforeEach(() => {
    cy.resetAndSignIn()
    cy.task('stubGetPrisonerByPrisonerNumber', 'A1234AA')
    cy.task('stubGetAppTypes')
  })

  const testConfirmDetailsPage = (title, route, backLink, hasChangeLinks) => {
    context(title, () => {
      beforeEach(() => {
        cy.task('stubGetPrisonerApp', {
          app,
        })

        if (route === '/log/confirm') {
          cy.visitIndexAndStartApplication()
          cy.enterPrisonerDetails()
          cy.selectApplicationType('Swap visiting orders (VOs) for PIN credit')
          cy.contains('button', 'Continue').click()
        } else if (route.includes('/change')) {
          cy.visit(route)
          cy.contains('button', 'Continue').click()
        }

        page = Page.verifyOnPage(ConfirmDetailsPage)
      })

      it('should display the correct page title', () => {
        page.pageTitle().should('include', 'Swap visiting orders (VOs) for PIN credit')
      })

      it('should render the back link with correct text and href', () => {
        page.backLink().should('have.text', 'Back').and('have.attr', 'href', backLink)
      })

      it('should render the application type summary with correct text', () => {
        page.applicationType().should('exist')
      })

      it(`should ${hasChangeLinks ? '' : 'not '}allow changing the application type`, () => {
        page.changeApplicationType().should(hasChangeLinks ? 'exist' : 'not.exist')
      })

      it('should render prisoner name summary with correct text', () => {
        page.prisonerName().should('exist')
      })

      it(`should ${hasChangeLinks ? '' : 'not '}allow changing the prisoner details`, () => {
        page.changePrisoner().should(hasChangeLinks ? 'exist' : 'not.exist')
      })

      it('should render a Continue button with the correct text', () => {
        page.continueButton().should('contain.text', 'Save')
      })
    })
  }

  testConfirmDetailsPage(
    'Logging a new application - Confirm details',
    '/log/confirm',
    '/log/application-details',
    true,
  )

  testConfirmDetailsPage(
    'Updating an existing application - Confirm details',
    `/applications/${app.requestedBy.username}/${app.id}/change`,
    `/applications/${app.requestedBy.username}/${app.id}/change`,
    false,
  )
})
