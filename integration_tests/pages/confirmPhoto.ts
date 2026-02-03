import Page from './page'

export default class ConfirmPhotoPage extends Page {
  constructor() {
    super('Confirm image')
  }

  pageTitle() {
    return cy.title()
  }

  photoPreview() {
    return cy.get('#photo-preview')
  }

  editInstructions() {
    return cy.contains('Edit the image before continuing')
  }

  saveAndContinue() {
    return cy.contains('button', 'Save and continue')
  }

  backLink() {
    return cy.get('.govuk-back-link')
  }
}
