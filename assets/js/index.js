/* eslint-disable no-unused-vars */
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
  const prisonerExistsInput = document.getElementById('prisoner-exists')
  const findPrisonerLookupButton = document.getElementById('prisoner-lookup-button')
  const dpsPrisonerUrlInput = document.getElementById('dps-prisoner-url')

  if (
    !findPrisonerButton ||
    !prisonerNumberInput ||
    !prisonerNameDisplay ||
    !prisonerNameInput ||
    !prisonerAlertCountInput ||
    !prisonerExistsInput ||
    !findPrisonerLookupButton ||
    !dpsPrisonerUrlInput
  ) {
    return
  }

  function setPrisonerNotFound() {
    prisonerExistsInput.value = 'false'
    prisonerNameInput.value = ''
    prisonerAlertCountInput.value = ''
    prisonerNameDisplay.innerHTML = 'Prisoner name: Not found'
  }

  async function handlePrisonerLookup(event) {
    event.preventDefault()

    const prisonNumber = prisonerNumberInput.value.trim()

    if (!prisonNumber) {
      setPrisonerNotFound()
      findPrisonerLookupButton.value = 'true'
      return
    }

    try {
      const response = await fetch(`/log/prisoner-details/find/${encodeURIComponent(prisonNumber)}`)
      const data = await response.json()

      prisonerNameDisplay.classList.remove('govuk-!-display-none')

      if (response.ok) {
        const dpsBaseUrl = dpsPrisonerUrlInput.value
        const alertsLink = `${dpsBaseUrl}prisoner/${prisonNumber}/alerts/active`

        prisonerExistsInput.value = 'true'
        prisonerNameInput.value = data.prisonerName
        prisonerAlertCountInput.value = data.activeAlertCount

        prisonerNameDisplay.innerHTML = `
          <strong>Prisoner name: ${data.prisonerName}</strong><br>
          ${data.activeAlertCount} alert${data.activeAlertCount === 1 ? '' : 's'} 
          (<a href="${alertsLink}" target="_blank" rel="noopener noreferrer">View</a>)
        `
      } else {
        setPrisonerNotFound()
      }
    } catch (e) {
      setPrisonerNotFound()
    }

    findPrisonerLookupButton.value = 'true'
  }

  findPrisonerButton.addEventListener('click', handlePrisonerLookup)
})

document.addEventListener('DOMContentLoaded', () => {
  const printButton = document.querySelector('#print-button')
  if (printButton) {
    printButton.addEventListener('click', event => {
      event.preventDefault()
      window.print()
    })
  }
})

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form')
  const closed = document.getElementById('status-2')
  const approved = document.getElementById('status-closed')
  const declined = document.getElementById('status-closed-2')

  if (!closed || !approved || !declined) {
    return
  }

  closed.addEventListener('change', () => {
    if (closed.checked) {
      if (!approved.checked && !declined.checked) {
        approved.checked = true
        declined.checked = true
      }
    } else {
      approved.checked = false
      declined.checked = false
    }
  })

  form.addEventListener('submit', () => {
    if (!closed.checked) {
      approved.checked = false
      declined.checked = false
    }
    if (closed.checked && !approved.checked && !declined.checked) {
      approved.checked = true
      declined.checked = true
    }
  })
})
