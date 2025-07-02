import { Request, Response, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import PrisonService from '../../services/prisonService'
import { updateSessionData } from '../../utils/session'
import validatePrisonerDetails from '../validate/validatePrisonerDetails'
import { getApplicationType } from '../../utils/getApplicationType'

export default function prisonerDetailsRoutes({
  auditService,
  prisonService,
}: {
  auditService: AuditService
  prisonService: PrisonService
}): Router {
  const router = Router()

  router.get(
    '/log/prisoner-details',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { applicationData } = req.session

      await auditService.logPageView(Page.LOG_PRISONER_DETAILS_PAGE, {
        who: res.locals.user.username,
        correlationId: req.id,
      })

      const applicationType = getApplicationType(applicationData?.type.apiValue)

      if (!applicationType) {
        return res.redirect('/log/application-type')
      }

      const formattedDate = applicationData.date
        ? new Intl.DateTimeFormat('en-GB').format(new Date(applicationData.date))
        : ''

      return res.render('pages/log-application/prisoner-details/index', {
        applicationType,
        dateString: formattedDate,
        earlyDaysCentre: req.session.applicationData.earlyDaysCentre || '',
        prisonerName: req.session.applicationData.prisonerName || '',
        prisonNumber: applicationData.prisonerId,
        title: 'Log prisoner details',
        errors: null,
      })
    }),
  )

  router.get(
    '/log/prisoner-details/find/:prisonNumber',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { prisonNumber } = req.params
      const { user } = res.locals

      if (!prisonNumber) {
        res.status(400).json({ error: 'Prison number is required' })
        return
      }

      const prisoner = await prisonService.getPrisonerByPrisonNumber(prisonNumber, user)

      if (!prisoner || prisoner.length === 0) {
        res.status(404).json({ error: 'Prisoner not found' })
        return
      }

      res.json({
        prisonerName: `${prisoner[0].lastName}, ${prisoner[0].firstName}`,
      })
    }),
  )

  router.post(
    '/log/prisoner-details',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { prisonNumber, date: dateString, earlyDaysCentre, prisonerLookupButton } = req.body
      const { applicationData } = req.session

      const applicationType = getApplicationType(applicationData?.type.apiValue)
      const errors = validatePrisonerDetails(applicationType, prisonNumber, dateString, earlyDaysCentre)

      if (prisonerLookupButton !== 'true' && !req.session.applicationData.prisonerName && !errors.prisonNumber) {
        errors.prisonerLookupButton = { text: 'Find prisoner to continue' }
      }

      if (Object.keys(errors).length === 0) {
        const prisoner = await prisonService.getPrisonerByPrisonNumber(prisonNumber, res.locals.user)

        if (!prisoner || prisoner.length === 0) {
          errors.prisonNumber = { text: 'Enter a valid prison number' }
        } else {
          req.body.prisonerName = `${prisoner[0].lastName}, ${prisoner[0].firstName}`
          req.session.applicationData.prisonerName = req.body.prisonerName
        }
      }

      if (Object.keys(errors).length > 0) {
        return res.render('pages/log-application/prisoner-details/index', {
          applicationType,
          prisonNumber,
          dateString,
          earlyDaysCentre,
          errors,
          prisonerName: req.body.prisonerName || '',
          prisonerLookupButton,
        })
      }

      let date: string | null = null

      if (typeof dateString === 'string' && dateString.trim() !== '') {
        const dateParts = dateString.split('/')

        if (dateParts.length === 3) {
          const [day, month, year] = dateParts.map(part => Number(part))

          if (!Number.isNaN(day) && !Number.isNaN(month) && !Number.isNaN(year)) {
            const parsedDate = new Date(year, month - 1, day)

            if (!Number.isNaN(parsedDate.getTime())) {
              date = `${parsedDate.toISOString().split('.')[0]}Z`
            }
          }
        }
      }

      updateSessionData(req, {
        prisonerName: req.body.prisonerName,
        date,
        prisonerId: prisonNumber,
        earlyDaysCentre,
      })

      return res.redirect(`/log/application-details`)
    }),
  )

  return router
}
