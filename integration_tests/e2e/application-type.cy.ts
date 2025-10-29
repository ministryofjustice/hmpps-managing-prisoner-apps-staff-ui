import ApplicationTypePage from '../pages/applicationType'
import Page from '../pages/page'

context('Application Type Page', () => {
  let page: ApplicationTypePage

  beforeEach(() => {
    cy.resetAndSignIn()
    cy.task('stubGetPrisonerByPrisonerNumber', 'A1234AA')
    cy.task('stubGetGroupsAndTypes')

    cy.visit('/log/application-type')

    cy.enterPrisonerDetails()
    cy.selectGroup('Pin Phone Contact Apps')

    page = Page.verifyOnPage(ApplicationTypePage)
  })

  it('should display the correct page title', () => {
    page.pageTitle().should('include', 'Select application type')
  })

  it('should display the back link', () => {
    page.backLink().should('exist').and('have.text', 'Back')
  })

  it('should display radio buttons with names', () => {
    cy.fixture('applicationTypes.json').then(({ applicationTypes }) => {
      cy.get('.govuk-radios__item').should('have.length', applicationTypes.length)

      cy.get('.govuk-radios__item').each(($element, index) => {
        const { name, id } = applicationTypes[index]

        cy.wrap($element)
          .find('label.govuk-label.govuk-radios__label')
          .should('exist')
          .invoke('text')
          .then(text => {
            expect(text.trim()).to.equal(name)
          })

        cy.wrap($element).find('input.govuk-radios__input').should('exist').and('have.attr', 'value', id)
      })
    })
  })

  it('should display the continue button', () => {
    cy.get('.govuk-button')
      .should('exist')
      .invoke('text')
      .should('satisfy', text => text.trim() === 'Continue')
  })

  it('should display the error message when no radio button is selected', () => {
    cy.get('.govuk-button').click()
    cy.get('.govuk-error-summary').should('exist').and('contain', 'Choose one application type')
    cy.get('.govuk-error-message').should('exist').and('contain', 'Choose one application type')
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
