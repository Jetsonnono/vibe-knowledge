import * as THREE from 'three'

/**
 * Point-cloud shell of the south gate — dissolves into solid geometry.
 */
export function createGatePointCloud(gateObject) {
  const count = 18000
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)

  const box = new THREE.Box3().setFromObject(gateObject)
  const size = new THREE.Vector3()
  const center = new THREE.Vector3()
  box.getSize(size)
  box.getCenter(center)

  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    // Bias samples toward gate silhouette (box + roof pyramid)
    const u = Math.random()
    let x, y, z
    if (u < 0.55) {
      x = (Math.random() - 0.5) * size.x * 0.95
      y = Math.random() * size.y
      z = (Math.random() - 0.5) * size.z * 0.95
    } else {
      // Roof / eaves cloud
      const t = Math.random()
      x = (Math.random() - 0.5) * size.x * (1.1 - t * 0.5)
      y = size.y * 0.55 + t * size.y * 0.55
      z = (Math.random() - 0.5) * size.z * (1.05 - t * 0.4)
    }
    positions[i3] = center.x + x
    positions[i3 + 1] = y
    positions[i3 + 2] = center.z + z

    const c = 0.55 + Math.random() * 0.45
    colors[i3] = 0.45 * c
    colors[i3 + 1] = 0.75 * c
    colors[i3 + 2] = 1.0 * c
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const mat = new THREE.PointsMaterial({
    size: 0.065,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  })

  const points = new THREE.Points(geo, mat)
  points.name = 'gate-pointcloud'
  return points
}

export function updatePointCloudReveal(points, solidGate, t) {
  // t: 0 = full cloud, 1 = solid revealed
  const opacity = THREE.MathUtils.clamp(1 - t * 1.15, 0, 1)
  points.material.opacity = opacity
  points.visible = opacity > 0.02
  solidGate.traverse((obj) => {
    if (obj.isMesh && obj.material && obj.material.opacity !== undefined) return
  })
  // Fade solid in
  solidGate.traverse((obj) => {
    if (!obj.isMesh) return
    if (!obj.userData._baseMat) {
      obj.userData._baseMat = obj.material
      obj.material = obj.material.clone()
      obj.material.transparent = true
    }
    obj.material.opacity = THREE.MathUtils.clamp((t - 0.25) / 0.6, 0, 1)
    obj.visible = obj.material.opacity > 0.02
  })
}
