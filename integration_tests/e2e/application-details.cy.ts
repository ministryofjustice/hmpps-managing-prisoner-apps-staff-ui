import ApplicationDetailsPage from '../pages/applicationDetailsPage'
import Page from '../pages/page'

context('Application Details Page', () => {
  let page: ApplicationDetailsPage

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
    cy.visit('/log/application-details')

    cy.contains('Swap visiting orders (VOs) for PIN credit').click()
    cy.contains('button', 'Continue').click()
    cy.contains('button', 'Continue').click()
    page = Page.verifyOnPage(ApplicationDetailsPage)
  })

  it('should direct the user to the correct page', () => {
    Page.verifyOnPage(ApplicationDetailsPage)
  })

  it('should display the correct page title', () => {
    page.pageTitle().should('include', 'Log swap VOs for PIN credit details')
  })

  it('should render the page heading correctly', () => {
    page.checkOnPage()
  })

  it('should render the back link with correct text and href', () => {
    page.backLink().should('have.text', 'Back').and('have.attr', 'href', '/log/prisoner-details')
  })

  it('should render the correct app type title', () => {
    page.appTypeTitle().should('have.text', 'Swap VOs for PIN credit')
  })

  it('should render the correct form label for the textarea', () => {
    page.formLabel().should('contain.text', 'Details (optional)')
  })

  it('should display the hint text correctly', () => {
    page.hintText().should('contain.text', 'Add a brief summary, for example, if this person is a Foreign National')
  })

  it('should contain a textarea with the correct ID', () => {
    page.textArea().should('have.attr', 'id', 'swap-vos-pin-credit-details')
  })

  it('should include a hidden CSRF token input field', () => {
    page.csrfToken().should('exist')
  })

  it('should render a Continue button with the correct text', () => {
    page.continueButton().should('contain.text', 'Continue')
  })
})
