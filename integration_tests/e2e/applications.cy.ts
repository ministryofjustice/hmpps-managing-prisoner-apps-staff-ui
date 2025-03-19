context('Applications Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
    cy.visit('/')
  })

  it('should display the page title', () => {
    cy.title().should('include', 'Applications')
  })

  it('should display the banner with the correct content', () => {
    cy.get('.applications-landing-page__banner')
      .should('exist')
      .within(() => {
        cy.get('h1').contains('Applications')
        cy.get('p').eq(0).contains('Log, action and reply to prisoner applications.')
        cy.get('p').eq(1).contains('Give us your').find('a').should('exist')
      })
  })

  it('should display the Log a new application card', () => {
    cy.get('[data-testid="log-new-application"]')
      .should('exist')
      .within(() => {
        cy.get('h2').contains('Log a new application')
        cy.get('a').should('have.attr', 'href', '/log/application-type')
        cy.get('p').contains('Log a new application to process.')
      })
  })

  it('should display the View all applications card', () => {
    cy.get('[data-testid="view-all-applications"]')
      .should('exist')
      .within(() => {
        cy.get('h2').contains('View all applications')
        cy.get('a').should('have.attr', 'href', '/applications')
        cy.get('p').contains('View all applications logged in your prison.')
      })
  })
})
