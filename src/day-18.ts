import {
  AmbientLight,
  AxesHelper,
  Box3Helper,
  BoxGeometry,
  Clock,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PointLight,
  Scene,
  WebGLRenderer,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { bounce } from './animations'
import { calculateBoundingBox, parseCubes } from './day-18/logic'
import { resizeRendererToDisplaySize } from './helpers/responsiveness'
import './style.css'

const CANVAS_ID = 'scene'

// GLOBALS
let camera: PerspectiveCamera
let cameraControls: OrbitControls
let renderer: WebGLRenderer
let scene: Scene
let stats: Stats
let axesHelper: AxesHelper
// let bBoxHelper: Box3Helper
let cubeGroup: Group
let clock: Clock

init()

animate()

function init() {
  // ===== CANVAS, RENDERER, & SCENE ======

  const canvas: HTMLElement = document.querySelector(`canvas#${CANVAS_ID}`)!
  renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  scene = new Scene()

  // ===== LIGHTS =====

  const ambientLight = new AmbientLight('white', 0.5)
  const pointLight = new PointLight('#ffdca8', 1.2, 100)
  const pointLightTwo = new PointLight('#ffdca8', 1.2, 100)
  ambientLight.position.z = 10
  pointLight.position.set(50, 0, 10)
  pointLightTwo.position.set(0, 50, 0)
  scene.add(ambientLight)
  scene.add(pointLight)
  scene.add(pointLightTwo)

  // ===== STATS =====

  stats = Stats()
  document.body.appendChild(stats.dom)

  // ===== OBJECTS =====
  const sideLength = 1
  const cubeGeometry = new BoxGeometry(sideLength, sideLength, sideLength)
  const cubeMaterial = new MeshStandardMaterial({
    color: 'orange',
    roughness: 1,
  })

  const cubes = parseCubes()

  cubeGroup = new Group()
  for (const cube of cubes) {
    const { x, y, z } = cube
    const cubeMesh = new Mesh(cubeGeometry, cubeMaterial)
    cubeMesh.position.set(x, y, z)
    cubeGroup.add(cubeMesh)
  }
  scene.add(cubeGroup)

  const boundaries = calculateBoundingBox(cubes)

  boundaries.forEach(({ x, y, z }) => {
    const cubeGeometry = new BoxGeometry(1.5, 1.5, 1.5)
    const cubeMaterial = new MeshStandardMaterial({
      color: 'red',
      roughness: 0.4,
    })
    const cubeMesh = new Mesh(cubeGeometry, cubeMaterial)
    cubeMesh.position.set(x, y, z)
    scene.add(cubeMesh)
  })

  //  ===== CAMERA =====

  camera = new PerspectiveCamera(50, 2, 0.1, 400)
  cameraControls = new OrbitControls(camera, canvas)
  camera.position.set(30, 30, 30)
  // cameraControls.autoRotate = true
  cameraControls.autoRotateSpeed = 10
  cameraControls.update()

  // ===== HELPERS =====

  axesHelper = new AxesHelper(10)
  // bBoxHelper = new Box3Helper()
  scene.add(axesHelper)

  //  ===== CLOCK =====
  clock = new Clock()
}

function animate() {
  requestAnimationFrame(animate)

  stats.update()

  // animation
  bounce(cubeGroup, clock, 0.2, 3)

  cameraControls.target.set(
    cubeGroup.position.x,
    cubeGroup.position.y,
    cubeGroup.position.z
  )
  cameraControls.update()
  // camera.lookAt(cubeGroup.position)
  // camera.updateProjectionMatrix()

  if (resizeRendererToDisplaySize(renderer)) {
    // responsiveness
    const canvas = renderer.domElement
    camera.aspect = canvas.clientWidth / canvas.clientHeight
    camera.updateProjectionMatrix()
  }

  renderer.render(scene, camera)
}
