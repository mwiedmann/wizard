import { gameSettings, settingsHelpers } from '../consts'
import { gameObjects } from '../game-objects'
import { gameState } from '../scene-update'
import { ActivateBlock, ActivateGate, ActivateImage } from './activate-object'
import { currentObjects } from './current-objects'
import { monsterFactory } from './monster-factory'

export interface IOnTouch {
  key: string
  isToggle?: boolean
}

export interface IBlockLayout {
  key?: string
  activateKey?: string
  activateReverse?: boolean
  onTouch?: IOnTouch
  isEmpty?: boolean
  x: number
  y: number
  repeat?: number
  width?: number
  height?: number
}

export interface IGateLayout {
  key?: string
  activateKey?: string
  activateReverse?: boolean
  x: number
  y: number
  width: number
  height: number
  toRoom: string
  dropArea: string
}

export interface ILayout {
  size?: { x?: number; y?: number; width: number; height: number }
  images?: { global?: boolean; key: string; url: string }[]
  backgrounds?: [{ key: string; activateKey?: string; activateReverse?: boolean; x?: number; y?: number }]
  blocks?: IBlockLayout[]
  gates?: IGateLayout[]
  dropAreas?: [{ key: string; x: number; y: number }]
  monsters?: [{ type: string; x: number; y: number }]
}

const xFromWidth = (width: number, x: number) => settingsHelpers.fieldWidthMid - width / 2 + x
const yFromHeight = (height: number, y: number) => settingsHelpers.fieldHeightMid - height / 2 + y

