import { format } from 'date-fns'
import { Request, Response, Router } from 'express'

import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'
import { MessageVisibility } from '../../constants/messageVisibility'

import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'

import getValidApplicationOrRedirect from '../../utils/getValidApplicationOrRedirect'

import { getAppType } from '../../helpers/application/getAppType'
import { formatMessagesCreatedByName } from '../../utils/formatters/formatName'
import { validateTextField } from '../validate/validateTextField'

export default function commentsRouter({
  auditService,
  managingPrisonerAppsService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
}): Router {
  const router = Router()

  router.get('/applications/:prisonerId/:applicationId/comments', async (req: Request, res: Response) => {
    const { prisonerId } = req.params
    const { user } = res.locals

    const { application, applicationType } = await getValidApplicationOrRedirect(
      req,
      res,
      auditService,
      managingPrisonerAppsService,
      Page.COMMENTS_PAGE,
    )

    const comments = await managingPrisonerAppsService.getComments(`${prisonerId}`, application.id, user)

    const formattedComments =
      comments?.contents?.map(({ message, createdBy, createdDate, visibility, createdByType }) => {
        return {
          message,
          createdByName: formatMessagesCreatedByName(createdBy.fullName, createdByType),
          timestamp: createdDate,
          date: format(createdDate, 'd MMMM yyyy'),
          time: format(createdDate, 'HH:mm'),
          visibility,
          createdByType,
        }
      }) ?? []
    return res.render(PATHS.APPLICATIONS.COMMENTS, {
      application,
      applicationType,
      comments: formattedComments,
      title: 'Messages',
    })
  })

  router.post('/applications/:prisonerId/:applicationId/comments', async (req: Request, res: Response) => {
    const { prisonerId, applicationId } = req.params
    const { comment } = req.body
    const { user } = res.locals

    const errors = validateTextField({ fieldValue: comment, fieldName: 'Comments', isRequired: true })

    if (Object.keys(errors).length > 0) {
      const application = await managingPrisonerAppsService.getPrisonerApp(`${prisonerId}`, `${applicationId}`, user)
      const comments = await managingPrisonerAppsService.getComments(`${prisonerId}`, application.id, user)

      if (!application) {
        return res.redirect(URLS.APPLICATIONS)
      }

      const applicationType = await getAppType(
        managingPrisonerAppsService,
        user,
        application.applicationType.id.toString(),
      )
      const formattedComments =
        comments?.contents?.map(({ message, createdBy, createdDate, visibility, createdByType }) => {
          return {
            message,
            createdByName: formatMessagesCreatedByName(createdBy.fullName, createdByType),
            timestamp: createdDate,
            date: format(createdDate, 'd MMMM yyyy'),
            time: format(createdDate, 'HH:mm'),
            visibility,
            createdByType,
          }
        }) ?? []

      return res.render(PATHS.APPLICATIONS.COMMENTS, {
        application,
        applicationType,
        comment,
        comments: formattedComments,
        errors,
        title: 'Messages',
      })
    }
    // Messages tab reads the user's selection; anything other than 'prisoner-and-staff' is STAFF_ONLY.
    const visibility =
      req.body.visibility === 'prisoner-and-staff' ? MessageVisibility.STAFF_AND_PRISONER : MessageVisibility.STAFF_ONLY

    await managingPrisonerAppsService.addComment(
      `${prisonerId}`,
      `${applicationId}`,
      { message: comment, visibility },
      user,
    )

    return res.redirect(`${URLS.APPLICATIONS}/${prisonerId}/${applicationId}/comments`)
  })

  return router
}
