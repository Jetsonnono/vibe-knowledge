import * as THREE from 'three'
import { createMaterials } from './materials.js'

function roof(w, d, mats, y = 0) {
  const g = new THREE.Group()
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, 0.35, d), mats.tile)
  body.position.y = y
  g.add(body)

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

  g.add(roof(w * 1.12, d * 1.18, mats, h + 0.1))
  return g
}

function courtyardUnit(mats, scale = 1, { openAxis = false } = {}) {
  const g = new THREE.Group()
  const yard = new THREE.Mesh(new THREE.BoxGeometry(10 * scale, 0.08, 12 * scale), mats.earth)
  yard.position.y = 0.04
  g.add(yard)

  if (openAxis) {
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

    const light = new THREE.PointLight(0xff9a3c, 2.1, 13, 1.7)
    light.position.set(x, 1.55, z)
    g.add(light)
  }

  return g
}

/** Fortress wall with brick courses, battlement depth, rim-catching edges */
function fortressWall(length, height, mats) {
  const g = new THREE.Group()
  g.name = 'fortress-wall'

  const core = new THREE.Mesh(new THREE.BoxGeometry(3.6, height, length), mats.stone)
  core.position.y = height / 2
  g.add(core)

  // Brick course relief on camera-facing (+X) side
  const courseH = 0.42
  const rows = Math.floor(height / courseH)
  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * 0.35
    const bricks = Math.floor(length / 1.05)
    for (let b = 0; b < bricks; b++) {
      if (Math.random() < 0.08) continue
      const brick = new THREE.Mesh(
        new THREE.BoxGeometry(0.14 + Math.random() * 0.06, courseH * 0.88, 0.95),
        Math.random() > 0.7 ? mats.brickDark : mats.brick,
      )
      brick.position.set(
        1.88 + Math.random() * 0.05,
        courseH * 0.5 + r * courseH,
        -length / 2 + 0.55 + b * 1.05 + offset,
      )
      g.add(brick)
    }
  }

  // Vertical pilasters / buttress rhythm
  for (let z = -length / 2 + 4; z < length / 2; z += 8) {
    const buttress = new THREE.Mesh(new THREE.BoxGeometry(1.4, height * 0.92, 1.6), mats.brickDark)
    buttress.position.set(2.2, height * 0.46, z)
    g.add(buttress)
  }

  // Merlons with depth + crenel gaps (silhouette)
  const merlonCount = Math.floor(length / 2.0)
  for (let i = 0; i < merlonCount; i++) {
    const z = -length / 2 + 1.0 + i * 2.0
    const merlon = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.15, 0.95), mats.brick)
    merlon.position.set(0.15, height + 0.55, z)
    g.add(merlon)
    const cap = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.18, 1.1), mats.stone)
    cap.position.set(0.15, height + 1.15, z)
    g.add(cap)
    // Foreground lip on camera side for rim light catch
    const lip = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.0, 0.9), mats.brickLight)
    lip.position.set(1.85, height + 0.5, z)
    g.add(lip)
    // Thin emissive rim catch on battlement crown
    const rimCatch = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.08, 0.95),
      new THREE.MeshStandardMaterial({
        color: 0xffd2a8,
        emissive: 0xffb080,
        emissiveIntensity: 0.55,
        roughness: 0.6,
      }),
    )
    rimCatch.position.set(1.95, height + 1.12, z)
    g.add(rimCatch)
  }

  // Watch tower mid-wall
  const tower = hall(5.5, 4.2, height * 0.55, mats)
  tower.position.set(0.6, height * 0.35, 0)
  g.add(tower)

  // Horse-face (马面) projection
  const horse = new THREE.Mesh(new THREE.BoxGeometry(5.5, height * 0.85, 6), mats.stone)
  horse.position.set(3.2, height * 0.42, 14)
  g.add(horse)
  const horseTop = roof(5.8, 5.2, mats, height * 0.85 + 0.2)
  horseTop.position.set(3.2, 0, 14)
  g.add(horseTop)

  // Walkway ledge
  const ledge = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.25, length * 0.98), mats.stone)
  ledge.position.set(1.2, height - 0.1, 0)
  g.add(ledge)

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

  // Arch frame wood
  const frameL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.5, 0.35), mats.wood)
  frameL.position.set(-1.7, 1.75, 3.05)
  const frameR = frameL.clone()
  frameR.position.x = 1.7
  const frameT = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.35, 0.35), mats.wood)
  frameT.position.set(0, 3.5, 3.05)
  g.add(frameL, frameR, frameT)

  const upper = hall(7.2, 5.2, 2.8, mats, false)
  upper.position.y = 5.5
  g.add(upper)

  g.add(roof(6.4, 4.6, mats, 9))

  // Night lanterns on gate + soft fill so silhouette still reads
  for (const x of [-2.4, 2.4]) {
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 10), mats.lantern)
    lamp.position.set(x, 3.8, 3.2)
    g.add(lamp)
    const pl = new THREE.PointLight(0xff9a40, 3.2, 18, 1.4)
    pl.position.set(x, 3.8, 3.2)
    g.add(pl)
  }
  const gateFill = new THREE.PointLight(0xffb070, 3.4, 28, 1.4)
  gateFill.position.set(0, 5.5, 7)
  g.add(gateFill)
  const gateUp = new THREE.PointLight(0xffc090, 2.6, 20, 1.35)
  gateUp.position.set(0, 8.8, 2)
  g.add(gateUp)
  const gateFront = new THREE.SpotLight(0xffd2a8, 4.5, 30, 0.55, 0.45, 1.1)
  gateFront.position.set(0, 6, 14)
  gateFront.target.position.set(0, 4, 38)
  g.add(gateFront, gateFront.target)

  return g
}

