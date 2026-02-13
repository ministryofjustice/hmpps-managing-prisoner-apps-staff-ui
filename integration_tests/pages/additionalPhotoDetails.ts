import Page from './page'

export default class AdditionalPhotoDetailsPage extends Page {
  constructor() {
    super('Enter additional details')
  }

  heading = () => cy.get('h1.govuk-heading-xl')

  caption = () => cy.get('.govuk-caption-xl')

  detailsLabel = () => cy.get('label').contains('Add additional details about this application (optional)')

  textArea = () => cy.get('#additionalDetails')

  continueButton = () => cy.get('button').contains('Continue')
}
