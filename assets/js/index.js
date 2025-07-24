import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'

govukFrontend.initAll()
mojFrontend.initAll()

document.addEventListener('DOMContentLoaded', function initPrisonerLookup() {
  const findPrisonerButton = document.getElementById('prisoner-number-lookup')
  const prisonerNumberInput = document.getElementById('prison-number')
  const prisonerNameDisplay = document.getElementById('prisoner-name-display')
  const prisonerNameInput = document.getElementById('prisoner-name')
  const prisonerAlertCountInput = document.getElementById('prisoner-alert-count')

  const findPrisonerLookupButton = document.getElementById('prisoner-lookup-button')

  if (!findPrisonerButton) {
    return
  }

  async function handlePrisonerLookup(event) {
    event.preventDefault()

    const prisonNumber = prisonerNumberInput.value.trim()
    if (!prisonNumber) {
      prisonerNameDisplay.innerText = 'Prisoner name: Not found'
      findPrisonerLookupButton.value = 'true'
      return
    }

    try {
      const response = await fetch(`/log/prisoner-details/find/${encodeURIComponent(prisonNumber)}`)
      const data = await response.json()

      prisonerNameDisplay.classList.remove('govuk-!-display-none')

      if (response.ok) {
        const { prisonerName, activeAlertCount } = data
        prisonerNameInput.value = prisonerName
        prisonerAlertCountInput.value = activeAlertCount

        const dpsPrisonerUrlInput = document.getElementById('dps-prisoner-url')
        const dpsPrisonerUrl = dpsPrisonerUrlInput.value

        const alertsLink = `${dpsPrisonerUrl}prisoner/${prisonNumber}/alerts/active`

        prisonerNameDisplay.innerHTML = `
    <strong>Prisoner name: ${prisonerName}</strong><br>
    ${activeAlertCount} alert${activeAlertCount === 1 ? '' : 's'} 
    (<a href="${alertsLink}" target="_blank" rel="noopener noreferrer">View</a>)
  `
      } else {
        prisonerNameInput.value = ''
        prisonerAlertCountInput.value = ''
        prisonerNameDisplay.innerHTML = 'Prisoner name: Not found'
      }

      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      prisonerNameInput.value = ''
      prisonerAlertCountInput.value = ''
      prisonerNameDisplay.innerHTML = 'Prisoner name: Not found'
    }

    findPrisonerLookupButton.value = 'true'
  }

  findPrisonerButton.addEventListener('click', handlePrisonerLookup)
})
