import { Group } from '../../@types/managingAppsApi'
import { buildAppTypes } from './buildAppTypes'

describe(buildAppTypes.name, () => {
  it('adds an "or" divider before the generic app type', () => {
    const group: Group = {
      id: 1,
      name: 'Property',
      appTypes: [
        { id: 10, name: 'Facilities list', genericType: false, genericForm: true, logDetailRequired: true },
        { id: 11, name: 'Property (general enquiry)', genericType: true, genericForm: true, logDetailRequired: true },
      ],
    }

    expect(buildAppTypes(group, null)).toEqual([
      { value: '10', text: 'Facilities list', checked: false },
      { divider: 'or' },
      { value: '11', text: 'Property (general enquiry)', checked: false },
    ])
  })

  it('does not add an "or" divider when there are no generic app types', () => {
    const group: Group = {
      id: 1,
      name: 'Property',
      appTypes: [{ id: 10, name: 'Facilities list', genericType: false, genericForm: true, logDetailRequired: true }],
    }

    expect(buildAppTypes(group, null)).toEqual([{ value: '10', text: 'Facilities list', checked: false }])
  })

  it('does not add an "or" divider when there is one generic app type and no normal app types', () => {
    const group: Group = {
      id: 1,
      name: 'Property',
      appTypes: [
        {
          id: 10,
          name: 'Facilities list (general enquiry)',
          genericType: true,
          genericForm: true,
          logDetailRequired: true,
        },
      ],
    }

    expect(buildAppTypes(group, null)).toEqual([
      { value: '10', text: 'Facilities list (general enquiry)', checked: false },
    ])
  })

  it('does not add an "or" divider when there are multiple generic app types', () => {
    const group: Group = {
      id: 1,
      name: 'Property',
      appTypes: [
        {
          id: 10,
          name: 'Facilities list (general enquiry)',
          genericType: true,
          genericForm: true,
          logDetailRequired: true,
        },
        { id: 11, name: 'Property (general enquiry)', genericType: true, genericForm: true, logDetailRequired: true },
      ],
    }

    expect(buildAppTypes(group, null)).toEqual([
      { value: '10', text: 'Facilities list (general enquiry)', checked: false },
      { value: '11', text: 'Property (general enquiry)', checked: false },
    ])
  })
})
