import { config } from '../config/index.js'
import type { Page, Locator } from '@playwright/test'
import { test, expect } from '@playwright/test'

test('version-one saves load without migration and reflection text cannot create HTML', async ({
  page,
}) => {
  const reflection = '</textarea><script>window.bad = true</script>'
  await page.addInitScript((text) => {
    localStorage.setItem(
      'homelab.journey.v1',
      JSON.stringify({
        level: 'challenge',
        unlocked: true,
        reflections: {
          router: text,
          switch: 'Connects wired devices.',
          ap: 'Connects the wireless phone.',
        },
        reflectionSaved: true,
      }),
    )
    localStorage.setItem(
      'homelab.level-two.v1',
      JSON.stringify({
        version: 1,
        slots: ['ap', 'router', 'switch'],
        wifi: true,
        hints: 2,
        cables: [
          ['isp:ETH', 'router:WAN'],
          ['router:LAN', 'switch:1'],
          ['switch:2', 'desktop:ETH'],
          ['switch:3', 'ap:ETH'],
        ],
      }),
    )
  }, reflection)
  await page.goto('/')
  await page.getByRole('button', { name: 'Run check' }).click()
  await expect(page.locator('.result.pass')).toHaveCount(2)
  await expect(page.locator('#reflection-router')).toHaveValue(reflection)
  await expect(page.locator('.reflection script')).toHaveCount(0)
  expect(await page.evaluate(() => Object.hasOwn(window, 'bad'))).toBe(false)
  await page.getByRole('button', { name: 'Save explanations' }).click()
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('homelab.level-two.v1')!))
  expect(Object.keys(saved).sort()).toEqual(['cables', 'hints', 'slots', 'version', 'wifi'])
  expect(saved.version).toBe(1)
  expect(saved.hints).toBe(2)
})

