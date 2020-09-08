import { settingsHelpers } from '../consts'
import { gameObjects } from '../game-objects'
import { Zombie } from '../objects/zombie'
import { gameState } from '../scene-update'
import { collisionCategories, collisionMasks } from './collisions'
import { currentObjects } from './current-objects'

export interface ILayout {
  images?: { global?: boolean; key: string; url: string }[]
  backgrounds?: [{ key: string; x?: number; y?: number }]
  floors?: { key: string; x: number; y: number; repeat: number }[]
  gates?: { key?: string; x: number; y: number; width: number; height: number; toRoom: string; dropArea: string }[]
  dropAreas?: [{ key: string; x: number; y: number }]
  monsters?: [{ type: string; x: number; y: number }]
}

export const layout = (scene: Phaser.Scene, roomKey: string): void => {
  const layout: ILayout = scene.game.cache.json.get(roomKey)

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
      currentObjects.images.push(scene.add.image(gate.x, gate.y, gate.key))
    }

    // Create a collision area
    const gateObject = scene.matter.add.rectangle(gate.x, gate.y, gate.width, gate.height, { isStatic: true })

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
    const zombie = new Zombie(scene.matter.world, monster.x, monster.y, 'zombie', 0)
    zombie.anims.play('zombie-walk', true)
    scene.add.existing(zombie)
    scene.matter.body.setInertia(zombie.body as MatterJS.BodyType, Infinity)
    currentObjects.monsters.push(zombie)
  })

  gameObjects.guy.setDepth(1)
}
