import * as THREE from 'three'
import { createMaterials } from './materials.js'

function roof(w, d, mats, y = 0) {
  const g = new THREE.Group()
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, 0.35, d), mats.tile)
  body.position.y = y
  g.add(body)

  // Ridge + flared eaves suggestion
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(w * 0.12, 0.28, d * 0.92), mats.tile)
  ridge.position.y = y + 0.28
  g.add(ridge)

  const eaveL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, d * 1.05), mats.tile)
  eaveL.position.set(-w * 0.52, y - 0.05, 0)
  const eaveR = eaveL.clone()
  eaveR.position.x = w * 0.52
  g.add(eaveL, eaveR)

  return g
}

function hall(w, d, h, mats, withDoor = true) {
  const g = new THREE.Group()
  const base = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats.plaster)
  base.position.y = h / 2
  g.add(base)

  const posts = [
    [-w * 0.42, 0, d * 0.48],
    [w * 0.42, 0, d * 0.48],
    [-w * 0.42, 0, -d * 0.48],
    [w * 0.42, 0, -d * 0.48],
  ]
  for (const [x, , z] of posts) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, h * 0.95, 8), mats.wood)
    p.position.set(x, h * 0.48, z)
    g.add(p)
  }

  if (withDoor) {
    const door = new THREE.Mesh(new THREE.BoxGeometry(w * 0.28, h * 0.62, 0.08), mats.wood)
    door.position.set(0, h * 0.35, d * 0.51)
    g.add(door)
  }

  const r = roof(w * 1.12, d * 1.18, mats, h + 0.1)
  g.add(r)
  return g
}

function courtyardUnit(mats, scale = 1, { openAxis = false } = {}) {
  const g = new THREE.Group()
  const yard = new THREE.Mesh(new THREE.BoxGeometry(10 * scale, 0.08, 12 * scale), mats.earth)
  yard.position.y = 0.04
  g.add(yard)

  if (openAxis) {
    // Split north/south halls leave a walkable gate along Z for camera push
    for (const side of [-1, 1]) {
      const wingN = hall(3.2 * scale, 2.0 * scale, 2.4 * scale, mats, false)
      wingN.position.set(side * 3.1 * scale, 0, -4.2 * scale)
      g.add(wingN)
      const wingS = hall(2.8 * scale, 1.6 * scale, 2.0 * scale, mats, false)
      wingS.position.set(side * 2.9 * scale, 0, 4.4 * scale)
      g.add(wingS)
    }
  } else {
    const north = hall(9 * scale, 2.2 * scale, 2.6 * scale, mats)
    north.position.z = -4.2 * scale
    g.add(north)

    const south = hall(7 * scale, 1.8 * scale, 2.2 * scale, mats)
    south.position.z = 4.4 * scale
    south.rotation.y = Math.PI
    g.add(south)
  }

  const east = hall(2 * scale, 8 * scale, 2.2 * scale, mats, false)
  east.position.x = 4.2 * scale
  g.add(east)

  const west = hall(2 * scale, 8 * scale, 2.2 * scale, mats, false)
  west.position.x = -4.2 * scale
  g.add(west)

  // Lanterns in yard corners
  for (const [x, z] of [
    [-2.5 * scale, -1.5 * scale],
    [2.5 * scale, -1.5 * scale],
    [-2.5 * scale, 2 * scale],
    [2.5 * scale, 2 * scale],
  ]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.6, 6), mats.wood)
    pole.position.set(x, 0.8, z)
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), mats.lantern)
    lamp.position.set(x, 1.55, z)
    g.add(pole, lamp)

    const light = new THREE.PointLight(0xff9a3c, 1.8, 12, 1.8)
    light.position.set(x, 1.55, z)
    g.add(light)
  }

  return g
}

function fortressWall(length, height, mats) {
  const g = new THREE.Group()
  const wall = new THREE.Mesh(new THREE.BoxGeometry(4.2, height, length), mats.stone)
  wall.position.y = height / 2
  g.add(wall)

  const merlonCount = Math.floor(length / 2.2)
  for (let i = 0; i < merlonCount; i++) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.9, 1.1), mats.brick)
    m.position.set(0, height + 0.35, -length / 2 + 1.2 + i * 2.2)
    g.add(m)
  }

  // Watch tower mid-wall
  const tower = hall(5.5, 4.2, height * 0.55, mats)
  tower.position.set(0.4, height * 0.35, 0)
  g.add(tower)

  return g
}

function gateTower(mats) {
  const g = new THREE.Group()
  const base = new THREE.Mesh(new THREE.BoxGeometry(8, 5.5, 6), mats.brick)
  base.position.y = 2.75
  g.add(base)

  const arch = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.4, 6.2), new THREE.MeshBasicMaterial({ color: 0x000000 }))
  arch.position.set(0, 1.7, 0)
  g.add(arch)

  const upper = hall(7.2, 5.2, 2.8, mats, false)
  upper.position.y = 5.5
  g.add(upper)

  const top = roof(6.4, 4.6, mats, 9)
  g.add(top)

  return g
}

