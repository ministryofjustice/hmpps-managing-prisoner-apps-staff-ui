import { Request, Response, Router } from 'express'

import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'

import { getAppType } from '../../helpers/application/getAppType'

import asyncMiddleware from '../../middleware/asyncMiddleware'

import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import PrisonService from '../../services/prisonService'

import config from '../../config'
import { updateSessionData } from '../../utils/session'
import validatePrisonerDetails from '../validate/validatePrisonerDetails'

export default function prisonerDetailsRoutes({
  auditService,
  managingPrisonerAppsService,
  prisonService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
  prisonService: PrisonService
}): Router {
  const router = Router()

  router.get(
    URLS.LOG_PRISONER_DETAILS,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { user } = res.locals
      const { applicationData } = req.session

      await auditService.logPageView(Page.LOG_PRISONER_DETAILS_PAGE, {
        who: res.locals.user.username,
        correlationId: req.id,
      })

      const applicationType = await getAppType(managingPrisonerAppsService, user, applicationData?.type.key)

      if (!applicationType) return res.redirect(URLS.LOG_APPLICATION_TYPE)

      const formattedDate = applicationData.date
        ? new Intl.DateTimeFormat('en-GB').format(new Date(applicationData.date))
        : ''

      return res.render(PATHS.LOG_APPLICATION.PRISONER_DETAILS, {
        applicationType,
        dateString: formattedDate,
        earlyDaysCentre: req.session.applicationData.earlyDaysCentre || '',
        prisonerName: req.session.applicationData.prisonerName || '',
        prisonNumber: applicationData.prisonerId,
        title: 'Log prisoner details',
        errors: null,
        dpsPrisonerUrl: config.dpsPrisoner,
      })
    }),
  )

  router.get(
    `${URLS.LOG_PRISONER_DETAILS}/find/:prisonNumber`,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { prisonNumber } = req.params
      const { user } = res.locals

      if (!prisonNumber) {
        res.status(400).json({ error: 'Prison number is required' })
        return
      }

      const prisoner = await prisonService.getPrisonerByPrisonNumber(prisonNumber, user)

      if (!prisoner) {
        res.status(404).json({ error: 'Prisoner not found' })
        return
      }

      res.json({
        prisonerName: `${prisoner.lastName}, ${prisoner.firstName}`,
        activeAlertCount: prisoner.activeAlertCount ?? 0,
      })
    }),
  )

  router.post(
    URLS.LOG_PRISONER_DETAILS,
    asyncMiddleware(async (req: Request, res: Response) => {
      const { user } = res.locals
      const { prisonNumber, date: dateString, earlyDaysCentre, prisonerLookupButton } = req.body
      const { applicationData } = req.session

      const applicationType = await getAppType(managingPrisonerAppsService, user, applicationData?.type.key)

      const errors = validatePrisonerDetails(applicationType, prisonNumber, dateString, earlyDaysCentre)

      if (prisonerLookupButton !== 'true' && !req.session.applicationData.prisonerName && !errors.prisonNumber) {
        errors.prisonerLookupButton = { text: 'Find prisoner to continue' }
      }

      if (Object.keys(errors).length === 0) {
        const prisoner = await prisonService.getPrisonerByPrisonNumber(prisonNumber, res.locals.user)

        if (!prisoner) {
          errors.prisonNumber = { text: 'Enter a valid prison number' }
        } else {
          req.body.prisonerName = `${prisoner.lastName}, ${prisoner.firstName}`
          req.session.applicationData.prisonerName = req.body.prisonerName
        }
      }

      if (Object.keys(errors).length > 0) {
        return res.render(PATHS.LOG_APPLICATION.PRISONER_DETAILS, {
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

      return res.redirect(URLS.LOG_APPLICATION_DETAILS)
    }),
  )

  return router
}
