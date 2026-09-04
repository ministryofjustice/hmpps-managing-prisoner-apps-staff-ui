import { format } from 'date-fns'
import { Request, Response, Router } from 'express'

import { PATHS } from '../../constants/paths'
import { URLS } from '../../constants/urls'
import { isOpenStatus } from '../../constants/applicationStatus'

import AuditService, { Page } from '../../services/auditService'
import ManagingPrisonerAppsService from '../../services/managingPrisonerAppsService'

import getValidApplicationOrRedirect from '../../utils/getValidApplicationOrRedirect'

import { getAppType } from '../../helpers/application/getAppType'
import { formatMessagesCreatedByName } from '../../utils/formatters/formatName'
import { validateTextField } from '../validate/validateTextField'
import { Comment } from '../../@types/managingAppsApi'

const formatComments = (comments: Comment[] = []) =>
  comments.map(({ message, createdBy, createdDate, createdByType }) => ({
    message,
    createdByName: formatMessagesCreatedByName(createdBy.fullName, createdByType),
    date: format(createdDate, 'd MMMM yyyy'),
  }))

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

    const validApplication = await getValidApplicationOrRedirect(
      req,
      res,
      auditService,
      managingPrisonerAppsService,
      Page.COMMENTS_PAGE,
    )
    if (!validApplication) return
    const { application, applicationType } = validApplication

    const comments = await managingPrisonerAppsService.getComments(`${prisonerId}`, application.id, user)

    res.render(PATHS.APPLICATIONS.COMMENTS, {
      application,
      applicationType,
      comments: formatComments(comments?.contents),
      title: 'Comments',
      isClosed: !isOpenStatus(application.status),
    })
  })

  router.post('/applications/:prisonerId/:applicationId/comments', async (req: Request, res: Response) => {
    const { prisonerId, applicationId } = req.params
    const { comment } = req.body
    const { user } = res.locals

    const application = await managingPrisonerAppsService.getPrisonerApp(`${prisonerId}`, `${applicationId}`, user)

    if (!application) {
      return res.redirect(URLS.APPLICATIONS)
    }

    if (!isOpenStatus(application.status)) {
      return res.redirect(`${URLS.APPLICATIONS}/${prisonerId}/${applicationId}/comments`)
    }

    const errors = validateTextField({ fieldValue: comment, fieldName: 'Comments', isRequired: true })

    if (Object.keys(errors).length > 0) {
      const comments = await managingPrisonerAppsService.getComments(`${prisonerId}`, application.id, user)
      const applicationType = await getAppType(
        managingPrisonerAppsService,
        user,
        application.applicationType.id.toString(),
      )

      return res.render(PATHS.APPLICATIONS.COMMENTS, {
        application,
        applicationType,
        comment,
        comments: formatComments(comments?.contents),
        errors,
        title: 'Comments',
        isClosed: false,
      })
    }

    await managingPrisonerAppsService.addComment(`${prisonerId}`, `${applicationId}`, comment, user)

    return res.redirect(`${URLS.APPLICATIONS}/${prisonerId}/${applicationId}/comments`)
  })

  return router
}
