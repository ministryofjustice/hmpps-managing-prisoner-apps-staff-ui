import LogPrisonerDetailsPage from '../pages/logPrisonerDetails'
import Page from '../pages/page'

context('Log Prisoner Details Page', () => {
  let page: LogPrisonerDetailsPage

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    cy.visit('/log/prisoner-details')

    cy.contains('Swap visiting orders (VOs) for PIN credit').click()
    cy.contains('button', 'Continue').click()

    page = Page.verifyOnPage(LogPrisonerDetailsPage)
  })

  it('should direct the user to the correct page', () => {
    Page.verifyOnPage(LogPrisonerDetailsPage)
  })

  it('should display the correct page title', () => {
    page.pageTitle().should('include', 'Log prisoner details')
  })

  it('should render the back link with correct text and href', () => {
    page.backLink().should('have.text', 'Back').and('have.attr', 'href', '/log/application-type')
  })

  it('should display the prisoner details form', () => {
    page.form().should('exist')
  })

  it('should include a hidden CSRF token input field', () => {
    page.csrfToken().should('exist').and('have.attr', 'type', 'hidden')
  })

  it('should render the prison number input field', () => {
    page.prisonNumberInput().should('exist').and('have.attr', 'type', 'text').and('have.attr', 'name', 'prisonNumber')
  })

  it('should render the "Find prisoner" button', () => {
    page
      .findPrisonerButton()
      .should('exist')
      .and('have.class', 'govuk-button--secondary')
      .and('include.text', 'Find prisoner')
  })

  it('should render the prisoner name inset text', () => {
    page.prisonerNameInsetText().should('exist').and('contain.text', 'Prisoner name: Not found')
  })

  it('should render the date picker', () => {
    page.dateInput().should('exist')
    page.dateLabel().should('exist').and('include.text', 'Date')
  })

  it('should render the continue button with the correct text', () => {
    page.continueButton().should('exist').and('include.text', 'Continue').and('have.class', 'govuk-button--primary')
  })
})
