import ApplicationDetailsPage from '../pages/applicationDetailsPage'
import Page from '../pages/page'

function startApplication(appType: string): void {
  cy.task('reset')
  cy.task('stubSignIn')
  cy.signIn()
  cy.visit('/log/application-details')

  cy.contains(appType).click()
  cy.contains('button', 'Continue').click()
  cy.contains('Prison number').should('exist')
  cy.get('#prison-number').type('G9812CC')
  cy.contains('Date').should('exist')
  cy.get('#date').type('10/04/2023')
  cy.contains('button', 'Continue').click()
}

context('Application Details Page - Swap visiting orders (VOs) for PIN credit', () => {
  let page: ApplicationDetailsPage

  beforeEach(() => {
    startApplication('Swap visiting orders (VOs) for PIN credit')
    page = Page.verifyOnPage(ApplicationDetailsPage)
  })

  it('should direct the user to the correct page', () => {
    Page.verifyOnPage(ApplicationDetailsPage)
  })

  it('should display the correct page title', () => {
    page.pageTitle().should('include', 'Log details')
  })

  it('should render the page heading correctly', () => {
    page.checkOnPage()
  })

  it('should render the back link with correct text and href', () => {
    page.backLink().should('have.text', 'Back').and('have.attr', 'href', '/log/prisoner-details')
  })

  it('should render the correct app type title', () => {
    page.appTypeTitle().should('have.text', 'Swap visiting orders (VOs) for PIN credit')
  })

  it('should render the correct form label for the textarea', () => {
    page.formLabel().should('contain.text', 'Details (optional)')
  })

  it('should display the hint text correctly', () => {
    page.hintText().should('contain.text', 'Add a brief summary, for example, if this person is a Foreign National')
  })

  it('should contain a textarea with the correct ID', () => {
    page.textArea().should('exist')
  })

  it('should include a hidden CSRF token input field', () => {
    page.csrfToken().should('exist')
  })

  it('should render a Continue button with the correct text', () => {
    page.continueButton().should('contain.text', 'Continue')
  })
})

context('Application Details Page - Add emergency PIN phone credit', () => {
  let page: ApplicationDetailsPage

  beforeEach(() => {
    startApplication('Add emergency PIN phone credit')
    page = Page.verifyOnPage(ApplicationDetailsPage)
  })

  it('should direct the user to the correct page', () => {
    Page.verifyOnPage(ApplicationDetailsPage)
  })

  it('should render the correct app type title', () => {
    page.appTypeTitle().should('have.text', 'Add emergency PIN phone credit')
  })

  it('should display the hint text correctly', () => {
    page.reasonHintText().should('contain.text', 'Add a brief summary')
  })

  it('should contain a amount input field with the correct ID', () => {
    page.amountInput().should('exist')
  })
})
