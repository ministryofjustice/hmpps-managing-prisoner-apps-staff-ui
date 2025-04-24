import { format } from 'date-fns'
import { Request, Response, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'
import { getApplicationType } from '../../utils/getApplicationType'
import { validateComment } from '../validate/validateComment'

export default function commentsRoutes({
  auditService,
  managingPrisonerAppsService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
}): Router {
  const router = Router()

  router.get(
    '/applications/:prisonerId/:applicationId/comments',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { prisonerId, applicationId } = req.params
      const { user } = res.locals

      const application = await managingPrisonerAppsService.getPrisonerApp(prisonerId, applicationId, user)
      const comments = await managingPrisonerAppsService.getComments(prisonerId, application.id, user)

      const formattedComments =
        comments?.contents?.map(comment => {
          return {
            message: comment.message,
            staffName: `${comment.createdBy.fullName}`,
            date: format(comment.createdDate, 'd MMMM yyyy'),
            time: format(comment.createdDate, 'HH:mm'),
          }
        }) ?? []

      if (!application) {
        return res.redirect(`/applications`)
      }

      const applicationType = getApplicationType(application.appType)

      if (!applicationType) {
        return res.redirect(`/applications?error=unknown-type`)
      }

      await auditService.logPageView(Page.COMMENTS_PAGE, {
        who: res.locals.user.username,
        correlationId: req.id,
      })

      return res.render(`pages/applications/comments/index`, {
        application,
        comments: formattedComments,
        title: applicationType.name,
      })
    }),
  )

  router.post(
    '/applications/:prisonerId/:applicationId/comments',
    asyncMiddleware(async (req: Request, res: Response) => {
      const { prisonerId, applicationId } = req.params
      const { comment } = req.body
      const { user } = res.locals

      const errors = validateComment(comment)

      if (Object.keys(errors).length > 0) {
        const application = await managingPrisonerAppsService.getPrisonerApp(prisonerId, applicationId, user)
        const comments = await managingPrisonerAppsService.getComments(prisonerId, application.id, user)

        if (!application) {
          return res.redirect(`/applications`)
        }

        const applicationType = getApplicationType(application.appType)

        const formattedComments =
          comments?.contents?.map(({ message, createdBy, createdDate }) => {
            return {
              message,
              staffName: `${createdBy.fullName}`,
              date: format(createdDate, 'd MMMM yyyy'),
              time: format(createdDate, 'HH:mm'),
            }
          }) ?? []

        return res.render('pages/applications/comments/index', {
          application,
          comment,
          comments: formattedComments,
          errors,
          title: applicationType.name,
        })
      }

      await managingPrisonerAppsService.addComment(
        prisonerId,
        applicationId,
        { message: comment, targetUsers: [] },
        user,
      )

      return res.redirect(`/applications/${prisonerId}/${applicationId}/comments`)
    }),
  )

  return router
}
