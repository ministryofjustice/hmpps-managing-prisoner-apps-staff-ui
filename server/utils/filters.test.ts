import { Request } from 'express'
import { formatAppTypes, formatGroups, removeFilterFromHref } from './filters'
import { APPLICATION_TYPES } from '../constants/applicationTypes'

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

describe('formatAppTypes', () => {
  it('should format app types correctly', () => {
    const types = {
      PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS: 3,
    }
    const selectedFilters = { types: ['PIN_PHONE_CREDIT_SWAP_VISITING_ORDERS'] }

    const result = formatAppTypes(types, selectedFilters)

    expect(result).toEqual([
      { value: APPLICATION_TYPES[0].apiValue, text: `${APPLICATION_TYPES[0].name} (3)`, checked: true },
    ])
  })

  it('should return an empty array if no matching types are found', () => {
    const types = { UNKNOWN_TYPE: 3 }
    const selectedFilters = { types: ['non-existing'] }

    const result = formatAppTypes(types, selectedFilters)

    expect(result).toEqual([])
  })
})

describe('formatGroups', () => {
  it('should format groups correctly', () => {
    const assignedGroups = [
      { id: 'group1', name: 'Group 1', count: 2 },
      { id: 'group2', name: 'Group 2', count: 3 },
    ]
    const selectedFilters = { groups: ['group1'] }

    const result = formatGroups(assignedGroups, selectedFilters)

    expect(result).toEqual([
      { value: 'group1', text: 'Group 1 (2)', checked: true },
      { value: 'group2', text: 'Group 2 (3)', checked: false },
    ])
  })
})
