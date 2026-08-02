import { test as base, expect, Page } from '@playwright/test'
import { t, TEST_USERS, SUPABASE_LOCAL } from './i18n'

type TestUser = (typeof TEST_USERS)[keyof typeof TEST_USERS]

/**
 * CookieConsent is a fixed overlay that intercepts clicks. CoachmarkTour
 * only shows right after a fresh registration (gated by the
 * nudinadi_just_registered flag, which login()/these fixtures never set),
 * so it doesn't need dismissing here. Pre-seed CookieConsent's flag and a
 * fixed country so neither renders and currency formatting is deterministic.
 */
export async function dismissOverlays(page: Page) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('nudinadi_cookie_consent', 'all')
      localStorage.setItem('nudinadi_country', 'ba')
    } catch {
      // ignore — localStorage not available
    }
  })
}

export async function login(page: Page, user: TestUser) {
  await dismissOverlays(page)
  await page.goto('/login')
  await page.getByPlaceholder('tvoj@email.com').first().fill(user.email)
  await page.locator('input[type="password"]').fill(user.password)
  await page.getByRole('button', { name: new RegExp(t('auth.login'), 'i') }).click()
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
    timeout: 15_000,
  })
}

export async function logout(page: Page) {
  await page.goto('/menu')
  const logoutBtn = page.getByRole('button', { name: /odjavi/i }).first()
  if (await logoutBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await logoutBtn.click()
  }
}

/**
 * Read the most recent email sent to the given address via Mailpit
 * (which Supabase CLI uses as the local SMTP capture). Polls briefly
 * because mail delivery is async.
 */
export async function readLatestMailpitMessage(
  email: string,
  { timeoutMs = 10_000 }: { timeoutMs?: number } = {},
): Promise<{ subject: string; body: string; links: string[] } | null> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const search = new URLSearchParams({ query: `to:${email}` }).toString()
    const res = await fetch(
      `${SUPABASE_LOCAL.inbucketUrl}/api/v1/search?${search}`,
    )
    if (res.ok) {
      const data = (await res.json()) as { messages?: Array<{ ID: string; Subject: string }> }
      const msgs = data.messages ?? []
      if (msgs.length > 0) {
        const latest = msgs[0]
        const detail = await fetch(
          `${SUPABASE_LOCAL.inbucketUrl}/api/v1/message/${latest.ID}`,
        )
        if (detail.ok) {
          const d = (await detail.json()) as { Subject: string; Text?: string; HTML?: string }
          const text = d.Text ?? d.HTML ?? ''
          const links = Array.from(text.matchAll(/https?:\/\/[^\s)"<]+/g)).map((m) => m[0])
          return { subject: d.Subject, body: text, links }
        }
      }
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  return null
}

// Back-compat alias for older specs
export const readLatestInbucketMessage = readLatestMailpitMessage

type Fixtures = {
  alicePage: Page
  bobPage: Page
}

export const test = base.extend<Fixtures>({
  // Override default page fixture: pre-dismiss overlays for ALL specs.
  page: async ({ page }, use) => {
    await dismissOverlays(page)
    await use(page)
  },
  alicePage: async ({ browser }, use) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    await dismissOverlays(page)
    await login(page, TEST_USERS.alice)
    await use(page)
    await context.close()
  },
  bobPage: async ({ browser }, use) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    await dismissOverlays(page)
    await login(page, TEST_USERS.bob)
    await use(page)
    await context.close()
  },
})

export { expect, t, TEST_USERS }
