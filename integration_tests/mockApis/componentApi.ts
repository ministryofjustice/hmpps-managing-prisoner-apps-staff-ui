import { stubFor } from './wiremock'

export default {
  stubPing: () =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/componentApi/ping',
      },
      response: {
        status: 200,
      },
    }),
}
