import { test, expect, t } from './fixtures/auth'
import { dismissOverlays } from './fixtures/auth'
import type { Page } from '@playwright/test'

/**
 * The signup → username → tour funnel.
 *
 * This spec exists because the flow shipped broken three times in a row and
 * every "test" was manual. The assertions below pin the exact things that
 * silently regressed:
 *   - landing on /profile after the username step (a navigation race sent
 *     users to / instead, where the tour deliberately never starts)
 *   - the tour actually opening there
 *   - the tour ending on the marketplace feed rather than in settings
 */

const PASSWORD = 'Passw0rdTest1'

/** Register through the UI and stop on the OTP verification screen. */
async function registerFreshUser(page: Page, email: string) {
  await page.goto('/register')

  await page.locator('input[type="email"]').first().fill(email)
  const passwords = page.locator('input[type="password"]')
  await passwords.first().fill(PASSWORD)
  await passwords.nth(1).fill(PASSWORD)

  // Age + terms are two custom checkbox labels, both required to enable submit.
  await page.getByText(t('auth.confirmAge'), { exact: false }).click()
  await page.getByText(t('auth.acceptTerms'), { exact: false }).click()

  await page.getByRole('button', { name: new RegExp(t('auth.register'), 'i') }).click()
}

test.describe('Onboarding: username step → coachmark tour', () => {
  test('new user lands on /profile and the tour opens', async ({ page }) => {
    const email = `e2e-tour-${Date.now()}@nudinadi.test`
    await registerFreshUser(page, email)

    // Skip email verification — mail delivery isn't what's under test here.
    const skipBtn = page.getByRole('button', { name: new RegExp(t('auth.verifyLater'), 'i') })
    await expect(skipBtn).toBeVisible({ timeout: 20_000 })
    await skipBtn.click()

    // The mandatory username step.
    await page.waitForURL(/\/postavi-profil/, { timeout: 20_000 })
    await expect(page.getByText(t('welcome.headline'))).toBeVisible()

    const username = `e2euser${Date.now().toString().slice(-8)}`
    await page.getByPlaceholder(t('welcome.usernamePlaceholder')).fill(username)

    // Wait out the 600ms debounce + availability round-trip.
    await expect(page.getByText(t('welcome.usernameFree'))).toBeVisible({ timeout: 15_000 })

    await page.getByRole('button', { name: new RegExp(t('welcome.save'), 'i') }).click()

    // THE regression: a stray replace('/') used to win this race.
    await page.waitForURL(/\/profile$/, { timeout: 20_000 })
    expect(new URL(page.url()).pathname).toBe('/profile')

    // And the tour must open by itself, without the user navigating anywhere.
    const spotlight = page.getByRole('dialog')
    await expect(spotlight).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText(t('tour.editTitle'))).toBeVisible()
  })

  test('completing the tour ends on the marketplace feed', async ({ page }) => {
    const email = `e2e-tour-end-${Date.now()}@nudinadi.test`
    await registerFreshUser(page, email)

    await page.getByRole('button', { name: new RegExp(t('auth.verifyLater'), 'i') }).click()
    await page.waitForURL(/\/postavi-profil/, { timeout: 20_000 })

    const username = `e2eend${Date.now().toString().slice(-8)}`
    await page.getByPlaceholder(t('welcome.usernamePlaceholder')).fill(username)
    await expect(page.getByText(t('welcome.usernameFree'))).toBeVisible({ timeout: 15_000 })
    await page.getByRole('button', { name: new RegExp(t('welcome.save'), 'i') }).click()

    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 20_000 })

    // Click "Dalje" until the last step, then "Završi".
    for (let i = 0; i < 10; i++) {
      const finish = page.getByRole('button', { name: new RegExp(`^${t('tour.finish')}$`, 'i') })
      if (await finish.isVisible({ timeout: 1_000 }).catch(() => false)) {
        await finish.click()
        break
      }
      const next = page.getByRole('button', { name: new RegExp(`^${t('tour.next')}$`, 'i') })
      await next.click()
      await page.waitForTimeout(800) // step transition + target poll
    }

    await page.waitForURL((url) => url.pathname === '/', { timeout: 20_000 })
    await expect(page.getByRole('dialog')).toBeHidden()
  })

  test('the username step is mandatory: / bounces back to it', async ({ page }) => {
    const email = `e2e-gate-${Date.now()}@nudinadi.test`
    await registerFreshUser(page, email)

    await page.getByRole('button', { name: new RegExp(t('auth.verifyLater'), 'i') }).click()
    await page.waitForURL(/\/postavi-profil/, { timeout: 20_000 })

    // Try to escape without choosing a username.
    await page.goto('/')
    await page.waitForURL(/\/postavi-profil/, { timeout: 15_000 })
    expect(new URL(page.url()).pathname).toBe('/postavi-profil')
  })

  test('existing users never see the username step', async ({ page }) => {
    await dismissOverlays(page)
    // Alice is seeded and pre-onboarded (username_chosen backfilled true).
    const { TEST_USERS, login } = await import('./fixtures/auth')
    await login(page, TEST_USERS.alice)

    await page.goto('/postavi-profil')
    await page.waitForURL((url) => url.pathname === '/', { timeout: 15_000 })
    expect(new URL(page.url()).pathname).toBe('/')
  })
})
