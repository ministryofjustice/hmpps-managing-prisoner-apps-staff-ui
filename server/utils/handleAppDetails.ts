import { Request, Response } from 'express'
import { ApplicationType } from 'express-session'

import { APPLICATION_TYPE_VALUES } from '../constants/applicationTypes'
import { validateAmountField } from '../routes/validate/validateAmountField'
import { validateTextField } from '../routes/validate/validateTextField'
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
