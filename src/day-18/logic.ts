import { input as _, sampleInput } from './input'

export async function partOne() {
  const cubes = parseCubes()
  const cubeSet = new Set<string>()

  for (const cube of cubes) {
    let { x, y, z } = cube
    if (cubeSet.has(`${x},${y},${z}`)) {
      throw new Error('attempting to add a cube coords that already exist')
    }
    cubeSet.add(`${x},${y},${z}`)
  }

  let totalFreeSides = 0

  for (const cube of cubes) {
    totalFreeSides += calculateNumOfFreeSides(cube, cubeSet)
  }

  return totalFreeSides
}

// --------------------------------------------------------------------------- //

export type Point = {
  x: number
  y: number
  z: number
}

export function parseCubes(): Point[] {
  const cubes: Point[] = sampleInput.split('\n').map((line) => {
    const [x, y, z] = line.split(',').map((str) => Number.parseInt(str))
    return { x, y, z }
  })

  return cubes
}

function calculateNumOfFreeSides(cube: Point, cubeSet: Set<string>) {
  let freeSides = 6

  const { x, y, z } = cube

  // y-adjacent
  const up: Point = { x, y: y + 1, z }
  const down: Point = { x, y: y - 1, z }

  // x-adjacent
  const left: Point = { x: x - 1, y, z }
  const right: Point = { x: x + 1, y, z }

  // z-adjacent
  const front: Point = { x, y, z: z + 1 }
  const back: Point = { x, y, z: z - 1 }

  // check how many of ☝️ these guys exist
  const adjacentCubes = [up, down, left, right, front, back]

  for (const adjacent of adjacentCubes) {
    if (!adjacent) continue
    let adjacentStr = `${adjacent.x},${adjacent.y},${adjacent.z}`
    if (cubeSet.has(adjacentStr)) {
      freeSides--
    }
  }

  return freeSides
}

export function calculateBoundingBox(cubes: Point[]) {
  const xSorted = [...cubes.sort((cubeA, cubeB) => cubeA.x - cubeB.x)]
  const ySorted = [...cubes.sort((cubeA, cubeB) => cubeA.y - cubeB.y)]
  const zSorted = [...cubes.sort((cubeA, cubeB) => cubeA.z - cubeB.z)]

  // what can I get out of each of these sorted arrays?
  const minX = xSorted.at(0)!
  const maxX = xSorted.at(-1)!
  const minY = ySorted.at(0)!
  const maxY = ySorted.at(-1)!
  const minZ = zSorted.at(0)!
  const maxZ = zSorted.at(-1)!

  return [minX, maxX, minY, maxY, minZ, maxZ]
}
