/**
 * Chapter map for Wang Family Courtyard roam.
 * Ch3 keeps the rich aerial; Ch6 is a distinct night gate orbit + title (not aerial).
 */
export const CHAPTERS = [
  {
    id: 1,
    start: 0,
    end: 12,
    zh: '王家大院',
    en: 'WANG FAMILY COURTYARD',
    sub: '红门堡 · 点云重构',
    cardFrom: 2.0,
    cardTo: 9.5,
  },
  {
    id: 2,
    start: 12,
    end: 24,
    zh: '堡院',
    en: 'THE FORTRESS COURT',
    sub: '马面 · 高崖轮廓',
    cardFrom: 13.2,
    cardTo: 21.5,
  },
  {
    id: 3,
    start: 24,
    end: 37,
    zh: '五巷五堡',
    en: 'FIVE LANES · FIVE FORTS',
    sub: '黛瓦合院肌理',
    cardFrom: 25.2,
    cardTo: 34,
  },
  {
    id: 4,
    start: 37,
    end: 50,
    zh: '高家崖',
    en: 'GAOJIA CLIFF COURT',
    sub: '门洞套景 · 夜轴',
    cardFrom: 38.2,
    cardTo: 46.5,
  },
  {
    id: 5,
    start: 50,
    end: 62,
    zh: '三雕 · 账房',
    en: 'BRICK CARVING · ACCOUNT ROOM',
    sub: '砖雕微距',
    cardFrom: 51.2,
    cardTo: 59.5,
  },
  {
    id: 6,
    start: 62,
    end: 78,
    zh: '中国民居艺术馆',
    en: 'MUSEUM OF FOLK RESIDENCES',
    sub: '静升 · 夜门收束',
    cardFrom: 64.5,
    cardTo: 76,
  },
]

export const LOOP_DURATION = 78

/** Quintic smootherstep for camera breath */
export function easeInOut(t) {
  const x = Math.min(1, Math.max(0, t))
  return x * x * x * (x * (x * 6 - 15) + 10)
}

export function segmentT(time, start, end) {
  return easeInOut((time - start) / Math.max(0.001, end - start))
}

/**
 * Soft dissolve envelope near chapter boundaries (point-cloud preferred over hard cuts).
 * Returns 0..1 peak in a ~1.4s window around each boundary.
 */
export function dissolveAt(time) {
  const t = ((time % LOOP_DURATION) + LOOP_DURATION) % LOOP_DURATION
  const edges = [0, 12, 24, 37, 50, 62, 78]
  let best = 0
  for (const e of edges) {
    const d = Math.min(Math.abs(t - e), Math.abs(t - e + LOOP_DURATION), Math.abs(t - e - LOOP_DURATION))
    const w = 1 - Math.min(1, d / 0.85)
    best = Math.max(best, w * w)
  }
  // Intro already owns point-cloud; keep dissolve mild there
  if (t < 10) return best * 0.35
  return best
}

/**
 * Camera keyframes — ease-in-out inside segments.
 * Ch6: slow night orbit of main gate (eye-level), not another aerial.
 */
export const CAMERA_KEYS = [
  // Ch1: point-cloud gate approach
  { t: 0, pos: [0, 4.5, 54], look: [0, 5.2, 38], night: 0.0, pc: 0.0 },
  { t: 12, pos: [0, 3.6, 43], look: [0, 5.0, 38], night: 0.08, pc: 1.0 },

  // Ch2: fortress corridor — clear run along wall face, merlons cut sky
  { t: 12.05, pos: [-17.5, 8.8, 28], look: [-23, 7.2, 12], night: 0.04, pc: 1.0 },
  { t: 18, pos: [-17.0, 8.2, 10], look: [-23.2, 7.0, -2], night: 0.09, pc: 1.0 },
  { t: 24, pos: [-16.5, 7.6, -8], look: [-23.5, 6.5, -20], night: 0.14, pc: 1.0 },

  // Ch3: ONLY rich aerial courtyard chapter
  { t: 24.05, pos: [10, 26, 26], look: [1, 1.2, 2], night: 0.42, pc: 1.0 },
  { t: 30.5, pos: [4, 24, 14], look: [0, 1, -2], night: 0.5, pc: 1.0 },
  { t: 37, pos: [-3, 22, 2], look: [2, 1, -10], night: 0.58, pc: 1.0 },

  // Ch4: night main axis through door frames
  { t: 37.05, pos: [0.7, 2.7, 15], look: [-0.2, 2.4, -4], night: 0.8, pc: 1.0 },
  { t: 43.5, pos: [0.5, 2.55, 6], look: [0, 2.3, -10], night: 0.88, pc: 1.0 },
  { t: 50, pos: [0.35, 2.45, -3], look: [0, 2.2, -18], night: 0.92, pc: 1.0 },

  // Ch5: brick carving — start wide on relief wall, then ease into door shaft
  { t: 50.05, pos: [14.2, 2.35, 6.2], look: [21.2, 2.1, -1.2], night: 0.92, pc: 1.0 },
  { t: 55, pos: [16.5, 2.05, 3.8], look: [21.8, 1.9, -1.5], night: 0.94, pc: 1.0 },
  { t: 62, pos: [18.6, 1.8, 1.6], look: [22.1, 1.65, -1.85], night: 0.96, pc: 1.0 },

  // Ch6: closing — slow night orbit of main gate (NOT aerial)
  { t: 62.05, pos: [12, 4.2, 50], look: [0, 5.0, 38], night: 0.92, pc: 1.0 },
  { t: 70, pos: [1.5, 4.6, 52], look: [0, 5.2, 38], night: 0.94, pc: 1.0 },
  { t: 78, pos: [-10, 4.4, 49], look: [0, 5.0, 38], night: 0.93, pc: 1.0 },
]

export function sampleCamera(time) {
  const t = ((time % LOOP_DURATION) + LOOP_DURATION) % LOOP_DURATION
  let i = 0
  while (i < CAMERA_KEYS.length - 1 && CAMERA_KEYS[i + 1].t < t) i++
  const a = CAMERA_KEYS[i]
  const b = CAMERA_KEYS[Math.min(i + 1, CAMERA_KEYS.length - 1)]
  const u = segmentT(t, a.t, b.t === a.t ? a.t + 0.001 : b.t)

  const lerp3 = (p, q, k) => [
    p[0] + (q[0] - p[0]) * k,
    p[1] + (q[1] - p[1]) * k,
    p[2] + (q[2] - p[2]) * k,
  ]

  return {
    pos: lerp3(a.pos, b.pos, u),
    look: lerp3(a.look, b.look, u),
    night: a.night + (b.night - a.night) * u,
    pc: a.pc + (b.pc - a.pc) * u,
    dissolve: dissolveAt(t),
    time: t,
  }
}

export function chapterAt(time) {
  const t = ((time % LOOP_DURATION) + LOOP_DURATION) % LOOP_DURATION
  return CHAPTERS.find((c) => t >= c.start && t < c.end) || CHAPTERS[0]
}