async function build(page: Page, keyboard = false) {
  const activate = async (locator: Locator) => {
    if (keyboard) {
      await locator.focus()
      await page.keyboard.press('Enter')
    } else await locator.click()
  }
  for (const [i, id] of ['router', 'switch', 'ap'].entries()) {
    await activate(page.locator(`[data-equipment="${id}"]`))
    await activate(page.locator(`[data-slot="${i}"]`))
  }
  for (const pair of [
    ['isp:ETH', 'router:WAN'],
    ['router:LAN', 'switch:1'],
    ['switch:2', 'desktop:ETH'],
    ['switch:3', 'ap:ETH'],
  ]) {
    for (const p of pair) await activate(page.locator(`[data-port="${p}"]`))
  }
  if (keyboard) {
    await page.locator('#wifi').focus()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Tab')
  } else await page.locator('#wifi').selectOption('on')
  await activate(page.getByRole('button', { name: 'Run check' }))
  await expect(page.locator('.wireless-path')).toHaveCSS('stroke', 'rgb(92, 129, 86)')
  await expect(page.locator('.cables path:not(.wireless-path)')).toHaveCount(4)
}
test('build, diagnose, undo, persist and reset', async ({ page }, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('/')
  await build(page)
  await expect(page.getByText('Your homelab is online.')).toBeVisible()
  await page.locator('[data-trace="phone"]').click()
  await expect(page.locator('.trace li')).toHaveCount(6)
  await page.screenshot({
    path: testInfo.outputPath('desktop-connected.png'),
    fullPage: true,
    animations: 'disabled',
  })
  await page
    .getByRole('button', { name: 'Remove cable Switch 3 to Access point ETH', exact: true })
    .click()
  await expect(
    page.getByText('Wi-Fi is connected, but the access point has no wired uplink.'),
  ).toBeVisible()
  await expect(page.locator('.result.pass h3')).toHaveText('Desktop')
  await page.getByRole('button', { name: 'Undo last change' }).click()
  await expect(page.getByText('Your homelab is online.')).toBeVisible()
  await page.reload()
  await page.getByRole('button', { name: 'Run check' }).click()
  await expect(page.getByText('Your homelab is online.')).toBeVisible()
  await page.getByRole('button', { name: 'Reset level' }).click()
  await expect(page.locator('.empty-slot')).toHaveCount(3)
  expect(errors).toEqual([])
})
test('mobile keyboard completion and reduced motion', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await build(page, true)
  await expect(page.getByText('Your homelab is online.')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('mobile-connected.png'), fullPage: true })
  await page.setViewportSize({ width: 320, height: 740 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('prediction applies a real disconnection, explains mistakes, and restores', async ({
  page,
}, testInfo) => {
  await page.goto('/')
  await expect(page.locator('.prediction')).toHaveCount(0)
  await build(page)
  await expect(page.getByRole('button', { name: 'Test prediction' })).toBeDisabled()
  await page.getByLabel('Both devices', { exact: true }).check()
  await page.getByRole('button', { name: 'Test prediction' }).click()
  await expect(page.getByText('A different result. Here is why.')).toBeVisible()
  await expect(page.locator('.prediction-result')).toContainText('Still online: Desktop only')
  await expect(page.locator('.result.pass h3')).toHaveText('Desktop')
  await expect(page.locator('.connection-row')).toHaveCount(3)
  await page.screenshot({
    path: testInfo.outputPath('prediction-desktop.png'),
    fullPage: true,
    animations: 'disabled',
  })
  await page.getByRole('button', { name: 'Reconnect & try another' }).click()
  await expect(page.locator('.result.pass')).toHaveCount(2)
  await expect(page.locator('.connection-row')).toHaveCount(4)
  await page.getByLabel('Experiment', { exact: true }).selectOption('wan')
  await expect(page.getByRole('button', { name: 'Test prediction' })).toBeDisabled()
  await page.getByLabel('Neither device', { exact: true }).check()
  await page.getByRole('button', { name: 'Test prediction' }).click()
  await expect(page.getByText('Your prediction matched.')).toBeVisible()
  await expect(page.locator('.prediction-result')).toContainText('local network remains connected')
  await page.getByRole('button', { name: 'Undo last change' }).click()
  await expect(page.locator('.result.pass')).toHaveCount(2)
  await expect(page.locator('.prediction-result')).toHaveCount(0)
})

test('prediction can be completed with the keyboard on mobile', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await build(page, true)
  await page.getByLabel('Desktop only', { exact: true }).focus()
  await page.keyboard.press('Space')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Test prediction' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByText('Your prediction matched.')).toBeVisible()
  await expect(page.locator('#prediction-heading')).toBeFocused()
  await page.screenshot({ path: testInfo.outputPath('prediction-mobile.png'), fullPage: true })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('button', { name: 'Reset level' }).click()
  await expect(page.locator('.prediction')).toHaveCount(0)
})

async function wireChallenge(page: Page) {
  for (const pair of [
    ['isp:ETH', 'router:WAN'],
    ['router:LAN', 'switch:5'],
    ['switch:4', 'desktop:ETH'],
    ['switch:2', 'ap:ETH'],
  ]) {
    for (const port of pair) await page.locator(`[data-port="${port}"]`).click()
  }
  await page.locator('#wifi').selectOption('on')
  await page.getByRole('button', { name: 'Run check' }).click()
}

test('keyboard focus follows placement, removal and cancellation', async ({ page }) => {
  await page.goto('/')
  await page.locator('[data-equipment="router"]').focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('[data-slot="0"]')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('[data-port="router:WAN"]')).toBeFocused()
  await page.getByRole('button', { name: 'Remove from rack' }).click()
  await expect(page.locator('[data-equipment="router"]')).toBeFocused()
  await page.keyboard.press('Enter')
  await page.keyboard.press('Escape')
  await expect(page.locator('[data-equipment="router"]')).toBeFocused()
})

