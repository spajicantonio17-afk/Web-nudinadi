import path from 'node:path'
import { test, expect } from './fixtures/auth'
import { t } from './fixtures/i18n'

const TEST_IMAGE = path.join(__dirname, 'fixtures', 'test-image.png')

test.describe('Upload / new listing', () => {
  // Mock AI moderation + categorization to avoid Gemini API calls in tests.
  test.beforeEach(async ({ alicePage }) => {
    await alicePage.route('**/api/ai/**', async (route) => {
      const url = route.request().url()
      if (url.includes('moderate') || url.includes('check')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ allowed: true, flagged: false, reason: null }),
        })
      }
      if (
        url.includes('categorize') ||
        url.includes('classify') ||
        url.includes('enhance') ||
        url.includes('tags')
      ) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              category: 'Ostalo',
              subcategory: null,
              correctedTitle: 'E2E Test Title',
              description: 'E2E test description.',
              tags: ['e2e', 'test'],
              confidence: 0.5,
            },
          }),
        })
      }
      return route.continue()
    })
  })

  test('upload page renders for logged-in user', async ({ alicePage }) => {
    const response = await alicePage.goto('/upload')
    expect(response?.status() ?? 0).toBeLessThan(500)
    // Title (uses t('upload.title') = 'Novi Oglas') or photo-add button
    const hasTitle =
      (await alicePage.getByText(new RegExp(t('upload.title'), 'i')).count()) > 0
    const hasAddPhotos =
      (await alicePage.getByText(new RegExp(t('upload.addPhotos'), 'i')).count()) > 0
    expect(hasTitle || hasAddPhotos, 'Upload page has no recognizable header').toBe(true)
  })

  test('upload page first step asks "Šta prodaješ?"', async ({ alicePage }) => {
    await alicePage.goto('/upload')
    // Multi-step wizard: step 1 is a title prompt, photo upload comes later.
    await expect(
      alicePage.getByRole('heading', { name: new RegExp(t('upload.whatSelling'), 'i') }),
    ).toBeVisible({ timeout: 15_000 })
    // Verify the AI title input is present
    const titleInput = alicePage.getByPlaceholder(/Sony PS5|Golf 7|Patike/i).first()
    await expect(titleInput).toBeVisible()
  })

  // Skipped: the upload flow is a multi-step wizard with AI-driven branching
  // (category detection, vehicle attributes, etc.). Driving it end-to-end
  // requires real or mocked Gemini responses and step-specific selectors —
  // out of scope for the smoke pass.
  test.skip('file input accepts an image (full wizard)', async () => {
    void TEST_IMAGE
  })

  test('guest is redirected away from /upload', async ({ page }) => {
    // `page` (default fixture) is not logged in
    await page.goto('/upload')
    await page.waitForTimeout(2_000)
    const url = page.url()
    // Either redirected to login, or page shows guest-prompt
    const guestState =
      url.includes('/login') ||
      url.includes('/register') ||
      (await page.getByText(/prijavi|registr/i).count()) > 0
    expect(guestState).toBe(true)
  })
})
