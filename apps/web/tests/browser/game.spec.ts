import { config } from '../config/index.js'
import type { Page, Locator } from '@playwright/test'
import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    for (const id of ['v1', 'challenge.v1', 'broken-link.v1', 'choose-device.v1', 'expand.v1'])
      localStorage.setItem(`homelab.briefing.${id}`, 'done')
  })
})

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
  await page.getByRole('button', { name: 'Remove Router from rack' }).click()
  await expect(page.locator('[data-equipment="router"]')).toBeFocused()
  await page.keyboard.press('Enter')
  await page.keyboard.press('Escape')
  await expect(page.locator('[data-equipment="router"]')).toBeFocused()
})

test('controls have state names and target sizes', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Router, not installed' })).toBeVisible()
  await page.getByRole('button', { name: 'Router, not installed' }).click()
  await expect(page.getByRole('button', { name: 'Router, selected for placement' })).toBeVisible()
  await page.locator('[data-slot="0"]').click()
  await expect(page.getByRole('button', { name: 'Router, installed' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Inspect Router' })).toBeVisible()
  await expect(page.getByLabel('Phone Wi-Fi network, not connected')).toBeVisible()
  const targetSizes = await page.locator('button, select').evaluateAll((controls) =>
    controls.map((control) => {
      const box = control.getBoundingClientRect()
      const style = getComputedStyle(control)
      const before = getComputedStyle(control, '::before')
      const size = (value: string) => {
        const parsed = Number.parseFloat(value)
        return Number.isFinite(parsed) ? parsed : 0
      }
      const beforeWidth =
        size(before.width) + Math.abs(size(before.left)) + Math.max(0, size(before.right) * -1)
      const beforeHeight =
        size(before.height) + Math.abs(size(before.top)) + Math.max(0, size(before.bottom) * -1)
      return {
        label: control.getAttribute('aria-label') ?? control.textContent?.trim() ?? control.tagName,
        disabled: control.hasAttribute('disabled'),
        width: Math.max(box.width, beforeWidth || 0),
        height: Math.max(box.height, beforeHeight || 0),
        display: style.display,
      }
    }),
  )
  const failures = targetSizes.filter(
    (target) =>
      !target.disabled && target.display !== 'none' && (target.width < 44 || target.height < 44),
  )
  expect(failures).toEqual([])
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
  await page.getByRole('button', { name: 'Begin mission' }).click()
  await build(page)
  await expect(page.locator('.save-state')).toHaveText('Progress is not saved')
  await page.getByRole('button', { name: '02 On your own' }).click()
  await page.getByRole('button', { name: 'Begin mission' }).click()
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

test('production update waits for old tabs and keeps saved progress', async ({ page }) => {
  test.skip(!config().production, 'Service worker is production-only.')
  await page.goto('/')
  await expect(page.locator('.offline-state')).toHaveText('Ready for offline play')
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller))
  await build(page)
  const swPath = fileURLToPath(new URL('../../dist/sw.js', import.meta.url))
  const sw = await readFile(swPath, 'utf8')
  const updateWorker = `/sw.js?test-update-${Date.now()}`
  await page.route(`**${updateWorker}`, (route) =>
    route.fulfill({
      contentType: 'text/javascript',
      body: sw.replace(/PREFIX \+ '[^']+'/, "PREFIX + 'test-update'"),
    }),
  )
  await page.evaluate(async (workerUrl) => {
    const registration = await navigator.serviceWorker.register(workerUrl, { scope: '/' })
    await new Promise<void>((resolve, reject) => {
      const waiting = registration.waiting
      if (waiting) {
        resolve()
        return
      }
      const worker = registration.installing
      if (!worker) {
        reject(new Error('Missing installing worker.'))
        return
      }
      worker.addEventListener('statechange', () => {
        if (registration.waiting) resolve()
        if (worker.state === 'redundant') reject(new Error('Update install failed.'))
      })
    })
  }, updateWorker)
  await expect(page.locator('.offline-state')).toHaveText('Update ready. Close all tabs to finish.')
  await expect(page.getByText('Your homelab is online.')).toBeVisible()
  const cacheKeys = await page.evaluate(() => caches.keys())
  expect(cacheKeys.filter((key) => key.startsWith('homelab-offline-'))).toHaveLength(1)
})

test('production failed update keeps current offline version', async ({ page, context }) => {
  test.skip(!config().production, 'Service worker is production-only.')
  await page.goto('/')
  await expect(page.locator('.offline-state')).toHaveText('Ready for offline play')
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller))
  await build(page)
  const swPath = fileURLToPath(new URL('../../dist/sw.js', import.meta.url))
  const sw = await readFile(swPath, 'utf8')
  const failedUpdateWorker = `/sw.js?test-failed-update-${Date.now()}`
  await context.route(`**${failedUpdateWorker}`, (route) => {
    const failedWorker = sw
      .replace(/PREFIX \+ '[^']+'/, "PREFIX + 'test-failed-update'")
      .replace(
        /event\.waitUntil\(\(async \(\) => \{[\s\S]*?\}\)\(\)\);/m,
        "event.waitUntil(Promise.reject(new Error('test install failure')));",
      )
    return route.fulfill({ contentType: 'text/javascript', body: failedWorker })
  })
  await page.evaluate(async (workerUrl) => {
    const registration = await navigator.serviceWorker.register(workerUrl, { scope: '/' })
    await new Promise<void>((resolve, reject) => {
      const worker = registration.installing
      if (!worker) {
        reject(new Error('Missing installing worker.'))
        return
      }
      worker.addEventListener('statechange', () => {
        if (worker.state === 'redundant') resolve()
        if (registration.waiting) reject(new Error('Update install did not fail.'))
      })
    })
  }, failedUpdateWorker)
  await expect(page.locator('.offline-state')).toHaveText(
    'Offline download failed. Reload to retry.',
  )
  await context.setOffline(true)
  await page.reload()
  await expect(page.locator('.offline-state')).toHaveText('Playing offline')
  await page.getByRole('button', { name: 'Run check' }).click()
  await expect(page.getByText('Your homelab is online.')).toBeVisible()
})
