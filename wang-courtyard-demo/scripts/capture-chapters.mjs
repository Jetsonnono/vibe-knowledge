import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'

const OUT = process.argv[2] || '/cursor/stores/bc-5a9c8b79-f789-453d-83c8-bdb18576da29/media/wang-demo'
const URL = process.env.DEMO_URL || 'http://127.0.0.1:5173/'

const shots = [
  { file: '01-pointcloud-gate-v2.png', seek: 5 },
  { file: '02-fortress-court-v2.png', seek: 16.5 },
  { file: '03-five-lanes-v2.png', seek: 30 },
  { file: '04-gaojia-night-v2.png', seek: 42 },
  { file: '05-brick-carving-v2.png', seek: 52.5 },
  { file: '06-closing-gate-orbit-v2.png', seek: 69 },
]

fs.mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome-stable',
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-gpu-sandbox',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--window-size=540,960',
  ],
  defaultViewport: { width: 540, height: 960, deviceScaleFactor: 1 },
})

const page = await browser.newPage()
await page.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 })
await page.waitForFunction(() => window.__WANG_DEMO__, { timeout: 30000 })
await sleep(1000)

for (const s of shots) {
  await page.evaluate((t) => {
    window.__WANG_DEMO__.seek(t)
  }, s.seek)
  await sleep(900)
  const dest = path.join(OUT, s.file)
  await page.screenshot({ path: dest, type: 'png' })
  console.log('wrote', dest)
}

await browser.close()
console.log('done')
