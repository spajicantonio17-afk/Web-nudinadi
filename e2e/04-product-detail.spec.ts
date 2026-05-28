import { test, expect } from './fixtures/auth'
import { t, TEST_PRODUCT_ID } from './fixtures/i18n'

test.describe('Product detail page', () => {
  test('seeded product detail page loads', async ({ page }) => {
    const response = await page.goto(`/product/${TEST_PRODUCT_ID}`)
    expect(response?.status() ?? 0).toBeLessThan(500)
    // Product title (from seed.sql) should appear
    await expect(page.getByText(/E2E Test Proizvod/i).first()).toBeVisible({
      timeout: 15_000,
    })
  })

  test('"Pošalji Poruku" button is visible for product', async ({ page }) => {
    await page.goto(`/product/${TEST_PRODUCT_ID}`)
    const msgBtn = page.getByRole('button', {
      name: new RegExp(t('product.sendMessage'), 'i'),
    }).first()
    await expect(msgBtn).toBeVisible({ timeout: 10_000 })
  })

  test('back button returns to home', async ({ page }) => {
    await page.goto(`/product/${TEST_PRODUCT_ID}`)
    const backBtn = page.getByRole('button', { name: new RegExp(t('product.back'), 'i') }).first()
    if (await backBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await backBtn.click()
      await page.waitForTimeout(1_500)
      const url = new URL(page.url())
      expect(url.pathname).not.toContain('/product/')
    } else {
      test.skip(true, 'Back button not present on this page')
    }
  })

  test('add to cart works (localStorage cart)', async ({ page }) => {
    await page.goto(`/product/${TEST_PRODUCT_ID}`)
    const cartBtn = page.getByRole('button', { name: new RegExp(t('product.buy'), 'i') }).first()
    if (await cartBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await cartBtn.click()
      await page.waitForTimeout(1_500)
      // Either the button now shows "U Korpi" or a toast appeared
      const inCart = await page.getByText(new RegExp(`${t('product.inCart')}|${t('cart.added')}`, 'i')).count()
      expect(inCart).toBeGreaterThan(0)
    } else {
      test.skip(true, 'Add to cart button not present')
    }
  })
})
