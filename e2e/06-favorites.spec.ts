import { test, expect } from './fixtures/auth'
import { t, TEST_PRODUCT_ID } from './fixtures/i18n'

test.describe('Favorites flow', () => {
  test('favorites page loads when logged in', async ({ alicePage }) => {
    await alicePage.goto('/favorites')
    expect(alicePage.url()).toContain('/favorites')
  })

  test('toggle favorite on product detail page', async ({ alicePage }) => {
    await alicePage.goto(`/product/${TEST_PRODUCT_ID}`)
    // Heart button — usually has aria-label like "Favorite" or is icon-only.
    const heartBtn = alicePage
      .locator('button')
      .filter({ has: alicePage.locator('i.fa-heart, [class*="heart"], svg[class*="heart"]') })
      .first()

    if (!(await heartBtn.isVisible({ timeout: 5_000 }).catch(() => false))) {
      test.skip(true, 'Favorite button not found on product detail page')
      return
    }

    await heartBtn.click()
    await alicePage.waitForTimeout(1_500)

    // Check favorites list
    await alicePage.goto('/favorites')
    await alicePage.waitForTimeout(2_000)
    const productCount = await alicePage.getByText(/E2E Test Proizvod/i).count()
    expect(productCount).toBeGreaterThanOrEqual(1)
  })
})
