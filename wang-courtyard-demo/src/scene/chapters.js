/**
 * Chapter map for Wang Family Courtyard roam.
 * Times are cumulative seconds in the autoplay loop.
 */
export const CHAPTERS = [
  {
    id: 1,
    start: 0,
    end: 12,
    zh: '王家大院',
    en: 'WANG FAMILY COURTYARD',
    sub: '红门堡 · 点云重构',
    cardFrom: 1.5,
    cardTo: 9,
  },
  {
    id: 2,
    start: 12,
    end: 24,
    zh: '堡院',
    en: 'THE FORTRESS COURT',
    sub: '马面 · 高崖轮廓',
    cardFrom: 13,
    cardTo: 21,
  },
  {
    id: 3,
    start: 24,
    end: 36,
    zh: '五巷五堡',
    en: 'FIVE LANES · FIVE FORTS',
    sub: '黛瓦合院肌理',
    cardFrom: 25,
    cardTo: 33,
  },
  {
    id: 4,
    start: 36,
    end: 50,
    zh: '高家崖',
    en: 'GAOJIA CLIFF COURT',
    sub: '门洞套景 · 夜轴',
    cardFrom: 37.5,
    cardTo: 46,
  },
  {
    id: 5,
    start: 50,
    end: 62,
    zh: '三雕 · 账房',
    en: 'BRICK CARVING · ACCOUNT ROOM',
    sub: '砖雕微距',
    cardFrom: 51,
    cardTo: 59,
  },
  {
    id: 6,
    start: 62,
    end: 75,
    zh: '中国民居艺术馆',
    en: 'MUSEUM OF FOLK RESIDENCES',
    sub: '静升 · 家族纪年',
    cardFrom: 64,
    cardTo: 73,
  },
]

export const LOOP_DURATION = 75

/** Ease-in-out (smoothstep cubic) */
export function easeInOut(t) {
  const x = Math.min(1, Math.max(0, t))
  return x * x * (3 - 2 * x)
}

/** Segment-local eased progress */
export function segmentT(time, start, end) {
  return easeInOut((time - start) / Math.max(0.001, end - start))
}

/**
 * Camera keyframes: position + lookAt per chapter endpoints.
 * Interpolated with ease-in-out inside each segment.
 */
export const CAMERA_KEYS = [
  // Ch1: point-cloud gate approach
  {
    t: 0,
    pos: [0, 4.2, 52],
    look: [0, 5.5, 38],
    night: 0,
    pc: 0,
  },
  {
    t: 12,
    pos: [0, 3.8, 44],
    look: [0, 5.2, 38],
    night: 0.05,
    pc: 1,
  },
  // Ch2: fortress wall dusk push
  {
    t: 12.01,
    pos: [-14, 7.5, 24],
    look: [-22, 4.5, 6],
    night: 0.05,
    pc: 1,
  },
  {
    t: 24,
    pos: [-12, 6.8, -4],
    look: [-22, 4, -14],
    night: 0.18,
    pc: 1,
  },
  // Ch3: aerial grey tiles
  {
    t: 24.01,
    pos: [8, 24, 28],
    look: [0, 1, 4],
    night: 0.4,
    pc: 1,
  },
  {
    t: 36,
    pos: [-2, 22, 6],
    look: [2, 1, -8],
    night: 0.55,
    pc: 1,
  },
  // Ch4: night main axis through door frames (slight offset for depth)
  {
    t: 36.01,
    pos: [0.6, 2.8, 14],
    look: [-0.2, 2.4, -6],
    night: 0.78,
    pc: 1,
  },
  {
    t: 50,
    pos: [0.4, 2.5, -2],
    look: [0, 2.2, -18],
    night: 0.9,
    pc: 1,
  },
  // Ch5: brick carving close-up
  {
    t: 50.01,
    pos: [15.5, 1.9, 3.5],
    look: [22, 1.7, -2],
    night: 0.95,
    pc: 1,
  },
  {
    t: 62,
    pos: [19.2, 1.65, 0.8],
    look: [22, 1.55, -2],
    night: 0.98,
    pc: 1,
  },
  // Ch6: closing aerial
  {
    t: 62.01,
    pos: [8, 32, 40],
    look: [0, 2, 0],
    night: 0.95,
    pc: 1,
  },
  {
    t: 75,
    pos: [-6, 36, 20],
    look: [0, 1, -4],
    night: 0.9,
    pc: 1,
  },
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
    time: t,
  }
}

export function chapterAt(time) {
  const t = ((time % LOOP_DURATION) + LOOP_DURATION) % LOOP_DURATION
  return CHAPTERS.find((c) => t >= c.start && t < c.end) || CHAPTERS[0]
}
