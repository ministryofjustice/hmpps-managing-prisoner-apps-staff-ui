import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'

govukFrontend.initAll()
mojFrontend.initAll()

document.addEventListener('DOMContentLoaded', function initPrisonerLookup() {
  const findPrisonerButton = document.getElementById('prisoner-number-lookup')
  const prisonerNumberInput = document.getElementById('prison-number')
  const prisonerNameInput = document.getElementById('prisoner-name')
  const prisonerNameDisplay = document.getElementById('prisoner-name-display')
  const findPrisonerLookupButton = document.getElementById('prisoner-lookup-button')

  if (!findPrisonerButton) {
    return
  }

  async function handlePrisonerLookup(event) {
    event.preventDefault()

    const prisonNumber = prisonerNumberInput.value.trim()
    if (!prisonNumber) {
      prisonerNameDisplay.innerText = 'Prisoner name: Not found'
      prisonerNameDisplay.classList.remove('govuk-!-display-none')
      findPrisonerLookupButton.value = 'true'
      return
    }

    try {
      const response = await fetch(`/log/prisoner-details/find/${encodeURIComponent(prisonNumber)}`)
      const data = await response.json()

      prisonerNameDisplay.classList.remove('govuk-!-display-none')

      if (response.ok) {
        prisonerNameInput.value = data.prisonerName
        prisonerNameDisplay.innerText = `Prisoner name: ${data.prisonerName}`
      } else {
        prisonerNameInput.value = ''
        prisonerNameDisplay.innerText = 'Prisoner name: Not found'
      }
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      prisonerNameInput.value = ''
      prisonerNameDisplay.innerText = 'Prisoner name: Not found'
    }

    findPrisonerLookupButton.value = 'true'
  }

  findPrisonerButton.addEventListener('click', handlePrisonerLookup)
})
