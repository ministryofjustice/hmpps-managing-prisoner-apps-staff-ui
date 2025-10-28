import { appTypes } from './appTypes'

// eslint-disable-next-line import/prefer-default-export
export const groups = [
  {
    id: 1,
    name: 'Pin Phone Contact Apps',
    applicationTypes: [
      appTypes.addNewSocialContact,
      appTypes.addNewOfficialContact,
      appTypes.removeContact,
      appTypes.addGenericContact,
    ],
  },
  {
    id: 2,
    name: 'Emergency Credit and Vist',
    applicationTypes: [appTypes.emergencyCredit, appTypes.swapVOs, appTypes.genericCreditVisit],
  },
]
