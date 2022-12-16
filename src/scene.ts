import {
  AmbientLight,
  BasicShadowMap,
  BoxGeometry,
  Clock,
  GridHelper,
  Mesh,
  MeshLambertMaterial,
  OrthographicCamera,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Scene,
  WebGLRenderer,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { resizeRendererToDisplaySize } from './helpers/responsiveness'
import './style.css'
import Stats from 'three/examples/jsm/libs/stats.module'

const CANVAS_ID = 'scene'

const gridHeight = 10
const gridWidth = 10

const cubeGeometry = new BoxGeometry(0.8, 0.8, 0.8)
const cubeMaterial = new MeshLambertMaterial({ color: 'bluegray' })

function makeCube() {
  const cube = new Mesh(cubeGeometry, cubeMaterial)
  cube.castShadow = true
  cube.receiveShadow = true
  return cube
}

const cubeGrid = Array(gridHeight)
  .fill(null)
  .map((_) => Array(gridWidth).fill(null).map(makeCube))

const planeGeometry = new PlaneGeometry(gridWidth + 2, gridHeight + 2)
const planeMaterial = new MeshLambertMaterial({
  color: 'gray',
  emissive: 'teal',
  emissiveIntensity: 0.2,
  side: 2,
})
const plane = new Mesh(planeGeometry, planeMaterial)
const gridColor = 'hotpink'
const grid = new GridHelper(10, 10, gridColor, gridColor)

const ambientLight = new AmbientLight('white', 0.5)
const pointLight = new PointLight('#ffdca8', 0.8, 100)

const camera = new PerspectiveCamera(50, 2, 0.1, 400)

const canvas: HTMLElement = document.querySelector(`canvas#${CANVAS_ID}`)!

const cameraControls = new OrbitControls(camera, canvas)

const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
renderer.setPixelRatio(window.devicePixelRatio)

// const clock = new Clock()

const scene = new Scene()

const stats = Stats()

init()

animate()

function init() {
  // position and rotation
  pointLight.position.set(-5, 3, 4)
  grid.rotateX(Math.PI / 2)
  cubeGrid.forEach((row, r) =>
    row.forEach((cube, c) => cube.position.set(c + 0.5, -r - 0.5, 0.5))
  )
  camera.position.set(gridHeight / 2, -(gridHeight / 2), gridHeight * 1.5)
  plane.translateX(gridWidth / 2)
  plane.translateY(-gridHeight / 2)
  grid.translateX(gridWidth / 2)
  grid.translateZ(gridWidth / 2)
  grid.translateY(0.1)

  // shadows
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = BasicShadowMap
  pointLight.castShadow = true
  pointLight.shadow.radius = 4
  pointLight.shadow.camera.near = 0.1
  pointLight.shadow.mapSize.width = 2000
  pointLight.shadow.mapSize.height = 2000
  plane.receiveShadow = true

  // add objects and lights to scene
  scene.add(grid)
  scene.add(plane)
  scene.add(ambientLight)
  scene.add(pointLight)
  cubeGrid.forEach((row) => row.forEach((cube) => scene.add(cube)))

  // set camera looking at origin
  cameraControls.target.setX(gridWidth / 2)
  cameraControls.target.setY(-(gridHeight / 2))
  cameraControls.update()

  // stats
  document.body.appendChild(stats.dom)
}

function animate() {
  requestAnimationFrame(animate)

  stats.update()

  // animation

  // responsiveness
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement
    camera.aspect = canvas.clientWidth / canvas.clientHeight
    camera.updateProjectionMatrix()
  }

  renderer.render(scene, camera)
}
