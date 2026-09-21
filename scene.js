import * as THREE from 'three'

/* ============================================================
   WebGL scene — an abstract "spark to rocket" monolith:
   a faceted icosahedron core wrapped in an orbiting particle
   field. Drag to rotate · mouse parallax · scroll-morphed.
   ============================================================ */

const lerp = (a, b, t) => a + (b - a) * t
const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt))

export function createScene (canvas) {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)

  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(0, 0, 9)

  /* ---------- Core icosahedron ---------- */

  const geometry = new THREE.IcosahedronGeometry(2.1, 1)
  const positionAttr = geometry.attributes.position
  const basePositions = positionAttr.array.slice()

  const material = new THREE.MeshBasicMaterial({
    color: 0x0b0b0c,
    wireframe: true,
    transparent: true,
    opacity: 0.5
  })

  const core = new THREE.Mesh(geometry, material)
  scene.add(core)

  // solid dark shell so particles behind the core get occluded
  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.97, 1),
    new THREE.MeshBasicMaterial({ color: 0x050505 })
  )
  core.add(shell)

  // inner glowing seed
  const seed = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.5, 2),
    new THREE.MeshBasicMaterial({ color: 0xff5a1f, transparent: true, opacity: 0.9 })
  )
  core.add(seed)

  // faint solid edges for depth
  const edgeLines = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.1, 1)),
    new THREE.LineBasicMaterial({ color: 0xff5a1f, transparent: true, opacity: 0.22 })
  )
  core.add(edgeLines)

  /* ---------- Particle halo ---------- */

  const COUNT = 900
  const positions = new Float32Array(COUNT * 3)
  const speeds = new Float32Array(COUNT)
  const offsets = new Float32Array(COUNT)

  for (let i = 0; i < COUNT; i++) {
    const r = 2.8 + Math.random() * 3.4
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.72
    positions[i * 3 + 2] = r * Math.cos(phi)
    speeds[i] = 0.02 + Math.random() * 0.08
    offsets[i] = Math.random() * Math.PI * 2
  }

  const pGeo = new THREE.BufferGeometry()
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const pMat = new THREE.PointsMaterial({
    color: 0xf2f1ec,
    size: 0.02,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    sizeAttenuation: true
  })

  const particles = new THREE.Points(pGeo, pMat)
  scene.add(particles)

  /* ---------- Interaction state ---------- */

  const mouse = { x: 0, y: 0 }
  const drag = { active: false, vx: 0, vy: 0, lastX: 0, lastY: 0 }
  const scrollState = { progress: 0 }
  const rotation = { x: 0.15, y: 0.35 }

  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1
  }, { passive: true })

  const onDown = (x, y, target) => {
    if (target && target.closest && target.closest('a, button, input, textarea, select')) return
    drag.active = true
    drag.lastX = x
    drag.lastY = y
    canvas.style.cursor = 'grabbing'
  }
  const onMove = (x, y) => {
    if (!drag.active) return
    drag.vx = (x - drag.lastX) * 0.0045
    drag.vy = (y - drag.lastY) * 0.0045
    rotation.y += drag.vx
    rotation.x += drag.vy
    drag.lastX = x
    drag.lastY = y
  }
  const onUp = () => {
    drag.active = false
    canvas.style.cursor = ''
  }

  window.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return // let touch scroll the page
    onDown(e.clientX, e.clientY, e.target)
  })
  window.addEventListener('pointermove', (e) => onMove(e.clientX, e.clientY))
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', onUp)

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })

  /* ---------- Public API ---------- */

  const api = {
    setScroll (p) { scrollState.progress = p }
  }

  /* ---------- Render loop ---------- */

  const clock = new THREE.Clock()
  let raf

  function tick () {
    const dt = Math.min(clock.getDelta(), 0.05)
    const t = clock.elapsedTime
    const p = scrollState.progress

    // idle spin + drag inertia
    rotation.y += drag.active ? 0 : 0.0018
    if (!drag.active) {
      drag.vx = damp(drag.vx, 0, 2.2, dt)
      drag.vy = damp(drag.vy, 0, 2.2, dt)
      rotation.y += drag.vx
      rotation.x += drag.vy
    }

    // clamp x tilt
    rotation.x = Math.max(-1.2, Math.min(1.2, rotation.x))

    // mouse parallax on camera
    camera.position.x = damp(camera.position.x, mouse.x * 0.7, 3, dt)
    camera.position.y = damp(camera.position.y, -mouse.y * 0.5, 3, dt)
    camera.lookAt(0, 0, 0)

    // scroll morph: pushes the core away + dissolves as you scroll
    const targetZ = 9 + p * 7
    camera.position.z = damp(camera.position.z, targetZ, 4, dt)
    material.opacity = lerp(0.5, 0.12, p)
    pMat.opacity = lerp(0.55, 0.08, p)
    edgeLines.material.opacity = lerp(0.22, 0.04, p)
    seed.material.opacity = lerp(0.9, 0.25, p)

    // breathing / deformation
    const breathe = 1 + Math.sin(t * 0.6) * 0.03 + p * 0.5
    core.scale.setScalar(breathe)

    // vertex wobble (spark energy)
    const pos = positionAttr
    for (let i = 0; i < pos.count; i++) {
      const ix = i * 3
      const ox = basePositions[ix]
      const oy = basePositions[ix + 1]
      const oz = basePositions[ix + 2]
      const n = Math.sin(ox * 1.6 + t * 0.9) * Math.cos(oy * 1.4 + t * 0.7) * Math.sin(oz * 1.8 + t * 0.5)
      const amp = 0.09 + p * 0.2
      pos.array[ix] = ox + n * amp
      pos.array[ix + 1] = oy + n * amp * 0.8
      pos.array[ix + 2] = oz + n * amp
    }
    pos.needsUpdate = true

    core.rotation.x = rotation.x
    core.rotation.y = rotation.y
    seed.scale.setScalar(1 + Math.sin(t * 2.2) * 0.12)

    particles.rotation.y = t * 0.045 + rotation.y * 0.35
    particles.rotation.x = Math.sin(t * 0.2) * 0.05
    const pp = pGeo.attributes.position
    for (let i = 0; i < COUNT; i++) {
      pp.array[i * 3 + 1] += Math.sin(t * speeds[i] * 4 + offsets[i]) * 0.0012
    }
    pp.needsUpdate = true

    renderer.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }

  if (!prefersReduced) {
    raf = requestAnimationFrame(tick)
  } else {
    // single static frame
    renderer.render(scene, camera)
  }

  api.dispose = () => {
    cancelAnimationFrame(raf)
    renderer.dispose()
    geometry.dispose()
    material.dispose()
    pGeo.dispose()
    pMat.dispose()
  }

  return api
}
