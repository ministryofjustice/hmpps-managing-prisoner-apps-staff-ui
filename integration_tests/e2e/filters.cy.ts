import {
  appSearchResponse,
  getAppsByType,
  getAppsSortedByOldest,
  app as appDetailTemplate,
} from '../../server/testData'
import FiltersPage from '../pages/filters'

import Page from '../pages/page'

context('Applications List - Filter Functionality', () => {
  let page: FiltersPage

  beforeEach(() => {
    cy.resetAndSignIn()
    cy.task('stubGetApps', appSearchResponse)
    cy.task('stubGetGroupsAndTypes')
    cy.task('stubGetActiveAgencies')

    cy.visit('/applications')
    page = Page.verifyOnPage(FiltersPage)
  })

  describe('Applications List Page', () => {
    it('should display applications table with correct columns', () => {
      page.applicationsTable().should('exist')
      page.tableHeaders().should('have.length.at.least', 5)
      page.tableHeaderAt(0).should('contain', 'Date')
      page.tableHeaderAt(1).should('contain', 'Application type')
      page.tableHeaderAt(2).should('contain', 'From')
      page.tableHeaderAt(3).should('contain', 'Department')
    })

    it('should display the filter panel with default values with Pending and Newest', () => {
      page.assertDefaultFilters()
    })

    it('should sort by newest first', () => {
      page.sortBy('newest')
    })

    it('should filter by order Oldest', () => {
      const oldestResponse = getAppsSortedByOldest()

      cy.get('input[name="order"][value="oldest"]').check({ force: true })
      cy.task('stubGetApps', oldestResponse.apps)
      page.submitButton().click()

      cy.url().should('include', 'order=oldest')

      page.tableRows().first().find('td').eq(0).should('contain', '21 March 2025')
    })

    it('should filter by app type and retain filters when navigating back', () => {
      const filteredApps = getAppsByType(3)
      const selectedApp = filteredApps.apps[0]

      const application = {
        ...appDetailTemplate,
        id: selectedApp.id,
        requestedBy: { username: selectedApp.requestedBy },
      }

      cy.get(`input[name="type"][value="3"]`).check({ force: true })
      cy.task('stubGetApps', filteredApps.apps)
      page.submitButton().click()

      cy.url().should('include', 'type=3')

      page.tableRows().should('have.length', filteredApps.apps.length)
      page.tableRows().first().find('td').eq(1).should('contain', `${selectedApp.appType.name}`)

      cy.task('stubGetPrisonerApp', { app: application })
      cy.task('stubGetAppResponse', { app: application })
      cy.task('stubGetComments', { app: application })
      cy.task('stubGetHistory', { app: application })
      cy.task('stubGetPrisonerByPrisonerNumber', application.requestedBy.username)
      cy.task('stubGetGroupsAndTypes')
      cy.task('stubGetActiveAgencies')

      page.tableRows().first().find('a').contains('View').click()
      cy.url().should('include', `/applications/${application.requestedBy.username}/${application.id}`)
      cy.get('h1').should('exist')

      page.breadcrumbLink().contains('View all applications').click()

      cy.url().should('include', 'type=3')
      cy.get(`input[name="type"][value="3"]`).should('be.checked')

      page.tableRows().should('have.length', filteredApps.apps.length)
      page.tableRows().first().find('td').eq(1).should('contain', selectedApp.appType.name)
    })

    it('should clear all filters when clicking Clear filters', () => {
      cy.visit('/applications')

      cy.task('stubGetApps', appSearchResponse)

      cy.contains('Clear filters').should('exist')

      cy.contains('Clear filters').click()

      cy.url().should('include', 'clearFilters=true')

      cy.get('input[name="status"][value="PENDING"]').should('not.be.checked')
      cy.get('input[name="status"][value="APPROVED"]').should('not.be.checked')
      cy.get('input[name="status"][value="DECLINED"]').should('not.be.checked')

      cy.get('input[name="order"][value="newest"]').should('be.checked')
      cy.get('input[name="order"][value="oldest"]').should('not.be.checked')

      cy.get('input[name="type"]').each($el => {
        cy.wrap($el).should('not.be.checked')
      })

      cy.get('.moj-filter__tag').should('not.exist')
    })
  })
})
