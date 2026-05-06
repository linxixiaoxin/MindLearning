import fs from 'node:fs/promises'
import path from 'node:path'
import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buffer) => {
      this.result = buffer
      this.onloadend?.()
    })
  }

  readAsDataURL(blob) {
    blob.arrayBuffer().then((buffer) => {
      this.result = `data:${blob.type || 'application/octet-stream'};base64,${Buffer.from(buffer).toString('base64')}`
      this.onloadend?.()
    })
  }
}

const outputDir = path.resolve('public/atlas-assets/models/redbook/custom-glb')
const exporter = new GLTFExporter()

const palette = {
  bark: 0x6d4328,
  barkDark: 0x3f2919,
  brass: 0xd5a95d,
  cream: 0xf3dfad,
  green: 0x6fa66c,
  greenDark: 0x3d7048,
  teal: 0x5fa69c,
  blue: 0x4d718b,
  clay: 0xb77b48,
  sand: 0xd5bb77,
  stone: 0x8c8171,
  stoneDark: 0x5c554d,
  red: 0xb35442,
  amber: 0xffd57d,
  ink: 0x2f241a,
  white: 0xfff4dc,
  glass: 0xa8ded8,
}

function mat(color, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: options.roughness ?? 0.74,
    metalness: options.metalness ?? 0.02,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1,
    side: options.side ?? THREE.FrontSide,
  })
}

const materials = {
  wood: mat(palette.bark),
  darkWood: mat(palette.barkDark),
  brass: mat(palette.brass, { roughness: 0.55, metalness: 0.04 }),
  cream: mat(palette.cream),
  green: mat(palette.green),
  greenDark: mat(palette.greenDark),
  teal: mat(palette.teal),
  blue: mat(palette.blue),
  clay: mat(palette.clay),
  sand: mat(palette.sand),
  stone: mat(palette.stone),
  stoneDark: mat(palette.stoneDark),
  red: mat(palette.red),
  amber: mat(palette.amber, { roughness: 0.38, metalness: 0.02 }),
  ink: mat(palette.ink),
  white: mat(palette.white),
  glass: mat(palette.glass, { roughness: 0.2, transparent: true, opacity: 0.38, side: THREE.DoubleSide }),
  beam: mat(0xffef9c, { roughness: 0.2, transparent: true, opacity: 0.28, side: THREE.DoubleSide }),
}

function mesh(group, geometry, material, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], name = '') {
  const object = new THREE.Mesh(geometry, material)
  object.name = name
  object.position.set(...position)
  object.rotation.set(...rotation)
  object.scale.set(...scale)
  group.add(object)
  return object
}

function roundedBox(group, size, position, material, rotation = [0, 0, 0], radius = 0.08, name = '') {
  return mesh(group, new RoundedBoxGeometry(size[0], size[1], size[2], 3, radius), material, position, rotation, [1, 1, 1], name)
}

function box(group, size, position, material, rotation = [0, 0, 0], name = '') {
  return roundedBox(group, size, position, material, rotation, 0.025, name)
}

function cylinder(group, radiusTop, radiusBottom, height, position, material, rotation = [0, 0, 0], segments = 18, name = '') {
  return mesh(group, new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), material, position, rotation, [1, 1, 1], name)
}

function cone(group, radius, height, position, material, rotation = [0, 0, 0], segments = 18, name = '') {
  return mesh(group, new THREE.ConeGeometry(radius, height, segments), material, position, rotation, [1, 1, 1], name)
}

function sphere(group, radius, position, material, scale = [1, 1, 1], segments = 18, name = '') {
  return mesh(group, new THREE.SphereGeometry(radius, segments, Math.max(8, Math.floor(segments * 0.65))), material, position, [0, 0, 0], scale, name)
}

function torus(group, radius, tube, position, material, rotation = [0, 0, 0], name = '') {
  return mesh(group, new THREE.TorusGeometry(radius, tube, 10, 36), material, position, rotation, [1, 1, 1], name)
}

