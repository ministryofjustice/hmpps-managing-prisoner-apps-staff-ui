/* eslint-disable no-param-reassign */
import path from 'path'
import nunjucks from 'nunjucks'
import express from 'express'
import fs from 'fs'
import { initialiseName } from './utils'
import config from '../config'
import logger from '../../logger'

export default function nunjucksSetup(app: express.Express): void {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'HMPPS Managing Prisoner Apps Staff Ui'
  app.locals.environmentName = config.environmentName
  app.locals.environmentNameColour = config.environmentName === 'PRE-PRODUCTION' ? 'govuk-tag--green' : ''
  let assetManifest: Record<string, string> = {}

  try {
    const assetMetadataPath = path.resolve(__dirname, '../../assets/manifest.json')
    assetManifest = JSON.parse(fs.readFileSync(assetMetadataPath, 'utf8'))
  } catch (e) {
    if (process.env.NODE_ENV !== 'test') {
      logger.error(e, 'Could not read asset manifest file')
    }
  }

  const njkEnv = nunjucks.configure(
    [
      path.join(__dirname, '../../server/views'),
      'node_modules/govuk-frontend/dist/',
      'node_modules/@ministryofjustice/frontend/',
      'node_modules/@ministryofjustice/hmpps-connect-dps-components/dist/assets/',
    ],
    {
      autoescape: true,
      express: app,
    },
  )

  njkEnv.addGlobal('ga4SiteId', config.analytics.ga4SiteId)
  njkEnv.addFilter('initialiseName', initialiseName)
  njkEnv.addFilter('assetMap', (url: string) => assetManifest[url] || url)

  njkEnv.addFilter('toPagination', ({ page, totalPages }, query) => {
    const urlForPage = (n: number): string => {
      const urlSearchParams = new URLSearchParams(query)
      urlSearchParams.set('page', n.toString())
      return `?${urlSearchParams.toString()}`
    }

    const items = [...Array(totalPages).keys()].map(n => ({
      number: n + 1,
      href: urlForPage(n + 1),
      current: n + 1 === page,
    }))

    return {
      previous:
        page > 1
          ? {
              text: 'Previous',
              href: urlForPage(page - 1),
            }
          : null,
      next:
        page < totalPages
          ? {
              text: 'Next',
              href: urlForPage(page + 1),
            }
          : null,
      items,
    }
  })
}