/** Rich carved relief wall + account-room door with light shaft gap */
function brickCarvingWall(mats) {
  const g = new THREE.Group()
  g.name = 'carving-set'

  const wall = new THREE.Mesh(new THREE.BoxGeometry(7.2, 3.6, 0.55), mats.carving)
  wall.position.y = 1.8
  g.add(wall)

  // Side wood columns
  for (const x of [-3.5, 3.5]) {
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.8, 0.35), mats.woodPolish)
    col.position.set(x, 1.9, 0.35)
    g.add(col)
  }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.28, 0.4), mats.woodPolish)
  beam.position.set(0, 3.7, 0.35)
  g.add(beam)

  // Extruded floral / geometric relief panels
  const panelPositions = [
    [-2.2, 2.4],
    [2.2, 2.4],
    [-2.2, 1.1],
    [2.2, 1.1],
  ]
  for (const [px, py] of panelPositions) {
    const plate = new THREE.Mesh(new THREE.BoxGeometry(1.55, 1.2, 0.12), mats.carvingLight)
    plate.position.set(px, py, 0.34)
    g.add(plate)

    // Concentric carved rings
    for (let r = 0; r < 3; r++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.18 + r * 0.14, 0.035, 6, 20),
        mats.carvingDark,
      )
      ring.position.set(px, py, 0.42)
      g.add(ring)
    }

    // Petal / diamond extrusions
    for (let k = 0; k < 6; k++) {
      const ang = (k / 6) * Math.PI * 2
      const petal = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.08), mats.carvingDark)
      petal.position.set(px + Math.cos(ang) * 0.42, py + Math.sin(ang) * 0.42, 0.44)
      petal.rotation.z = ang
      g.add(petal)
    }

    // Center boss
    const boss = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.14, 10), mats.woodPolish)
    boss.rotation.x = Math.PI / 2
    boss.position.set(px, py, 0.46)
    g.add(boss)
  }

  // Account room door with vertical gap for shaft light
  const doorGroup = new THREE.Group()
  doorGroup.position.set(0, 0, 0.4)

  const jambL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 2.7, 0.22), mats.woodPolish)
  jambL.position.set(-1.05, 1.35, 0)
  const jambR = jambL.clone()
  jambR.position.x = 1.05
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.28, 0.24), mats.woodPolish)
  lintel.position.set(0, 2.75, 0)
  const sill = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.18, 0.3), mats.stone)
  sill.position.set(0, 0.12, 0.05)
  doorGroup.add(jambL, jambR, lintel, sill)

  // Two door leaves with gap between
  const leafL = new THREE.Mesh(new THREE.BoxGeometry(0.92, 2.35, 0.1), mats.wood)
  leafL.position.set(-0.52, 1.3, 0.06)
  const leafR = new THREE.Mesh(new THREE.BoxGeometry(0.92, 2.35, 0.1), mats.wood)
  leafR.position.set(0.52, 1.3, 0.06)
  doorGroup.add(leafL, leafR)

  // Door studs
  for (const leaf of [leafL, leafR]) {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 2; col++) {
        const stud = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), mats.metal)
        stud.position.set(leaf.position.x + (col - 0.5) * 0.35, 0.55 + row * 0.5, 0.14)
        doorGroup.add(stud)
      }
    }
  }

  // Warm interior glow plane behind gap
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.22, 2.2),
    new THREE.MeshStandardMaterial({
      color: 0xffe0a8,
      emissive: 0xffb45a,
      emissiveIntensity: 2.8,
      roughness: 1,
      transparent: true,
      opacity: 0.95,
    }),
  )
  glow.position.set(0, 1.35, -0.05)
  doorGroup.add(glow)

  g.add(doorGroup)

  // Roof eave over carving wall
  g.add(roof(7.8, 2.2, mats, 3.9))

  return g
}

