import type { RequestHandler } from 'express'
import logger from '../../logger'
import config from '../config'
import ManagingPrisonerAppsService from '../services/managingPrisonerAppsService'
import { PrisonUser } from '../interfaces/hmppsUser'

const ALL_CASELOADS = '***'

export default function checkActiveAgencyAccess(
  managingPrisonerAppsService: ManagingPrisonerAppsService,
): RequestHandler {
  return async (_req, res, next) => {
    const user = res.locals.user as PrisonUser | undefined
    const activeCaseLoadId = user?.activeCaseLoadId

    try {
      const activeAgencies = await managingPrisonerAppsService.getActiveAgencies()
      const isAllowed =
        activeCaseLoadId === ALL_CASELOADS ||
        (typeof activeCaseLoadId === 'string' &&
          Array.isArray(activeAgencies) &&
          activeAgencies.includes(activeCaseLoadId))

      logger.info(
        `Active agency access check: activeCaseLoadId=${activeCaseLoadId}, activeAgencies=${JSON.stringify(activeAgencies)}, isAllowed=${isAllowed}`,
      )

      if (isAllowed) {
        return next()
      }

      logger.warn(
        `Access denied for user ${user?.username}. activeCaseLoadId=${activeCaseLoadId}, activeAgencies=${JSON.stringify(activeAgencies)}`,
      )
      return res.status(403).render('pages/error', {
        message: 'Something went wrong. The error has been logged. Please try again',
        action: {
          text: 'Select a different service',
          href: config.apis.hmppsAuth.externalUrl,
        },
      })
    } catch (error) {
      logger.error('Unable to verify active agency access', error)
      return res.status(503).render('pages/error', {
        message: 'Something went wrong. The error has been logged. Please try again',
      })
    }
  }
}
