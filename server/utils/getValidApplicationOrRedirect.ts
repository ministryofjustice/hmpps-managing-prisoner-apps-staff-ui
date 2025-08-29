import { Request, Response } from 'express'
import AuditService, { Page } from '../services/auditService'
import ManagingPrisonerAppsService from '../services/managingPrisonerAppsService'
import { getAppType } from '../helpers/application/getAppType'

export default async function getValidApplicationOrRedirect(
  req: Request,
  res: Response,
  auditService: AuditService,
  managingPrisonerAppsService: ManagingPrisonerAppsService,
  auditPage?: Page,
) {
  const { prisonerId, applicationId } = req.params
  const { user } = res.locals

  const application = await managingPrisonerAppsService.getPrisonerApp(prisonerId, applicationId, user)

  if (!application) {
    res.redirect('/applications')
    return null
  }

  const applicationType = await getAppType(managingPrisonerAppsService, user, application.appType)

  if (!applicationType) {
    throw new Error('Unknown application type')
  }

  if (auditPage) {
    await auditService.logPageView(auditPage, {
      who: user.username,
      correlationId: req.id,
    })
  }

  return { application, applicationType }
}
