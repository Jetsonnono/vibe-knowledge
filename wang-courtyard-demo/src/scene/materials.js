import * as THREE from 'three'

/** Shared materials — earth, brick, tile, wood, night glow */
export function createMaterials() {
  const earth = new THREE.MeshStandardMaterial({
    color: 0x6b5340,
    roughness: 0.95,
    metalness: 0.02,
  })

  const stone = new THREE.MeshStandardMaterial({
    color: 0xa18868,
    roughness: 0.86,
    metalness: 0.04,
  })

  const brick = new THREE.MeshStandardMaterial({
    color: 0x927456,
    roughness: 0.88,
    metalness: 0.03,
  })

  const tile = new THREE.MeshStandardMaterial({
    color: 0x343840,
    roughness: 0.7,
    metalness: 0.08,
  })

  const wood = new THREE.MeshStandardMaterial({
    color: 0x5a3a24,
    roughness: 0.52,
    metalness: 0.05,
  })

  const plaster = new THREE.MeshStandardMaterial({
    color: 0xd2c2a8,
    roughness: 0.9,
    metalness: 0.01,
  })

  const lantern = new THREE.MeshStandardMaterial({
    color: 0xffb45a,
    emissive: 0xff8a2b,
    emissiveIntensity: 2.2,
    roughness: 0.4,
    metalness: 0.1,
  })

  const carving = new THREE.MeshStandardMaterial({
    color: 0xb09070,
    roughness: 0.6,
    metalness: 0.08,
  })

  return { earth, stone, brick, tile, wood, plaster, lantern, carving }
}
