import ConfirmSwapVosPinCreditDetailsPage from '../pages/confirmSwapVosPinCreditDetailsPage'
import Page from '../pages/page'

context('Confirm Swap VOs for PIN Credit Details Page', () => {
  let page: ConfirmSwapVosPinCreditDetailsPage

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    cy.visit('/log/confirm')

    cy.contains('Swap visiting orders (VOs) for PIN credit').click()
    cy.contains('button', 'Continue').click()
    cy.contains('button', 'Continue').click()
    cy.contains('button', 'Continue').click()

    page = Page.verifyOnPage(ConfirmSwapVosPinCreditDetailsPage)
  })

  it('should display the correct page title', () => {
    page.pageTitle().should('include', 'Check details')
  })

  it('should render the back link with correct text and href', () => {
    page.backLink().should('have.text', 'Back').and('have.attr', 'href', '/log/application-details')
  })

  it('should render the application type summary with correct text', () => {
    page.applicationType().should('contain.text', 'Swap VOs for pin credit')
  })

  it('should allow changing the application type', () => {
    page.changeApplicationType().should('exist').and('have.attr', 'href', '#')
  })

  it('should render prisoner name summary with correct text', () => {
    page.prisonerName().should('exist')
  })

  it('should allow changing the prisoner details', () => {
    page.changePrisoner().should('exist').and('have.attr', 'href', '#')
  })

  it('should display the submitted on date', () => {
    page.submittedOn().should('exist')
  })

  it('should allow changing the submission date', () => {
    page.changeSubmittedOn().should('exist').and('have.attr', 'href', '#')
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
