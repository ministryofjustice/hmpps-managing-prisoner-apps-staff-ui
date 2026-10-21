import { Request, Response, Router } from 'express'

import { auditEventLoggers, auditLogged } from '@ministryofjustice/hmpps-prisoner-facing-services-utilities'
import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import AuditService from '../../services/auditService'
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
    const { user } = res.locals

    await auditLogged(
      'VIEW_LOG_PRISONER_DETAILS',
      async (what, details = {}) =>
        auditService.logAuditEvent({
          what,
          who: user.username,
          correlationId: String(req.id),
          subjectId: req.session.applicationData?.prisonerId || 'NONE',
          subjectType: req.session.applicationData?.prisonerId ? 'PRISONER_ID' : 'NOT_APPLICABLE',
          details,
        }),
      async () => {
        delete req.session.prisonerContext
        delete req.session.isLoggingForSamePrisoner

        res.render(PATHS.LOG_APPLICATION.PRISONER_DETAILS, {
          dpsPrisonerUrl: config.dpsPrisoner,
          errors: null,
          prisonerAlertCount: req.session.applicationData?.prisonerAlertCount || '',
          prisonerExists: req.session.applicationData?.prisonerExists || 'false',
          prisonerName: req.session.applicationData?.prisonerName || '',
          prisonNumber: req.session.applicationData?.prisonerId,
          title: 'Log prisoner details',
        })
      },
    )
  })

  router.get(`${URLS.LOG_PRISONER_DETAILS}/find/:prisonNumber`, async (req: Request, res: Response) => {
    const { user } = res.locals

    await auditLogged(
      'SEARCH_PRISONER',
      async (what, extraDetails = {}) => {
        const successful = what.endsWith('_SUCCESS') && res.statusCode < 300
        const auditWhat = what.endsWith('_SUCCESS') && !successful ? 'SEARCH_PRISONER_FAILURE' : what
        await auditService.logAuditEvent({
          what: auditWhat,
          who: user.username,
          correlationId: String(req.id),
          subjectId: String(req.params.prisonNumber || ''),
          subjectType: 'SEARCH_TERM',
          details: {
            queryParams: req.query,
            ...(successful ? res.locals.auditDetails : {}),
            ...extraDetails,
            ...(!successful && res.statusCode >= 300 ? { failureReason: `HTTP ${res.statusCode}` } : {}),
          },
        })
        if (what === 'SEARCH_PRISONER_SUCCESS' && successful) {
          await auditService.logAuditEvent({
            what: 'VIEW_PRISONER_SEARCH_RESULTS_SUCCESS',
            who: user.username,
            correlationId: String(req.id),
            subjectId: String(req.params.prisonNumber),
            subjectType: 'SEARCH_TERM',
            details: res.locals.auditDetails,
          })
        }
      },
      async () => {
        if (!req.params.prisonNumber) {
          res.status(400).json({ error: 'Prison number is required' })
          return
        }

        const prisoner = await prisonService.getPrisonerByPrisonNumber(
          res.locals.user.username,
          req.params.prisonNumber as string,
        )

        if (!prisoner) {
          res.status(404).json({ error: 'Prisoner not found' })
          return
        }

        res.locals.auditDetails = {
          results: { resultCount: 1, returnedSubjectIds: [req.params.prisonNumber] },
        }

        res.json({
          prisonerName: formatName(prisoner.firstName, prisoner.middleName, prisoner.lastName),
          activeAlertCount: prisoner.activeAlertCount ?? 0,
        })
      },
    )
  })

  router.post(URLS.LOG_PRISONER_DETAILS, async (req: Request, res: Response) => {
    const { prisonNumber: prisonNumberInput, prisonerLookupButton } = req.body

    const prisonNumber = prisonNumberInput
      ?.trim()
      .replace(/[\s.]+/g, '')
      .toUpperCase()

    const { user } = res.locals
    const { logAttempt, logSuccess, logFailure } = auditEventLoggers(
      'EDIT_LOG_PRISONER_DETAILS',
      async (what, extraDetails = {}) =>
        auditService.logAuditEvent({
          what,
          who: user.username,
          correlationId: String(req.id),
          subjectId: prisonNumber || 'NONE',
          subjectType: prisonNumber ? 'PRISONER_ID' : 'NOT_APPLICABLE',
          details: { changes: [{ field: 'prisonerId' }], ...extraDetails },
        }),
    )

    await logAttempt()
    try {
      const errors = validatePrisonerDetails(prisonNumber)

      if (prisonerLookupButton !== 'true' && !req.session.applicationData?.prisonerName && !errors.prisonNumber) {
        errors.prisonerLookupButton = { text: 'Find prisoner to continue' }
      }

      if (Object.keys(errors).length === 0) {
        const prisoner = await prisonService.getPrisonerByPrisonNumber(res.locals.user.username, prisonNumber)

        if (!prisoner) {
          errors.prisonNumber = { text: 'Enter a valid prison number' }
        } else {
          req.body.prisonerName = formatName(prisoner.firstName, prisoner.middleName, prisoner.lastName)
        }
      }

      if (Object.keys(errors).length > 0) {
        await logFailure({ failureReason: 'Validation failed' })
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

      await logSuccess()
      return res.redirect(URLS.LOG_GROUP)
    } catch (error) {
      await logFailure({ failureReason: error instanceof Error ? error.message : 'Unknown error' })
      throw error
    }
  })

  return router
}
