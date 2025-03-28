import TestData from '../../server/routes/testutils/testData'
import ConfirmDetailsPage from '../pages/confirmDetailsPage'
import Page from '../pages/page'

context('Confirm Details Page', () => {
  let page: ConfirmDetailsPage
  const { app } = new TestData()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
  })

  const testConfirmDetailsPage = (title, route, backLink, hasChangeLinks) => {
    context(title, () => {
      beforeEach(() => {
        cy.task('stubGetPrisonerApp', {
          app,
        })

        cy.visit(route)

        if (route === '/log/confirm') {
          cy.contains('Swap visiting orders (VOs) for PIN credit').click()
          cy.contains('button', 'Continue').click()
          cy.contains('button', 'Continue').click()
          cy.contains('button', 'Continue').click()
        }

        page = Page.verifyOnPage(ConfirmDetailsPage)
      })

      it('should display the correct page title', () => {
        page.pageTitle().should('include', 'Check details')
      })

      it('should render the back link with correct text and href', () => {
        page.backLink().should('have.text', 'Back').and('have.attr', 'href', backLink)
      })

      it('should render the application type summary with correct text', () => {
        page.applicationType().should('contain.text', 'Swap VOs for pin credit')
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

      it('should display the submitted on date', () => {
        page.submittedOn().should('exist')
      })

      it(`should ${hasChangeLinks ? '' : 'not '}allow changing the submission date`, () => {
        page.changeSubmittedOn().should(hasChangeLinks ? 'exist' : 'not.exist')
      })

      it('should display the VOs to swap details', () => {
        page.swapVOsDetails().should('exist')
      })

      it('should allow changing the swap VOs details', () => {
        page.changeSwapVOsDetails().should('exist').and('have.attr', 'href', '#')
      })

      it('should render a Continue button with the correct text', () => {
        page.continueButton().should('contain.text', 'Continue')
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
    `/applications/${app.requestedBy.username}/${app.id}/change/confirm`,
    `/applications/${app.requestedBy.username}/${app.id}/change`,
    false,
  )
})
