import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'

govukFrontend.initAll()
mojFrontend.initAll()

document.addEventListener('DOMContentLoaded', function initPrisonerLookup() {
  const findPrisonerButton = document.getElementById('prisoner-number-lookup')
  const prisonerNumberInput = document.getElementById('prison-number')
  const prisonerNameInput = document.getElementById('prisoner-name')
  const prisonerNameDisplay = document.getElementById('prisoner-name-display')

  async function handlePrisonerLookup(event) {
    event.preventDefault()

    const prisonNumber = prisonerNumberInput.value.trim()
    if (!prisonNumber) {
      prisonerNameDisplay.innerText = 'Prisoner name: Not found'
      return
    }

    try {
      const response = await fetch(`/log/prisoner-details/find?prisonNumber=${encodeURIComponent(prisonNumber)}`)
      const data = await response.json()

      if (response.ok) {
        prisonerNameInput.value = data.prisonerName
        prisonerNameDisplay.innerText = `Prisoner name: ${data.prisonerName}`
      } else {
        prisonerNameInput.value = ''
        prisonerNameDisplay.innerText = 'Prisoner name: Not found'
      }
    } catch (e) {
      prisonerNameInput.value = ''
      prisonerNameDisplay.innerText = 'Prisoner name: Not found'
    }
  }

  findPrisonerButton.addEventListener('click', handlePrisonerLookup)
})
