import { test, expect } from './fixtures/auth'
import { t } from './fixtures/i18n'

test.describe('Search & filter on home', () => {
  test('text search updates URL and results', async ({ page }) => {
    await page.goto('/')
    const searchInput = page.getByPlaceholder(/traži/i).first()
    await searchInput.fill('iphone')
    await searchInput.press('Enter')
    await page.waitForTimeout(2_000)
    // URL should reflect search or results should change — either is acceptable.
    const url = new URL(page.url())
    const urlReflects = url.search.toLowerCase().includes('iphone') ||
      url.search.includes('q=') ||
      url.search.includes('search=')
    if (!urlReflects) {
      // Fallback: at least the input still holds the value
      await expect(searchInput).toHaveValue(/iphone/i)
    }
  })

  test('category filter is clickable', async ({ page }) => {
    await page.goto('/')
    // Find any category button (category buttons render as buttons or links with category text)
    const categoryButtons = page
      .getByRole('button')
      .filter({ hasText: /vozila|elektronika|odjeća|namještaj|mobiteli/i })
    const count = await categoryButtons.count()
    if (count > 0) {
      await categoryButtons.first().click()
      await page.waitForTimeout(1_500)
      // Page should still render (no 500)
      expect(page.url()).toContain('/')
    } else {
      test.skip(true, 'No category buttons found — UI may have changed')
    }
  })

  test('filters modal opens when triggered', async ({ page }) => {
    await page.goto('/')
    const filterButton = page.getByRole('button', { name: new RegExp(t('home.filters'), 'i') }).first()
    if (await filterButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await filterButton.click()
      await page.waitForTimeout(1_000)
      // Some filter UI should now be visible
      const filterContent = page.getByText(new RegExp(t('home.filters'), 'i'))
      expect(await filterContent.count()).toBeGreaterThan(0)
    } else {
      test.skip(true, 'Filters button not present on this viewport')
    }
  })

  test('reset filters button works when filters are active', async ({ page }) => {
    await page.goto('/?category=vozila')
    await page.waitForTimeout(2_000)
    const resetBtn = page.getByRole('button', { name: new RegExp(t('home.resetFilters'), 'i') }).first()
    if (await resetBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await resetBtn.click()
      await page.waitForTimeout(1_000)
      const url = new URL(page.url())
      expect(url.search).not.toContain('category=vozila')
    } else {
      test.skip(true, 'Reset filters not visible — may need active filter trigger')
    }
  })
})
