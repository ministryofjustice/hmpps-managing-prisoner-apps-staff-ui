import applicationTypesData from '../fixtures/applicationTypes.json'

import TestData from '../../server/routes/testutils/testData'
import ViewApplicationPage from '../pages/viewApplicationPage'

const { applicationTypes } = applicationTypesData

applicationTypes
  .filter(({ key }) => !['PIN_PHONE_ADD_NEW_LEGAL_CONTACT'].includes(key))
  .forEach(({ name, key }) => {
    context(`View Application Page - ${name}`, () => {
      let page: ViewApplicationPage
      const { app: baseApp } = new TestData()
      const app = { ...baseApp, appType: key }

      beforeEach(() => {
        cy.resetAndSignIn()
        cy.task('stubGetPrisonerApp', {
          app,
        })
        cy.task('stubGetAppTypes')

        cy.visit(`/applications/${app.requestedBy.username}/${app.id}`)

        page = new ViewApplicationPage(name)
      })

      it('should display the correct page title', () => {
        page.pageTitle().should('include', name)
      })

      it('should display the application type correctly', () => {
        page.applicationType().should('contain.text', name)
      })

      it('should display the application status', () => {
        page.applicationStatus().should('exist')
      })

      it('should display the department handling the application', () => {
        page.department().should('exist')
      })

      it('should display the prisoner name', () => {
        page.prisonerName().should('exist')
      })

      it('should display the prisoner cell location', () => {
        page.prisonerCellLocation().should('exist')
      })

      it('should display the date the application was submitted', () => {
        page.submittedOn().should('exist')
      })

      it('should display View profile and View alerts links opening in a new tab', () => {
        page
          .viewProfileLink()
          .should('exist')
          .should('have.attr', 'target', '_blank')
          .and('have.attr', 'rel', 'noopener noreferrer')

        page
          .viewAlertsLink()
          .should('exist')
          .should('have.attr', 'target', '_blank')
          .and('have.attr', 'rel', 'noopener noreferrer')
      })

      it('should display the incentive level', () => {
        page.summaryListRowKey('Incentive level').should('exist')
      })

      it('should allow navigating to the Comments section', () => {
        page
          .commentsTab()
          .should('exist')
          .and('contain.text', 'Comments')
          .and('have.attr', 'href', '/applications/G123456/13d2c453-be11-44a8-9861-21fd8ae6e911/comments')
      })

      it('should allow navigating to the Action and Reply section', () => {
        page
          .actionAndReplyTab()
          .should('exist')
          .and('contain.text', 'Action and reply')
          .and('have.attr', 'href', '/applications/G123456/13d2c453-be11-44a8-9861-21fd8ae6e911/reply')
      })

      it('should allow navigating to the History section', () => {
        page
          .historyTab()
          .should('exist')
          .and('contain.text', 'History')
          .and('have.attr', 'href', '/applications/G123456/13d2c453-be11-44a8-9861-21fd8ae6e911/history')
      })
    })
  })
