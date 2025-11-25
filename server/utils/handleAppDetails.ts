import { Request, Response } from 'express'
import {
  AddNewOfficialPinPhoneContactDetails,
  AddNewSocialPinPhoneContactDetails,
  RemovePinPhoneContactDetails,
} from 'express-session'

import { ApplicationType } from '../@types/managingAppsApi'
import { validateAmountField } from '../routes/validate/validateAmountField'
import { validateAddNewOfficialContact } from '../routes/validate/validateNewOfficialContact'
import { validateAddNewSocialContact } from '../routes/validate/validateNewSocialPinPhoneContact'
import { validateRemovePinPhoneContact } from '../routes/validate/validateRemovePinPhoneContact'
import { validateTextField } from '../routes/validate/validateTextField'
import { getCountryNameByCode } from './formatCountryList'
import { updateSessionData } from './session'

type ContextOptions = {
  getAppType: (req: Request, res: Response) => ApplicationType
  getTemplateData: (req: Request, res: Response, appType: ApplicationType) => Promise<Record<string, unknown>>
  isUpdate: boolean
  renderPath: string
  successRedirect: (req: Request, res: Response) => string
}

type SelectOption = {
  value: string
  text: string
  selected?: boolean
}

// eslint-disable-next-line import/prefer-default-export
export async function handleApplicationDetails(req: Request, res: Response, options: ContextOptions): Promise<void> {
  const applicationType = options.getAppType(req, res)

  const errors: Record<string, string> = {}
  const additionalData: Record<string, unknown> = {}

  let earlyDaysCentre: string | undefined

  const templateData: Record<string, unknown> = {
    ...(await options.getTemplateData(req, res, applicationType)),
    title: applicationType.name,
  }
  const isGeneric = applicationType.genericType || applicationType.genericForm

  if (isGeneric) {
    const { details } = req.body
    const detailErrors = validateTextField({
      fieldValue: details,
      fieldName: 'Details',
      isRequired: true,
    })

    if (Object.keys(detailErrors).length === 0) {
      additionalData.details = details
    } else {
      Object.assign(errors, detailErrors)
      templateData.details = details
    }
  } else {
    switch (applicationType.id) {
      case 1: {
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

      case 2: {
        const formData: AddNewOfficialPinPhoneContactDetails = req.body

        const formErrors = validateAddNewOfficialContact(formData)

        const formFields = [
          'firstName',
          'lastName',
          'organisation',
          'relationship',
          'telephone1',
          'telephone2',
        ] as const

        if (Object.keys(formErrors).length === 0) {
          for (const field of formFields) {
            additionalData[field] = formData[field]
          }

          Object.assign(templateData)
        } else {
          Object.assign(errors, formErrors)

          const updatedRelationships = ((templateData.formattedRelationshipList as SelectOption[]) ?? []).map(item => ({
            ...item,
            selected: item.value === formData.relationship,
          }))

          Object.assign(templateData, {
            ...formData,
            formattedRelationshipList: updatedRelationships,
          })
        }
        break
      }

      case 3: {
        const formData: AddNewSocialPinPhoneContactDetails = {
          ...req.body,
          dob: {
            day: req.body['dob-day'] || '',
            month: req.body['dob-month'] || '',
            year: req.body['dob-year'] || '',
          },
        }
        const formErrors = validateAddNewSocialContact(formData, options.isUpdate)

        const formFields = [
          'firstName',
          'lastName',
          'dateOfBirthOrAge',
          'dob',
          'age',
          'relationship',
          'addressLine1',
          'addressLine2',
          'townOrCity',
          'postcode',
          'country',
          'telephone1',
          'telephone2',
        ] as const

        if (Object.keys(formErrors).length === 0) {
          earlyDaysCentre = formData.earlyDaysCentre

          for (const field of formFields) {
            if (field === 'country') {
              additionalData.country = getCountryNameByCode(formData.country)
            } else {
              additionalData[field] = formData[field]
            }
          }

          Object.assign(templateData, {
            dateOfBirthOrAge: formData.dateOfBirthOrAge,
          })
        } else {
          Object.assign(errors, formErrors)

          const updatedCountries = ((templateData.countries as SelectOption[]) ?? []).map(item => ({
            ...item,
            selected: item.value === formData.country,
          }))

          const updatedRelationships = ((templateData.formattedRelationshipList as SelectOption[]) ?? []).map(item => ({
            ...item,
            selected: item.value === formData.relationship,
          }))

          Object.assign(templateData, {
            ...formData,
            countries: updatedCountries,
            formattedRelationshipList: updatedRelationships,
            dob: formData.dob || { day: '', month: '', year: '' },
            age: formData.age || '',
            dateOfBirthOrAge: formData.dateOfBirthOrAge || '',
          })
        }
        break
      }

      case 4: {
        const formData: RemovePinPhoneContactDetails = req.body

        const formErrors = validateRemovePinPhoneContact(formData)

        const formFields = ['firstName', 'lastName', 'telephone1', 'telephone2', 'relationship'] as const

        if (Object.keys(formErrors).length === 0) {
          for (const field of formFields) {
            additionalData[field] = formData[field]
          }

          Object.assign(templateData, {
            ...formData,
          })
        } else {
          Object.assign(errors, formErrors)

          Object.assign(templateData, {
            ...formData,
          })
        }
        break
      }

      case 5: {
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

      case 6: {
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

      case 7: {
        const { details } = req.body
        const detailErrors = validateTextField({ fieldValue: details, fieldName: 'Details', isRequired: true })

        if (Object.keys(detailErrors).length === 0) {
          additionalData.details = details
        } else {
          Object.assign(errors, detailErrors)
          templateData.details = details
        }
        break
      }

      default:
        return res.redirect(options.successRedirect(req, res))
    }
  }
  if (Object.keys(errors).length > 0) {
    return res.render(options.renderPath, {
      ...templateData,
      errors,
    })
  }

  updateSessionData(req, {
    earlyDaysCentre,
    additionalData,
  })

  return res.redirect(options.successRedirect(req, res))
}
