import { format } from 'date-fns'
import { Request, Response, Router } from 'express'

import { auditLogged } from '@ministryofjustice/hmpps-prisoner-facing-services-utilities'
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

const formatMessages = (comments: Comment[] = []) =>
  comments.map(({ message, createdBy, createdDate, visibility, createdByType }) => ({
    message,
    createdByName: formatMessagesCreatedByName(createdBy.fullName, createdByType),
    timestamp: createdDate,
    date: format(createdDate, 'd MMMM yyyy'),
    time: format(createdDate, 'HH:mm'),
    visibility,
    createdByType,
  }))

export default function messagesRouter({
  auditService,
  managingPrisonerAppsService,
}: {
  auditService: AuditService
  managingPrisonerAppsService: ManagingPrisonerAppsService
}): Router {
  const router = Router()

  router.get('/applications/:prisonerId/:applicationId/messages', async (req, res, next) => {
    const { prisonerId, applicationId } = req.params
    const { user } = res.locals

    await auditLogged(
      'VIEW_MESSAGES',
      async (what, extraDetails = {}) => {
        await auditService.logAuditEvent({
          what,
          who: req.user.username,
          correlationId: req.id,
          subjectId: prisonerId as string,
          subjectType: 'PRISONER_ID',
          details: { applicationId, ...extraDetails },
        })
      },
      async () => {
        const { application, applicationType } = await getValidApplicationOrRedirect(
          req,
          res,
          auditService,
          managingPrisonerAppsService,
          Page.MESSAGES_PAGE,
        )

        const departments = await managingPrisonerAppsService.getDepartments(user, applicationType.id.toString())

        const messages = await managingPrisonerAppsService.getMessages(`${prisonerId}`, application.id, user)

        res.render(PATHS.APPLICATIONS.MESSAGES, {
          application,
          applicationType,
          comments: formatMessages(messages?.contents),
          title: 'Prisoner messages',
          isClosed: !isOpenStatus(application.status),
          isForwardable: departments?.length > 1,
        })
      },
    )
  })

  router.post('/applications/:prisonerId/:applicationId/messages', async (req: Request, res: Response) => {
    const { prisonerId, applicationId } = req.params
    const { comment } = req.body
    const { user } = res.locals

    const application = await managingPrisonerAppsService.getPrisonerApp(`${prisonerId}`, `${applicationId}`, user)

    if (!application) {
      return res.redirect(URLS.APPLICATIONS)
    }

    if (!isOpenStatus(application.status)) {
      return res.redirect(`${URLS.APPLICATIONS}/${prisonerId}/${applicationId}/messages`)
    }

    const errors = validateTextField({ fieldValue: comment, fieldName: 'Messages', isRequired: true })

    if (Object.keys(errors).length > 0) {
      const messages = await managingPrisonerAppsService.getMessages(`${prisonerId}`, application.id, user)

      const applicationType = await getAppType(
        managingPrisonerAppsService,
        user,
        application.applicationType.id.toString(),
      )
      const departments = await managingPrisonerAppsService.getDepartments(user, applicationType.id.toString())

      return res.render(PATHS.APPLICATIONS.MESSAGES, {
        application,
        applicationType,
        comment,
        comments: formatMessages(messages?.contents),
        errors,
        title: 'Prisoner messages',
        isClosed: false,
        isForwardable: departments?.length > 1,
      })
    }

    await managingPrisonerAppsService.addMessage(`${prisonerId}`, `${applicationId}`, comment, user)

    return res.redirect(`${URLS.APPLICATIONS}/${prisonerId}/${applicationId}/messages`)
  })

  return router
}
