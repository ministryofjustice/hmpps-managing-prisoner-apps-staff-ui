import { Request } from 'express'
import { removeFilterFromHref } from './filters'

describe('removeFilterFromHref', () => {
  const mockReq = (query: Record<string, string | string[]>): Request => ({ query }) as Request

  it('should remove a single value from query parameters', () => {
    const req = mockReq({ type: 'urgent' })
    const result = removeFilterFromHref(req, 'type', 'urgent')
    expect(result).toBe('/applications?')
  })

  it('should remove a value from an array of query parameters', () => {
    const req = mockReq({ type: ['urgent', 'standard', 'low'] })
    const result = removeFilterFromHref(req, 'type', 'urgent')
    expect(result).toBe('/applications?type=standard&type=low')
  })

  it('should not modify the query if the value is not present', () => {
    const req = mockReq({ type: ['standard', 'low'] })
    const result = removeFilterFromHref(req, 'type', 'urgent')
    expect(result).toBe('/applications?type=standard&type=low')
  })

  it('should return the original query if the filterKey is not present', () => {
    const req = mockReq({ category: 'books' })
    const result = removeFilterFromHref(req, 'type', 'urgent')
    expect(result).toBe('/applications?category=books')
  })

  it('should return an empty query string if all values are removed', () => {
    const req = mockReq({ type: ['urgent'] })
    const result = removeFilterFromHref(req, 'type', 'urgent')
    expect(result).toBe('/applications?')
  })

  it('should handle multiple instances of the same value correctly', () => {
    const req = mockReq({ type: ['urgent', 'urgent', 'low'] })
    const result = removeFilterFromHref(req, 'type', 'urgent')
    expect(result).toBe('/applications?type=low')
  })

  it('should handle an empty request object gracefully', () => {
    const req = mockReq({})
    const result = removeFilterFromHref(req, 'type', 'urgent')
    expect(result).toBe('/applications?')
  })
})
