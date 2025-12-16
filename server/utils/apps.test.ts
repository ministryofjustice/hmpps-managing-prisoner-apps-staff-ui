import { format } from 'date-fns'
import { Comment, History } from '../@types/managingAppsApi'
import { HmppsUser } from '../interfaces/hmppsUser'
import ManagingPrisonerAppsService from '../services/managingPrisonerAppsService'
import { appDecisionResponse, appHistoryResponse, appSearchResponse, user } from '../testData'
import { formatApplicationHistory, formatAppsToRows } from './apps'

jest.mock('date-fns', () => ({
  format: jest.fn(),
  getTime: jest.fn((date: Date) => date.getTime()),
}))

describe(formatAppsToRows.name, () => {
  let managingPrisonerAppsService: ManagingPrisonerAppsService

  const mockUser: HmppsUser = {
    ...user,
    authSource: 'nomis',
    staffId: 12345,
  }

  beforeEach(() => {
    jest.clearAllMocks()

    managingPrisonerAppsService = {
      getGroupsAndTypes: jest.fn().mockResolvedValue([
        {
          id: 1,
          name: 'Business Hub',
          appTypes: [{ id: 2, name: 'Add new official PIN phone contact' }],
        },
      ]),
    } as unknown as ManagingPrisonerAppsService
  })

  it('should correctly format applications', async () => {
    ;(format as jest.Mock).mockReturnValue('24 March 2025')

    const applications = [
      {
        ...appSearchResponse.apps[0],
        prisonerName: 'Doe, John',
        appType: { id: 2, name: 'Add new official PIN phone contact' },
      },
    ]

    const result = await formatAppsToRows(managingPrisonerAppsService, mockUser, applications)

    expect(result).toEqual([
      [
        { text: '24 March 2025', attributes: { 'data-sort-value': '1742824993000' }, classes: 'govuk-!-text-nowrap' },
        { text: 'Add new official PIN phone contact' },
        { html: 'Doe, John<br/><span class="govuk-table__subtext govuk-body-s">A12345</span>' },
        { text: 'Business Hub' },
        { html: '<a href="/applications/A12345/1808f5e2-2bf4-499a-b79f-fb0a5f4bac7b" class="govuk-link">View</a>' },
      ],
    ])
  })
})

describe(formatApplicationHistory.name, () => {
  const getHistoryItem = (entityType: History['entityType']) => {
    const item = appHistoryResponse.find(h => h.entityType === entityType)
    if (!item) throw new Error(`${entityType} history item not found in appHistoryResponse`)
    return item
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('formats date and time for each history item', () => {
    const date = '10 January 2024'
    const time = '14:30'

    ;(format as jest.Mock).mockReturnValueOnce(date).mockReturnValueOnce(time)

    const firstItem = appHistoryResponse[0]
    const result = formatApplicationHistory(appHistoryResponse, [], [])

    expect(format).toHaveBeenNthCalledWith(1, new Date(firstItem.createdDate), 'd MMMM yyyy')
    expect(format).toHaveBeenNthCalledWith(2, new Date(firstItem.createdDate), 'HH:mm')

    const formattedFirst = result.find(r => r.id === firstItem.id)
    expect(formattedFirst).toBeDefined()
    expect(formattedFirst).toMatchObject({ date, time })
  })

  it('adds commentMessage when entityType is COMMENT and comment exists', () => {
    ;(format as jest.Mock).mockReturnValue('formatted')

    const commentHistoryItem = getHistoryItem('COMMENT')

    const comment: Comment = {
      id: commentHistoryItem.entityId,
      message: 'This is a comment',
      createdBy: undefined,
      appId: '',
      prisonerNumber: '',
      createdDate: '',
    }

    const result = formatApplicationHistory(appHistoryResponse, [comment], [])

    const formattedCommentItem = result.find(r => r.id === commentHistoryItem.id)
    expect(formattedCommentItem).toBeDefined()
    expect(formattedCommentItem!.commentMessage).toBe('This is a comment')
    expect(formattedCommentItem!.responseMessage).toBeNull()
  })

  it('sets commentMessage to null when comment is not found', () => {
    ;(format as jest.Mock).mockReturnValue('formatted')

    const commentHistoryItem = getHistoryItem('COMMENT')

    const result = formatApplicationHistory(appHistoryResponse, [], [])

    const formattedCommentItem = result.find(r => r.id === commentHistoryItem.id)
    expect(formattedCommentItem).toBeDefined()
    expect(formattedCommentItem!.commentMessage).toBeNull()
  })

  it('adds responseMessage when entityType is RESPONSE and response exists', () => {
    ;(format as jest.Mock).mockReturnValue('formatted')

    const responseHistoryItem = getHistoryItem('RESPONSE')
    const response = { ...appDecisionResponse, id: responseHistoryItem.entityId, reason: 'Application rejected' }

    const result = formatApplicationHistory(appHistoryResponse, [], [response])

    const formattedResponseItem = result.find(r => r.id === responseHistoryItem.id)
    expect(formattedResponseItem).toBeDefined()
    expect(formattedResponseItem!.responseMessage).toBe('Application rejected')
    expect(formattedResponseItem!.commentMessage).toBeNull()
  })

  it('sets responseMessage to null when response is not found', () => {
    ;(format as jest.Mock).mockReturnValue('formatted')

    const responseHistoryItem = getHistoryItem('RESPONSE')

    const result = formatApplicationHistory(appHistoryResponse, [], [])

    const formattedResponseItem = result.find(r => r.id === responseHistoryItem.id)
    expect(formattedResponseItem).toBeDefined()
    expect(formattedResponseItem!.responseMessage).toBeNull()
  })
})