/**
 * Build Wang Family Courtyard compound (procedural low-poly).
 */
export function buildArchitecture() {
  const mats = createMaterials()
  const root = new THREE.Group()
  root.name = 'wang-compound'

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(180, 180), mats.earth)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  root.add(ground)

  const wall = fortressWall(72, 7.2, mats)
  wall.position.set(-24, 0, 0)
  root.add(wall)

  // Rim-catching accent light aimed at battlements (dusk silhouette)
  const rim = new THREE.DirectionalLight(0xffc8a0, 1.35)
  rim.position.set(18, 14, 8)
  rim.target.position.set(-22, 7, 0)
  root.add(rim, rim.target)
  root.userData.rimLight = rim

  // Warm ground bounce near wall
  const bounce = new THREE.PointLight(0xff9a60, 1.6, 40, 2)
  bounce.position.set(-16, 3.5, 6)
  root.add(bounce)

  const gate = gateTower(mats)
  gate.position.set(0, 0, 38)
  root.add(gate)

  const gate2 = gateTower(mats)
  gate2.scale.set(0.75, 0.75, 0.75)
  gate2.position.set(-18, 0, 22)
  root.add(gate2)

  // Keep west side open for fortress camera corridor (wall at x≈-24)
  const layout = [
    [0, 8, 1.05, true],
    [14, 8, 0.9, false],
    [0, -8, 1, true],
    [14, -8, 0.85, false],
    [0, 22, 0.8, true],
    [12, 20, 0.7, false],
    [16, -20, 0.75, false],
    [8, -22, 0.7, false],
  ]
  for (const [x, z, s, openAxis] of layout) {
    const c = courtyardUnit(mats, s, { openAxis })
    c.position.set(x, 0, z)
    root.add(c)
  }

  // Door-frame occluders + axis lanterns
  for (let i = 0; i < 5; i++) {
    const z = 10 - i * 7
    const frame = new THREE.Group()
    const left = new THREE.Mesh(new THREE.BoxGeometry(0.55, 3.9, 0.55), mats.brick)
    left.position.set(-2.15, 1.95, 0)
    const right = left.clone()
    right.position.x = 2.15
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.45, 0.55), mats.wood)
    lintel.position.set(0, 4.0, 0)
    // Side wings for stronger occluder silhouette
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(1.4, 3.2, 0.35), mats.plaster)
    wingL.position.set(-3.2, 1.6, 0)
    const wingR = wingL.clone()
    wingR.position.x = 3.2
    frame.add(left, right, lintel, wingL, wingR)
    frame.position.set(0, 0, z)
    root.add(frame)

    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), mats.lantern)
    lamp.position.set(0, 3.25, z + 0.4)
    root.add(lamp)
    const axisLight = new THREE.PointLight(0xffa040, 2.4, 13, 1.5)
    axisLight.position.set(0, 3.05, z + 0.4)
    root.add(axisLight)
  }

  // Brick carving / account room
  const carving = brickCarvingWall(mats)
  carving.position.set(22, 0, -2)
  carving.rotation.y = -Math.PI * 0.12
  root.add(carving)

  // Shaft light through door gap
  const shaft = new THREE.SpotLight(0xffd2a0, 8.5, 22, 0.18, 0.55, 1.2)
  shaft.position.set(18.5, 3.2, 4.5)
  shaft.target.position.set(22, 1.4, -2)
  root.add(shaft, shaft.target)
  root.userData.carvingShaft = shaft

  const carvingKey = new THREE.SpotLight(0xffc090, 3.2, 16, 0.5, 0.45, 1)
  carvingKey.position.set(16, 5, 2)
  carvingKey.target.position.set(22, 2, -2)
  root.add(carvingKey, carvingKey.target)

  const carvingFill = new THREE.PointLight(0xffa060, 1.4, 9, 1.6)
  carvingFill.position.set(20.5, 2.0, 1.2)
  root.add(carvingFill)

  for (let z = -24; z <= 34; z += 2.5) {
    const stone = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 1.8), mats.stone)
    stone.position.set(0, 0.06, z)
    root.add(stone)
  }

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
    t.position.set(-40 - Math.random() * 8, 0, -30 + i * 6 + Math.random() * 2)
    root.add(t)
  }

  root.userData.mats = mats
  root.userData.gate = gate
  root.userData.wall = wall
  root.userData.carving = carving
  root.userData.emberAnchor = { x: -20, y: 2, z: 4 }
  root.userData.dustAnchor = { x: 21, y: 1.2, z: -1 }
  return root
}