test('storage failure preserves session play and does not claim saved explanations', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException('Blocked', 'SecurityError')
    }
    Storage.prototype.setItem = () => {
      throw new DOMException('Blocked', 'SecurityError')
    }
  })
  await page.goto('/')
  await build(page)
  await expect(page.locator('.save-state')).toHaveText('Progress is not saved')
  await page.getByRole('button', { name: '02 On your own' }).click()
  await wireChallenge(page)
  for (const id of ['router', 'switch', 'ap'])
    await page.locator(`#reflection-${id}`).fill('A session-only explanation for review.')
  await page.getByRole('button', { name: 'Save explanations' }).click()
  await page.getByRole('button', { name: 'Run check' }).click()
  await expect(page.locator('.reflection-status')).toContainText('session only')
  await page.getByRole('button', { name: '01 First connection' }).click()
  await expect(page.locator('.connection-row')).toHaveCount(4)
  await page.getByRole('button', { name: '02 On your own' }).click()
  await expect(page.locator('.connection-row')).toHaveCount(4)
  await page.getByRole('button', { name: 'Run check' }).click()
  await expect(page.locator('#reflection-router')).toHaveValue(
    'A session-only explanation for review.',
  )
  await page.locator('#reflection-router').focus()
  await page.keyboard.press('Escape')
  await expect(page.locator('#reflection-router')).toBeFocused()
})

test('independent challenge, explanations and separate saved progress', async ({
  page,
}, testInfo) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: '02 On your own' })).toBeDisabled()
  await build(page)
  await page.getByRole('button', { name: '02 On your own' }).click()
  await expect(page.locator('.hardware')).toHaveCount(3)
  await expect(page.locator('.hardware').first()).toHaveClass(/ap/)
  await expect(page.locator('.connection-row')).toHaveCount(0)
  await expect(page.locator('.objective')).toBeHidden()
  await wireChallenge(page)
  await expect(page.locator('.prediction')).toHaveCount(0)
  await page.getByRole('button', { name: 'Save explanations' }).click()
  await expect(page.locator('.reflection-status')).toContainText('at least 10 characters')
  await page
    .locator('#reflection-router')
    .fill('Connects the local network to the upstream network.')
  await page
    .locator('#reflection-switch')
    .fill('Provides enough wired ports for the desktop and AP.')
  await page.locator('#reflection-ap').fill('Bridges the wireless phone to the wired network.')
  await page.getByRole('button', { name: 'Save explanations' }).click()
  await expect(page.locator('.reflection-status')).toContainText('not automatically graded')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Your network. Your call.' })).toBeVisible()
  await page.getByRole('button', { name: 'Run check' }).click()
  await expect(page.locator('#reflection-router')).toHaveValue(
    'Connects the local network to the upstream network.',
  )
  await page.screenshot({
    path: testInfo.outputPath('challenge-desktop.png'),
    fullPage: true,
    animations: 'disabled',
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({
    path: testInfo.outputPath('challenge-mobile.png'),
    fullPage: true,
    animations: 'disabled',
  })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('button', { name: '01 First connection' }).click()
  await expect(page.locator('.hardware').first()).toHaveClass(/router/)
  await expect(page.locator('.connection-row')).toHaveCount(4)
  await page.getByRole('button', { name: '02 On your own' }).click()
  await page.getByRole('button', { name: 'Reset level' }).click()
  await expect(page.locator('.connection-row')).toHaveCount(0)
  await expect(page.locator('.hardware').first()).toHaveClass(/ap/)
})

test('production build reloads and plays offline with saved progress', async ({
  page,
  context,
}) => {
  test.skip(!config().production, 'Service worker is production-only.')
  await page.goto('/')
  await expect(page.locator('.offline-state')).toHaveText('Ready for offline play')
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller))
  await build(page)
  await context.setOffline(true)
  await page.reload()
  await expect(page.locator('.offline-state')).toHaveText('Playing offline')
  await page.getByRole('button', { name: 'Run check' }).click()
  await expect(page.getByText('Your homelab is online.')).toBeVisible()
  await page.getByRole('button', { name: '02 On your own' }).click()
  await wireChallenge(page)
  await expect(page.locator('.reflection')).toBeVisible()
  await page.reload()
  await page.getByRole('button', { name: 'Run check' }).click()
  await expect(page.locator('.reflection')).toBeVisible()
})
