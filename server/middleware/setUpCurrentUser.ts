import { jwtDecode } from 'jwt-decode'
import express from 'express'
import CaseLoad from '@ministryofjustice/hmpps-connect-dps-components/dist/types/CaseLoad'
import { convertToTitleCase } from '../utils/utils'
import logger from '../../logger'
import { PrisonUser } from '../interfaces/hmppsUser'
import PrisonService from '../services/prisonService'

export default function setUpCurrentUser(prisonService: PrisonService) {
  const router = express.Router()

  router.use((_req, res, next) => {
    try {
      const {
        name,
        user_id: userId,
        authorities: roles = [],
      } = jwtDecode(res.locals.user.token) as {
        name?: string
        user_id?: string
        authorities?: string[]
      }

      res.locals.user = {
        ...res.locals.user,
        userId,
        name,
        displayName: convertToTitleCase(name),
        userRoles: roles.map(role => role.substring(role.indexOf('_') + 1)),
      }

      if (res.locals.user.authSource === 'nomis') {
        const prisonUser = res.locals.user as PrisonUser
        prisonUser.staffId = parseInt(userId, 10) || undefined

        try {
          let caseLoads: CaseLoad[] = []
          prisonService.getCurrentUserCaseloads(prisonUser.staffId.toString()).then(result => {
            caseLoads = result
          })

          const activeCaseLoad = caseLoads.find(caseLoad => caseLoad.currentlyActive)

          if (activeCaseLoad) {
            prisonUser.activeCaseLoadId = activeCaseLoad.caseLoadId
          } else if (caseLoads.length > 0) {
            prisonUser.activeCaseLoadId = caseLoads[0].caseLoadId
          }
        } catch (error) {
          logger.error('Failed to fetch activeCaseLoadId from Prison API:', error)
        }

        logger.info(
          `Prison user ${prisonUser.username} - staffId: ${prisonUser.staffId}, activeCaseLoadId: ${prisonUser.activeCaseLoadId}`,
        )
      }

      next()
    } catch (error) {
      logger.error(error, `Failed to populate user details for: ${res.locals.user && res.locals.user.username}`)
      next(error)
    }
  })

  return router
}