function base(group, colorMaterial = materials.sand) {
  cylinder(group, 1.24, 1.38, 0.22, [0, 0.11, 0], colorMaterial, [0, 0, 0], 36, 'asset-plinth')
  torus(group, 1.24, 0.035, [0, 0.25, 0], materials.brass, [Math.PI / 2, 0, 0], 'plinth-rim')
}

function addBookStack(group, x = 0.62, z = -0.5) {
  box(group, [0.62, 0.12, 0.46], [x, 0.38, z], materials.cream, [0, 0.15, 0], 'book-pages')
  box(group, [0.66, 0.1, 0.5], [x, 0.5, z], materials.red, [0, 0.15, 0], 'book-cover')
  box(group, [0.52, 0.1, 0.4], [x - 0.08, 0.62, z + 0.02], materials.blue, [0, -0.05, 0], 'book-cover-small')
}

function trojanProgram() {
  const g = new THREE.Group()
  base(g, materials.clay)
  roundedBox(g, [1.72, 0.55, 0.62], [-0.1, 1.05, 0], materials.wood, [0, 0, 0], 0.12, 'trojan-body')
  roundedBox(g, [0.52, 0.44, 0.5], [0.96, 1.48, 0], materials.wood, [0, 0, 0], 0.08, 'trojan-head')
  cylinder(g, 0.14, 0.16, 0.66, [0.62, 1.3, 0], materials.wood, [0, 0, -0.6], 12, 'trojan-neck')
  roundedBox(g, [0.56, 0.28, 0.44], [-1.02, 1.04, 0], materials.darkWood, [0, 0, 0], 0.04, 'hidden-hatch')
  ;[-0.74, -0.22, 0.34, 0.74].forEach((x, index) => {
    cylinder(g, 0.06, 0.08, 0.72, [x, 0.59, index % 2 ? 0.18 : -0.18], materials.darkWood, [0, 0, 0], 10, 'trojan-leg')
  })
  ;[-0.68, 0.72].forEach((x) => {
    torus(g, 0.21, 0.045, [x, 0.32, 0.36], materials.ink, [Math.PI / 2, 0, 0], 'trojan-wheel')
    torus(g, 0.21, 0.045, [x, 0.32, -0.36], materials.ink, [Math.PI / 2, 0, 0], 'trojan-wheel')
  })
  box(g, [0.08, 1.0, 0.08], [-0.28, 1.83, 0], materials.darkWood, [0, 0, 0.32], 'program-pole')
  torus(g, 0.22, 0.035, [-0.6, 2.22, 0], materials.amber, [Math.PI / 2, 0, 0], 'loop-trigger')
  ;[-0.34, -0.1, 0.14].forEach((x, index) => {
    box(g, [0.18, 0.08, 0.16], [x, 1.45 + index * 0.1, 0.42], index % 2 ? materials.teal : materials.amber, [0.2, 0, 0.08], 'code-block')
  })
  addBookStack(g, 0.38, -0.52)
  return g
}

