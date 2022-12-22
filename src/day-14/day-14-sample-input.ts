import {
  AmbientLight,
  BoxGeometry,
  Clock,
  DodecahedronGeometry,
  GridHelper,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PointLight,
  Scene,
  WebGLRenderer,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { resizeRendererToDisplaySize } from '../helpers/responsiveness'
import { sampleInput } from './input'
import '../style.css'

type Coordinates = { x: number; y: number }

let wallPaths: Coordinates[][] = sampleInput.split('\n').map((line) =>
  line
    .split(' -> ')
    .map((s) => s.split(',').map((c) => Number.parseInt(c)))
    .map(([x, y]) => ({ x, y }))
)

// Fill-in missing wall blocks

let allWallBlocks: Coordinates[] = wallPaths.flatMap((wallPath) => {
  let temp: Coordinates[] = []

  for (let i = 0, k = 1; k < wallPath.length; i++, k++) {
    const { x: xA, y: yA } = wallPath[i]
    const { x: xB, y: yB } = wallPath[k]

    const hDiff = xA - xB
    const vDiff = yA - yB

    let hDirection: 'right' | 'left' = 'right'
    let vDirection: 'up' | 'down' = 'down'

    if (hDiff > 0) {
      hDirection = 'left'
    }

    if (vDiff > 0) {
      vDirection = 'up'
    }

    let fillIn = []

    for (let i = 1; i < Math.abs(hDiff); i++) {
      let newX = hDirection === 'right' ? xA + i : xA - i
      fillIn.push({ x: newX, y: yA })
    }

    for (let i = 1; i < Math.abs(vDiff); i++) {
      let newY = vDirection === 'down' ? yA + i : yA - i
      fillIn.push({ x: xA, y: newY })
    }

    temp.push(wallPath[i], ...fillIn, wallPath[k])
  }

  return temp
})

let allOccupiedBlocks = new Set(allWallBlocks.map((coords) => `${coords.x},${coords.y}`))

let xSorted = wallPaths.flat(1).sort(({ x: xA }, { x: xB }) => xB - xA)
let ySorted = wallPaths.flat(1).sort(({ y: yA }, { y: yB }) => yB - yA)

let minX = xSorted.at(-1)!.x
let maxX = xSorted[0].x
let minY = 0
let maxY = ySorted[0].y

let gridWidth = maxX - minX + 1
let gridHeight = maxY - minY + 1

const CANVAS_ID = 'scene'

const cubeGeometry = new BoxGeometry(0.9, 0.9, 0.9)
const cubeMaterial = new MeshStandardMaterial({
  color: 'DarkSlateBlue',
  roughness: 0.5,
})

function makeCube() {
  const cube = new Mesh(cubeGeometry, cubeMaterial)
  return cube
}

const ambientLight = new AmbientLight('white', 0.5)
const pointLight = new PointLight('#ffdca8', 1.3, 100)

const camera = new PerspectiveCamera(50, 2, 0.1, 400)

const canvas: HTMLElement = document.querySelector(`canvas#${CANVAS_ID}`)!

const cameraControls = new OrbitControls(camera, canvas)
cameraControls.autoRotate = true
cameraControls.autoRotateSpeed = 2

const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
renderer.setPixelRatio(window.devicePixelRatio)

const clock = new Clock()

const scene = new Scene()

const stats = Stats()

const gridHelper = new GridHelper(
  Math.max(gridHeight, gridWidth),
  Math.max(gridHeight, gridWidth),
  'DarkSlateBlue',
  'DarkSlateBlue'
)

const sandMaterial = new MeshStandardMaterial({ color: 'orange', roughness: 1 })
const sandGeometry = new DodecahedronGeometry(0.35)

function makeSandGrain({ x, y }: Coordinates) {
  const sandGrain = new Mesh(sandGeometry, sandMaterial)
  sandGrain.position.set(x - minX + 0.5, -y - 0.5, 0.5)
  sandGrain.rotateY(Math.PI / (Math.random() * 4))
  return sandGrain
}

let lastTick = clock.getElapsedTime()

type SandGrain = Mesh<DodecahedronGeometry, MeshStandardMaterial>
let sandGrain: SandGrain = makeSandGrain({ x: 500, y: 0 })

init()
animate()

function init() {
  scene.add(sandGrain)

  // position and rotate assets
  gridHelper.rotateX(Math.PI / 2)
  gridHelper.position.set(
    Math.max(gridHeight, gridWidth) / 2,
    -Math.max(gridHeight, gridWidth) / 2,
    0
  )
  pointLight.position.set(0, -5, 20)

  const wallCubes = allWallBlocks.map(({ x, y }) => {
    let cube = makeCube()
    let gridX = x - minX
    let gridY = -y
    cube.position.set(gridX + 0.5, gridY - 0.5, 0.5)
    return cube
  })

  // add lights to scene
  scene.add(ambientLight)
  scene.add(pointLight)

  // add objects to scene
  // scene.add(gridHelper)
  wallCubes.forEach((cube) => scene.add(cube))

  // CAMERA
  camera.position.set(
    gridWidth / 2,
    -(gridHeight / 5),
    Math.max(gridHeight, gridWidth) * 1.7
  )
  cameraControls.target.setX(gridWidth / 2)
  cameraControls.target.setY(-(gridHeight / 2))
  cameraControls.update()

  // stats
  document.body.appendChild(stats.dom)

  clock.getElapsedTime()
}

function attemptToMove(sandGrain: SandGrain) {
  let down: Coordinates = {
    x: sandGrain.position.x,
    y: sandGrain.position.y - 1,
  }
  let downLeft: Coordinates = {
    x: sandGrain.position.x - 1,
    y: sandGrain.position.y - 1,
  }
  let downRight: Coordinates = {
    x: sandGrain.position.x + 1,
    y: sandGrain.position.y - 1,
  }

  const convertToGridCoordinates = ({ x, y }: Coordinates) => ({
    x: Math.floor(x + minX),
    y: Math.floor(-y),
  })

  if (sandGrain.position.y < -maxY - 4) {
    // sand is falling to abyss
    scene.remove(sandGrain)
    return false
  }

  if (
    !allOccupiedBlocks.has(
      `${convertToGridCoordinates(down).x},${convertToGridCoordinates(down).y}`
    )
  ) {
    sandGrain.position.set(down.x, down.y, sandGrain.position.z)
    return true
  }

  if (
    !allOccupiedBlocks.has(
      `${convertToGridCoordinates(downLeft).x},${convertToGridCoordinates(downLeft).y}`
    )
  ) {
    sandGrain.position.set(downLeft.x, downLeft.y, sandGrain.position.z)
    return true
  }

  if (
    !allOccupiedBlocks.has(
      `${convertToGridCoordinates(downRight).x},${convertToGridCoordinates(downRight).y}`
    )
  ) {
    sandGrain.position.set(downRight.x, downRight.y, sandGrain.position.z)
    return true
  }

  allOccupiedBlocks.add(
    `${convertToGridCoordinates(sandGrain.position).x},${
      convertToGridCoordinates(sandGrain.position).y
    }`
  )

  return false
}

function animate() {
  requestAnimationFrame(animate)

  stats.update()

  if (clock.getElapsedTime() > lastTick + 0.0001) {
    lastTick = clock.getElapsedTime()

    if (!attemptToMove(sandGrain)) {
      sandGrain = makeSandGrain({ x: 500, y: 0 })
      scene.add(sandGrain)
    }
  }

  cameraControls.update()

  if (resizeRendererToDisplaySize(renderer)) {
    // responsiveness
    const canvas = renderer.domElement
    camera.aspect = canvas.clientWidth / canvas.clientHeight
    camera.updateProjectionMatrix()
  }

  renderer.render(scene, camera)
}
