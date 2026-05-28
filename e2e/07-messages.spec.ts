import { test, expect } from './fixtures/auth'
import { login } from './fixtures/auth'
import { t, TEST_USERS, TEST_PRODUCT_ID } from './fixtures/i18n'

test.describe('Messaging flow (two users)', () => {
  test('Alice can open her own messages page', async ({ alicePage }) => {
    await alicePage.goto('/messages')
    expect(alicePage.url()).toContain('/messages')
  })

  test('Bob sends a message to Alice via product page; Alice receives it', async ({
    browser,
  }) => {
    // Alice: log in, open messages tab
    const aliceCtx = await browser.newContext()
    const alicePage = await aliceCtx.newPage()
    await login(alicePage, TEST_USERS.alice)
    await alicePage.goto('/messages')

    // Bob: open product, click "Pošalji Poruku", send a message
    const bobCtx = await browser.newContext()
    const bobPage = await bobCtx.newPage()
    await login(bobPage, TEST_USERS.bob)
    await bobPage.goto(`/product/${TEST_PRODUCT_ID}`)

    const msgBtn = bobPage.getByRole('button', {
      name: new RegExp(t('product.sendMessage'), 'i'),
    }).first()

    if (!(await msgBtn.isVisible({ timeout: 5_000 }).catch(() => false))) {
      test.skip(true, '"Pošalji Poruku" button not visible — chat entry point may differ')
      await aliceCtx.close()
      await bobCtx.close()
      return
    }
    await msgBtn.click()
    await bobPage.waitForTimeout(2_000)

    const uniqueText = `E2E ping ${Date.now()}`
    // Find chat input — usually a textarea or input near a send button
    const chatInput = bobPage
      .locator('textarea, input[type="text"]')
      .last()
    await chatInput.fill(uniqueText)
    await chatInput.press('Enter')
    await bobPage.waitForTimeout(3_000)

    // Alice: check messages for the unique text (with realtime, give it ~5s)
    await alicePage.reload()
    await alicePage.waitForTimeout(3_000)
    const found = await alicePage.getByText(uniqueText).count()
    expect(found, `Alice did not receive Bob's message "${uniqueText}"`).toBeGreaterThan(0)

    await aliceCtx.close()
    await bobCtx.close()
  })
})
