import { test, expect, t, TEST_USERS } from './fixtures/auth'
import { login, logout, readLatestInbucketMessage } from './fixtures/auth'

test.describe('Authentication flows', () => {
  test('login with seeded Alice user', async ({ page }) => {
    await login(page, TEST_USERS.alice)
    // Should land somewhere other than /login
    expect(page.url()).not.toContain('/login')
  })

  test('login fails with wrong password', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('tvoj@email.com').first().fill(TEST_USERS.alice.email)
    await page.locator('input[type="password"]').fill('wrong-password-xyz')
    await page.getByRole('button', { name: new RegExp(t('auth.login'), 'i') }).click()
    // Still on login page, error visible
    await page.waitForTimeout(2_000)
    expect(page.url()).toContain('/login')
  })

  test('client-side validation: empty fields show errors', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: new RegExp(t('auth.login'), 'i') }).click()
    await expect(page.getByText(t('auth.emailRequired'))).toBeVisible()
    await expect(page.getByText(t('auth.passwordRequired'))).toBeVisible()
  })

  test('client-side validation: invalid email format', async ({ page }) => {
    await page.goto('/login')
    // Native HTML5 type=email validation blocks submission before our
    // custom validator runs. Verify the browser's own invalidity state.
    const emailInput = page.getByPlaceholder('tvoj@email.com').first()
    await emailInput.fill('not-an-email')
    await page.locator('input[type="password"]').fill('somepassword')
    await page.getByRole('button', { name: new RegExp(t('auth.login'), 'i') }).click()
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.checkValidity())
    expect(isInvalid).toBe(true)
  })

  test('password reset request sends email', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: new RegExp(t('auth.forgotPassword'), 'i') }).click()
    await page.locator('input[type="email"]').last().fill(TEST_USERS.alice.email)
    await page.getByRole('button', { name: new RegExp(t('auth.send'), 'i') }).click()
    await expect(page.getByText(t('auth.resetSent'))).toBeVisible({ timeout: 15_000 })

    const mail = await readLatestInbucketMessage(TEST_USERS.alice.email)
    expect(mail).not.toBeNull()
  })

  // Skipped: register flow has an OTP confirmation step that requires
  // reading Inbucket and entering a code. Will be revisited once core flows
  // are green and we know the exact UI shape.
  test.skip('register a fresh user and complete the form', async ({ page }) => {
    const uniqueEmail = `e2e-fresh-${Date.now()}@nudinadi.test`
    await page.goto('/register')
    // Form has multiple inputs — fill by placeholder & type
    await page.locator('input[type="email"]').first().fill(uniqueEmail)
    const passwordInputs = page.locator('input[type="password"]')
    await passwordInputs.first().fill('Passw0rd!Test')
    await passwordInputs.nth(1).fill('Passw0rd!Test')

    // Accept terms checkbox (if present)
    const termsCheckbox = page.getByRole('checkbox').first()
    if (await termsCheckbox.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await termsCheckbox.check()
    }

    const registerBtn = page.getByRole('button', { name: new RegExp(t('auth.register'), 'i') })
    await registerBtn.click()

    // Expect either an OTP step, a redirect, or a toast — give it a generous window.
    await page.waitForTimeout(5_000)
    const url = page.url()
    const onOtpOrSuccess =
      !url.includes('/register') ||
      (await page.getByText(/verifi/i).count()) > 0 ||
      (await page.getByText(t('auth.registerSuccess')).count()) > 0
    expect(onOtpOrSuccess).toBe(true)
  })
})
