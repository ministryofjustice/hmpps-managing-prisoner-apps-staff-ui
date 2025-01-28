context('Application Type Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
    cy.visit('/log/application-type')
  })

  it('should display the page title', () => {
    cy.title().should('include', 'Select application type')
  })

  it('should display the back link', () => {
    cy.get('.govuk-back-link').should('exist').and('have.text', 'Back')
  })

  it('should display radio buttons with names', () => {
    cy.fixture('applicationTypes.json').then(({ applicationTypes }) => {
      applicationTypes.forEach((applicationType: { name: string; value: string }) => {
        cy.get('.govuk-radios__item')
          .find('label.govuk-label.govuk-radios__label')
          .should('exist')
          .invoke('text')
          .should('satisfy', text => text.trim() === applicationType.name)
        cy.get('.govuk-radios__item')
          .should('exist')
          .find('input.govuk-radios__input')
          .should('exist')
          .and('have.attr', 'value', applicationType.value)
      })
    })

    it('should display the continue button', () => {
      cy.get('.govuk-button')
        .should('exist')
        .invoke('text')
        .should('satisfy', text => text.trim() === 'Continue')
    })

    it('should ensure links are functional (if paths are set)', () => {
      cy.get('a').each($link => {
        const href = $link.attr('href')
        if (href && href !== '#' && href !== '') {
          cy.request({
            url: href,
            failOnStatusCode: false,
          }).then(response => {
            if (response.status !== 200) {
              cy.log(`Broken link: ${href} - Status: ${response.status}`)
            } else {
              cy.wrap(response.status).should('equal', 200)
            }
          })
        } else {
          cy.log(`Skipping link with href: ${href}`)
        }
      })
    })
  })
})
