import { Request, Response, Router } from 'express'

import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import AuditService, { Page } from '../../services/auditService'

import handleLoggingMethodSelection from '../../helpers/logMethod'

const ERROR_MESSAGE = 'Select one'
const ERROR_SUMMARY = 'You need to select a method to log the application'

type LoggingMethod = 'manual' | 'webcam'

export default function logMethodRouter({ auditService }: { auditService: AuditService }): Router {
  const router = Router()

  router.get(URLS.LOG_METHOD, async (req: Request, res: Response) => {
    const { user } = res.locals
    const { applicationData, isLoggingForSamePrisoner } = req.session

    if (!applicationData?.department) {
      return res.redirect(URLS.LOG_DEPARTMENT)
    }

    await auditService.logPageView(Page.LOG_METHOD_PAGE, {
      who: user.username,
      correlationId: req.id,
    })

    return res.render(PATHS.LOG_APPLICATION.SELECT_METHOD, {
      title: 'Select method to log this application',
      errorMessage: null,
      errorSummary: null,
      applicationType: applicationData.type.name,
      isLoggingForSamePrisoner,
      selectedLogMethod: applicationData?.loggingMethod || null,
      prisonerName: isLoggingForSamePrisoner ? req.session.applicationData.prisonerName : null,
    })
  })

  router.post(URLS.LOG_METHOD, async (req: Request, res: Response) => {
    const { loggingMethod } = req.body as { loggingMethod?: LoggingMethod }
    const { applicationData } = req.session

    if (!applicationData?.department) {
      return res.redirect(URLS.LOG_DEPARTMENT)
    }

    if (!loggingMethod) {
      return res.render(PATHS.LOG_APPLICATION.SELECT_METHOD, {
        title: 'Select method to log this application',
        applicationType: applicationData.type?.name ?? '',
        errorMessage: ERROR_MESSAGE,
        errorSummary: [{ text: ERROR_SUMMARY, href: '#loggingMethod' }],
        selectedLogMethod: loggingMethod || null,
      })
    }

    const { redirectUrl } = handleLoggingMethodSelection(req, loggingMethod)

    return res.redirect(redirectUrl)
  })

  return router
}
