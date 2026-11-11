import * as THREE from 'three'

function makePoints(count, { color, size, opacity = 0.85, additive = true }) {
  const positions = new Float32Array(count * 3)
  const velocities = new Float32Array(count * 3)
  const phases = new Float32Array(count)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const mat = new THREE.PointsMaterial({
    color,
    size,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    sizeAttenuation: true,
  })
  const points = new THREE.Points(geo, mat)
  points.userData = { velocities, phases, count, bounds: null }
  return points
}

/** Ember / dust along fortress wall at dusk */
export function createEmberField({ center, size, count = 900 }) {
  const pts = makePoints(count, { color: 0xffb070, size: 0.07, opacity: 0.75 })
  const pos = pts.geometry.attributes.position.array
  const { velocities, phases } = pts.userData
  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    pos[i3] = center.x + (Math.random() - 0.5) * size.x
    pos[i3 + 1] = center.y + Math.random() * size.y
    pos[i3 + 2] = center.z + (Math.random() - 0.5) * size.z
    velocities[i3] = (Math.random() - 0.5) * 0.15
    velocities[i3 + 1] = 0.25 + Math.random() * 0.55
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.12
    phases[i] = Math.random() * Math.PI * 2
  }
  pts.userData.bounds = { center: center.clone(), size: size.clone() }
  pts.name = 'ember-field'
  return pts
}

/** Warm dust / gold motes for carving close-up */
export function createGoldDust({ center, size, count = 700 }) {
  const pts = makePoints(count, { color: 0xffd9a0, size: 0.045, opacity: 0.7 })
  const pos = pts.geometry.attributes.position.array
  const { velocities, phases } = pts.userData
  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    pos[i3] = center.x + (Math.random() - 0.5) * size.x
    pos[i3 + 1] = center.y + Math.random() * size.y
    pos[i3 + 2] = center.z + (Math.random() - 0.5) * size.z
    velocities[i3] = (Math.random() - 0.5) * 0.08
    velocities[i3 + 1] = 0.05 + Math.random() * 0.12
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.08
    phases[i] = Math.random() * Math.PI * 2
  }
  pts.userData.bounds = { center: center.clone(), size: size.clone() }
  pts.name = 'gold-dust'
  return pts
}

/** Soft transition dissolve cloud around camera look target */
export function createDissolveCloud(count = 5000) {
  const pts = makePoints(count, { color: 0xa8d4ff, size: 0.06, opacity: 0 })
  const pos = pts.geometry.attributes.position.array
  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    pos[i3] = (Math.random() - 0.5) * 24
    pos[i3 + 1] = Math.random() * 14
    pos[i3 + 2] = (Math.random() - 0.5) * 24
  }
  pts.visible = false
  pts.name = 'dissolve-cloud'
  return pts
}

export function updateParticleField(points, dt, time, { rise = true } = {}) {
  if (!points || !points.visible) return
  const pos = points.geometry.attributes.position.array
  const { velocities, phases, count, bounds } = points.userData
  if (!bounds) return
  const { center, size } = bounds
  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    const wobble = Math.sin(time * 1.4 + phases[i]) * 0.02
    pos[i3] += velocities[i3] * dt + wobble * dt
    pos[i3 + 1] += (rise ? velocities[i3 + 1] : velocities[i3 + 1] * 0.35) * dt
    pos[i3 + 2] += velocities[i3 + 2] * dt
    // Recycle
    if (
      pos[i3 + 1] > center.y + size.y ||
      Math.abs(pos[i3] - center.x) > size.x * 0.55 ||
      Math.abs(pos[i3 + 2] - center.z) > size.z * 0.55
    ) {
      pos[i3] = center.x + (Math.random() - 0.5) * size.x
      pos[i3 + 1] = center.y + Math.random() * size.y * 0.2
      pos[i3 + 2] = center.z + (Math.random() - 0.5) * size.z
    }
  }
  points.geometry.attributes.position.needsUpdate = true
}

export function setDissolveCloud(points, look, amount) {
  if (!points) return
  const a = THREE.MathUtils.clamp(amount, 0, 1)
  points.material.opacity = a * 0.85
  points.visible = a > 0.02
  if (points.visible) {
    points.position.set(look[0], look[1] * 0.4, look[2])
  }
}
