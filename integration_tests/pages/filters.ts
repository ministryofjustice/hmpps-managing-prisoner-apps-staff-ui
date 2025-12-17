import Page from './page'

export default class FiltersPage extends Page {
  constructor() {
    super('View all applications in your prison')
  }

  applicationsTable = () => cy.get('table')

  tableHeaders = () => cy.get('thead th')

  tableHeaderAt = (index: number) => this.tableHeaders().eq(index)

  filterPanel = () => cy.get('.moj-filter')

  statusCheckbox = (status: 'PENDING' | 'APPROVED' | 'DECLINED') => cy.get(`input[name="status"][value="${status}"]`)

  orderRadio = (order: 'newest' | 'oldest') => cy.get(`input[name="order"][value="${order}"]`)

  submitButton = () => cy.get('[data-test-id="submit-button"]')

  breadcrumbLink = () => cy.get('.govuk-breadcrumbs a')

  tableRows = () => cy.get('tbody tr')

  assertDefaultFilters = () => {
    this.filterPanel().should('exist')
    this.statusCheckbox('PENDING').should('exist').and('be.checked')
    this.statusCheckbox('APPROVED').should('not.be.checked')
    this.statusCheckbox('DECLINED').should('not.be.checked')
    this.orderRadio('newest').should('exist').and('be.checked')
    this.orderRadio('oldest').should('not.be.checked')
  }

  sortBy = (order: 'newest' | 'oldest') => {
    this.orderRadio(order).check({ force: true })
    this.submitButton().click()
    cy.url().should('include', `order=${order}`)
  }
}
