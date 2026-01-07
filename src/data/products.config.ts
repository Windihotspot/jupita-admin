export const PRODUCT_CONFIG = {
  analyze: {
    name: 'Analyze',
    status: 'Active',
    global: true,
    features: [
      { id: 1, name: 'Recommendation', enabled: false },
      { id: 2, name: 'Individual Analysis', enabled: true },
      { id: 3, name: 'Business Analysis', enabled: true },
      { id: 4, name: 'Export Analysis', enabled: true }
    ]
  },

  'credit-search': {
    name: 'Credit Search',
    status: 'Active',
    global: true,
    features: [
      {
        id: 1,
        name: 'Credit Registry',
        enabled: false,
        api: 'Credit Registry API'
      },
      {
        id: 2,
        name: 'CRC',
        enabled: true,
        api: 'CRC API'
      },
      {
        id: 3,
        name: 'First Central',
        enabled: true,
        api: 'First Central API'
      }
    ]
  },
  'loan-origination': {
    name: 'Loan Origination',
    status: 'Active',
    global: true,
    features: [
      {
        id: 1,
        name: 'Credit Registry',
        enabled: false,
        api: 'Credit Registry API'
      },
      {
        id: 2,
        name: 'CRC',
        enabled: true,
        api: 'CRC API'
      },
      {
        id: 3,
        name: 'First Central',
        enabled: true,
        api: 'First Central API'
      }
    ]
  },

  'id-verification': {
    name: 'ID Verification',
    status: 'Active',
    global: true,
    features: [
      { id: 1, name: 'BVN', enabled: false, api: 'Smile ID' },
      { id: 2, name: 'NIN', enabled: true, api: 'Smile ID' },
      { id: 3, name: "Voter's Card", enabled: true, api: 'Zeeh Africa' },
      { id: 4, name: 'Phone Number', enabled: true, api: 'Smile ID' }
    ]
  }
}
