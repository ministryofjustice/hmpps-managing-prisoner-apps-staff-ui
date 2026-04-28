import { Request, Response, Router } from 'express'

import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import AuditService, { Page } from '../../services/auditService'
import PrisonService from '../../services/prisonService'

import config from '../../config'
import { updateSessionData } from '../../utils/http/session'
import { formatName } from '../../utils/formatters/formatName'
import validatePrisonerDetails from '../validate/validatePrisonerDetails'

export default function prisonerRouter({
  auditService,
  prisonService,
}: {
  auditService: AuditService
  prisonService: PrisonService
}): Router {
  const router = Router()

  router.get(URLS.LOG_PRISONER_DETAILS, async (req: Request, res: Response) => {
    delete req.session.prisonerContext
    delete req.session.isLoggingForSamePrisoner

    await auditService.logPageView(Page.LOG_PRISONER_DETAILS_PAGE, {
      who: res.locals.user.username,
      correlationId: req.id,
    })

    return res.render(PATHS.LOG_APPLICATION.PRISONER_DETAILS, {
      dpsPrisonerUrl: config.dpsPrisoner,
      errors: null,
      prisonerAlertCount: req.session.applicationData?.prisonerAlertCount || '',
      prisonerExists: req.session.applicationData?.prisonerExists || 'false',
      prisonerName: req.session.applicationData?.prisonerName || '',
      prisonNumber: req.session.applicationData?.prisonerId,
      title: 'Log prisoner details',
    })
  })

  router.get(`${URLS.LOG_PRISONER_DETAILS}/find/:prisonNumber`, async (req: Request, res: Response) => {
    if (!req.params.prisonNumber) {
      res.status(400).json({ error: 'Prison number is required' })
      return
    }

    const prisoner = await prisonService.getPrisonerByPrisonNumber(req.params.prisonNumber as string)

    if (!prisoner) {
      res.status(404).json({ error: 'Prisoner not found' })
      return
    }

    res.json({
      prisonerName: formatName(prisoner.firstName, prisoner.middleName, prisoner.lastName),
      activeAlertCount: prisoner.activeAlertCount ?? 0,
    })
  })

  router.post(URLS.LOG_PRISONER_DETAILS, async (req: Request, res: Response) => {
    const { prisonNumber: prisonNumberInput, prisonerLookupButton } = req.body

    const prisonNumber = prisonNumberInput
      ?.trim()
      .replace(/[\s.]+/g, '')
      .toUpperCase()

    const errors = validatePrisonerDetails(prisonNumber)

    if (prisonerLookupButton !== 'true' && !req.session.applicationData?.prisonerName && !errors.prisonNumber) {
      errors.prisonerLookupButton = { text: 'Find prisoner to continue' }
    }

    if (Object.keys(errors).length === 0) {
      const prisoner = await prisonService.getPrisonerByPrisonNumber(prisonNumber)

      if (!prisoner) {
        errors.prisonNumber = { text: 'Enter a valid prison number' }
      } else {
        req.body.prisonerName = formatName(prisoner.firstName, prisoner.middleName, prisoner.lastName)
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.render(PATHS.LOG_APPLICATION.PRISONER_DETAILS, {
        dpsPrisonerUrl: config.dpsPrisoner,
        errors,
        prisonerAlertCount: req.body.prisonerAlertCount || '',
        prisonerExists: req.body.prisonerExists || 'false',
        prisonerLookupButton,
        prisonerName: req.body.prisonerName || '',
        prisonNumber,
      })
    }

    updateSessionData(req, {
      prisonerAlertCount: req.body.prisonerAlertCount,
      prisonerExists: req.body.prisonerExists,
      prisonerId: prisonNumber,
      prisonerName: req.body.prisonerName,
    })

    return res.redirect(URLS.LOG_GROUP)
  })

  return router
}
