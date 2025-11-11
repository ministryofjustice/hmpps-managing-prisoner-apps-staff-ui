import { appTypes } from './appTypes'

// eslint-disable-next-line import/prefer-default-export
export const groups = [
  {
    id: 1,
    name: 'Pin Phone Contact Apps',
    appTypes: [
      appTypes.emergencyCredit,
      appTypes.addNewOfficialContact,
      appTypes.addNewSocialContact,
      appTypes.addOrRemoveContact,
      appTypes.swapVOs,
      appTypes.supplyContactList,
      appTypes.makeGeneralEnquiry,
    ],
  },
]
