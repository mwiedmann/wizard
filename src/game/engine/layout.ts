import { gameSettings, settingsHelpers } from '../consts'
import { gameObjects } from '../game-objects'
import { Zombie } from '../objects/zombie'
import { gameState } from '../scene-update'
import { collisionCategories, collisionMasks } from './collisions'
import { currentObjects } from './current-objects'

export interface ILayout {
  size?: { x?: number; y?: number; width: number; height: number }
  images?: { global?: boolean; key: string; url: string }[]
  backgrounds?: [{ key: string; x?: number; y?: number }]
  floors?: { key: string; x: number; y: number; repeat: number }[]
  gates?: { key?: string; x: number; y: number; width: number; height: number; toRoom: string; dropArea: string }[]
  dropAreas?: [{ key: string; x: number; y: number }]
  monsters?: [{ type: string; x: number; y: number }]
}

const xFromWidth = (width: number, x: number) => settingsHelpers.fieldWidthMid - width / 2 + x
const yFromHeight = (height: number, y: number) => settingsHelpers.fieldHeightMid - height / 2 + y

export const layout = (scene: Phaser.Scene, roomKey: string): void => {
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

  // Static images on the level
  layout.backgrounds?.forEach((b) => {
    const backgroundKey = layout.images?.some((i) => !i.global && i.key === b.key) ? `${roomKey}-background` : b.key
    currentObjects.images.push(
      scene.add.image(settingsHelpers.fieldWidthMid, settingsHelpers.fieldHeightMid, backgroundKey)
    )
  })

  // Floor pieces. Player can stand on and jump from these
  layout.floors?.forEach((f) => {
    const floorKey = layout.images?.some((i) => !i.global && i.key === f.key) ? `${roomKey}-${f.key}` : f.key
    const imageData = scene.game.textures.get(floorKey).get(0)

    // Get the width/height from the image size
    const width = imageData.width
    const height = imageData.height

    for (let i = 0; i < f.repeat; i++) {
      currentObjects.images.push(scene.add.image(f.x + i * width, f.y, floorKey))
      currentObjects.blocks.push(
        scene.matter.add.rectangle(f.x + i * width, f.y, width, height, {
          isStatic: true,
          collisionFilter: { category: collisionCategories.static, mask: collisionMasks.static },
        })
      )
    }
  })

  // Gate take the player to another room.
  // They can optionally have an image
  layout.gates?.forEach((gate) => {
    // Optional image - key is image key
    if (gate.key) {
      currentObjects.images.push(scene.add.image(cornerX + gate.x, cornerY + gate.y, gate.key))
    }

    // Create a collision area
    const gateObject = scene.matter.add.rectangle(cornerX + gate.x, cornerY + gate.y, gate.width, gate.height, {
      isStatic: true,
    })

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
    const zombie = new Zombie(scene.matter.world, cornerX + monster.x, cornerY + monster.y, 'zombie', 0)
    zombie.anims.play('zombie-walk', true)
    scene.add.existing(zombie)
    scene.matter.body.setInertia(zombie.body as MatterJS.BodyType, Infinity)
    currentObjects.monsters.push(zombie)
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
