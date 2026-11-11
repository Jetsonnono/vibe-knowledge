import * as THREE from 'three'

function makeBrickMap({ cols = 8, rows = 12, base = '#9a7858', mortar = '#5a4634', variation = 18 }) {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 256
  const ctx = c.getContext('2d')
  ctx.fillStyle = mortar
  ctx.fillRect(0, 0, 256, 256)
  const bw = 256 / cols
  const bh = 256 / rows
  for (let y = 0; y < rows; y++) {
    const off = (y % 2) * (bw * 0.5)
    for (let x = -1; x <= cols; x++) {
      const shade = (Math.random() - 0.5) * variation
      ctx.fillStyle = shadeColor(base, shade)
      const px = x * bw + off + 1
      const py = y * bh + 1
      ctx.fillRect(px, py, bw - 2, bh - 2)
    }
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

function shadeColor(hex, delta) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, Math.min(255, ((n >> 16) & 255) + delta))
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + delta))
  const b = Math.max(0, Math.min(255, (n & 255) + delta))
  return `rgb(${r|0},${g|0},${b|0})`
}

function makeWoodMap() {
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 256
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#4e321c'
  ctx.fillRect(0, 0, 128, 256)
  for (let i = 0; i < 40; i++) {
    ctx.strokeStyle = `rgba(30,18,8,${0.08 + Math.random() * 0.2})`
    ctx.beginPath()
    const x = Math.random() * 128
    ctx.moveTo(x, 0)
    ctx.bezierCurveTo(x + 4, 80, x - 3, 160, x + 2, 256)
    ctx.stroke()
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/** Shared materials — readable brick/wood contrast, controlled emissives */
export function createMaterials() {
  const brickMap = makeBrickMap({})
  brickMap.repeat.set(2, 3)
  const stoneMap = makeBrickMap({ cols: 6, rows: 10, base: '#a48a6a', mortar: '#6a5644', variation: 14 })
  stoneMap.repeat.set(1.5, 2.5)
  const woodMap = makeWoodMap()

  const earth = new THREE.MeshStandardMaterial({
    color: 0x6a5340,
    roughness: 0.94,
    metalness: 0.02,
  })

  const stone = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: stoneMap,
    roughness: 0.84,
    metalness: 0.04,
  })

  const brick = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: brickMap,
    roughness: 0.86,
    metalness: 0.03,
  })

  const brickDark = new THREE.MeshStandardMaterial({
    color: 0xb0a090,
    map: brickMap,
    roughness: 0.9,
    metalness: 0.02,
  })

  const brickLight = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: stoneMap,
    roughness: 0.78,
    metalness: 0.04,
  })

  const tile = new THREE.MeshStandardMaterial({
    color: 0x2e333a,
    roughness: 0.68,
    metalness: 0.1,
  })

  const wood = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: woodMap,
    roughness: 0.55,
    metalness: 0.04,
  })

  const woodPolish = new THREE.MeshStandardMaterial({
    color: 0xd0b090,
    map: woodMap,
    roughness: 0.38,
    metalness: 0.12,
  })

  const plaster = new THREE.MeshStandardMaterial({
    color: 0xd6c6ac,
    roughness: 0.9,
    metalness: 0.01,
  })

  const lantern = new THREE.MeshStandardMaterial({
    color: 0xffb45a,
    emissive: 0xff8a2b,
    emissiveIntensity: 2.6,
    roughness: 0.35,
    metalness: 0.08,
  })

  const carving = new THREE.MeshStandardMaterial({
    color: 0xa88868,
    roughness: 0.62,
    metalness: 0.06,
  })

  const carvingLight = new THREE.MeshStandardMaterial({
    color: 0xc4a888,
    roughness: 0.55,
    metalness: 0.07,
  })

  const carvingDark = new THREE.MeshStandardMaterial({
    color: 0x7a6048,
    roughness: 0.7,
    metalness: 0.05,
  })

  const metal = new THREE.MeshStandardMaterial({
    color: 0xc9a46a,
    roughness: 0.35,
    metalness: 0.75,
  })

  return {
    earth,
    stone,
    brick,
    brickDark,
    brickLight,
    tile,
    wood,
    woodPolish,
    plaster,
    lantern,
    carving,
    carvingLight,
    carvingDark,
    metal,
  }
}
