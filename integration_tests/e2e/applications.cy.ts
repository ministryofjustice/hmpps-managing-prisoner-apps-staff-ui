context('Applications Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
    cy.visit('/')

    cy.fixture('sections.json').then(data => {
      this.sections = data
    })
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

  it('should display the log an application button', () => {
    cy.get('a.govuk-button').should('exist').and('have.text', '\n  Log an application\n').and('have.attr', 'href', '#')
  })

  it('should display all sections with their items', () => {
    cy.fixture('sections.json').then(({ sections }) => {
      sections.forEach(section => {
        cy.contains('h2.govuk-heading-m', section.title).should('exist')

        section.items.forEach(item => {
          cy.contains('.applications-landing-page__list-menu-item', item.name)
            .should('exist')
            .within(() => {
              cy.get('.applications-landing-page__list-menu-item-notification').should('exist')
              cy.get('a').contains(item.name)
            })
        })
      })
    })
  })

  it('should ensure links are functional (if paths are set)', () => {
    cy.get('.applications-landing-page__list-menu-item a').each($link => {
      const href = $link.attr('href')
      if (href && href !== '#') {
        cy.request(href).its('status').should('eq', 200)
      }
    })
  })
})