function sensitivityGreenhouse() {
  const g = new THREE.Group()
  base(g, materials.green)
  cylinder(g, 0.86, 0.96, 0.16, [0, 0.36, 0], materials.greenDark, [0, 0, 0], 28, 'greenhouse-floor')
  mesh(g, new THREE.SphereGeometry(0.9, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), materials.glass, [0, 0.47, 0], [0, 0, 0], [1, 0.95, 1], 'glass-dome')
  ;[0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach((a) => {
    cylinder(g, 0.025, 0.025, 1.38, [Math.cos(a) * 0.66, 0.9, Math.sin(a) * 0.66], materials.white, [0, 0, 0], 8, 'greenhouse-frame')
  })
  torus(g, 0.68, 0.025, [0, 0.58, 0], materials.white, [Math.PI / 2, 0, 0], 'greenhouse-ring')
  cylinder(g, 0.08, 0.12, 0.62, [0, 0.72, 0], materials.bark, [0, 0, 0], 10, 'plant-stem')
  cone(g, 0.42, 0.78, [0, 1.28, 0], materials.green, [0, 0, 0], 18, 'soft-plant')
  cone(g, 0.32, 0.58, [0, 1.62, 0], materials.green, [0, 0, 0], 18, 'soft-plant-top')
  cylinder(g, 0.035, 0.04, 0.76, [0.82, 0.76, -0.25], materials.darkWood, [0, 0, 0], 8, 'small-lamp-post')
  sphere(g, 0.17, [0.82, 1.18, -0.25], materials.amber, [1, 0.75, 1], 16, 'small-lamp')
  addBookStack(g, -0.62, -0.46)
  return g
}

function dialogueTable() {
  const g = new THREE.Group()
  base(g, materials.teal)
  cylinder(g, 0.72, 0.72, 0.18, [0, 1.0, 0], materials.wood, [0, 0, 0], 32, 'round-table')
  cylinder(g, 0.1, 0.13, 0.66, [0, 0.64, 0], materials.darkWood, [0, 0, 0], 12, 'table-leg')
  ;[-0.82, 0.82].forEach((x) => {
    roundedBox(g, [0.46, 0.44, 0.42], [x, 0.68, 0.32], materials.teal, [0, x > 0 ? -0.28 : 0.28, 0], 0.07, 'dialogue-chair')
    box(g, [0.5, 0.1, 0.42], [x, 0.98, 0.32], materials.darkWood, [0, x > 0 ? -0.28 : 0.28, 0], 'chair-back')
  })
  ;[-0.36, -0.12, 0.12, 0.36].forEach((x, index) => {
    sphere(g, 0.09, [x, 1.15, 0.02], index % 2 ? materials.amber : materials.green, [1, 1, 1], 12, 'four-step-token')
  })
  box(g, [1.6, 0.12, 0.34], [0, 0.44, -0.72], materials.brass, [0, 0, 0], 'connection-bridge')
  addBookStack(g, 0, -0.38)
  return g
}

function dualClockDecision() {
  const g = new THREE.Group()
  base(g, materials.blue)
  ;[-0.48, 0.48].forEach((x, index) => {
    cylinder(g, 0.48, 0.48, 0.12, [x, 1.28, 0], index ? materials.brass : materials.white, [Math.PI / 2, 0, 0], 32, 'clock-face')
    torus(g, 0.48, 0.035, [x, 1.28, 0.07], materials.ink, [Math.PI / 2, 0, 0], 'clock-rim')
    box(g, [0.035, 0.42, 0.035], [x, 1.28, 0.16], materials.ink, [0, 0, index ? 1.1 : -0.45], 'clock-hand-long')
    box(g, [0.035, 0.3, 0.035], [x, 1.28, 0.18], materials.ink, [0, 0, index ? -0.42 : 0.72], 'clock-hand-short')
  })
  box(g, [1.5, 0.16, 0.28], [0, 0.83, 0], materials.ink, [0, 0, 0], 'system-switch')
  ;[-0.54, 0, 0.54].forEach((x, index) => {
    box(g, [0.36, 0.08, 0.22], [x, 0.5, 0.52 + Math.abs(x) * 0.2], index === 1 ? materials.amber : materials.blue, [0, x * 0.4, 0], 'decision-path')
  })
  addBookStack(g, 0, -0.48)
  return g
}

function stairTowerGrowth() {
  const g = new THREE.Group()
  base(g, materials.stone)
  ;[0, 1, 2, 3, 4].forEach((step) => {
    box(g, [0.62, 0.24, 0.62], [-0.9 + step * 0.42, 0.45 + step * 0.22, 0], materials.stone, [0, 0.18, 0], 'growth-step')
  })
  cylinder(g, 0.32, 0.44, 1.62, [0.9, 1.08, 0], materials.clay, [0, 0, 0], 18, 'tower-body')
  cone(g, 0.5, 0.48, [0.9, 2.12, 0], materials.red, [0, 0, 0], 18, 'tower-roof')
  box(g, [0.08, 0.9, 0.06], [1.22, 1.98, 0], materials.ink, [0, 0, -0.08], 'flagpole')
  box(g, [0.48, 0.24, 0.04], [1.42, 2.18, 0], materials.amber, [0, 0, -0.08], 'flag')
  addBookStack(g, -0.62, -0.52)
  return g
}

function practiceWorkbench() {
  const g = new THREE.Group()
  base(g, materials.clay)
  roundedBox(g, [1.78, 0.18, 0.78], [0, 0.98, 0], materials.wood, [0, 0, 0], 0.06, 'practice-table')
  ;[-0.66, 0.66].forEach((x) => cylinder(g, 0.06, 0.08, 0.72, [x, 0.58, -0.24], materials.darkWood, [0, 0, 0], 8, 'table-leg'))
  cylinder(g, 0.04, 0.04, 0.7, [-0.52, 1.3, 0.06], materials.ink, [0.9, 0.2, 0.9], 8, 'tool-handle')
  box(g, [0.3, 0.1, 0.18], [-0.74, 1.47, 0.08], materials.stoneDark, [0, 0.4, 0.1], 'tool-head')
  cylinder(g, 0.04, 0.04, 0.62, [0.42, 1.28, 0.04], materials.ink, [0.9, 0, -0.75], 8, 'second-tool')
  cone(g, 0.17, 0.28, [0.65, 1.47, 0.08], materials.stoneDark, [0, 0, -0.5], 12, 'pick-head')
  ;[-0.36, 0, 0.36].forEach((x, index) => {
    box(g, [0.24, 0.14, 0.28], [x, 1.2, -0.18], index % 2 ? materials.blue : materials.cream, [0, 0.12, 0], 'practice-card')
  })
  addBookStack(g, -0.08, 1.0)
  return g
}

function careLighthouse() {
  const g = new THREE.Group()
  base(g, materials.teal)
  cylinder(g, 0.34, 0.48, 1.74, [-0.32, 1.1, 0], materials.white, [0, 0, 0], 20, 'lighthouse-body')
  cylinder(g, 0.36, 0.46, 0.16, [-0.32, 0.62, 0], materials.red, [0, 0, 0], 20, 'lighthouse-band')
  cylinder(g, 0.3, 0.38, 0.16, [-0.32, 1.15, 0], materials.red, [0, 0, 0], 20, 'lighthouse-band')
  cylinder(g, 0.24, 0.24, 0.26, [-0.32, 2.05, 0], materials.amber, [0, 0, 0], 18, 'lantern-room')
  cone(g, 0.44, 0.42, [-0.32, 2.42, 0], materials.red, [0, 0, 0], 18, 'lighthouse-roof')
  cone(g, 0.28, 1.4, [-0.92, 2.05, 0], materials.beam, [0, 0, Math.PI / 2], 18, 'light-beam')
  roundedBox(g, [0.9, 0.54, 0.72], [0.72, 0.7, 0.08], materials.teal, [0, 0, 0], 0.06, 'care-house')
  cone(g, 0.7, 0.42, [0.72, 1.18, 0.08], materials.ink, [0, Math.PI / 4, 0], 4, 'care-house-roof')
  box(g, [1.15, 0.08, 0.34], [0.42, 0.42, 0.72], materials.wood, [0, 0, 0], 'dock')
  addBookStack(g, 0.38, -0.52)
  return g
}

function bridgeDoorBoundary() {
  const g = new THREE.Group()
  base(g, materials.teal)
  box(g, [1.9, 0.16, 0.42], [-0.24, 0.7, 0.1], materials.wood, [0, 0, 0], 'boundary-bridge')
  ;[-0.78, -0.28, 0.22].forEach((x) => box(g, [0.12, 0.82, 0.12], [x, 0.42, 0.1], materials.darkWood, [0, 0, 0], 'bridge-support'))
  box(g, [0.26, 1.34, 0.22], [0.78, 1.02, -0.32], materials.teal, [0, -0.18, 0], 'door-post-left')
  box(g, [0.26, 1.34, 0.22], [1.32, 1.02, -0.32], materials.teal, [0, -0.18, 0], 'door-post-right')
  box(g, [0.78, 0.24, 0.24], [1.05, 1.68, -0.32], materials.teal, [0, -0.18, 0], 'door-top')
  torus(g, 0.09, 0.018, [0.92, 1.02, -0.15], materials.amber, [Math.PI / 2, 0, 0], 'door-knob-ring')
  addBookStack(g, -0.58, -0.48)
  return g
}

function compassPath() {
  const g = new THREE.Group()
  base(g, materials.sand)
  cylinder(g, 0.76, 0.76, 0.1, [0, 0.86, 0], materials.cream, [0, 0, 0], 40, 'compass-face')
  torus(g, 0.76, 0.035, [0, 0.93, 0], materials.ink, [Math.PI / 2, 0, 0], 'compass-rim')
  cone(g, 0.14, 0.9, [0, 1.0, -0.08], materials.red, [Math.PI / 2, 0, 0], 3, 'compass-needle-red')
  cone(g, 0.14, 0.82, [0, 0.98, 0.08], materials.blue, [-Math.PI / 2, 0, 0], 3, 'compass-needle-blue')
  ;[-0.84, -0.34, 0.18, 0.7].forEach((x, index) => {
    box(g, [0.38, 0.08, 0.24], [x, 0.42, -0.72 + index * 0.34], index % 2 ? materials.clay : materials.brass, [0, 0.36, 0], 'path-stone')
  })
  addBookStack(g, 0.68, 0.42)
  return g
}

function mirrorLampSelf() {
  const g = new THREE.Group()
  base(g, materials.blue)
  torus(g, 0.56, 0.055, [-0.36, 1.34, 0], materials.brass, [Math.PI / 2, 0, 0], 'mirror-frame')
  cylinder(g, 0.48, 0.48, 0.035, [-0.36, 1.34, 0.02], materials.glass, [Math.PI / 2, 0, 0], 32, 'mirror-glass')
  cylinder(g, 0.06, 0.08, 0.9, [-0.36, 0.82, 0], materials.darkWood, [0, 0, 0], 10, 'mirror-stand')
  cylinder(g, 0.06, 0.08, 0.9, [0.74, 0.92, 0], materials.darkWood, [0, 0, 0], 10, 'lamp-stand')
  sphere(g, 0.2, [0.74, 1.46, 0], materials.amber, [1, 0.8, 1], 16, 'lamp-light')
  cone(g, 0.38, 0.42, [0.74, 1.65, 0], materials.teal, [0, 0, 0], 18, 'lamp-shade')
  addBookStack(g, 0.06, -0.54)
  return g
}

const assets = [
  ['trojan-program.glb', trojanProgram],
  ['sensitivity-greenhouse.glb', sensitivityGreenhouse],
  ['dialogue-table.glb', dialogueTable],
  ['dual-clock-decision.glb', dualClockDecision],
  ['stair-tower-growth.glb', stairTowerGrowth],
  ['practice-workbench.glb', practiceWorkbench],
  ['care-lighthouse.glb', careLighthouse],
  ['bridge-door-boundary.glb', bridgeDoorBoundary],
  ['compass-path.glb', compassPath],
  ['mirror-lamp-self.glb', mirrorLampSelf],
]

async function exportAsset(filename, createScene) {
  const scene = new THREE.Scene()
  const root = createScene()
  root.name = filename.replace('.glb', '')
  scene.add(root)
  const result = await exporter.parseAsync(scene, {
    binary: true,
    trs: false,
    onlyVisible: true,
  })
  await fs.writeFile(path.join(outputDir, filename), Buffer.from(result))
}

await fs.mkdir(outputDir, { recursive: true })
for (const [filename, createScene] of assets) {
  await exportAsset(filename, createScene)
  console.log(`wrote ${filename}`)
}
