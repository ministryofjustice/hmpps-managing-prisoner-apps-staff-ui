import applicationTypesData from '../fixtures/applicationTypes.json'

import ApplicationDetailsPage from '../pages/applicationDetailsPage'
import Page from '../pages/page'

const appTypes = applicationTypesData.applicationTypes

function startApplication(appType: string): ApplicationDetailsPage {
  cy.task('reset')
  cy.task('stubSignIn')
  cy.signIn()
  cy.task('stubGetPrisonerByPrisonNumber')

  cy.visit('/log/application-details')

  cy.contains(appType).click()
  cy.contains('button', 'Continue').click()
  cy.contains('Prison number').should('exist')
  cy.get('#prison-number').type('G3682UE')
  cy.contains('Date').should('exist')
  cy.get('#date').type('10/04/2023')
  cy.contains('button', 'Continue').click()

  return Page.verifyOnPage(ApplicationDetailsPage)
}

appTypes.forEach(({ name, type, hint }) => {
  context(`Application Details Page - ${name}`, () => {
    let page: ApplicationDetailsPage

    beforeEach(() => {
      page = startApplication(name)
    })

    it('should direct the user to the correct page', () => {
      Page.verifyOnPage(ApplicationDetailsPage)
    })

    it('should render the correct app type title', () => {
      page.appTypeTitle().should('have.text', name)
    })

    if (type === 'textarea') {
      it('should render the form label', () => {
        page.formLabel().should('contain.text', 'Details (optional)')
      })

      it('should display the hint text', () => {
        page.hintText().should('contain.text', hint)
      })

      it('should have a textarea field', () => {
        page.textArea().should('exist')
      })
    }

    if (type === 'amount') {
      it('should display the hint text', () => {
        page.reasonHintText().should('contain.text', hint)
      })

      it('should have an amount input field', () => {
        page.amountInput().should('exist')
      })
    }

    it('should have CSRF token and continue button', () => {
      page.csrfToken().should('exist')
      page.continueButton().should('contain.text', 'Continue')
    })
  })
})
