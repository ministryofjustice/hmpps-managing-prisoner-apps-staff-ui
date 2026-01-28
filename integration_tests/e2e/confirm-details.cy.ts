import { app } from '../../server/testData'
import ConfirmDetailsPage from '../pages/confirmDetailsPage'
import Page from '../pages/page'

context('Confirm Details Page', () => {
  let page: ConfirmDetailsPage

  beforeEach(() => {
    cy.resetAndSignIn()

    cy.task('stubGetPrisonerByPrisonerNumber', 'A1234AA')
    cy.task('stubGetGroupsAndTypes')
    cy.task('stubGetDepartments', { appType: '5' })
  })

  const testConfirmDetailsPage = (title, route, backLink, hasChangeLinks, isUpdate = false) => {
    const changeApp = {
      ...app,
      appType: '5',
      applicationType: { id: '5', name: 'Swap Visiting Orders (VOs) for PIN Credit' },
      assignedGroup: { name: 'Business Hub', id: '591185f2-863a-4a32-9812-c12f40b94ccb' },
    }

    context(title, () => {
      beforeEach(() => {
        if (route === '/log/confirm') {
          cy.visit('/log/confirm')

          cy.enterPrisonerDetails()
          cy.selectGroup('Pin Phone Contact Apps')
          cy.selectApplicationType('Swap Visiting Orders (VOs) for PIN Credit')
          cy.selectDepartment('Business Hub')
          cy.selectLoggingMethod('manual')

          cy.contains('button', 'Continue').click()
        } else {
          cy.task('stubGetPrisonerApp', {
            app: changeApp,
          })
          cy.task('stubGetHistory', { app: changeApp })
          cy.task('stubGetAppResponse', { app: changeApp })

          cy.visit(route)
          cy.contains('button', 'Continue').click()
        }

        page = Page.verifyOnPage(ConfirmDetailsPage)
      })

      it('should display the correct page title', () => {
        page.pageTitle().should('include', 'Swap Visiting Orders (VOs) for PIN Credit')
      })

      it('should render the back link with correct text and href', () => {
        page.backLink().should('have.text', 'Back').and('have.attr', 'href', backLink)
      })

      it('should render the application type summary with correct text', () => {
        page.applicationType().should('exist')
      })

      it(`should ${hasChangeLinks ? '' : 'not '}allow changing the application type`, () => {
        page.changeApplicationType().should(hasChangeLinks ? 'exist' : 'not.exist')
      })

      it('should render prisoner name summary with correct text', () => {
        page.prisonerName().should('exist')
      })

      it('should render a Continue button with the correct text', () => {
        page.continueButton().should('contain.text', 'Save')
      })

      it('should successfully submit the application and redirect', () => {
        if (isUpdate) {
          cy.task('stubUpdatePrisonerApp', { app: changeApp })
          cy.task('stubGetPrisonerApp', { app: changeApp })

          page.continueButton().click()

          cy.url().should('include', `/applications/${changeApp.requestedBy.username}/${changeApp.id}/change/submit`)
        } else {
          const submittedApp = {
            ...app,
            id: '13d2c453-be11-44a8-9861-21fd8ae6e911',
            requestedBy: { ...app.requestedBy, username: 'A1234AA' },
            applicationType: { id: 5, name: 'Swap Visiting Orders (VOs) for PIN Credit' },
          }
          cy.task('stubSubmitPrisonerApp', { app: submittedApp })
          cy.task('stubGetPrisonerApp', { app: submittedApp })

          page.continueButton().click()

          cy.url().should('include', `/log/submit/A1234AA/${submittedApp.id}`)
        }
      })
    })
  }

  testConfirmDetailsPage(
    'Logging a new application - Confirm details',
    '/log/confirm',
    '/log/application-details',
    true,
    false,
  )

  testConfirmDetailsPage(
    'Updating an existing application - Confirm details',
    `/applications/${app.requestedBy.username}/${app.id}/change`,
    `/applications/${app.requestedBy.username}/${app.id}/change`,
    false,
    true,
  )
})
