import { Request, Response, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import PrisonService from '../../services/prisonService'
import { updateSessionData } from '../../utils/session'
import validatePrisonerDetails from '../validate/validatePrisonerDetails'

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
      await auditService.logPageView(Page.LOG_PRISONER_DETAILS_PAGE, {
        who: res.locals.user.username,
        correlationId: req.id,
      })

      if (!req.session.applicationData?.type) {
        return res.redirect('/log/application-type')
      }

      const { prisonerId, date } = req.session.applicationData
      const formattedDate = date ? new Intl.DateTimeFormat('en-GB').format(new Date(date)) : ''

      return res.render('pages/log-application/prisoner-details/index', {
        title: 'Log prisoner details',
        appTypeTitle: req.session.applicationData.type.name,
        prisonNumber: prisonerId,
        dateString: formattedDate,
        errors: null,
        prisonerName: req.session.applicationData.prisonerName || '',
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
      const { prisonNumber, date: dateString, prisonerLookupButton } = req.body

      const errors = validatePrisonerDetails(prisonNumber, dateString)

      if (prisonerLookupButton !== 'true' && !req.session.applicationData.prisonerName) {
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
          appTypeTitle: req.session.applicationData.type.name,
          prisonNumber,
          dateString,
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
      })

      return res.redirect(`/log/application-details`)
    }),
  )

  return router
}
