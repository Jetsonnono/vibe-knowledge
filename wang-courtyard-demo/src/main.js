import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { buildArchitecture } from './scene/architecture.js'
import { createLighting } from './scene/lighting.js'
import { createGatePointCloud, updatePointCloudReveal } from './scene/pointCloud.js'
import {
  createEmberField,
  createGoldDust,
  createDissolveCloud,
  updateParticleField,
  setDissolveCloud,
} from './scene/particles.js'
import { sampleCamera, LOOP_DURATION, chapterAt } from './scene/chapters.js'
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
const camera = new THREE.PerspectiveCamera(46, 9 / 16, 0.1, 400)
camera.position.set(0, 4, 50)

const lighting = createLighting(scene)
const compound = buildArchitecture()
scene.add(compound)

const gate = compound.userData.gate
const pointCloud = createGatePointCloud(gate)
scene.add(pointCloud)
gate.traverse((obj) => {
  if (obj.isMesh) {
    obj.material = obj.material.clone()
    obj.material.transparent = true
    obj.material.opacity = 0
    obj.visible = false
  }
})

const ember = createEmberField({
  center: new THREE.Vector3(-19.5, 3.5, 2),
  size: new THREE.Vector3(8, 10, 40),
  count: 1100,
})
scene.add(ember)

const goldDust = createGoldDust({
  center: new THREE.Vector3(21.2, 1.4, -0.5),
  size: new THREE.Vector3(4.5, 3.2, 3.5),
  count: 800,
})
scene.add(goldDust)

const dissolveCloud = createDissolveCloud(4200)
scene.add(dissolveCloud)

const hud = createHUD()

const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene, camera))
const bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.32, 0.5, 0.82)
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
  if (!autoplay) controls.target.set(0, 2, 0)
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

function syncAtmosphere(sample, dt) {
  lighting.setNight(sample.night)
  updatePointCloudReveal(pointCloud, gate, sample.pc)
  setDissolveCloud(dissolveCloud, sample.look, sample.dissolve)

  // Chapter-aware particles (fortress embers / carving gold dust)
  const ch = chapterAt(sample.time)
  ember.visible = ch.id === 2 || (ch.id === 1 && sample.time > 10)
  goldDust.visible = ch.id === 5 || (ch.id === 6 && sample.time < 64)
  if (ember.visible) updateParticleField(ember, dt, sample.time, { rise: true })
  if (goldDust.visible) updateParticleField(goldDust, dt, sample.time, { rise: true })

  // Controlled lantern bloom — stronger at night, not muddy
  const nightBloom = 0.2 + sample.night * 0.42
  const dissolveBloom = sample.dissolve * 0.1
  bloom.strength = nightBloom + dissolveBloom
  bloom.threshold = 0.72 - sample.night * 0.06
  // Exposure: dusk hotter; night slightly lifted so gate structure reads
  renderer.toneMappingExposure = THREE.MathUtils.lerp(1.14, 1.05, sample.night)

  // Rim on fortress fades as night deepens
  if (compound.userData.rimLight) {
    compound.userData.rimLight.intensity = THREE.MathUtils.lerp(1.4, 0.05, sample.night)
  }
}

function tick(now) {
  const dt = Math.min(0.05, (now - last) / 1000)
  last = now

  if (autoplay) {
    elapsed += dt
    const sample = sampleCamera(elapsed)
    applyCamera(sample)
    syncAtmosphere(sample, dt)
    hud.update(elapsed, sample)
  } else {
    controls.update()
    const fake = {
      pos: [camera.position.x, camera.position.y, camera.position.z],
      look: [controls.target.x, controls.target.y, controls.target.z],
      night: 0.75,
      pc: 1,
      dissolve: 0,
      time: elapsed % LOOP_DURATION,
    }
    syncAtmosphere(fake, dt)
    hud.update(elapsed, fake)
  }

  if (pointCloud.visible) {
    pointCloud.rotation.y = Math.sin(elapsed * 0.12) * 0.012
  }

  composer.render()
  requestAnimationFrame(tick)
}

requestAnimationFrame(tick)

window.__WANG_DEMO__ = {
  seek(t) {
    elapsed = t
    autoplay = true
    controls.enabled = false
    pauseBtn.textContent = 'Ⅱ'
    const sample = sampleCamera(elapsed)
    applyCamera(sample)
    syncAtmosphere(sample, 0.016)
    hud.update(elapsed, sample)
  },
  chapters: hud.CHAPTERS,
  duration: LOOP_DURATION,
  renderer,
  camera,
  scene,
}
