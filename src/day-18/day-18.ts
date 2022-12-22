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
  Material,
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
import { bounce } from '../animations'
import { resizeRendererToDisplaySize } from '../helpers/responsiveness'
import '../style.css'
import { calculateBoundingBox, parseCubes as parseCubesFromInput } from './logic'

const CANVAS_ID = 'scene'

// GLOBALS
let canvas: HTMLElement
let renderer: WebGLRenderer
let scene: Scene
let stats: Stats
let pointLight: PointLight
let axesHelper: AxesHelper
let bBoxHelper: Box3Helper
let cubeGroup: Group
let camera: PerspectiveCamera
let cameraControls: OrbitControls
let pointLightHelper: PointLightHelper
let clock: Clock

init()

animate()

function init() {
  // ===== 🖼️ CANVAS, RENDERER, & SCENE =====
  {
    canvas = document.querySelector(`canvas#${CANVAS_ID}`)!
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    scene = new Scene()
  }

  // ===== 💡 LIGHTS =====
  {
    const ambientLight = new AmbientLight('white', 0.5)
    ambientLight.position.z = 10
    pointLight = new PointLight('#ffdca8', 1.2, 100)
    pointLight.position.set(50, 20, 10)
    const pointLightTwo = new PointLight('#ffdca8', 1.2, 100)
    pointLightTwo.position.set(-50, -10, 0)
    scene.add(ambientLight)
    scene.add(pointLight)
    scene.add(pointLightTwo)
  }

  // ===== 📦 OBJECTS =====
  {
    const sideLength = 0.95
    const cubeGeometry = new BoxGeometry(sideLength, sideLength, sideLength)
    const cubeMaterial = new MeshStandardMaterial({
      color: 'orange',
      roughness: 1,
    })

    cubeGroup = new Group()
    const cubes = parseCubesFromInput()

    for (const cube of cubes) {
      const { x, y, z } = cube

      const cubeMesh = new Mesh(cubeGeometry, cubeMaterial)
      cubeMesh.position.set(x, y, z)
      // cubeGroup.add(cubeMesh)

      const wireframe = new WireframeGeometry(cubeMesh.geometry)
      const lines = new LineSegments(wireframe)
      const boxHelper = new BoxHelper(lines, 'black')
      boxHelper.position.set(x, y, z)
      boxHelper.updateMatrix()
      scene.add(boxHelper)

      scene.add(cubeGroup)
    }

    const boundaries = calculateBoundingBox(cubes)

    boundaries.forEach(({ x, y, z }) => {
      const cubeGeometry = new BoxGeometry(sideLength, sideLength, sideLength)
      const cubeMaterial = new MeshStandardMaterial({
        color: 'red',
        roughness: 0.7,
      })
      const cubeMesh = new Mesh(cubeGeometry, cubeMaterial)
      cubeMesh.position.set(x, y, z)
      cubeGroup.add(cubeMesh)
      const wireframe = new WireframeGeometry(cubeMesh.geometry)
      const lines = new LineSegments(wireframe)
      const boxHelper = new BoxHelper(lines, 'red')
      boxHelper.position.set(x, y, z)
      boxHelper.updateMatrix()
      scene.add(boxHelper)
    })
  }

  //  ===== 🎥 CAMERA =====
  {
    camera = new PerspectiveCamera(50, 2, 0.1, 400)
    camera.position.set(0, 0, 10)
    cameraControls = new OrbitControls(camera, canvas)
    // cameraControls.autoRotate = true
    cameraControls.autoRotateSpeed = 4
    cameraControls.update()
  }

  // ===== 🪄 HELPERS =====
  {
    axesHelper = new AxesHelper(10)
    bBoxHelper = new Box3Helper(new Box3().setFromObject(cubeGroup, true))
    bBoxHelper.visible = true
    cubeGroup.add(bBoxHelper)
    pointLightHelper = new PointLightHelper(pointLight)
    scene.add(axesHelper)
    scene.add(pointLightHelper)
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

  // bounce(cubeGroup, clock)

  if (resizeRendererToDisplaySize(renderer)) {
    // responsiveness
    const canvas = renderer.domElement
    camera.aspect = canvas.clientWidth / canvas.clientHeight
    camera.updateProjectionMatrix()
  }

  renderer.render(scene, camera)
}
