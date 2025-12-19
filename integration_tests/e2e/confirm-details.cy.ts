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

  const testConfirmDetailsPage = (title, route, backLink, hasChangeLinks) => {
    context(title, () => {
      beforeEach(() => {
        if (route === '/log/confirm') {
          cy.visit('/log/confirm')

          cy.enterPrisonerDetails()
          cy.selectGroup('Pin Phone Contact Apps')
          cy.selectApplicationType('Swap Visiting Orders (VOs) for PIN Credit')
          cy.selectDepartment('Business Hub')

          cy.contains('button', 'Continue').click()
        } else {
          const changeApp = {
            ...app,
            appType: '5',
            applicationType: { id: '5', name: 'Swap Visiting Orders (VOs) for PIN Credit' },
            assignedGroup: { name: 'Business Hub', id: '591185f2-863a-4a32-9812-c12f40b94ccb' },
          }
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
    })
  }

  testConfirmDetailsPage(
    'Logging a new application - Confirm details',
    '/log/confirm',
    '/log/application-details',
    true,
  )

  testConfirmDetailsPage(
    'Updating an existing application - Confirm details',
    `/applications/${app.requestedBy.username}/${app.id}/change`,
    `/applications/${app.requestedBy.username}/${app.id}/change`,
    false,
  )
})
