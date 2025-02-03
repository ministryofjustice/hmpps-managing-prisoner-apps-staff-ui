context('Log Prisoner Details Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
    cy.request('/mock-session').then(() => {
      cy.visit('/log/prisoner-details')
    })
  })

  it('should display the page title', () => {
    cy.title().should('include', 'Log prisoner details')
    cy.log('Checked page title')
  })

  it('should display the back link', () => {
    cy.get('.govuk-back-link')
      .should('exist')
      .and('have.attr', 'href', '/log/application-type')
      .and('have.text', 'Back')
    cy.log('Checked back link')
  })

  it('should display the prisoner details form', () => {
    cy.get('form#log-prisoner-details').should('exist')
    cy.log('Checked prisoner details form')
  })

  it('should display the hidden CSRF token field', () => {
    cy.get('input[name="_csrf"]').should('exist').and('have.attr', 'type', 'hidden')
    cy.log('Checked CSRF token field')
  })

  it('should display the prison number input field', () => {
    cy.get('input#prisonNumber')
      .should('exist')
      .and('have.attr', 'type', 'text')
      .and('have.attr', 'name', 'prisonNumber')
    cy.log('Checked prison number input field')
  })

  it('should display the "Find prisoner" button', () => {
    cy.get('#prison-number-lookup')
      .should('exist')
      .and('include.text', 'Find prisoner')
      .and('have.class', 'govuk-button--secondary')
    cy.log('Checked "Find prisoner" button')
  })

  it('should display the prisoner name inset text', () => {
    cy.get('.govuk-inset-text').should('exist').and('contain.text', 'Prisoner name: Patel, Taj')
    cy.log('Checked prisoner name inset text')
  })

  it('should display the date picker', () => {
    cy.get('#date').should('exist')
    cy.get('label[for="date"]').should('exist').and('include.text', 'Date')
    cy.log('Checked date picker')
  })

  it('should display the continue button', () => {
    cy.get('[data-test="continue-button"]')
      .should('exist')
      .and('include.text', 'Continue')
      .and('have.class', 'govuk-button--primary')
    cy.log('Checked continue button')
  })
})
