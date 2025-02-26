import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'

govukFrontend.initAll()
mojFrontend.initAll()

document.addEventListener('DOMContentLoaded', () => {
  const findPrisonerButton = document.getElementById('prisoner-number-lookup')
  const prisonerNumberInput = document.getElementById('prison-number')
  const prisonerNameInput = document.getElementById('prisoner-name')
  const prisonerNameDisplay = document.getElementById('prisoner-name-display')

  async function handlePrisonerLookup(event) {
    event.preventDefault()

    const prisonNumber = prisonerNumberInput.value.trim()
    const notFoundText = 'Prisoner name: Not found'

    if (!prisonNumber) {
      prisonerNameDisplay.innerText = notFoundText
      prisonerNameInput.value = ''
      prisonerNameDisplay.classList.remove('govuk-!-display-none')
      return
    }

    try {
      const response = await fetch(`/log/prisoner-details/find?prisonNumber=${encodeURIComponent(prisonNumber)}`)
      const data = (await response.ok) ? await response.json() : null

      prisonerNameInput.value = data && data.prisonerName ? data.prisonerName : ''
      prisonerNameDisplay.innerText = data ? `Prisoner name: ${data.prisonerName}` : notFoundText
      prisonerNameDisplay.classList.remove('govuk-!-display-none')
      // eslint-disable-next-line no-unused-vars
    } catch (_e) {
      prisonerNameInput.value = ''
      prisonerNameDisplay.innerText = notFoundText
    }
  }

  findPrisonerButton.addEventListener('click', handlePrisonerLookup)
})