function brickCarvingWall(mats) {
  const g = new THREE.Group()
  const wall = new THREE.Mesh(new THREE.BoxGeometry(6, 3.2, 0.5), mats.carving)
  wall.position.y = 1.6
  g.add(wall)

  // Relief panels
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 2; j++) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.1, 0.18), mats.carving)
      panel.position.set(-1.8 + i * 1.8, 1.1 + j * 1.3, 0.28)
      g.add(panel)
      const detail = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.06, 8, 16), mats.wood)
      detail.position.copy(panel.position)
      detail.position.z += 0.12
      g.add(detail)
    }
  }

  // Account room frame
  const frame = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.6, 0.2), mats.wood)
  frame.position.set(0, 1.4, 0.45)
  g.add(frame)
  const paper = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 2),
    new THREE.MeshStandardMaterial({ color: 0xe8d9b8, emissive: 0xffcc88, emissiveIntensity: 0.35, roughness: 0.85 }),
  )
  paper.position.set(0, 1.4, 0.56)
  g.add(paper)

  return g
}

/**
 * Build Wang Family Courtyard compound (procedural low-poly).
 */
export function buildArchitecture() {
  const mats = createMaterials()
  const root = new THREE.Group()
  root.name = 'wang-compound'

  // Terrain
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(180, 180), mats.earth)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  root.add(ground)

  // Outer fortress wall (camera approaches from +X / courtyard side)
  const wall = fortressWall(70, 6.5, mats)
  wall.position.set(-24, 0, 0)
  root.add(wall)

  // Gate tower at south approach
  const gate = gateTower(mats)
  gate.position.set(0, 0, 38)
  root.add(gate)

  // Secondary gate / Hongmenbao suggestion
  const gate2 = gateTower(mats)
  gate2.scale.set(0.75, 0.75, 0.75)
  gate2.position.set(-18, 0, 22)
  root.add(gate2)

  // Courtyard grid — 五巷五堡 density (x≈0 open for night axis roam)
  const layout = [
    [0, 8, 1.05, true],
    [14, 8, 0.9, false],
    [-14, 8, 0.9, false],
    [0, -8, 1, true],
    [14, -8, 0.85, false],
    [-14, -8, 0.85, false],
    [0, 22, 0.8, true],
    [12, 20, 0.7, false],
    [-12, 20, 0.7, false],
  ]
  for (const [x, z, s, openAxis] of layout) {
    const c = courtyardUnit(mats, s, { openAxis })
    c.position.set(x, 0, z)
    root.add(c)
  }

  // Main axis halls for night push (高家崖)
  const axisHalls = [
    [0, 0, 1.15],
    [0, -16, 1],
    [0, 16, 0.95],
  ]
  // Door-frame occluders + axis lanterns for night push depth
  for (let i = 0; i < 5; i++) {
    const z = 10 - i * 7
    const frame = new THREE.Group()
    const left = new THREE.Mesh(new THREE.BoxGeometry(0.6, 3.8, 0.6), mats.brick)
    left.position.set(-2.2, 1.9, 0)
    const right = left.clone()
    right.position.x = 2.2
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.5, 0.6), mats.wood)
    lintel.position.set(0, 3.9, 0)
    frame.add(left, right, lintel)
    frame.position.set(0, 0, z)
    root.add(frame)

    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), mats.lantern)
    lamp.position.set(0, 3.2, z + 0.4)
    root.add(lamp)
    const axisLight = new THREE.PointLight(0xffa040, 2.0, 12, 1.6)
    axisLight.position.set(0, 3.0, z + 0.4)
    root.add(axisLight)
  }

  // Brick carving / account room set-piece near +X
  const carving = brickCarvingWall(mats)
  carving.position.set(22, 0, -2)
  carving.rotation.y = -Math.PI * 0.15
  root.add(carving)
  const carvingLight = new THREE.SpotLight(0xffcc88, 4.5, 18, 0.55, 0.4, 1)
  carvingLight.position.set(17, 4.5, 3)
  carvingLight.target.position.set(22, 1.5, -2)
  root.add(carvingLight, carvingLight.target)
  const carvingFill = new THREE.PointLight(0xffb060, 2.2, 10, 1.5)
  carvingFill.position.set(20, 2.2, 1)
  root.add(carvingFill)

  // Path stones along main axis
  for (let z = -24; z <= 34; z += 2.5) {
    const stone = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 1.8), mats.stone)
    stone.position.set(0, 0.06, z)
    root.add(stone)
  }

  // Sparse trees outside wall
  for (let i = 0; i < 12; i++) {
    const t = new THREE.Group()
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.22, 2.2, 6), mats.wood)
    trunk.position.y = 1.1
    const canopy = new THREE.Mesh(
      new THREE.SphereGeometry(1.4 + Math.random() * 0.4, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x2f4a2e, roughness: 0.95 }),
    )
    canopy.position.y = 2.6
    t.add(trunk, canopy)
    t.position.set(-38 - Math.random() * 8, 0, -30 + i * 6 + Math.random() * 2)
    root.add(t)
  }

  root.userData.mats = mats
  root.userData.gate = gate
  return root
}
