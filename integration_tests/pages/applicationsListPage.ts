import { expect, Page } from '@playwright/test'
import AbstractPage, { PageElement } from './abstractPage'

export default class ApplicationsListPage extends AbstractPage {
  constructor(page: Page) {
    super(page, 'View all applications in your prison')
  }

  filterCheckbox(name: string | RegExp): PageElement {
    return this.page.getByRole('checkbox', { name, exact: typeof name === 'string' })
  }

  locationGroup(): PageElement {
    return this.page.getByRole('group', { name: 'Location', exact: true })
  }

  filterPanel(): PageElement {
    return this.page.locator('.moj-filter')
  }

  locationInputs(): PageElement {
    return this.page.locator('input[name="location"]')
  }

  order(name: 'Newest' | 'Oldest'): PageElement {
    return this.page.getByRole('radio', { name, exact: true })
  }

  prisoner(): PageElement {
    return this.page.locator('#prisoner')
  }

  applicationTypeSearch(): PageElement {
    return this.page.getByLabel('Application type', { exact: true })
  }

  selectedFilters(): PageElement {
    return this.page.locator('.moj-filter__tag')
  }

  selectedFilter(name: string): PageElement {
    return this.page.locator('.moj-filter__tag', { hasText: name })
  }

  checkedFilters(name: 'status' | 'priority' | 'location' | 'group' | 'type'): PageElement {
    return this.page.locator(`input[name="${name}"]:checked`)
  }

  rows(): PageElement {
    return this.page.locator('tbody tr')
  }

  table(): PageElement {
    return this.page.locator('table')
  }

  tableHeaders(): PageElement {
    return this.page.locator('thead th')
  }

  firstRowCell(index: number): PageElement {
    return this.rows().first().locator('td').nth(index)
  }

  async viewFirstApplication(): Promise<void> {
    await this.rows().first().getByRole('link', { name: 'View' }).click()
  }

  async applyFilters(position: 'top' | 'bottom' = 'top'): Promise<void> {
    const buttons = this.page.getByRole('button', { name: 'Apply filters' })
    await (position === 'top' ? buttons.first() : buttons.last()).click()
  }

  async clearFilters(): Promise<void> {
    await this.page.getByRole('link', { name: 'Clear filters' }).click()
  }

  async selectPrisoner(search: string, label: string): Promise<void> {
    await this.prisoner().fill(search)
    await this.page.getByRole('option', { name: label }).click()
  }

  async expectSingleResult(): Promise<void> {
    await expect(this.rows()).toHaveCount(1)
    await expect(this.rows().first()).toContainText('24/03/2025')
    await expect(this.rows().first()).toContainText('Swap Visiting Orders (VOs) for PIN Credit')
  }
}
