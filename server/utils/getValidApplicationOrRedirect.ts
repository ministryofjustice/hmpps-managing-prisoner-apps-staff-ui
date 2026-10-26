import { Request, Response } from 'express'
import { getAppType } from '../helpers/application/getAppType'
import ManagingPrisonerAppsService from '../services/managingPrisonerAppsService'
import DocumentManagementService from '../services/documentManagementService'
import { Document } from '../@types/documentManagementApi'

export default async function getValidApplicationOrRedirect(
  req: Request,
  res: Response,
  managingPrisonerAppsService: ManagingPrisonerAppsService,
  documentManagementService?: DocumentManagementService,
) {
  const { prisonerId, applicationId } = req.params
  const { user } = res.locals

  const application = await managingPrisonerAppsService.getPrisonerApp(
    prisonerId.toString(),
    applicationId.toString(),
    user,
  )
  if (!application) {
    res.redirect('/applications')
    return null
  }

  const applicationType = await getAppType(managingPrisonerAppsService, user, application.applicationType.id.toString())

  if (!applicationType) {
    throw new Error('Unknown application type')
  }

  let documents: Document[] = []

  if (documentManagementService && application.files && application.files.length > 0) {
    const documentPromises = application.files.map(file =>
      documentManagementService.getDocument(file.documentId, user.username),
    )

    documents = (await Promise.allSettled(documentPromises))
      .filter((result): result is PromiseFulfilledResult<Document> => result.status === 'fulfilled')
      .map(result => result.value)
  }

  return { application, applicationType, documents }
}
