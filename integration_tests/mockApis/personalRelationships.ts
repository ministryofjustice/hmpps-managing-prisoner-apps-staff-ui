import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

const relationships = {
  SOCIAL_RELATIONSHIP: [
    {
      referenceCode: 50,
      groupCode: 'SOCIAL_RELATIONSHIP',
      code: 'COU',
      description: 'Cousin',
      displayOrder: 0,
      isActive: 'true',
    },
    {
      referenceCode: 51,
      groupCode: 'SOCIAL_RELATIONSHIP',
      code: 'FRI',
      description: 'Friend',
      displayOrder: 0,
      isActive: 'true',
    },
  ],
  OFFICIAL_RELATIONSHIP: [
    {
      referenceCodeId: 60,
      groupCode: 'OFFICIAL_RELATIONSHIP',
      code: 'PRO',
      description: 'Probation Officer',
      displayOrder: 0,
      isActive: 'true',
    },
    {
      referenceCodeId: 61,
      groupCode: 'OFFICIAL_RELATIONSHIP',
      code: 'SOL',
      description: 'Solicitor',
      displayOrder: 0,
      isActive: 'true',
    },
  ],
}

export default {
  stubGetRelationships: (groupCode: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/personalRelationships/reference-codes/group/${groupCode}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: relationships[groupCode] || [],
      },
    })
  },
}
