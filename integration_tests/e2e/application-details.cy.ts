import applicationTypesData from '../fixtures/applicationTypes.json'
import ApplicationDetailsPage from '../pages/applicationDetailsPage'
import Page from '../pages/page'

const { applicationTypes } = applicationTypesData

function startApplication(appType: string): ApplicationDetailsPage {
  const appConfig = applicationTypes.find(type => type.name === appType)
  const relationshipType = appType.includes('official') ? 'OFFICIAL_RELATIONSHIP' : 'SOCIAL_RELATIONSHIP'

  cy.resetAndSignIn()
  cy.task('stubGetPrisonerByPrisonerNumber', 'A1234AA')
  cy.task('stubGetGroupsAndTypes')
  cy.task('stubGetDepartments', { appType: appConfig?.id.toString() })
  cy.task('stubGetRelationships', relationshipType)

  cy.visit('/log/application-details')

  cy.enterPrisonerDetails()
  cy.selectGroup('Pin Phone Contact Apps')
  cy.selectApplicationType(appType)
  cy.selectDepartment('Business Hub')
  cy.selectLoggingMethod('manual')

  return Page.verifyOnPage(ApplicationDetailsPage)
}

applicationTypes.forEach(({ name, genericType, genericForm }) => {
  context(`Application Details Page - ${name}`, () => {
    let page: ApplicationDetailsPage

    beforeEach(() => {
      page = startApplication(name)
    })

    if (genericType || genericForm) {
      it('should render the generic Details form', () => {
        page.appTypeTitle().should('have.text', name)
        page.textArea().should('exist')
      })

      it('should allow entering details', () => {
        page.textArea().type('Generic info')
        page.textArea().should('have.value', 'Generic info')
      })

      it('should allow submitting the generic form', () => {
        page.textArea().type('Log generic details')
        page.continueButton().click()
        cy.url().should('include', '/log/confirm')
      })

      return
    }

    if (name === 'Add emergency phone credit') {
      it('should show validation errors when fields are missing', () => {
        page.continueButton().click()

        page.errorSummary().should('exist')
        page.errorMessage().should('exist')
      })
      it('should enter the log details for emergency phone credit and proceed to check details page', () => {
        page.emergencyPhoneCreditLogDetails()

        page.continueButton().click()
        cy.url().should('include', '/log/confirm')
      })
    }

    if (name === 'Add an official PIN phone contact') {
      it('should show validation errors when fields are missing', () => {
        page.continueButton().click()

        page.errorSummary().should('exist')
        page.errorMessage().should('exist')
      })
      it('should enter log details for official PIN phone contact and proceed to check details page', () => {
        page.officialPinPhoneContactLogDetails()

        page.continueButton().click()
        cy.url().should('include', '/log/confirm')
      })
    }

    if (name === 'Add a social PIN phone contact') {
      it('should render the first night or early days centre radio buttons', () => {
        page
          .firstNightOrEarlyDaysCentreLabel()
          .should('exist')
          .and('include.text', 'Is this person in the first night or early days centre?')
        page.firstNightOrEarlyDaysCentre().should('exist')
        page.firstNightOrEarlyDaysCentreYes().should('exist')
        page.firstNightOrEarlyDaysCentreNo().should('exist')
      })

      it('should allow the user to select "No" for "Is this person in the first night or early days centre?"', () => {
        page.selectFirstNightOption('no')
      })

      it('should allow the user to select "Yes" for "Is this person in the first night or early days centre?"', () => {
        page.selectFirstNightOption('yes')
      })

      it('should show an error if no radio button is selected for "Is this person in the first night or early days centre?"', () => {
        page.continueButton().click()
        page.firstNightOrEarlyDaysCentreErrorMessage().should('exist')
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

      it('should show validation errors for missing required fields', () => {
        page.firstNightOrEarlyDaysCentreNo().check({ force: true })
        page.continueButton().click()

        page.errorSummary().should('exist')
        page.errorMessage().should('exist')
      })

      it('should validate telephone number format', () => {
        page.firstNightOrEarlyDaysCentreNo().check({ force: true })
        page.socialContactInvalidTelephoneLogDetails()

        page.continueButton().click()
        page.errorMessage().should('contain', 'Enter a phone number in the correct format')
      })

      it('should enter log details for social PIN phone contact and proceed to check details page', () => {
        page.firstNightOrEarlyDaysCentreNo().check({ force: true })
        page.socialPinPhoneContactLogDetails()

        page.continueButton().click()
        cy.url().should('include', '/log/confirm')
      })
    }

    if (name === 'Remove a PIN phone contact') {
      it('should display "PIN phone contact to remove" text', () => {
        cy.contains('h2', 'PIN phone contact to remove').should('exist')
      })

      it('should show validation errors for missing required fields', () => {
        page.continueButton().click()

        page.errorSummary().should('exist')
        page.errorMessage().should('exist')
      })

      it('should enter log details for removing a PIN phone contact and proceed to check details page', () => {
        page.removePinPhoneContactLogDetails()

        page.continueButton().click()
        cy.url().should('include', '/log/confirm')
      })
    }

    if (name === 'Swap Visiting Orders (VOs) for PIN Credit') {
      it('should enter log details for swapping VOs for PIN credit and proceed to check details page', () => {
        cy.get('textarea#details').type('Need to swap 2 visiting orders for phone credit')

        page.continueButton().click()
        cy.url().should('include', '/log/confirm')
      })

      it('should allow proceed to check details page without entering log details (optional)', () => {
        page.continueButton().click()
        cy.url().should('include', '/log/confirm')
      })

      it('should enforce character limit on details field', () => {
        const longText = 'a'.repeat(1001)
        cy.get('textarea#details').invoke('val', longText).trigger('input')

        page.continueButton().click()
        cy.get('.govuk-error-message').should('contain', '1000 characters')
      })
    }

    if (name === 'Supply list of contacts') {
      it('should enter log details for supply contact list and proceed to check details page', () => {
        cy.get('textarea#details').type('Please provide full contact list for prisoner')

        page.continueButton().click()
        cy.url().should('include', '/log/confirm')
      })

      it('should allow proceed to check details page without entering log details (optional)', () => {
        page.continueButton().click()
        cy.url().should('include', '/log/confirm')
      })
    }
  })
})

context('Change Application Page - Legacy company field', () => {
  beforeEach(() => {
    cy.resetAndSignIn()
    cy.task('stubOfficialAppTypeWithCompanyField')
    cy.task('stubGetGroupsAndTypes')
    cy.task('stubGetDepartments', { appType: '2' })
    cy.task('stubGetRelationships', 'OFFICIAL_RELATIONSHIP')
    cy.visit('/applications/A1234AA/official-app-id/change')
  })

  it('should pre-fill Organisation field using legacy company value', () => {
    cy.get('#organisation').should('have.value', 'Legacy Company Ltd')
  })
})
