import { Request } from 'express'
import { removeFilterFromHref } from './filters'

describe('removeFilterFromHref', () => {
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
