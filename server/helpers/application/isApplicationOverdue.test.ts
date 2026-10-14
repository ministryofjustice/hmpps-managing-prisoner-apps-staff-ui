import isApplicationOverdue from './isApplicationOverdue'

describe(isApplicationOverdue.name, () => {
  const createdDate = '2025-01-06T23:59:00.000Z'

  it.each(['NEW', 'IN_PROGRESS'])('marks apps overdue after five working days', status => {
    expect(isApplicationOverdue(createdDate, status, new Date('2025-01-14T00:00:00.000Z'))).toBe(true)
  })

  it('does not mark an app overdue just before the five-working-day deadline', () => {
    expect(isApplicationOverdue(createdDate, 'NEW', new Date('2025-01-13T23:59:59.999Z'))).toBe(false)
  })

  it('skips weekends when counting the five working days', () => {
    expect(isApplicationOverdue('2025-01-10T23:59:00.000Z', 'NEW', new Date('2025-01-18T00:00:00.000Z'))).toBe(true)
  })

  it.each(['APPROVED', 'DECLINED', 'REJECTED'])('does not mark  apps overdue', status => {
    expect(isApplicationOverdue(createdDate, status, new Date('2025-01-14T00:00:00.000Z'))).toBe(false)
  })

  it('does not mark an app with an invalid creation date overdue', () => {
    expect(isApplicationOverdue('not-a-date', 'NEW', new Date('2025-01-14T00:00:00.000Z'))).toBe(false)
  })
})
