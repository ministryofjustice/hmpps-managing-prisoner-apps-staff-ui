import { PERSONAL_RELATIONSHIPS_GROUP_CODES } from '../../constants/personalRelationshipsGroupCodes'

// eslint-disable-next-line import/prefer-default-export
export const relationships = {
  SOCIAL_RELATIONSHIP: [
    {
      referenceCode: 50,
      groupCode: PERSONAL_RELATIONSHIPS_GROUP_CODES.SOCIAL_RELATIONSHIP,
      code: 'COU',
      description: 'Cousin',
      displayOrder: 0,
      isActive: 'true',
    },
  ],
  OFFICIAL_RELATIONSHIP: [
    {
      referenceCodeId: 60,
      groupCode: PERSONAL_RELATIONSHIPS_GROUP_CODES.OFFICIAL_RELATIONSHIP,
      code: 'PRO',
      description: 'Probation Officer',
      displayOrder: 0,
      isActive: 'true',
    },
  ],
}
