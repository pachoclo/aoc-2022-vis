import {
  AmbientLight,
  AxesHelper,
  BoxGeometry,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PointLight,
  Scene,
  WebGLRenderer,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { resizeRendererToDisplaySize } from './helpers/responsiveness'
import './style.css'
import { parseCubes } from './day-18/logic'

const CANVAS_ID = 'scene'

// GLOBALS
let camera: PerspectiveCamera
let cameraControls: OrbitControls
let renderer: WebGLRenderer
let scene: Scene
let stats: Stats
let axesHelper: AxesHelper

init()

animate()

function init() {
  // CANVAS, RENDERER, & SCENE
  const canvas: HTMLElement = document.querySelector(`canvas#${CANVAS_ID}`)!
  renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  scene = new Scene()

  // LIGHTS
  const ambientLight = new AmbientLight('white', 0.5)
  const pointLight = new PointLight('#ffdca8', 1.2, 100)
  ambientLight.position.z = 10
  pointLight.position.set(-10, 10, 10)
  scene.add(ambientLight)
  scene.add(pointLight)

  // CAMERA
  camera = new PerspectiveCamera(50, 2, 0.1, 400)
  cameraControls = new OrbitControls(camera, canvas)
  camera.position.set(0, 0, 10)
  cameraControls.autoRotate = true
  cameraControls.autoRotateSpeed = 3
  cameraControls.update()

  // HELPERS
  axesHelper = new AxesHelper(10)
  scene.add(axesHelper)

  // STATS
  stats = Stats()
  document.body.appendChild(stats.dom)

  // OBJECTS
  const sideLength = 1
  const cubeGeometry = new BoxGeometry(sideLength, sideLength, sideLength)
  const cubeMaterial = new MeshStandardMaterial({
    color: 'orange',
    roughness: 1,
  })
  const cubes = parseCubes()
  for (const cube of cubes) {
    const { x, y, z } = cube
    const cubeMesh = new Mesh(cubeGeometry, cubeMaterial)
    cubeMesh.position.set(x, y, z)
    scene.add(cubeMesh)
  }
}

function animate() {
  requestAnimationFrame(animate)

  stats.update()

  // cameraControls.update()

  if (resizeRendererToDisplaySize(renderer)) {
    // responsiveness
    const canvas = renderer.domElement
    camera.aspect = canvas.clientWidth / canvas.clientHeight
    camera.updateProjectionMatrix()
  }

  renderer.render(scene, camera)
}