export const layout = (scene: Phaser.Scene, roomKey: string): void => {
  console.log('Starting layout for', roomKey)
  const layout: ILayout = scene.game.cache.json.get(roomKey)

  // Ok, so if the size of this level is different than the game size,
  // we need to calculate the x,y corner. This is because
  // everything is around the center of the screen to get the best
  // camera view for the player.
  // So we start at the center and move 1/2 width/height away to get the corner.
  const width = layout.size?.width ?? gameSettings.fieldWidth
  const height = layout.size?.height ?? gameSettings.fieldHeight
  const cornerX = xFromWidth(width, layout.size?.x ?? 0)
  const cornerY = yFromHeight(height, layout.size?.y ?? 0)

  // Make sure gameObjects don't fall off the world
  scene.matter.world.setBounds(cornerX, cornerY, width, height)

  // Calc the actual pixel width/height that the camera shows.
  // We are zoomed in slightly so its less than the full game size.
  // We can prob calc this once at game startup but we may want to allow the zoom level to change per room
  const cameraBoundWidthMin = Math.floor(gameSettings.fieldWidth / gameSettings.gameCameraZoom)
  const cameraBoundHeightMin = Math.floor(gameSettings.fieldHeight / gameSettings.gameCameraZoom)

  // If the room fits within the camera size, then just use a fixed camera.
  // Otherwise, set it to follow the guy with some lerp/deadzone allowance
  const cameraBoundWidth = width <= cameraBoundWidthMin ? cameraBoundWidthMin : width
  const cameraBoundHeight = height <= cameraBoundHeightMin ? cameraBoundHeightMin : height
  const fixedCamera = width <= cameraBoundWidthMin && height <= cameraBoundHeightMin

  scene.cameras.main.setBounds(
    settingsHelpers.fieldWidthMid - cameraBoundWidth / 2,
    settingsHelpers.fieldHeightMid - cameraBoundHeight / 2,
    cameraBoundWidth,
    cameraBoundHeight,
    true
  )

  if (fixedCamera) {
    scene.cameras.main.stopFollow()
    scene.cameras.main.centerOn(settingsHelpers.fieldWidthMid, settingsHelpers.fieldHeightMid)
    scene.cameras.main.setDeadzone(0, 0)
  } else {
    scene.cameras.main.startFollow(gameObjects.guy)
    // scene.cameras.main.setLerp(0.1, 0.1) // Don't seem to need lerping for the camara in this game. TBD.
    scene.cameras.main.setLerp(1, 1)
    scene.cameras.main.setDeadzone(100, 100)
  }

  let imageDepth = 1

  // Static images on the level
  layout.backgrounds?.forEach((backConfig) => {
    const backgroundKey = layout.images?.some((i) => !i.global && i.key === backConfig.key)
      ? `${roomKey}-${backConfig.key}`
      : backConfig.key

    const imageActivator = new ActivateImage(
      backConfig.activateKey,
      backConfig.activateReverse,
      backgroundKey,
      backConfig.x ?? settingsHelpers.fieldWidthMid,
      backConfig.y ?? settingsHelpers.fieldHeightMid,
      imageDepth++
    )

    // If there is no activateKey then create the image,
    // otherwise check the state
    if (!backConfig.activateKey) {
      imageActivator.create(scene)
    } else {
      imageActivator.checkState(scene)
    }

    currentObjects.images.push(imageActivator)
  })

  // Blocking pieces (floors/walls). Player can stand on and jump from these
  layout.blocks?.forEach((blockConfig) => {
    const imageKey =
      blockConfig.key && layout.images?.some((i) => !i.global && i.key === blockConfig.key)
        ? `${roomKey}-${blockConfig.key}`
        : blockConfig.key
    const imageData = imageKey ? scene.game.textures.get(imageKey).get(0) : undefined

    // Get the width/height from the image size or json
    const width = blockConfig.width ?? imageData?.width ?? 0
    const height = blockConfig.height ?? imageData?.height ?? 0
    const repeat = blockConfig.repeat ?? 1

    // Repeat lets you repeat the same block a number of times (default is 1)
    for (let i = 0; i < repeat; i++) {
      const blockActivator = new ActivateBlock(
        blockConfig.activateKey,
        blockConfig.activateReverse,
        imageKey,
        cornerX + blockConfig.x + width / 2 + i * width,
        cornerY + blockConfig.y + height / 2,
        imageDepth++,
        width,
        height,
        blockConfig
      )

      // If there is no activateKey then create the block,
      // otherwise check the state
      if (!blockConfig.activateKey) {
        blockActivator.create(scene)
      } else {
        blockActivator.checkState(scene)
      }

      currentObjects.blocks.push(blockActivator)
    }
  })

  // Gate take the player to another room.
  // They can optionally have an image
  layout.gates?.forEach((gateConfig) => {
    const imageKey =
      gateConfig.key && layout.images?.some((i) => !i.global && i.key === gateConfig.key)
        ? `${roomKey}-${gateConfig.key}`
        : gateConfig.key
    const imageData = imageKey ? scene.game.textures.get(imageKey).get(0) : undefined

    // Get the width/height from the image size or json
    const width = gateConfig.width ?? imageData?.width ?? 0
    const height = gateConfig.height ?? imageData?.height ?? 0

    const gateActivator = new ActivateGate(
      gateConfig.activateKey,
      gateConfig.activateReverse,
      imageKey,
      cornerX + gateConfig.x + width / 2,
      cornerY + gateConfig.y + height / 2,
      imageDepth++,
      width,
      height,
      gateConfig
    )

    // If there is no activateKey then create the gate,
    // otherwise check the state
    if (!gateConfig.activateKey) {
      gateActivator.create(scene)
    } else {
      gateActivator.checkState(scene)
    }

    currentObjects.blocks.push(gateActivator)
  })

  layout.monsters?.forEach((monster) => {
    const createdMonster = monsterFactory(scene, monster.type, cornerX + monster.x, cornerY + monster.y)
    createdMonster.anims.play(monster.type, true)
    scene.add.existing(createdMonster)
    scene.matter.body.setInertia(createdMonster.body as MatterJS.BodyType, Infinity)
    currentObjects.monsters.push(createdMonster)
  })

  // Move the guy to the dropArea
  if (layout.dropAreas) {
    const guyLocation = layout.dropAreas.find((d) => d.key === gameState.dropArea)
    if (!guyLocation) {
      throw new Error(`Could not find dropArea: ${gameState.dropArea}`)
    }
    gameObjects.guy.setPosition(cornerX + guyLocation.x, cornerY + guyLocation.y)
  }

  gameObjects.guy.setDepth(999)
}
