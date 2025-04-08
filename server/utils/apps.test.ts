import TestData from '../routes/testutils/testData'
import { formatAppsToRows } from './apps'

describe('formatAppsToRows', () => {
  it('should correctly format applications', () => {
    const applications = [
      {
        ...new TestData().appSearchResponse.apps[0],
        prisonerName: 'Doe, John',
      },
    ]

    const result = formatAppsToRows(applications)

    expect(result).toEqual([
      [
        { text: '24 March 2025', attributes: { 'data-sort-value': '1742824993000' } },
        { text: 'Swap visiting orders (VOs) for PIN credit' },
        { html: 'Doe, John<br/><span class="govuk-table__subtext govuk-body-s">A12345</span>' },
        { text: 'Business Hub' },
        { html: '<a href="/applications/A12345/1808f5e2-2bf4-499a-b79f-fb0a5f4bac7b" class="govuk-link">View</a>' },
      ],
    ])
  })
})
