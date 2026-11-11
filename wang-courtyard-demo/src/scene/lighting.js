import * as THREE from 'three'

/**
 * Dusk → night lighting rig with stronger dusk rim + cleaner night fog.
 */
export function createLighting(scene) {
  const hemi = new THREE.HemisphereLight(0xb89ad4, 0x3a2a1c, 0.55)
  scene.add(hemi)

  const sun = new THREE.DirectionalLight(0xffc4a0, 1.55)
  sun.position.set(28, 20, 36)
  sun.castShadow = false
  scene.add(sun)

  // Cool rim opposite sun — battlement edges read at dusk
  const rim = new THREE.DirectionalLight(0xffd2b0, 0.85)
  rim.position.set(-8, 18, -20)
  scene.add(rim)

  const moon = new THREE.DirectionalLight(0x6a7cff, 0.15)
  moon.position.set(30, 40, -10)
  scene.add(moon)

  const fill = new THREE.AmbientLight(0x2a2038, 0.25)
  scene.add(fill)

  // Soft volumetric dusk band (horizon glow plane)
  const hazeGeo = new THREE.PlaneGeometry(320, 80)
  const hazeMat = new THREE.MeshBasicMaterial({
    color: 0xd4896a,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  })
  const haze = new THREE.Mesh(hazeGeo, hazeMat)
  haze.position.set(-40, 8, 0)
  haze.rotation.y = Math.PI * 0.5
  scene.add(haze)

  const skyGeo = new THREE.SphereGeometry(220, 32, 16)
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      topColor: { value: new THREE.Color(0x090612) },
      midColor: { value: new THREE.Color(0x523070) },
      botColor: { value: new THREE.Color(0xe09870) },
      night: { value: 0 },
    },
    vertexShader: `
      varying vec3 vWorld;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vWorld = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 midColor;
      uniform vec3 botColor;
      uniform float night;
      varying vec3 vWorld;
      void main() {
        float h = normalize(vWorld).y;
        vec3 dusk = mix(botColor, midColor, smoothstep(-0.12, 0.22, h));
        dusk = mix(dusk, topColor, smoothstep(0.18, 0.82, h));
        // Soft horizon bloom band
        float band = exp(-pow((h - 0.02) / 0.12, 2.0)) * 0.35;
        dusk += vec3(0.35, 0.18, 0.12) * band;
        vec3 nightCol = mix(vec3(0.015, 0.02, 0.04), vec3(0.04, 0.05, 0.1), smoothstep(-0.2, 0.9, h));
        vec3 col = mix(dusk, nightCol, night);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  })
  const sky = new THREE.Mesh(skyGeo, skyMat)
  scene.add(sky)

  scene.fog = new THREE.FogExp2(0x1a1020, 0.008)

  return {
    hemi,
    sun,
    rim,
    moon,
    fill,
    haze,
    skyMat,
    setNight(n) {
      const k = THREE.MathUtils.clamp(n, 0, 1)
      skyMat.uniforms.night.value = k
      hemi.intensity = THREE.MathUtils.lerp(0.72, 0.32, k)
      hemi.color.set(0xc4a8d8).lerp(new THREE.Color(0x4a5578), k)
      sun.intensity = THREE.MathUtils.lerp(1.55, 0.12, k)
      sun.color.set(0xffc4a0).lerp(new THREE.Color(0x667788), k)
      rim.intensity = THREE.MathUtils.lerp(0.95, 0.08, k)
      moon.intensity = THREE.MathUtils.lerp(0.14, 0.42, k)
      fill.intensity = THREE.MathUtils.lerp(0.32, 0.18, k)
      haze.material.opacity = THREE.MathUtils.lerp(0.28, 0.02, k)
      const fogCol = new THREE.Color(0x241628).lerp(new THREE.Color(0x0a0810), k)
      scene.fog.color.copy(fogCol)
      // Less muddy night fog; dusk keeps soft volume
      scene.fog.density = THREE.MathUtils.lerp(0.0055, 0.0095, k)
    },
  }
}
