import Page from '../pages/page'
import SwapVosDetailsPage from '../pages/swapVosDetailsPage'

context('Swap VOs for PIN Credit Details Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
    cy.visit('/log/swap-vos-pin-credit-details')
  })

  it('should direct the user to the correct page', () => {
    Page.verifyOnPage(SwapVosDetailsPage)
  })

  it('should display the correct page title', () => {
    cy.title().should('include', 'Log swap VOs for PIN credit details')
  })

  it('should render the page heading correctly', () => {
    const page = Page.verifyOnPage(SwapVosDetailsPage)
    page.pageHeading().should('have.text', 'Log details')
  })

  it('should render the back link with correct text and href', () => {
    const page = Page.verifyOnPage(SwapVosDetailsPage)
    page.backLink().should('have.text', 'Back').and('have.attr', 'href', '/log/prisoner-details')
  })

  it('should render the correct app type title', () => {
    const page = Page.verifyOnPage(SwapVosDetailsPage)
    page.appTypeTitle().should('have.text', 'Swap VOs for PIN credit')
  })

  it('should render the correct form label for the textarea', () => {
    const page = Page.verifyOnPage(SwapVosDetailsPage)
    page.formLabel().should('contain.text', 'Details (optional)')
  })

  it('should display the hint text correctly', () => {
    const page = Page.verifyOnPage(SwapVosDetailsPage)
    page.hintText().should('have.text', 'Add a brief summary, for example, if this person is a Foreign National')
  })

  it('should contain a textarea with the correct ID', () => {
    const page = Page.verifyOnPage(SwapVosDetailsPage)
    page.textArea().should('have.attr', 'id', 'swap-vos-pin-credit-details')
  })

  it('should include a hidden CSRF token input field', () => {
    const page = Page.verifyOnPage(SwapVosDetailsPage)
    page.csrfToken().should('exist')
  })

  it('should render a Continue button with the correct text', () => {
    const page = Page.verifyOnPage(SwapVosDetailsPage)
    page.continueButton().should('have.text', 'Continue')
  })
})
