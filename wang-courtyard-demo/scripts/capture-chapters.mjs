import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'

const OUT = process.argv[2] || '/cursor/stores/bc-5a9c8b79-f789-453d-83c8-bdb18576da29/media/wang-demo'
const URL = process.env.DEMO_URL || 'http://127.0.0.1:5173/'

const shots = [
  { file: '01-pointcloud-gate.png', seek: 4 },
  { file: '02-fortress-court.png', seek: 16 },
  { file: '03-five-lanes.png', seek: 28 },
  { file: '04-gaojia-night.png', seek: 42 },
  { file: '05-brick-carving.png', seek: 55 },
  { file: '06-closing-aerial.png', seek: 68 },
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
// Warm up a few frames
await sleep(800)

for (const s of shots) {
  await page.evaluate((t) => {
    window.__WANG_DEMO__.seek(t)
  }, s.seek)
  // allow a few render frames
  await sleep(700)
  const dest = path.join(OUT, s.file)
  await page.screenshot({ path: dest, type: 'png' })
  console.log('wrote', dest)
}

await browser.close()
console.log('done')
