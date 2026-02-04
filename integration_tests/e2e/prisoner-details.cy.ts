import LogPrisonerDetailsPage from '../pages/logPrisonerDetails'
import Page from '../pages/page'

context(`Log Prisoner Details Page`, () => {
  let page: LogPrisonerDetailsPage

  beforeEach(() => {
    cy.resetAndSignIn()

    cy.visit('/log/prisoner-details')

    page = Page.verifyOnPage(LogPrisonerDetailsPage)
  })

  it('should direct the user to the correct page', () => {
    Page.verifyOnPage(LogPrisonerDetailsPage)
  })

  it('should display the correct page title', () => {
    page.pageTitle().should('include', 'Log prisoner details')
  })

  it('should render the back link with correct text and href', () => {
    page.backLink().should('have.text', 'Back').and('have.attr', 'href', '/')
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

  it('should render the continue button with the correct text', () => {
    page.continueButton().should('exist').and('include.text', 'Continue').and('have.class', 'govuk-button--primary')
  })

  it('should show an error if "Find prisoner" button is not clicked', () => {
    page.prisonNumberInput().type('A1234AA')
    page.continueButton().click()
    page.findPrisonerButtonErrorMessage().should('exist')
  })

  it('should display prisoner name and alert count when found', () => {
    cy.task('stubGetPrisonerByPrisonerNumber', 'A1234AA')
    page.prisonNumberInput().type('A1234AA')
    page.findPrisonerButton().click()
    page.prisonerNameInsetText().should('contain', 'Prisoner name:')
    page.prisonerNameInsetText().should('contain', 'alerts')
  })

  it('should show error for invalid prison number', () => {
    page.prisonNumberInput().type('INVALID')
    page.findPrisonerButton().click()
    page.prisonerNameInsetText().should('contain', 'Prisoner name: Not found')
  })

  it('should successfully submit and redirect to application group selection', () => {
    cy.task('stubGetPrisonerByPrisonerNumber', 'A1234AA')
    cy.task('stubGetGroupsAndTypes')
    page.prisonNumberInput().type('A1234AA')
    page.findPrisonerButton().click()
    page.continueButton().click()
    cy.url().should('include', '/log/group')
  })

  it('should remove spaces and dots from prison number input in real-time', () => {
    page.prisonNumberInput().type('A1234 . UE')
    page.prisonNumberInput().should('have.value', 'A1234UE')
  })

  it('should convert lowercase letters to uppercase in prison number', () => {
    page.prisonNumberInput().type('a1234ue')
    page.prisonNumberInput().should('have.value', 'A1234UE')
  })

  it('should handle double-space auto-correction', () => {
    page.prisonNumberInput().type('A1234  AA')
    page.prisonNumberInput().should('have.value', 'A1234AA')
  })
})
