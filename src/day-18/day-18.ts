import {
  AmbientLight,
  AxesHelper,
  Box3,
  Box3Helper,
  BoxGeometry,
  BoxHelper,
  Clock,
  Group,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PointLight,
  PointLightHelper,
  Scene,
  WebGLRenderer,
  WireframeGeometry,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { resizeRendererToDisplaySize } from '../helpers/responsiveness'
import '../style.css'
import { calculateBoundingBox, parseCubes as parseCubesFromInput } from './logic'

const CANVAS_ID = 'scene'

let canvas: HTMLElement
let renderer: WebGLRenderer
let scene: Scene
let stats: Stats
let pointLight: PointLight
let pointLightTwo: PointLight
let axesHelper: AxesHelper
let bBoxHelper: Box3Helper
let cubeGroup: Group
let camera: PerspectiveCamera
let cameraControls: OrbitControls
let pointLightHelper: PointLightHelper
let pointLightHelperTwo: PointLightHelper
let clock: Clock

init()
animate()

function init() {
  // ===== 🖼️ CANVAS, RENDERER, & SCENE =====
  {
    scene = new Scene()
    canvas = document.querySelector(`canvas#${CANVAS_ID}`)!
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
  }

  // ===== 💡 LIGHTS =====
  {
    const ambientLight = new AmbientLight('white', 0.5)
    ambientLight.position.z = 10

    pointLight = new PointLight('#ffdca8', 1.2, 100)
    pointLight.position.set(50, 20, 10)

    pointLightTwo = new PointLight('#ffdca8', 1.2, 100)
    pointLightTwo.position.set(-40, 20, 10)

    scene.add(ambientLight)
    scene.add(pointLight)
    scene.add(pointLightTwo)
  }

  // ===== 📦 OBJECTS =====
  {
    const sideLength = 1
    const cubeGeometry = new BoxGeometry(sideLength, sideLength, sideLength)
    const cubeMaterial = new MeshStandardMaterial({
      color: 'orange',
      roughness: 1,
    })

    const cubes = parseCubesFromInput()

    cubeGroup = new Group()

    for (const cube of cubes) {
      const { x, y, z } = cube
      const cubeMesh = new Mesh(cubeGeometry, cubeMaterial)
      cubeMesh.position.set(x, y, z)
      cubeGroup.add(cubeMesh)
      scene.add(cubeGroup)
    }

    const boundaries = calculateBoundingBox(cubes)

    boundaries.forEach(({ x, y, z }) => {
      const cubeGeometry = new BoxGeometry(
        sideLength + 0.1,
        sideLength + 0.1,
        sideLength + 0.1
      )
      const cubeMaterial = new MeshStandardMaterial({ color: 'red', roughness: 0.7 })
      const cubeMesh = new Mesh(cubeGeometry, cubeMaterial)

      cubeMesh.position.set(x, y, z)
      cubeMesh.position.set(x, y, z)

      cubeGroup.add(cubeMesh)
    })
  }

  //  ===== 🎥 CAMERA =====
  {
    camera = new PerspectiveCamera(50, 2, 0.1, 400)
    camera.position.set(30, 30, 30)
  }

  //  ===== 🕹️ CONTROLS =====
  {
    cameraControls = new OrbitControls(camera, canvas)
    cameraControls.autoRotateSpeed = 4
    cameraControls.autoRotate = true
    cameraControls.update()
  }

  // ===== 🪄 HELPERS =====
  {
    axesHelper = new AxesHelper(10)
    pointLightHelper = new PointLightHelper(pointLight, undefined, 'blue')
    pointLightHelperTwo = new PointLightHelper(pointLightTwo, undefined, 'red')
    bBoxHelper = new Box3Helper(new Box3().setFromObject(cubeGroup, true))

    pointLightHelper.visible = false
    pointLightHelperTwo.visible = false
    bBoxHelper.visible = false

    cubeGroup.add(bBoxHelper)

    scene.add(axesHelper)
    scene.add(pointLightHelper)
    scene.add(pointLightHelperTwo)
  }

  // ===== 📈 STATS & CLOCK =====
  {
    clock = new Clock()
    stats = Stats()

    // document.body.appendChild(stats.dom)
  }
}

function animate() {
  requestAnimationFrame(animate)

  stats.update()

  cameraControls.target.set(
    bBoxHelper.position.x,
    bBoxHelper.position.y,
    bBoxHelper.position.z
  )
  cameraControls.update()

  if (resizeRendererToDisplaySize(renderer)) {
    // responsiveness
    const canvas = renderer.domElement
    camera.aspect = canvas.clientWidth / canvas.clientHeight
    camera.updateProjectionMatrix()
  }

  renderer.render(scene, camera)
}
