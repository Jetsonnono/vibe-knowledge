import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { buildArchitecture } from './scene/architecture.js'
import { createLighting } from './scene/lighting.js'
import { createGatePointCloud, updatePointCloudReveal } from './scene/pointCloud.js'
import { sampleCamera, LOOP_DURATION } from './scene/chapters.js'
import { createHUD } from './ui/hud.js'

const canvas = document.getElementById('c')
const stage = document.getElementById('stage')
const pauseBtn = document.getElementById('pause-btn')

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: 'high-performance',
})
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.05

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(48, 9 / 16, 0.1, 400)
camera.position.set(0, 4, 50)

const lighting = createLighting(scene)
const compound = buildArchitecture()
scene.add(compound)

const gate = compound.userData.gate
const pointCloud = createGatePointCloud(gate)
scene.add(pointCloud)
// Start with solid gate hidden for point-cloud intro
gate.traverse((obj) => {
  if (obj.isMesh) {
    obj.material = obj.material.clone()
    obj.material.transparent = true
    obj.material.opacity = 0
    obj.visible = false
  }
})

const hud = createHUD()

const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene, camera))
const bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.28, 0.55, 0.88)
composer.addPass(bloom)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enabled = false
controls.maxPolarAngle = Math.PI * 0.49
controls.minDistance = 3
controls.maxDistance = 80

let autoplay = true
let elapsed = 0
let last = performance.now()

pauseBtn.addEventListener('click', () => {
  autoplay = !autoplay
  controls.enabled = !autoplay
  pauseBtn.textContent = autoplay ? 'Ⅱ' : '▶'
  document.getElementById('hint').textContent = autoplay
    ? 'AUTO ROAM · tap Ⅱ to orbit'
    : 'ORBIT · tap ▶ to resume roam'
  if (!autoplay) {
    controls.target.set(0, 2, 0)
  }
})

function resize() {
  const w = stage.clientWidth
  const h = stage.clientHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h, false)
  composer.setSize(w, h)
  bloom.setSize(w, h)
}

window.addEventListener('resize', resize)
resize()

const _look = new THREE.Vector3()

function applyCamera(sample) {
  camera.position.set(sample.pos[0], sample.pos[1], sample.pos[2])
  _look.set(sample.look[0], sample.look[1], sample.look[2])
  camera.lookAt(_look)
}

function tick(now) {
  const dt = Math.min(0.05, (now - last) / 1000)
  last = now

  if (autoplay) {
    elapsed += dt
    const sample = sampleCamera(elapsed)
    applyCamera(sample)
    lighting.setNight(sample.night)
    updatePointCloudReveal(pointCloud, gate, sample.pc)
    bloom.strength = 0.2 + sample.night * 0.22
    renderer.toneMappingExposure = 1.08 + sample.night * 0.08
    hud.update(elapsed, sample)
  } else {
    controls.update()
    const fake = {
      pos: [camera.position.x, camera.position.y, camera.position.z],
      look: [controls.target.x, controls.target.y, controls.target.z],
      night: 0.7,
      pc: 1,
    }
    lighting.setNight(fake.night)
    updatePointCloudReveal(pointCloud, gate, 1)
    hud.update(elapsed, fake)
  }

  // Subtle point shimmer
  if (pointCloud.visible) {
    pointCloud.rotation.y = Math.sin(elapsed * 0.15) * 0.01
  }

  composer.render()
  requestAnimationFrame(tick)
}

requestAnimationFrame(tick)

// Expose for screenshot tooling / debug
window.__WANG_DEMO__ = {
  seek(t) {
    elapsed = t
    autoplay = true
    controls.enabled = false
    pauseBtn.textContent = 'Ⅱ'
    const sample = sampleCamera(elapsed)
    applyCamera(sample)
    lighting.setNight(sample.night)
    updatePointCloudReveal(pointCloud, gate, sample.pc)
    hud.update(elapsed, sample)
  },
  chapters: hud.CHAPTERS,
  duration: LOOP_DURATION,
  renderer,
  camera,
  scene,
}
