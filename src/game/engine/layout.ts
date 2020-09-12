import { gameSettings, settingsHelpers } from '../consts'
import { gameObjects } from '../game-objects'
import { gameState } from '../scene-update'
import { collisionCategories, collisionMasks } from './collisions'
import { currentObjects } from './current-objects'
import { monsterFactory } from './monster-factory'

export interface ILayout {
  size?: { x?: number; y?: number; width: number; height: number }
  images?: { global?: boolean; key: string; url: string }[]
  backgrounds?: [{ key: string; activateKey?: string; x?: number; y?: number }]
  blocks?: {
    key?: string
    activateKey?: string
    onTouch?: { key: string; isToggle?: boolean }
    isSolid?: boolean
    x: number
    y: number
    repeat?: number
    width?: number
    height?: number
  }[]
  gates?: {
    key?: string
    activateKey?: string
    x: number
    y: number
    width: number
    height: number
    toRoom: string
    dropArea: string
  }[]
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

  // Static images on the level
  layout.backgrounds?.forEach((backConfig) => {
    // If there is an activeKey but it hasn't been set then skip this one
    if (backConfig.activateKey && !gameState.state[backConfig.activateKey]) {
      return
    }
    const backgroundKey = layout.images?.some((i) => !i.global && i.key === backConfig.key)
      ? `${roomKey}-background`
      : backConfig.key
    currentObjects.images.push(
      scene.add.image(
        backConfig.x ?? settingsHelpers.fieldWidthMid,
        backConfig.y ?? settingsHelpers.fieldHeightMid,
        backgroundKey
      )
    )
  })

  // Blocking pieces (floors/walls). Player can stand on and jump from these
  layout.blocks?.forEach((blockConfig) => {
    // If there is an activeKey but it hasn't been set then skip this one
    if (blockConfig.activateKey && !gameState.state[blockConfig.activateKey]) {
      return
    }
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
      if (imageKey) {
        currentObjects.images.push(
          scene.add.image(
            cornerX + blockConfig.x + width / 2 + i * width,
            cornerY + blockConfig.y + height / 2,
            imageKey
          )
        )
      }

      const createdBlock = scene.matter.add.rectangle(
        cornerX + blockConfig.x + width / 2 + i * width,
        cornerY + blockConfig.y + height / 2,
        width,
        height,
        {
          isStatic: true,
          collisionFilter: { category: collisionCategories.static, mask: collisionMasks.static },
        }
      )

      // Touching the block could trigger a state change
      if (blockConfig.onTouch) {
        const onTouch = blockConfig.onTouch
        createdBlock.setOnCollideWith(gameObjects.guy.body as MatterJS.BodyType, () => {
          gameState.state[onTouch.key] = onTouch.isToggle ? !gameState.state[onTouch.key] : true
          console.log('triggered block', onTouch)
        })
      }

      currentObjects.blocks.push(createdBlock)
    }
  })

  // Gate take the player to another room.
  // They can optionally have an image
  layout.gates?.forEach((gate) => {
    // If there is an activeKey but it hasn't been set then skip this one
    if (gate.activateKey && !gameState.state[gate.activateKey]) {
      return
    }
    const imageKey =
      gate.key && layout.images?.some((i) => !i.global && i.key === gate.key) ? `${roomKey}-${gate.key}` : gate.key
    const imageData = imageKey ? scene.game.textures.get(imageKey).get(0) : undefined

    // Get the width/height from the image size or json
    const width = gate.width ?? imageData?.width ?? 0
    const height = gate.height ?? imageData?.height ?? 0

    // Optional image - key is image key
    if (imageKey) {
      scene.add.image(cornerX + gate.x + width / 2, cornerY + gate.y + height / 2, imageKey)
    }

    // Create a collision area
    const gateObject = scene.matter.add.rectangle(
      cornerX + gate.x + width / 2,
      cornerY + gate.y + height / 2,
      width,
      height,
      {
        isStatic: true,
      }
    )

    // Create a collider for the area that take the player to the linked room
    // TODO: How do we clean this up? Does it get removed when the gateObject/collision area is deleted?
    gateObject.setOnCollideWith(gameObjects.guy.body as MatterJS.BodyType, () => {
      gameState.phase = gate.toRoom
      gameState.dropArea = gate.dropArea
      gameObjects.guy.setVelocity(0, 0)
      console.log('hit gate', gate.toRoom, gate.dropArea)
    })

    currentObjects.blocks.push(gateObject)
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

  gameObjects.guy.setDepth(1)
}
