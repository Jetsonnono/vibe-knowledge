import { CHAPTERS, LOOP_DURATION, chapterAt } from '../scene/chapters.js'

function pad(n, w = 2) {
  return String(Math.floor(n)).padStart(w, '0')
}

function formatTimer(seconds) {
  const s = Math.floor(seconds % 60)
  const m = Math.floor((seconds / 60) % 60)
  const h = Math.floor(seconds / 3600)
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

export function createHUD() {
  const el = {
    timer: document.getElementById('rec-timer'),
    pcCount: document.getElementById('pc-count'),
    pcPct: document.getElementById('pc-pct'),
    alt: document.getElementById('alt'),
    hdg: document.getElementById('hdg'),
    card: document.getElementById('chapter-card'),
    zh: document.getElementById('chapter-zh'),
    en: document.getElementById('chapter-en'),
    sub: document.getElementById('chapter-sub'),
  }

  let lastChapterId = -1
  let baseCloud = 1_240_000

  function update(time, sample) {
    const t = ((time % LOOP_DURATION) + LOOP_DURATION) % LOOP_DURATION
    el.timer.textContent = formatTimer(t)

    const ch = chapterAt(t)
    const recon = Math.min(99, Math.floor(18 + sample.pc * 78 + Math.sin(t) * 1.5))
    const cloud = Math.floor(baseCloud + sample.pc * 1_860_000 + Math.sin(t * 2.1) * 4000)
    el.pcCount.textContent = cloud.toLocaleString('en-US')
    el.pcPct.textContent = String(recon).padStart(2, '0')

    el.alt.textContent = (780 + sample.pos[1] * 1.8).toFixed(1)
    const dx = sample.look[0] - sample.pos[0]
    const dz = sample.look[2] - sample.pos[2]
    let hdg = (Math.atan2(dx, -dz) * 180) / Math.PI
    if (hdg < 0) hdg += 360
    el.hdg.textContent = hdg.toFixed(1)

    // Soft fade windows — card appears after dissolve settles
    const showCard = t >= ch.cardFrom && t <= ch.cardTo
    if (ch.id !== lastChapterId) {
      el.zh.textContent = ch.zh
      el.en.textContent = ch.en
      el.sub.textContent = ch.sub
      lastChapterId = ch.id
      el.card.classList.add('swap')
      requestAnimationFrame(() => el.card.classList.remove('swap'))
    }
    el.card.classList.toggle('hidden', !showCard)
  }

  return { update, CHAPTERS }
}
