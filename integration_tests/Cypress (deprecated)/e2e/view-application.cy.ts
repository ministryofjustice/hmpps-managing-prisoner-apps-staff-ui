import { app, appWithPhotos } from '../../server/testData'
import applicationTypesData from '../fixtures/applicationTypes.json'

import ViewApplicationPage from '../pages/viewApplicationPage'

const { applicationTypes } = applicationTypesData

applicationTypes
  .filter(type => type.id !== 6)
  .forEach(({ name, id }) => {
    context(`View Application Page - ${name}`, () => {
      let page: ViewApplicationPage
      const application = { ...app, applicationType: { id, name } }

      beforeEach(() => {
        cy.resetAndSignIn()
        cy.task('stubGetPrisonerApp', { app: application })
        cy.task('stubGetGroupsAndTypes')

        cy.visit(`/applications/${application.requestedBy.username}/${application.id}`)
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

context('View Application Page - With Photos', () => {
  let page: ViewApplicationPage
  const applicationWithPhotos = {
    ...appWithPhotos,
    applicationType: { id: 7, name: 'Make a general PIN phone enquiry' },
  }

  beforeEach(() => {
    cy.resetAndSignIn()
    cy.task('stubGetPrisonerApp', { app: applicationWithPhotos })
    cy.task('stubGetGroupsAndTypes')
    cy.task('stubGetDocument', { documentUuid: 'uuid-1234' })
    cy.task('stubGetDocument', { documentUuid: 'uuid-9876' })
    cy.task('stubDownloadDocument', { documentUuid: 'uuid-1234' })
    cy.task('stubDownloadDocument', { documentUuid: 'uuid-9876' })

    cy.visit(`/applications/${applicationWithPhotos.requestedBy.username}/${applicationWithPhotos.id}`)
    page = new ViewApplicationPage('Make a general PIN phone enquiry')
  })

  it('should display Image 1 and Image 2 (optional) labels', () => {
    page.image1Label().should('exist')
    page.image2Label().should('exist')
  })

  it('should make images clickable links that open in new tab', () => {
    cy.get('a[target="_blank"][rel="noopener noreferrer"]').first().should('have.attr', 'href')
  })

  it('should display Additional details field', () => {
    page.additionalDetailsLabel().should('exist')
  })

  it('should not display Change button when photos exist', () => {
    page.changeButton().should('not.exist')
  })
})

context('View Application Page - Without Photos', () => {
  let page: ViewApplicationPage
  const applicationWithoutPhotos = {
    ...app,
    applicationType: { id: 3, name: 'Add a social PIN phone contact' },
    files: [],
  }

  beforeEach(() => {
    cy.resetAndSignIn()
    cy.task('stubGetPrisonerApp', { app: applicationWithoutPhotos })
    cy.task('stubGetGroupsAndTypes')

    cy.visit(`/applications/${applicationWithoutPhotos.requestedBy.username}/${applicationWithoutPhotos.id}`)
    page = new ViewApplicationPage('Add a social PIN phone contact')
  })

  it('should not display image labels when no photos', () => {
    page.image1Label().should('not.exist')
    page.image2Label().should('not.exist')
  })

  it('should not display any image thumbnails', () => {
    page.thumbnailImages().should('not.exist')
  })

  it('should not display Additional details field (photo-specific field)', () => {
    page.additionalDetailsLabel().should('not.exist')
  })
})
