import applicationTypesData from '../fixtures/applicationTypes.json'
import LogPrisonerDetailsPage from '../pages/logPrisonerDetails'
import Page from '../pages/page'

const appTypes = applicationTypesData.applicationTypes

appTypes.forEach(appType => {
  context(`${appType.name} Log Prisoner Details Page`, () => {
    let page: LogPrisonerDetailsPage

    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.signIn()

      cy.visit('/log/prisoner-details')

      cy.contains(appType.name).click()
      cy.contains('button', 'Continue').click()

      page = Page.verifyOnPage(LogPrisonerDetailsPage)
    })

    it('should direct the user to the correct page', () => {
      Page.verifyOnPage(LogPrisonerDetailsPage)
    })

    it('should show the correct app type caption', () => {
      page.caption().should('have.text', appType.name)
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
      page.prisonerNameInsetText().should('exist')
    })

    it('should render the date picker', () => {
      page.dateInput().should('exist')
      page.dateLabel().should('exist').and('include.text', 'Date')
    })

    it('should render the continue button with the correct text', () => {
      page.continueButton().should('exist').and('include.text', 'Continue').and('have.class', 'govuk-button--primary')
    })

    it('should show an error if "Find prisoner" button is not clicked', () => {
      page.prisonNumberInput().type('A1234AA')
      page.continueButton().click()
      cy.get('.govuk-error-message').should('exist').and('contain.text', 'Find prisoner to continue')
    })
  })
})
