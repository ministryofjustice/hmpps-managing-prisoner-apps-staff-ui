import { applicationTypeLabels } from '../../server/constants/applicationTypes'
import applicationTypesData from '../fixtures/applicationTypes.json'
import ApplicationDetailsPage from '../pages/applicationDetailsPage'
import Page from '../pages/page'

const { applicationTypes } = applicationTypesData

function startApplication(appType: string): ApplicationDetailsPage {
  cy.task('reset')
  cy.task('stubSignIn')
  cy.signIn()
  cy.task('stubGetPrisonerByPrisonerNumber', 'A1234AA')
  cy.task('stubGetAppTypes')

  cy.visit('/log/application-details')

  cy.contains(appType).click()
  cy.contains('button', 'Continue').click()
  cy.contains('Prison number').should('exist')
  cy.get('#prison-number').type('A1234AA')
  cy.contains('button', 'Find prisoner').click()
  cy.contains('button', 'Continue').click()

  if (appType === applicationTypeLabels.PIN_PHONE_ADD_NEW_SOCIAL_CONTACT) {
    cy.get('input[name="earlyDaysCentre"][value="yes"]').check({ force: true })
    cy.contains('button', 'Continue').click()
  }

  return Page.verifyOnPage(ApplicationDetailsPage)
}

applicationTypes.forEach(({ name, type, hint }) => {
  context(`Application Details Page - ${name}`, () => {
    let page: ApplicationDetailsPage

    beforeEach(() => {
      page = startApplication(name)
    })

    it('should direct the user to the correct page', () => {
      Page.verifyOnPage(ApplicationDetailsPage)
    })

    it('should render the correct app type title', () => {
      page.appTypeTitle().should('have.text', name)
    })

    if (type === 'textarea') {
      it('should render the form label', () => {
        page.formLabel().should('contain.text', 'Details (optional)')
      })

      it('should display the hint text', () => {
        page.hintText().should('contain.text', hint)
      })

      it('should have a textarea field', () => {
        page.textArea().should('exist')
      })
    }

    if (type === 'amount') {
      it('should display the hint text', () => {
        page.reasonHintText().should('contain.text', hint)
      })

      it('should have an amount input field', () => {
        page.amountInput().should('exist')
      })
    }

    it('should have CSRF token and continue button', () => {
      page.csrfToken().should('exist')
      page.continueButton().should('contain.text', 'Continue')
    })
  })
})

context(`Application Details Page - Add new social PIN contact`, () => {
  let page: ApplicationDetailsPage

  beforeEach(() => {
    page = startApplication('Add new social PIN phone contact')
  })

  it('should direct the user to the correct page', () => {
    Page.verifyOnPage(ApplicationDetailsPage)
  })

  it('should render the correct app type title', () => {
    page.appTypeTitle().should('have.text', 'Add new social PIN phone contact')
  })

  it('should render the form fields', () => {
    cy.get('#firstName').should('exist')
    cy.get('#lastName').should('exist')
    cy.get('input[value="dateofbirth"]').should('exist')
    cy.get('input[value="age"]').should('exist')
    cy.get('input[value="donotknow"]').should('exist')
    cy.get('#addressline1').should('exist')
    cy.get('#addressline2').should('exist')
    cy.get('#townorcity').should('exist')
    cy.get('#postcode').should('exist')
    cy.get('#country').should('exist')
    cy.get('#relationship').should('exist')
    cy.get('#telephone1').should('exist')
    cy.get('#telephone2').should('exist')
  })

  it('should display date of birth inputs when selected', () => {
    cy.get('input[value="dateofbirth"]').check({ force: true })
    cy.get('#dob-day').should('exist')
    cy.get('#dob-month').should('exist')
    cy.get('#dob-year').should('exist')
    cy.get('.govuk-hint').should('contain', 'For example, 7/10/2002')
  })

  it('should display age input when selected', () => {
    cy.get('input[value="age"]').check({ force: true })
    cy.get('#age').should('exist')
  })

  it('should display the country dropdown', () => {
    cy.get('#country').should('be.visible')
  })

  it('should display the relationship dropdown', () => {
    cy.get('#relationship').should('be.visible')
  })
})
