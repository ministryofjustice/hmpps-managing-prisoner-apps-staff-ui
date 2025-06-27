import { Request, Response } from 'express'
import { ApplicationType, AddNewSocialPinPhoneContactDetails } from 'express-session'

import { APPLICATION_TYPE_VALUES } from '../constants/applicationTypes'
import { validateAmountField } from '../routes/validate/validateAmountField'
import { validateTextField } from '../routes/validate/validateTextField'
import { validateAddNewSocialContact } from '../routes/validate/validateNewSocialPinPhoneContact'
import { updateSessionData } from './session'

type ContextOptions = {
  getAppType: (req: Request, res: Response) => ApplicationType
  getTemplateData: (req: Request, res: Response, appType: ApplicationType) => Record<string, unknown>
  renderPath: string
  successRedirect: (req: Request, res: Response) => string
}

// eslint-disable-next-line import/prefer-default-export
export async function handleApplicationDetails(req: Request, res: Response, options: ContextOptions): Promise<void> {
  const applicationType = options.getAppType(req, res)

  const errors: Record<string, string> = {}
  const additionalData: Record<string, unknown> = {}

  const templateData: Record<string, unknown> = {
    ...options.getTemplateData(req, res, applicationType),
    title: applicationType.name,
    applicationType,
  }

  switch (applicationType.value) {
    case APPLICATION_TYPE_VALUES.PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS: {
      const { details } = req.body
      const detailErrors = validateTextField({ fieldValue: details, fieldName: 'Details', isRequired: false })

      if (Object.keys(detailErrors).length === 0) {
        additionalData.details = details
      } else {
        Object.assign(errors, detailErrors)
        templateData.details = details
      }
      break
    }

    case APPLICATION_TYPE_VALUES.PIN_PHONE_EMERGENCY_CREDIT_TOP_UP: {
      const { amount, reason } = req.body
      const { errors: amountErrors, value: sanitizedAmount } = validateAmountField(amount, 'Amount', true)
      const reasonErrors = validateTextField({ fieldValue: reason, fieldName: 'Reason', isRequired: true })

      const fieldErrors = {
        ...amountErrors,
        ...reasonErrors,
      }

      templateData.amount = amount
      templateData.reason = reason

      if (!amountErrors?.Amount) {
        additionalData.amount = sanitizedAmount
      }

      if (!reasonErrors?.Reason) {
        additionalData.reason = reason
      }

      Object.assign(errors, fieldErrors)
      break
    }

    case APPLICATION_TYPE_VALUES.PIN_PHONE_SUPPLY_LIST_OF_CONTACTS: {
      const { details } = req.body
      const detailErrors = validateTextField({ fieldValue: details, fieldName: 'Details', isRequired: false })

      if (Object.keys(detailErrors).length === 0) {
        additionalData.details = details
      } else {
        Object.assign(errors, detailErrors)
        templateData.details = details
      }
      break
    }

    case APPLICATION_TYPE_VALUES.PIN_PHONE_ADD_NEW_CONTACT: {
      const formData: AddNewSocialPinPhoneContactDetails = req.body
      const formErrors = validateAddNewSocialContact(formData)

      if (Object.keys(formErrors).length === 0) {
        additionalData.firstName = formData.firstName
        additionalData.lastName = formData.lastName
        additionalData.dateOfBirthOrAge = formData.dateOfBirthOrAge
        additionalData.dob = formData.dob
        additionalData.age = formData.age
        additionalData.relationship = formData.relationship
        additionalData.addressLine1 = formData.addressLine1
        additionalData.addressLine2 = formData.addressLine2
        additionalData.townOrCity = formData.townOrCity
        additionalData.postcode = formData.postcode
        additionalData.country = formData.country
        additionalData.telephone1 = formData.telephone1
        additionalData.telephone2 = formData.telephone2
      } else {
        Object.assign(errors, formErrors)
        Object.assign(templateData, {
          ...formData,
          dob: formData.dob || { day: '', month: '', year: '' },
          age: formData.age || '',
          dateOfBirthOrAge: formData.dateOfBirthOrAge || '',
        })
      }
      break
    }

    default:
      return res.redirect(options.successRedirect(req, res))
  }

  if (Object.keys(errors).length > 0) {
    return res.render(options.renderPath, {
      ...templateData,
      errors,
    })
  }

  updateSessionData(req, { additionalData })

  return res.redirect(options.successRedirect(req, res))
}
