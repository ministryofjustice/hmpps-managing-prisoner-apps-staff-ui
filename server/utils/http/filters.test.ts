import { Request } from 'express'
import { ListFilters } from 'express-session'
import { removeFilterFromHref, retainFilters, saveFiltersToSession } from './filters'
import { FILTER_KEYS } from '../../constants/filters'

describe(removeFilterFromHref.name, () => {
  const mockReq = (query: Record<string, string | string[]>): Request => ({ query }) as Request

  it('should remove a single type from the query', () => {
    const req = mockReq({ type: 'business-hub' })
    const result = removeFilterFromHref(req, 'type', 'business-hub')
    expect(result).toBe('/applications?')
  })

  it('should remove a type from an array of types', () => {
    const req = mockReq({ type: ['business-hub', 'omu'] })
    const result = removeFilterFromHref(req, 'type', 'business-hub')
    expect(result).toBe('/applications?type=omu')
  })

  it('should remove a single department from the query', () => {
    const req = mockReq({ department: 'dept-1' })
    const result = removeFilterFromHref(req, 'department', 'dept-1')
    expect(result).toBe('/applications?')
  })

  it('should remove a department from an array of departments', () => {
    const req = mockReq({ department: ['dept-1', 'dept-2'] })
    const result = removeFilterFromHref(req, 'department', 'dept-1')
    expect(result).toBe('/applications?department=dept-2')
  })

  it('should not modify the query if the type is not present', () => {
    const req = mockReq({ type: ['omu'] })
    const result = removeFilterFromHref(req, 'type', 'business-hub')
    expect(result).toBe('/applications?type=omu')
  })

  it('should not modify the query if the department is not present', () => {
    const req = mockReq({ department: ['dept-2'] })
    const result = removeFilterFromHref(req, 'department', 'dept-1')
    expect(result).toBe('/applications?department=dept-2')
  })

  it('should return the original query if the filterKey is not present', () => {
    const req = mockReq({ category: 'other' })
    const result = removeFilterFromHref(req, 'type', 'business-hub')
    expect(result).toBe('/applications?category=other')
  })

  it('should return an empty query string if all types are removed', () => {
    const req = mockReq({ type: ['business-hub'] })
    const result = removeFilterFromHref(req, 'type', 'business-hub')
    expect(result).toBe('/applications?')
  })

  it('should return an empty query string if all departments are removed', () => {
    const req = mockReq({ department: ['dept-1'] })
    const result = removeFilterFromHref(req, 'department', 'dept-1')
    expect(result).toBe('/applications?')
  })

  it('should handle multiple instances of the same type correctly', () => {
    const req = mockReq({ type: ['business-hub', 'business-hub', 'omu'] })
    const result = removeFilterFromHref(req, 'type', 'business-hub')
    expect(result).toBe('/applications?type=omu')
  })

  it('should handle multiple instances of the same department correctly', () => {
    const req = mockReq({ department: ['dept-1', 'dept-1', 'dept-2'] })
    const result = removeFilterFromHref(req, 'department', 'dept-1')
    expect(result).toBe('/applications?department=dept-2')
  })

  it('should handle an empty request object gracefully', () => {
    const req = mockReq({})
    const result = removeFilterFromHref(req, 'type', 'business-hub')
    expect(result).toBe('/applications?')
  })
})

describe(retainFilters.name, () => {
  const mockReq = (query: Record<string, string | string[] | undefined> = {}, listFilters?: ListFilters): Request =>
    ({
      query,
      session: { listFilters },
    }) as unknown as Request

  it('should do nothing if clearFilters is true', () => {
    const req = mockReq({ clearFilters: 'true' }, { status: ['PENDING'] })
    retainFilters(req)
    expect(req.query.status).toBeUndefined()
  })

  it('should do nothing if query params already exist', () => {
    const req = mockReq({ status: ['APPROVED'] }, { status: ['PENDING'] })
    retainFilters(req)
    expect(req.query.status).toEqual(['APPROVED'])
  })

  it('should restore filters from session if no query params and clearFilters is false', () => {
    const listFilters: ListFilters = {
      order: 'newest',
      status: ['PENDING'],
      prisoner: 'ABC123',
      priority: 'first-night-centre',
      group: ['group1', 'group2'],
      applicationTypeFilter: ['appTypeA'],
      type: ['1', '2'],
    }
    const req = mockReq({}, listFilters)
    retainFilters(req)

    FILTER_KEYS.forEach(key => {
      expect(req.query[key]).toEqual(listFilters[key])
    })
  })
})

describe(saveFiltersToSession.name, () => {
  const mockReq = (query: Record<string, string | string[] | undefined> = {}): Request =>
    ({
      query,
      session: {},
    }) as unknown as Request

  it('should save single string filters to session', () => {
    const req = mockReq({ prisoner: 'ABC123', priority: 'first-night-centre' })
    saveFiltersToSession(req)
    expect(req.session.listFilters?.prisoner).toEqual('ABC123')
    expect(req.session.listFilters?.priority).toEqual('first-night-centre')
  })

  it('should save array filters to session', () => {
    const req = mockReq({ status: ['PENDING', 'APPROVED'], group: ['group1', 'group2'] })
    saveFiltersToSession(req)
    expect(req.session.listFilters?.status).toEqual(['PENDING', 'APPROVED'])
    expect(req.session.listFilters?.group).toEqual(['group1', 'group2'])
  })
})
