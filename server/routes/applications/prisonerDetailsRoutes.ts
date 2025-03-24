import { Request, Response, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import { updateSessionData } from '../../utils/session'
import PrisonService from '../../services/prisonService'

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

      return res.render('pages/log-application/prisoner-details/index', {
        title: 'Log prisoner details',
        appTypeTitle: req.session.applicationData.type.name,
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
        prisonerName: `${prisoner[0].firstName} ${prisoner[0].lastName}`,
      })
    }),
  )

  router.post(
    '/log/prisoner-details',
    asyncMiddleware(async (req: Request, res: Response) => {
      const [day, month, year] = req.body.date.split('/').map(Number)
      const date = new Date(year, month - 1, day)

      updateSessionData(req, {
        prisonerName: req.body.prisonerName,
        date: `${date.toISOString().split('.')[0]}Z`,
        prisonerId: req.body.prisonNumber,
      })

      res.redirect(`/log/application-details`)
    }),
  )

  return router
}
