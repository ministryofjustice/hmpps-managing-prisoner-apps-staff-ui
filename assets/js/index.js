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

/* eslint-disable no-console */
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ Status sync script loaded') // temp log

  const form = document.querySelector('form')
  const closed = form && form.querySelector('input[name="status"][value="CLOSED"]')
  const approved = form && form.querySelector('input[name="status"][value="APPROVED"]')
  const declined = form && form.querySelector('input[name="status"][value="DECLINED"]')

  if (!closed || !approved || !declined) {
    console.log('⚠️ Status checkboxes not found') // another useful log
    return
  }

  closed.addEventListener('change', () => {
    console.log('Closed checkbox changed:', closed.checked)
    if (closed.checked) {
      if (!approved.checked && !declined.checked) {
        approved.checked = true
        declined.checked = true
        console.log('Approved + Declined auto‑checked')
      }
    } else {
      approved.checked = false
      declined.checked = false
      console.log('Approved + Declined cleared')
    }
  })

  form.addEventListener('submit', () => {
    console.log('Form submit normalisation running')
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
