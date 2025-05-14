import applicationTypesData from '../fixtures/applicationTypes.json'

import TestData from '../../server/routes/testutils/testData'
import ForwardApplicationPage from '../pages/forwardApplicationPage'
import Page from '../pages/page'

const { applicationTypes } = applicationTypesData

applicationTypes.forEach(({ name, apiValue }) => {
  context(`Forward Application Page - ${name}`, () => {
    let page: ForwardApplicationPage
    const { app: baseApp, group } = new TestData()
    const app = { ...baseApp, appType: apiValue }

    const visitPage = () => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.task('stubGetPrisonerApp', {
        app,
      })
      cy.task('stubGetGroups')
      cy.signIn()
      cy.visit(`/applications/${app.requestedBy.username}/${app.id}/forward`)
      page = Page.verifyOnPage(ForwardApplicationPage)
    }

    beforeEach(visitPage)

    describe('Page structure', () => {
      it('should display the correct page title', () => {
        page.pageTitle().should('include', 'Forward this application')
      })

      it('should display the correct application type name in the caption', () => {
        page.caption().should('contain.text', name)
      })

      it('should display all form elements', () => {
        page.forwardToDepartment().should('exist')
        page.forwardingReason().should('exist')
        page.continueButton().should('exist').and('contain.text', 'Continue')
      })
    })

    describe('Form interactions', () => {
      it('should allow submitting the form when a department is selected', () => {
        page.selectForwardToDepartment(group.id)
        page.continueButton().click()
        cy.url().should('not.include', '/forward')
      })

      it('should allow adding a forwarding reason', () => {
        const reason = 'This application needs to be reviewed by Activities department.'
        page.forwardingReason().type(reason).should('have.value', reason)
      })
    })

    describe('Form validation', () => {
      it('should display an error if no department is selected and continue is clicked', () => {
        page.continueButton().click()
        page.errorSummary().should('be.visible')
        page.errorSummary().should('contain.text', 'Choose where to send')
      })

      it('should display an error if the forwarding reason exceeds 1000 characters', () => {
        const longReason = 'A'.repeat(1001)
        page.forwardingReason().type(longReason)
        page.continueButton().click()
        page.errorSummary().should('be.visible')
        page.errorSummary().should('contain.text', 'Reason must be 1000 characters or less')
      })
    })
  })
})
