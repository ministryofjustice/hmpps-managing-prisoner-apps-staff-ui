context('Swap VOs for PIN Credit Details Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
    cy.visit('/log/swap-vos-pin-credit-details')
  })

  it('should display the page title', () => {
    cy.title().should('include', 'Log swap VOs for PIN credit details')
  })

  it('should display the back link', () => {
    cy.get('.govuk-back-link').should('exist').and('have.text', 'Back')
  })

  it('should render the correct form label for the textarea', () => {
    cy.get('h1.govuk-label-wrapper')
      .find('label[for="swap-vos-pin-credit-details"]')
      .should('exist')
      .invoke('text')
      .should('satisfy', text => text.trim() === 'Details (optional)')
  })

  it('should include a hidden CSRF token input field', () => {
    cy.get('input[name="_csrf"]').should('exist')
  })

  it('should display the continue button', () => {
    cy.get('.govuk-button')
      .should('exist')
      .invoke('text')
      .should('satisfy', text => text.trim() === 'Continue')
  })
})
