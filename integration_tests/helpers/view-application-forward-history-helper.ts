import { expect, Page, TestInfo } from '@playwright/test'
import { app } from '../../server/testData'
import managingPrisonerAppsApi from '../mockApis/managingPrisonerApps'
import { stubFor } from '../mockApis/wiremock'
import ForwardApplicationPage from '../pages/forwardApplicationPage'
import ViewApplicationPage from '../pages/viewApplicationPage'

export type ForwardTarget = {
  value: string
  name: string
}

export const getForwardTargetDepartment = async (
  page: Page,
  forwardPage: ForwardApplicationPage,
): Promise<ForwardTarget> => {
  const targetDepartmentRadio = forwardPage.departmentRadios().nth(1)
  const targetDepartmentId = await targetDepartmentRadio.getAttribute('id')
  const targetDepartmentValue = await targetDepartmentRadio.getAttribute('value')
  const targetDepartmentName = (await page.locator(`label[for="${targetDepartmentId}"]`).innerText()).trim()

  return {
    value: targetDepartmentValue,
    name: targetDepartmentName,
  }
}

export const stubForwardFlowStateTransition = async ({
  application,
  targetDepartment,
}: {
  application: typeof app
  targetDepartment: ForwardTarget
}) => {
  const forwardedApplication = {
    ...application,
    assignedGroup: {
      ...application.assignedGroup,
      id: targetDepartment.value,
      name: targetDepartment.name,
    },
  }

  await stubFor({
    priority: 1,
    scenarioName: 'forward-application-flow',
    requiredScenarioState: 'Started',
    newScenarioState: 'FORWARDED',
    request: {
      method: 'POST',
      urlPathPattern: `/managingPrisonerApps/v1/apps/${application.id}/forward/groups/.*`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
    },
  })

  await stubFor({
    priority: 1,
    scenarioName: 'forward-application-flow',
    requiredScenarioState: 'FORWARDED',
    request: {
      method: 'GET',
      url: `/managingPrisonerApps/v1/prisoners/${application.requestedBy.username}/apps/${application.id}?requestedBy=true&assignedGroup=true`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: forwardedApplication,
    },
  })

  return forwardedApplication
}

export const stubForwardHistoryEvents = async ({
  application,
  forwardedApplication,
  targetDepartment,
}: {
  application: typeof app
  forwardedApplication: typeof app
  targetDepartment: ForwardTarget
}) => {
  await managingPrisonerAppsApi.stubGetComments({ app: forwardedApplication })
  await stubFor({
    request: {
      method: 'GET',
      url: `/managingPrisonerApps/v1/prisoners/${application.requestedBy.username}/apps/${application.id}/history`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: [
        {
          id: 'history-item-logged',
          appId: application.id,
          entityId: application.assignedGroup.id,
          entityType: 'ASSIGNED_GROUP',
          activityMessage: {
            header: 'Application logged',
            createdBy: 'John Doe',
            body: `Assigned to ${application.assignedGroup.name}`,
          },
          createdDate: '2026-07-10T10:00:00.000Z',
        },
        {
          id: 'history-item-forwarded',
          appId: application.id,
          entityId: targetDepartment.value,
          entityType: 'ASSIGNED_GROUP',
          activityMessage: {
            header: 'Application forwarded',
            createdBy: 'John Doe',
            body: `Forwarded to ${targetDepartment.name}`,
          },
          createdDate: '2026-07-10T10:00:30.000Z',
        },
      ],
    },
  })
}

export const assertAndCaptureHistoryEvents = async ({
  page,
  viewPage,
  application,
  targetDepartment,
  testInfo,
}: {
  page: Page
  viewPage: ViewApplicationPage
  application: typeof app
  targetDepartment: ForwardTarget
  testInfo: TestInfo
}) => {
  await viewPage.historyTab().click()

  await expect(page).toHaveURL(
    new RegExp(`/applications/${application.requestedBy.username}/${application.id}/history`),
  )
  await expect(page.getByText('History of this application')).toBeVisible()
  await expect(page.getByText('Application logged')).toBeVisible()
  await expect(page.getByText(`Assigned to ${application.assignedGroup.name}`)).toBeVisible()
  await expect(page.getByText('Application forwarded')).toBeVisible()
  await expect(page.getByText(`Forwarded to ${targetDepartment.name}`)).toBeVisible()

  const historyEvents = await page
    .locator('.moj-timeline__item')
    .evaluateAll(items => items.map(item => item.textContent?.trim() || ''))

  await testInfo.attach('history-events.txt', {
    body: Buffer.from(historyEvents.join('\n\n'), 'utf-8'),
    contentType: 'text/plain',
  })
}
