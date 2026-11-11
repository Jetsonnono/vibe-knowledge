import * as THREE from 'three'

/**
 * Dusk → night lighting rig.
 * nightFactor 0 = purple/pink dusk, 1 = warm lantern night.
 */
export function createLighting(scene) {
  const hemi = new THREE.HemisphereLight(0xb89ad4, 0x3a2a1c, 0.55)
  scene.add(hemi)

  const sun = new THREE.DirectionalLight(0xffc4a0, 1.45)
  // From courtyard side so fortress wall face reads at dusk
  sun.position.set(35, 24, 40)
  sun.castShadow = false
  scene.add(sun)

  const moon = new THREE.DirectionalLight(0x6a7cff, 0.15)
  moon.position.set(30, 40, -10)
  scene.add(moon)

  const fill = new THREE.AmbientLight(0x2a2038, 0.25)
  scene.add(fill)

  // Horizon glow sprite-like plane behind compound
  const skyGeo = new THREE.SphereGeometry(220, 32, 16)
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      topColor: { value: new THREE.Color(0x0a0614) },
      midColor: { value: new THREE.Color(0x4a2868) },
      botColor: { value: new THREE.Color(0xd4896a) },
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
        vec3 dusk = mix(botColor, midColor, smoothstep(-0.15, 0.25, h));
        dusk = mix(dusk, topColor, smoothstep(0.2, 0.85, h));
        vec3 nightCol = mix(vec3(0.02, 0.03, 0.06), vec3(0.05, 0.06, 0.12), smoothstep(-0.2, 0.9, h));
        vec3 col = mix(dusk, nightCol, night);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  })
  const sky = new THREE.Mesh(skyGeo, skyMat)
  scene.add(sky)

  // Fog
  scene.fog = new THREE.FogExp2(0x1a1020, 0.012)

  return {
    hemi,
    sun,
    moon,
    fill,
    skyMat,
    setNight(n) {
      const k = THREE.MathUtils.clamp(n, 0, 1)
      skyMat.uniforms.night.value = k
      hemi.intensity = THREE.MathUtils.lerp(0.7, 0.35, k)
      hemi.color.set(0xc4a8d8).lerp(new THREE.Color(0x4a5578), k)
      sun.intensity = THREE.MathUtils.lerp(1.45, 0.18, k)
      sun.color.set(0xffc4a0).lerp(new THREE.Color(0x667788), k)
      moon.intensity = THREE.MathUtils.lerp(0.18, 0.45, k)
      fill.intensity = THREE.MathUtils.lerp(0.35, 0.22, k)
      const fogCol = new THREE.Color(0x221428).lerp(new THREE.Color(0x0c0a14), k)
      scene.fog.color.copy(fogCol)
      scene.fog.density = THREE.MathUtils.lerp(0.006, 0.011, k)
    },
  }
}
