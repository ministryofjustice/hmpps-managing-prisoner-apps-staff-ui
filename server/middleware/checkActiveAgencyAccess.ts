import type { RequestHandler } from 'express'
import logger from '../../logger'
import config from '../config'
import ManagingPrisonerAppsService from '../services/managingPrisonerAppsService'
import { PrisonUser } from '../interfaces/hmppsUser'

const ALL_CASELOADS = '***'
const NO_ACTIVE_CASELOAD = '-no-active-case-load-id-'
const STANDARD_ERROR_MESSAGE = 'Something went wrong. The error has been logged. Please try again'
const ENTRY_DENIED_ERROR_PAGE = {
  message: STANDARD_ERROR_MESSAGE,
  action: {
    text: 'Select a different service',
    href: config.apis.hmppsAuth.externalUrl,
  },
}

export default function checkActiveAgencyAccess(
  managingPrisonerAppsService: ManagingPrisonerAppsService,
): RequestHandler {
  return async (_req, res, next) => {
    const user = res.locals.user as PrisonUser | undefined

    if (!user) {
      logger.warn('Access denied as user is missing')
      return res.status(403).render('pages/error', ENTRY_DENIED_ERROR_PAGE)
    }

    const activeCaseLoadId = user.activeCaseLoadId || NO_ACTIVE_CASELOAD

    try {
      const activeAgencies = await managingPrisonerAppsService.getActiveAgencies()
      const isAllowed = activeCaseLoadId === ALL_CASELOADS || activeAgencies.includes(activeCaseLoadId)

      logger.info(
        `Active agency access check: activeCaseLoadId=${activeCaseLoadId}, activeAgencies=${JSON.stringify(activeAgencies)}, isAllowed=${isAllowed}`,
      )

      if (isAllowed) {
        return next()
      }

      logger.warn(
        `Access denied for user ${user.username}. activeCaseLoadId=${activeCaseLoadId}, activeAgencies=${JSON.stringify(activeAgencies)}`,
      )
      return res.status(403).render('pages/error', ENTRY_DENIED_ERROR_PAGE)
    } catch (error) {
      logger.error('Unable to verify active agency access', error)
      return res.status(503).render('pages/error', {
        message: STANDARD_ERROR_MESSAGE,
      })
    }
  }
}
