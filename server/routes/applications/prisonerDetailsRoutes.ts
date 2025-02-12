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

      return res.render('pages/log/prisoner-details', {
        title: 'Log prisoner details',
        appTypeTitle: req.session.applicationData.type.name,
      })
    }),
  )

  router.get(
    '/log/prisoner-details/find',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { prisonNumber } = req.query

      if (!prisonNumber) {
        res.status(400).json({ error: 'Prison number is required' })
        return
      }

      const prisoner = await prisonService.getPrisonerByPrisonNumber(prisonNumber.toString())

      if (!prisoner) {
        res.status(404).json({ error: 'Prisoner not found' })
        return
      }

      res.json({
        prisonerName: `${prisoner.firstName} ${prisoner.lastName}`,
      })
    }),
  )

  router.post(
    '/log/prisoner-details',
    asyncMiddleware(async (req: Request, res: Response) => {
      if (!req.session.applicationData) {
        res.status(400).send('Application data is missing')
        return
      }

      updateSessionData(req, {
        prisonerName: req.body.prisonerName,
        date: req.body.date,
      })

      res.redirect(`/log/swap-vos-pin-credit-details`)
    }),
  )

  return router
}
