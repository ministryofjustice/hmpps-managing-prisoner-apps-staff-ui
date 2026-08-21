import superagent, { SuperAgentRequest, Response } from 'superagent'

const defaultWiremockPort = '9091'

const getWiremockUrl = () => `http://localhost:${process.env.WIREMOCK_PORT || defaultWiremockPort}/__admin`

const stubFor = (mapping: Record<string, unknown>): SuperAgentRequest =>
  superagent.post(`${getWiremockUrl()}/mappings`).send(mapping)

const getMatchingRequests = (body: string | Record<string, unknown> | object): SuperAgentRequest =>
  superagent.post(`${getWiremockUrl()}/requests/find`).send(body)

const resetStubs = (): Promise<Array<Response>> =>
  Promise.all([superagent.delete(`${getWiremockUrl()}/mappings`), superagent.delete(`${getWiremockUrl()}/requests`)])

export { stubFor, getMatchingRequests, resetStubs }
