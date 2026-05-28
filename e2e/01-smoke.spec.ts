import { test, expect } from './fixtures/auth'
import { t } from './fixtures/i18n'

const PUBLIC_ROUTES: Array<{ path: string; expectText?: string | RegExp }> = [
  { path: '/', expectText: /NudiNa/i },
  { path: '/login', expectText: new RegExp(t('auth.login'), 'i') },
  { path: '/register', expectText: new RegExp(t('auth.registration'), 'i') },
  { path: '/o-nama' },
  { path: '/kontakt' },
  { path: '/planovi' },
  { path: '/privatnost' },
  { path: '/kolacici' },
  { path: '/blog' },
]

for (const route of PUBLIC_ROUTES) {
  test(`public route loads without error: ${route.path}`, async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })
    const response = await page.goto(route.path, { waitUntil: 'domcontentloaded' })

    expect(response, `no response from ${route.path}`).not.toBeNull()
    expect(response!.status(), `bad status for ${route.path}`).toBeLessThan(400)

    if (route.expectText) {
      await expect(page.getByText(route.expectText).first()).toBeVisible({
        timeout: 10_000,
      })
    }

    const fatalErrors = consoleErrors.filter(
      (e) =>
        !e.includes('Failed to load resource') &&
        !e.includes('favicon') &&
        !e.toLowerCase().includes('warning'),
    )
    expect(fatalErrors, `console errors on ${route.path}`).toEqual([])
  })
}

test('home page renders core layout sections', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByPlaceholder(/traži/i).first()).toBeVisible()
})
